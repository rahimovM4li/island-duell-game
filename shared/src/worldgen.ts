// Deterministic world content generation from the match seed (§3, §5).
// Host and clients run this identically; only loot *contents* of crates are
// rolled host-side and broadcast as events.
import {
  BEACH_INNER_RADIUS, FIXED_POI_CRATES, ISLAND_LAND_RADIUS, SPAWN_POI_COUNT,
  SPAWN_RING_RADIUS, scatterCrateCount, ItemType,
} from './constants';
import { deriveSeed, mulberry32, pick, randRange, Rng } from './rng';
import { PlacementMap, type PlacementPoint } from './placement';
import {
  bunkerCenter, isOnLand, plateauCenter, sampleHeight, terrainParams, TerrainParams, RUINS_RADIUS,
} from './terrain';
import landmarkColliderManifest from './landmark-colliders.json';
import middleIslandManifest from './middle-island.json';

export type CrateTier = 'common' | 'good' | 'top';
export type VegKind = 'tree' | 'rock' | 'bush';
export type VegVariant = 'pine' | 'broadleaf' | 'palm' | 'boulder' | 'slab' | 'cluster' | 'bush';

export interface Veg {
  id: number;
  kind: VegKind;
  variant: VegVariant;
  x: number; z: number; y: number;
  scale: number;
  rot: number;
  colliderRadius: number; // 0 = walk-through (bushes)
}

export type PoiKind = 'ruins' | 'wreck' | 'watchtower' | 'bunker';

export interface Crate {
  id: string;
  x: number; z: number;
  tier: CrateTier;
  poi: PoiKind | 'forest' | 'scatter';
  /** Optional landmark reward that is guaranteed for this cache. */
  guaranteedItem?: ItemType;
}

export interface GroundItem {
  id: string;
  item: ItemType;
  x: number; z: number;
}

export interface RuinWall {
  x: number; z: number;
  w: number; d: number; h: number;
  rotY: number;
}

export interface CentralBoxStructure {
  name: string;
  shape: 'box';
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  rotY: number;
  rotX: number;
  walkSurface: boolean;
}

export interface CentralCylinderStructure {
  name: string;
  shape: 'cylinder';
  x: number; y: number; z: number;
  radius: number;
  h: number;
  walkSurface: false;
}

export type CentralStructure = CentralBoxStructure | CentralCylinderStructure;

export interface PoiStructure extends RuinWall {
  material: 'wood' | 'metal' | 'stone';
  collider: boolean;
  yOffset?: number;
  rotX?: number;
  walkSurface?: boolean;
}

export interface LandmarkPoi {
  id: PoiKind;
  name: string;
  x: number;
  z: number;
  risk: 'medium' | 'high';
  structures: PoiStructure[];
}

export interface SpawnPoi { index: number; x: number; z: number; angle: number }

export interface WorldDecoration {
  id: string;
  kind: 'rubble' | 'barrel';
  owner: PoiKind;
  x: number;
  z: number;
  scale: number;
  rot: number;
}

interface LocalBoxCollider {
  center: [number, number, number];
  size: [number, number, number];
  yaw: number;
  pitch?: number;
  walkSurface?: boolean;
}

interface LocalMiddleIslandCollider {
  name: string;
  shape: 'box' | 'cylinder';
  center: [number, number, number];
  size?: [number, number, number];
  radius?: number;
  height?: number;
  yaw?: number;
  pitch?: number;
  walkSurface?: boolean;
}

interface MiddleIslandManifest {
  rootYOffset: number;
  colliders: LocalMiddleIslandCollider[];
  lootSpots: Array<[number, number]>;
}

const LANDMARK_COLLIDERS = landmarkColliderManifest.landmarks as unknown as Record<
  'wreck' | 'watchtower' | 'bunker', { colliders: LocalBoxCollider[] }
>;

const MIDDLE_ISLAND = middleIslandManifest as unknown as MiddleIslandManifest;
export const MIDDLE_ISLAND_ROOT_Y = MIDDLE_ISLAND.rootYOffset;
export const MIDDLE_ISLAND_LOOT_SPOTS = MIDDLE_ISLAND.lootSpots as readonly (
  readonly [number, number]
)[];

