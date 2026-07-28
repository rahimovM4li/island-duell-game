import { PLAYER_RADIUS } from './constants';
import { sampleHeight } from './terrain';
import type {
  CentralBoxStructure, CentralStructure, LandmarkPoi, PoiStructure, WorldGen,
} from './worldgen';

export type WorldAuditSeverity = 'error' | 'warning';
export type WorldAuditIssueKind =
  | 'invalid-collider'
  | 'duplicate-collider'
  | 'floating-gameplay-cover'
  | 'narrow-passage'
  | 'ramp-low-gap'
  | 'ramp-high-gap';

export interface WorldAuditIssue {
  severity: WorldAuditSeverity;
  kind: WorldAuditIssueKind;
  object: string;
  message: string;
}

export interface WorldAuditReport {
  colliders: number;
  walkSurfaces: number;
  namedPassages: Array<{ name: string; width: number; required: number }>;
  issues: WorldAuditIssue[];
  errors: number;
  warnings: number;
}

interface AuditBox {
  name: string;
  owner: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  yaw: number;
  pitch: number;
  walkSurface: boolean;
  terrainY: number;
}

interface AuditCylinder {
  name: string;
  owner: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  h: number;
}

const REQUIRED_PASSAGE_WIDTH = PLAYER_RADIUS * 2 + 0.3;
const GROUND_TOLERANCE = 0.22;
const RAMP_JOIN_TOLERANCE = 0.72;

function poiBox(poi: LandmarkPoi, part: PoiStructure, terrainY: number): AuditBox {
  return {
    name: part.name,
    owner: poi.id,
    x: part.x,
    y: terrainY + (part.yOffset ?? 0) + part.h / 2,
    z: part.z,
    w: part.w,
    h: part.h,
    d: part.d,
    yaw: part.rotY,
    pitch: part.rotX ?? 0,
    walkSurface: part.walkSurface ?? false,
    terrainY,
  };
}

function centralBox(part: CentralBoxStructure, terrainY: number): AuditBox {
  return {
    name: part.name,
    owner: 'middle',
    x: part.x,
    y: part.y,
    z: part.z,
    w: part.w,
    h: part.h,
    d: part.d,
    yaw: part.rotY,
    pitch: part.rotX,
    walkSurface: part.walkSurface,
    terrainY,
  };
}

function verticalHalfExtent(box: AuditBox): number {
  return Math.abs(Math.cos(box.pitch)) * box.h / 2
    + Math.abs(Math.sin(box.pitch)) * box.d / 2;
}

function topY(box: AuditBox): number {
  return box.y + verticalHalfExtent(box);
}

function bottomY(box: AuditBox): number {
  return box.y - verticalHalfExtent(box);
}

function localPoint(box: AuditBox, x: number, z: number): { x: number; z: number } {
  const dx = x - box.x;
  const dz = z - box.z;
  const c = Math.cos(box.yaw);
  const s = Math.sin(box.yaw);
  return { x: c * dx - s * dz, z: s * dx + c * dz };
}

function containsXZ(box: AuditBox, x: number, z: number, padding = 0): boolean {
  const local = localPoint(box, x, z);
  return Math.abs(local.x) <= box.w / 2 + padding
    && Math.abs(local.z) <= box.d / 2 + padding;
}

function almostSameBox(a: AuditBox, b: AuditBox): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.015
    && Math.abs(a.w - b.w) < 0.015
    && Math.abs(a.h - b.h) < 0.015
    && Math.abs(a.d - b.d) < 0.015
    && Math.abs(Math.sin(a.yaw - b.yaw)) < 0.01
    && Math.abs(Math.sin(a.pitch - b.pitch)) < 0.01;
}

function rampEndpoints(box: AuditBox): Array<{ x: number; z: number; y: number }> {
  const cp = Math.cos(box.pitch);
  const sp = Math.sin(box.pitch);
  const projectedHalf = box.d * cp / 2 + box.h * sp / 2;
  const c = Math.cos(box.yaw);
  const s = Math.sin(box.yaw);
  return [-projectedHalf, projectedHalf].map((localZ) => ({
    x: box.x + s * localZ,
    z: box.z + c * localZ,
    y: box.y + box.h / (2 * cp) - Math.tan(box.pitch) * localZ,
  })).sort((a, b) => a.y - b.y);
}

function namedPairGap(
  poi: LandmarkPoi,
  leftName: string,
  rightName: string,
): number | null {
  const left = poi.structures.find((part) => part.name === leftName);
  const right = poi.structures.find((part) => part.name === rightName);
  if (!left || !right) return null;
  const c = Math.cos(poi.rootYaw);
  const s = Math.sin(poi.rootYaw);
  const leftLocalX = c * (left.x - poi.x) - s * (left.z - poi.z);
  const rightLocalX = c * (right.x - poi.x) - s * (right.z - poi.z);
  return Math.abs(rightLocalX - leftLocalX) - left.w / 2 - right.w / 2;
}

function finitePositive(values: number[]): boolean {
  return values.every((value) => Number.isFinite(value) && value > 0);
}

