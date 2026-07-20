// Deterministic world content generation from the match seed (§3, §5).
// Host and clients run this identically; only loot *contents* of crates are
// rolled host-side and broadcast as events.
import {
  BEACH_INNER_RADIUS, FIXED_POI_CRATES, ISLAND_LAND_RADIUS, SPAWN_POI_COUNT,
  SPAWN_RING_RADIUS, scatterCrateCount, ItemType,
} from './constants';
import { deriveSeed, mulberry32, pick, randRange, Rng } from './rng';
import {
  isOnLand, plateauCenter, sampleHeight, terrainParams, TerrainParams, RUINS_RADIUS,
} from './terrain';

export type CrateTier = 'common' | 'good' | 'top';
export type VegKind = 'tree' | 'rock' | 'bush';

export interface Veg {
  id: number;
  kind: VegKind;
  x: number; z: number; y: number;
  scale: number;
  rot: number;
  colliderRadius: number; // 0 = walk-through (bushes)
}

export interface Crate {
  id: string;
  x: number; z: number;
  tier: CrateTier;
  poi: 'ruins' | 'beach' | 'plateau' | 'forest' | 'scatter';
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

export interface SpawnPoi { index: number; x: number; z: number; angle: number }

export interface WorldGen {
  seed: number;
  n: number;
  params: TerrainParams;
  spawns: SpawnPoi[];
  plateau: { x: number; z: number };
  ruinWalls: RuinWall[];
  vegetation: Veg[];
  crates: Crate[];
  spawnFloorItems: GroundItem[];
  carePackagePos: { x: number; z: number };
}

const MELEE_FLOOR: ItemType[] = ['machete', 'spear'];
const RANGED_FLOOR: ItemType[] = ['pistol', 'bow'];

function landSpot(rng: Rng, p: TerrainParams, ok: (x: number, z: number) => boolean): { x: number; z: number } {
  for (let tries = 0; tries < 200; tries++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (ISLAND_LAND_RADIUS - 6);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (isOnLand(p, x, z) && ok(x, z)) return { x, z };
  }
  return { x: 0, z: 40 }; // deterministic fallback, always on land
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

  // ---- ruins: broken walls around the flattened center pad
  const ruinRng = mulberry32(deriveSeed(seed, 'ruins'));
  const ruinWalls: RuinWall[] = [];
  const ruinBase = ruinRng() * Math.PI * 2;
  for (let i = 0; i < 8; i++) {
    const a = ruinBase + (i / 8) * Math.PI * 2 + randRange(ruinRng, -0.15, 0.15);
    if (ruinRng() < 0.22) continue; // broken gaps
    const r = randRange(ruinRng, 8, 14);
    ruinWalls.push({
      x: Math.cos(a) * r, z: Math.sin(a) * r,
      w: randRange(ruinRng, 4, 7), d: 0.8, h: randRange(ruinRng, 2.2, 3.6),
      rotY: a + Math.PI / 2,
    });
  }
  // inner cross walls for tight melee sightlines
  ruinWalls.push({ x: 3, z: 0, w: 5, d: 0.8, h: 2.6, rotY: ruinBase });
  ruinWalls.push({ x: -3, z: 2, w: 4, d: 0.8, h: 2.2, rotY: ruinBase + Math.PI / 2 });

  // ---- fixed 12 POI crates (§3): risk-coupled loot (§5.2)
  const crateRng = mulberry32(deriveSeed(seed, 'crates'));
  const crates: Crate[] = [];
  let crateId = 0;
  const addCrate = (x: number, z: number, tier: CrateTier, poi: Crate['poi']) =>
    crates.push({ id: `crate-${crateId++}`, x, z, tier, poi });

  for (let i = 0; i < 4; i++) { // ruins: top loot, contested center
    const a = crateRng() * Math.PI * 2;
    const r = randRange(crateRng, 3, RUINS_RADIUS * 0.7);
    addCrate(Math.cos(a) * r, Math.sin(a) * r, 'top', 'ruins');
  }
  for (let i = 0; i < 4; i++) { // beach: top loot, exposed
    const a = (i / 4) * Math.PI * 2 + crateRng() * 0.8 + baseAngle + Math.PI / 4;
    const r = randRange(crateRng, BEACH_INNER_RADIUS + 2, ISLAND_LAND_RADIUS - 6);
    addCrate(Math.cos(a) * r, Math.sin(a) * r, 'top', 'beach');
  }
  for (let i = 0; i < 2; i++) { // plateau: good loot
    const a = crateRng() * Math.PI * 2;
    const r = randRange(crateRng, 2, 10);
    addCrate(plateau.x + Math.cos(a) * r, plateau.z + Math.sin(a) * r, 'good', 'plateau');
  }
  for (let i = 0; i < 2; i++) { // forest: common, safe
    const s = landSpot(crateRng, params, (x, z) =>
      Math.hypot(x, z) > RUINS_RADIUS + 8 && Math.hypot(x, z) < BEACH_INNER_RADIUS - 5);
    addCrate(s.x, s.z, 'common', 'forest');
  }
  if (crates.length !== FIXED_POI_CRATES) throw new Error('fixed crate count mismatch');

  // ---- 3×N scatter crates (§3)
  const scatterRng = mulberry32(deriveSeed(seed, 'scatter'));
  for (let i = 0; i < scatterCrateCount(n); i++) {
    const s = landSpot(scatterRng, params, (x, z) => Math.hypot(x, z) > RUINS_RADIUS);
    addCrate(s.x, s.z, scatterRng() < 0.3 ? 'good' : 'common', 'scatter');
  }

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
      spawnFloorItems.push({
        id: `spawn${sp.index}-item${k}`,
        item,
        x: sp.x + Math.cos(a) * r,
        z: sp.z + Math.sin(a) * r,
      });
    });
  }

  // ---- vegetation (also the resource nodes: tree→wood, rock→stone, bush→fiber)
  const vegRng = mulberry32(deriveSeed(seed, 'veg'));
  const vegetation: Veg[] = [];
  let vegId = 0;
  const clearOfPois = (x: number, z: number) => {
    if (Math.hypot(x, z) < RUINS_RADIUS + 4) return false;
    for (const sp of spawns) if (Math.hypot(x - sp.x, z - sp.z) < 5) return false;
    for (const c of crates) if (Math.hypot(x - c.x, z - c.z) < 2.5) return false;
    return true;
  };
  const addVeg = (kind: VegKind, count: number, colliderBase: number, minScale: number, maxScale: number) => {
    for (let i = 0; i < count; i++) {
      const s = landSpot(vegRng, params, clearOfPois);
      const scale = randRange(vegRng, minScale, maxScale);
      vegetation.push({
        id: vegId++,
        kind,
        x: s.x, z: s.z, y: sampleHeight(params, s.x, s.z),
        scale,
        rot: vegRng() * Math.PI * 2,
        colliderRadius: colliderBase * scale,
      });
    }
  };
  addVeg('tree', 220, 0.35, 0.8, 1.5);
  addVeg('rock', 70, 0.9, 0.7, 1.6);
  addVeg('bush', 130, 0, 0.7, 1.3);

  return {
    seed, n, params, spawns, plateau, ruinWalls, vegetation, crates,
    spawnFloorItems, carePackagePos: { x: 0, z: 0 }, // §7: map center airdrop
  };
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