function middleIslandStructures(): CentralStructure[] {
  return MIDDLE_ISLAND.colliders.map((collider) => {
    const [x, localY, z] = collider.center;
    const y = MIDDLE_ISLAND_ROOT_Y + localY;
    if (collider.shape === 'cylinder') {
      if (collider.radius === undefined || collider.height === undefined) {
        throw new Error(`invalid middle-island cylinder ${collider.name}`);
      }
      return {
        name: collider.name,
        shape: 'cylinder' as const,
        x, y, z,
        radius: collider.radius,
        h: collider.height,
        walkSurface: false as const,
      };
    }
    if (!collider.size) throw new Error(`invalid middle-island box ${collider.name}`);
    return {
      name: collider.name,
      shape: 'box' as const,
      x, y, z,
      w: collider.size[0],
      h: collider.size[1],
      d: collider.size[2],
      rotY: collider.yaw ?? 0,
      rotX: collider.pitch ?? 0,
      walkSurface: collider.walkSurface ?? false,
    };
  });
}

/** Convert Blender-authored local box proxies into deterministic world colliders. */
function landmarkStructures(
  id: keyof typeof LANDMARK_COLLIDERS, x: number, z: number, rootYaw: number,
): PoiStructure[] {
  const material: PoiStructure['material'] = id === 'wreck' || id === 'watchtower' ? 'wood' : 'stone';
  const c = Math.cos(rootYaw), s = Math.sin(rootYaw);
  return LANDMARK_COLLIDERS[id].colliders.map((collider) => {
    const [lx, cy, lz] = collider.center;
    const [w, h, d] = collider.size;
    return {
      x: x + c * lx + s * lz,
      z: z - s * lx + c * lz,
      w, h, d,
      yOffset: cy - h / 2,
      rotY: rootYaw + collider.yaw,
      rotX: collider.pitch ?? 0,
      walkSurface: collider.walkSurface ?? false,
      material,
      collider: true,
    };
  });
}

export interface WorldGen {
  seed: number;
  n: number;
  params: TerrainParams;
  spawns: SpawnPoi[];
  plateau: { x: number; z: number };
  pois: LandmarkPoi[];
  centralStructures: CentralStructure[];
  decorations: WorldDecoration[];
  navigationLights: PlacementPoint[];
  vegetation: Veg[];
  crates: Crate[];
  spawnFloorItems: GroundItem[];
  carePackagePos: { x: number; z: number };
}

const MELEE_FLOOR: ItemType[] = ['machete', 'spear'];
const RANGED_FLOOR: ItemType[] = ['pistol'];
export const CRATE_PLACEMENT_RADIUS = 0.8;
export const FLOOR_ITEM_PLACEMENT_RADIUS = 0.5;
export const CARE_PLACEMENT_RADIUS = 1.2;
const DECORATION_RADIUS = { rubble: 0.48, barrel: 0.42 } as const;
const NAV_LIGHT_RADIUS = 0.32;

function landSpot(
  rng: Rng,
  p: TerrainParams,
  ok: (x: number, z: number) => boolean,
  label = 'land object',
): { x: number; z: number } {
  for (let tries = 0; tries < 300; tries++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (ISLAND_LAND_RADIUS - 6);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (isOnLand(p, x, z) && ok(x, z)) return { x, z };
  }
  throw new Error(`no free island placement found for ${label}`);
}

function requiredNearbySpot(
  placement: PlacementMap,
  preferredX: number,
  preferredZ: number,
  radius: number,
  phase: number,
  maxDistance: number,
  allowed: (x: number, z: number) => boolean,
  label: string,
): PlacementPoint {
  const point = placement.findFreeCircleNear(preferredX, preferredZ, radius, {
    maxDistance,
    phase,
    allowed,
  });
  if (!point) throw new Error(`no free placement found for ${label}`);
  placement.reserveCircle(point.x, point.z, radius, label);
  return point;
}