export function auditWorld(gen: WorldGen): WorldAuditReport {
  const issues: WorldAuditIssue[] = [];
  const middleTerrainY = sampleHeight(gen.params, 0, 0);
  const boxes: AuditBox[] = [];
  const cylinders: AuditCylinder[] = [];

  for (const part of gen.centralStructures) {
    if (part.shape === 'box') boxes.push(centralBox(part, middleTerrainY));
    else cylinders.push({
      name: part.name, owner: 'middle', x: part.x, y: part.y, z: part.z,
      radius: part.radius, h: part.h,
    });
  }
  for (const poi of gen.pois) {
    const terrainY = sampleHeight(gen.params, poi.x, poi.z);
    for (const part of poi.structures) {
      if (part.collider) boxes.push(poiBox(poi, part, terrainY));
    }
  }

  for (const box of boxes) {
    if (!finitePositive([box.w, box.h, box.d])
      || ![box.x, box.y, box.z, box.yaw, box.pitch].every(Number.isFinite)) {
      issues.push({
        severity: 'error', kind: 'invalid-collider', object: `${box.owner}/${box.name}`,
        message: 'Box-Collider besitzt ungültige Maße oder Transformationen.',
      });
    }
  }
  for (const cylinder of cylinders) {
    if (!finitePositive([cylinder.radius, cylinder.h])
      || ![cylinder.x, cylinder.y, cylinder.z].every(Number.isFinite)) {
      issues.push({
        severity: 'error', kind: 'invalid-collider', object: `${cylinder.owner}/${cylinder.name}`,
        message: 'Zylinder-Collider besitzt ungültige Maße oder Transformationen.',
      });
    }
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (almostSameBox(boxes[i], boxes[j])) {
        issues.push({
          severity: 'error', kind: 'duplicate-collider',
          object: `${boxes[i].owner}/${boxes[i].name}`,
          message: `Nahezu identisch mit ${boxes[j].owner}/${boxes[j].name}.`,
        });
      }
    }
  }

  const solids = boxes.filter((box) => !box.walkSurface);
  for (const box of solids.filter((entry) =>
    entry.owner === 'middle' && /^(Cover_|Prop_|Nature_)/.test(entry.name))) {
    const bottom = bottomY(box);
    const supportedByTerrain = bottom <= box.terrainY + GROUND_TOLERANCE;
    const supportedByCollider = solids.some((support) =>
      support !== box
      && containsXZ(support, box.x, box.z, 0.08)
      && topY(support) <= bottom + GROUND_TOLERANCE
      && bottom - topY(support) <= GROUND_TOLERANCE);
    if (!supportedByTerrain && !supportedByCollider) {
      issues.push({
        severity: 'warning', kind: 'floating-gameplay-cover',
        object: `${box.owner}/${box.name}`,
        message: `Gameplay-Objekt hat ${Math.max(0, bottom - box.terrainY).toFixed(2)} m Bodenabstand ohne Stützfläche.`,
      });
    }
  }

  const walkSurfaces = boxes.filter((box) => box.walkSurface);
  for (const ramp of walkSurfaces) {
    const [low, high] = rampEndpoints(ramp);
    const lowGround = sampleHeight(gen.params, low.x, low.z);
    const lowSupport = solids
      .filter((solid) => containsXZ(solid, low.x, low.z, 0.35))
      .reduce((best, solid) => Math.max(best, topY(solid)), lowGround);
    if (Math.abs(low.y - lowSupport) > RAMP_JOIN_TOLERANCE) {
      issues.push({
        severity: 'warning', kind: 'ramp-low-gap', object: `${ramp.owner}/${ramp.name}`,
        message: `Unterer Rampenanschluss weicht ${(low.y - lowSupport).toFixed(2)} m ab.`,
      });
    }
    const highSupport = solids
      .filter((solid) => containsXZ(solid, high.x, high.z, 0.5))
      .map((solid) => topY(solid))
      .reduce((best, candidate) =>
        Math.abs(candidate - high.y) < Math.abs(best - high.y) ? candidate : best, -Infinity);
    if (!Number.isFinite(highSupport) || Math.abs(high.y - highSupport) > RAMP_JOIN_TOLERANCE) {
      issues.push({
        severity: 'warning', kind: 'ramp-high-gap', object: `${ramp.owner}/${ramp.name}`,
        message: Number.isFinite(highSupport)
          ? `Oberer Rampenanschluss weicht ${(high.y - highSupport).toFixed(2)} m ab.`
          : 'Oberer Rampenanschluss besitzt keine erkennbare Stützfläche.',
      });
    }
  }

  const namedPassages: WorldAuditReport['namedPassages'] = [];
  const passageSpecs = [
    ['bunker', 'Bunker-Eingang', 'bunker_left', 'bunker_right'],
    ['watchtower', 'Turm-Bodenöffnung', 'tower_deck_left', 'tower_deck_right'],
  ] as const;
  for (const [poiId, name, leftName, rightName] of passageSpecs) {
    const poi = gen.pois.find((entry) => entry.id === poiId);
    if (!poi) continue;
    const width = namedPairGap(poi, leftName, rightName);
    if (width === null) continue;
    namedPassages.push({ name, width, required: REQUIRED_PASSAGE_WIDTH });
    if (width < REQUIRED_PASSAGE_WIDTH) {
      issues.push({
        severity: 'error', kind: 'narrow-passage', object: poiId,
        message: `${name} ist ${width.toFixed(2)} m breit; benötigt werden mindestens ${REQUIRED_PASSAGE_WIDTH.toFixed(2)} m.`,
      });
    }
  }

  return {
    colliders: boxes.length + cylinders.length + gen.vegetation.filter((entry) => entry.colliderRadius > 0).length + 1,
    walkSurfaces: walkSurfaces.length,
    namedPassages,
    issues,
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  };
}

export function colliderCountByShape(gen: WorldGen): { boxes: number; cylinders: number } {
  const centralBoxes = gen.centralStructures.filter((entry): entry is CentralBoxStructure => entry.shape === 'box').length;
  const centralCylinders = gen.centralStructures.filter((entry: CentralStructure) => entry.shape === 'cylinder').length;
  return {
    boxes: centralBoxes + gen.pois.flatMap((poi) => poi.structures).filter((part) => part.collider).length,
    cylinders: centralCylinders + gen.vegetation.filter((entry) => entry.colliderRadius > 0).length,
  };
}