function buildNavigationLights(spawns: SpawnPoi[], pois: LandmarkPoi[]): PlacementPoint[] {
  const positions: PlacementPoint[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI * 0.25 + i * Math.PI * 0.5;
    positions.push({ x: Math.cos(angle) * 14.8, z: Math.sin(angle) * 14.8 });
  }
  for (const poi of pois) {
    const length = Math.max(1, Math.hypot(poi.x, poi.z));
    const outwardX = poi.x / length, outwardZ = poi.z / length;
    const tangentX = -outwardZ, tangentZ = outwardX;
    const forward = poi.id === 'watchtower' ? 7 : poi.id === 'bunker' ? 4.4 : 0;
    const spread = poi.id === 'wreck' ? 4.6 : 2.25;
    for (const side of [-1, 1]) {
      positions.push({
        x: poi.x + outwardX * forward + tangentX * spread * side,
        z: poi.z + outwardZ * forward + tangentZ * spread * side,
      });
    }
  }
  for (const spawn of spawns) {
    const length = Math.max(1, Math.hypot(spawn.x, spawn.z));
    positions.push({
      x: spawn.x - (spawn.x / length) * 2.2,
      z: spawn.z - (spawn.z / length) * 2.2,
    });
  }
  return positions;
}

export function generateWorld(seed: number, n: number): WorldGen {
  const params = terrainParams(seed);
  const plateau = plateauCenter(params);

  // ---- 5 spawn POIs on 80 m ring, 72° apart, ring rotation from seed (§5.3)
  const ringRng = mulberry32(deriveSeed(seed, 'spawn-ring'));
  const baseAngle = ringRng() * Math.PI * 2;
  const spawns: SpawnPoi[] = [];
  for (let i = 0; i < SPAWN_POI_COUNT; i++) {
    const angle = baseAngle + (i * 2 * Math.PI) / SPAWN_POI_COUNT;
    spawns.push({
      index: i,
      x: Math.cos(angle) * SPAWN_RING_RADIUS,
      z: Math.sin(angle) * SPAWN_RING_RADIUS,
      angle,
    });
  }

  // ---- three silhouette-first landmarks with distinct encounter profiles.
  const wreckAngle = baseAngle + Math.PI * 0.34;
  const wreck = { x: Math.cos(wreckAngle) * 88, z: Math.sin(wreckAngle) * 88 };
  const wreckRot = wreckAngle + Math.PI / 2;
  const bunkerAngle = params.bunkerAngle;
  const bunker = bunkerCenter(params);
  // Authored stairs/entrances face local +Z. In Three.js that direction maps
  // to (sin(yaw), cos(yaw)), so pi/2-angle points radially away from the hill.
  const watchtowerRot = Math.PI / 2 - params.plateauAngle;
  const bunkerRot = Math.PI / 2 - bunkerAngle;
  const pois: LandmarkPoi[] = [
    {
      id: 'wreck', name: 'Strandwrack', x: wreck.x, z: wreck.z, risk: 'high',
      structures: landmarkStructures('wreck', wreck.x, wreck.z, wreckRot),
    },
    {
      id: 'watchtower', name: 'Aussichtsposten', x: plateau.x, z: plateau.z, risk: 'high',
      structures: landmarkStructures('watchtower', plateau.x, plateau.z, watchtowerRot),
    },
    {
      id: 'bunker', name: 'Waldbunker', x: bunker.x, z: bunker.z, risk: 'medium',
      structures: landmarkStructures('bunker', bunker.x, bunker.z, bunkerRot),
    },
  ];

  // ---- authored middle island: visual GLB and these simple deterministic
  // gameplay proxies share the same Blender coordinate source.
  const centralStructures = middleIslandStructures();

  // ---- fixed 12 POI crates (§3): risk-coupled loot (§5.2)
  // ---- one shared occupancy map for structures, loot, props and vegetation.
  // Visual meshes remain independent, but every generated ground footprint is
  // reserved here before later systems may place another object.
  const placement = new PlacementMap();
  for (const structure of centralStructures) {
    if (structure.shape === 'cylinder') {
      placement.reserveCircle(
        structure.x, structure.z, structure.radius,
        `middle-island-${structure.name}`,
      );
    } else {
      placement.reserveBox(
        structure.x, structure.z, structure.w, structure.d, structure.rotY,
        `middle-island-${structure.name}`,
      );
    }
  }
  for (const poi of pois) {
    poi.structures.forEach((part, index) => {
      // Ignore genuinely raised roofs/decks, but reserve sloped stairs whose
      // projected box reaches the ground even when their center is elevated.
      const pitch = part.rotX ?? 0;
      const centerY = (part.yOffset ?? 0) + part.h / 2;
      const lowestY = centerY
        - Math.abs(Math.cos(pitch)) * part.h / 2
        - Math.abs(Math.sin(pitch)) * part.d / 2;
      if (lowestY >= 1.25) return;
      placement.reserveBox(
        part.x, part.z, part.w, part.d, part.rotY,
        `${poi.id}-structure-${index}`,
      );
    });
  }
  const navigationLights = buildNavigationLights(spawns, pois).map((preferred, index) =>
    requiredNearbySpot(
      placement,
      preferred.x,
      preferred.z,
      NAV_LIGHT_RADIUS,
      index * 2.399,
      3,
      (x, z) => isOnLand(params, x, z),
      `navigation-light-${index}`,
    ));
  spawns.forEach((spawn) =>
    placement.reserveCircle(spawn.x, spawn.z, 1.2, `spawn-marker-${spawn.index}`));

  const crateRng = mulberry32(deriveSeed(seed, 'crates'));
  const crates: Crate[] = [];
  let crateId = 0;
  const addCrate = (
    x: number,
    z: number,
    tier: CrateTier,
    poi: Crate['poi'],
    guaranteedItem?: ItemType,
    options: {
      maxDistance?: number;
      allowed?: (candidateX: number, candidateZ: number) => boolean;
    } = {},
  ) => {
    const id = `crate-${crateId++}`;
    const point = requiredNearbySpot(
      placement,
      x,
      z,
      CRATE_PLACEMENT_RADIUS,
      crateRng() * Math.PI * 2,
      options.maxDistance ?? 7,
      options.allowed ?? ((candidateX, candidateZ) => isOnLand(params, candidateX, candidateZ)),
      `${id} seed ${seed}`,
    );
    crates.push({
      id, x: point.x, z: point.z, tier, poi,
      ...(guaranteedItem ? { guaranteedItem } : {}),
    });
  };

  for (const [x, z] of MIDDLE_ISLAND_LOOT_SPOTS) { // authored contested pads
    addCrate(x, z, 'top', 'ruins', undefined, {
      maxDistance: 3,
      allowed: (x, z) => {
        const distance = Math.hypot(x, z);
        return distance >= 2.8 && distance <= RUINS_RADIUS * 0.78;
      },
    });
  }
  for (let i = 0; i < 3; i++) { // wreck: top loot, almost no natural cover
    const side = (i - 1) * 2.3;
    addCrate(
      wreck.x + Math.cos(wreckRot) * side,
      wreck.z + Math.sin(wreckRot) * side,
      'top',
      'wreck',
      undefined,
      {
        maxDistance: 7,
        allowed: (x, z) => isOnLand(params, x, z) && Math.hypot(x - wreck.x, z - wreck.z) <= 10,
      },
    );
  }
  const localPoint = (origin: { x: number; z: number }, yaw: number, lx: number, lz: number) => ({
    x: origin.x + Math.cos(yaw) * lx + Math.sin(yaw) * lz,
    z: origin.z - Math.sin(yaw) * lx + Math.cos(yaw) * lz,
  });
  for (let i = 0; i < 2; i++) { // watchtower: strong visibility but exposed
    const point = localPoint(plateau, watchtowerRot, i ? 3.3 : -3.3, i ? -1.2 : 1.2);
    // The exposed tower cache is the reliable marksman objective. Other top
    // crates retain their random sniper chance, so the weapon stays special.
    addCrate(
      point.x, point.z, i === 0 ? 'top' : 'good', 'watchtower',
      i === 0 ? 'sniper' : undefined,
      {
        maxDistance: 5,
        allowed: (x, z) => isOnLand(params, x, z)
          && Math.hypot(x - plateau.x, z - plateau.z) <= 9,
      },
    );
  }
  for (let i = 0; i < 2; i++) { // bunker: good loot in tight sightlines
    const point = localPoint(bunker, bunkerRot, i ? 1.9 : -1.9, 0.8);
    addCrate(point.x, point.z, 'good', 'bunker', undefined, {
      maxDistance: 5,
      allowed: (x, z) => isOnLand(params, x, z)
        && Math.hypot(x - bunker.x, z - bunker.z) <= 8,
    });
  }
  for (let i = 0; i < 2; i++) { // forest: common recovery route
    const s = landSpot(crateRng, params, (x, z) =>
      Math.hypot(x, z) > RUINS_RADIUS + 8
      && Math.hypot(x, z) < BEACH_INNER_RADIUS - 5
      && placement.canPlaceCircle(x, z, CRATE_PLACEMENT_RADIUS), `forest crate ${i} seed ${seed}`);
    addCrate(s.x, s.z, 'common', 'forest');
  }
  if (crates.length !== FIXED_POI_CRATES) throw new Error('fixed crate count mismatch');

  // ---- 3×N scatter crates (§3)
  const scatterRng = mulberry32(deriveSeed(seed, 'scatter'));
  for (let i = 0; i < scatterCrateCount(n); i++) {
    const s = landSpot(scatterRng, params, (x, z) =>
      Math.hypot(x, z) > RUINS_RADIUS
      && placement.canPlaceCircle(x, z, CRATE_PLACEMENT_RADIUS), `scatter crate ${i} seed ${seed}`);
    addCrate(s.x, s.z, scatterRng() < 0.3 ? 'good' : 'common', 'scatter');
  }

  // Keep the late-game reward close to the central landmark, but never on top
  // of authored cover, a fixed crate, the brazier or a navigation marker.
  const careRng = mulberry32(deriveSeed(seed, 'care-placement'));
  const careAngle = careRng() * Math.PI * 2;
  const carePreferredRadius = 6.5 + careRng() * 1.5;
  const carePackagePos = requiredNearbySpot(
    placement,
    Math.cos(careAngle) * carePreferredRadius,
    Math.sin(careAngle) * carePreferredRadius,
    CARE_PLACEMENT_RADIUS,
    careRng() * Math.PI * 2,
    5,
    (x, z) => {
      const distance = Math.hypot(x, z);
      return distance >= 4 && distance <= 12 && isOnLand(params, x, z);
    },
    `care-package seed ${seed}`,
  );

  // ---- spawn loot floor: 1 melee + 1 ranged + 2 bandages within 20 m (§5.3)
  const floorRng = mulberry32(deriveSeed(seed, 'floor'));
  const spawnFloorItems: GroundItem[] = [];
  for (const sp of spawns) {
    const melee = pick(floorRng, MELEE_FLOOR);
    const ranged = pick(floorRng, RANGED_FLOOR);
    const items: ItemType[] = [melee, ranged, 'bandageItem', 'bandageItem'];
    items.forEach((item, k) => {
      const a = floorRng() * Math.PI * 2;
      const r = randRange(floorRng, 2, 9); // well within 20 m
      const id = `spawn${sp.index}-item${k}`;
      const point = requiredNearbySpot(
        placement,
        sp.x + Math.cos(a) * r,
        sp.z + Math.sin(a) * r,
        FLOOR_ITEM_PLACEMENT_RADIUS,
        floorRng() * Math.PI * 2,
        5,
        (x, z) => {
          const spawnDistance = Math.hypot(x - sp.x, z - sp.z);
          return spawnDistance >= 1.8 && spawnDistance <= 12 && isOnLand(params, x, z);
        },
        `${id} seed ${seed}`,
      );
      spawnFloorItems.push({
        id,
        item,
        x: point.x,
        z: point.z,
      });
    });
  }

  // ---- small environmental props use the same reservations as gameplay loot.
  const decorations: WorldDecoration[] = [];
  const propRng = mulberry32(deriveSeed(seed, 'poi-props'));
  for (const poi of pois) {
    const count = 2 + Math.floor(propRng() * 2);
    for (let index = 0; index < count; index++) {
      const angle = propRng() * Math.PI * 2;
      const distance = randRange(propRng, 3.2, 4.8);
      const scale = randRange(propRng, 0.92, 1.08);
      const point = requiredNearbySpot(
        placement,
        poi.x + Math.cos(angle) * distance,
        poi.z + Math.sin(angle) * distance,
        DECORATION_RADIUS.barrel * scale,
        propRng() * Math.PI * 2,
        4,
        (x, z) => isOnLand(params, x, z) && Math.hypot(x - poi.x, z - poi.z) <= 8,
        `${poi.id} barrel ${index} seed ${seed}`,
      );
      decorations.push({
        id: `${poi.id}-barrel-${index}`,
        kind: 'barrel',
        owner: poi.id,
        x: point.x,
        z: point.z,
        scale,
        rot: propRng() * Math.PI * 2,
      });
    }
  }

  // ---- vegetation (also the resource nodes: tree→wood, rock→stone, bush→fiber)
  const vegRng = mulberry32(deriveSeed(seed, 'veg'));
  const vegetation: Veg[] = [];
  let vegId = 0;
  const clearOfPois = (x: number, z: number) => {
    if (Math.hypot(x, z) < RUINS_RADIUS + 4) return false;
    for (const sp of spawns) if (Math.hypot(x - sp.x, z - sp.z) < 5) return false;
    for (const poi of pois) {
      const clearRadius = poi.id === 'wreck' ? 8 : poi.id === 'watchtower' ? 12 : 10.5;
      if (Math.hypot(x - poi.x, z - poi.z) < clearRadius) return false;
    }
    return true;
  };
  const addVeg = (kind: VegKind, count: number, colliderBase: number, minScale: number, maxScale: number) => {
    for (let i = 0; i < count; i++) {
      const scale = randRange(vegRng, minScale, maxScale);
      const footprintRadius = kind === 'bush' ? 0.95 * scale : colliderBase * scale;
      const s = landSpot(
        vegRng,
        params,
        (x, z) => clearOfPois(x, z) && placement.canPlaceCircle(x, z, footprintRadius),
        `${kind} ${i} seed ${seed}`,
      );
      let variant: VegVariant = 'bush';
      if (kind === 'tree') {
        if (i === 0) variant = 'pine';
        else if (i === 1) variant = 'broadleaf';
        else if (i === 2) variant = 'palm';
        else if (Math.hypot(s.x, s.z) > 77 && vegRng() < 0.72) variant = 'palm';
        else variant = vegRng() < 0.52 ? 'pine' : 'broadleaf';
      } else if (kind === 'rock') {
        const rockVariants = ['boulder', 'slab', 'cluster'] as const;
        variant = rockVariants[i < 3 ? i : Math.floor(vegRng() * rockVariants.length)];
      }
      vegetation.push({
        id: vegId++,
        kind, variant,
        x: s.x, z: s.z, y: sampleHeight(params, s.x, s.z),
        scale,
        rot: vegRng() * Math.PI * 2,
        colliderRadius: colliderBase * scale,
      });
      placement.reserveCircle(s.x, s.z, footprintRadius, `${kind}-${vegId - 1}`);
    }
  };
  addVeg('tree', 220, 0.35, 0.8, 1.5);
  addVeg('rock', 70, 0.9, 0.7, 1.6);
  addVeg('bush', 190, 0, 0.8, 1.45);

  return {
    seed, n, params, spawns, plateau, pois, centralStructures, decorations, navigationLights,
    vegetation, crates, spawnFloorItems, carePackagePos,
  };
}

/** Returns the walk-through bush currently surrounding a player, if any. */
export function bushAt(gen: WorldGen, x: number, z: number): Veg | null {
  let nearest: Veg | null = null;
  let best = Infinity;
  for (const veg of gen.vegetation) {
    if (veg.kind !== 'bush') continue;
    const d = Math.hypot(x - veg.x, z - veg.z);
    if (d <= 0.95 * veg.scale && d < best) { nearest = veg; best = d; }
  }
  return nearest;
}

/**
 * Which N of the 5 spawn POIs each player gets, deterministic from seed + round (§3).
 * Player ids are sorted first so every peer computes the same assignment.
 */
export function assignSpawnIndices(seed: number, round: number, playerIds: string[]): Map<string, number> {
  const rng = mulberry32(deriveSeed(seed, `assign-r${round}`));
  const indices = [0, 1, 2, 3, 4];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const map = new Map<string, number>();
  [...playerIds].sort().forEach((id, i) => map.set(id, indices[i % 5]));
  return map;
}
