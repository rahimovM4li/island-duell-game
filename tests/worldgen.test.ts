// §3/§5: deterministic generation, spawn ring geometry, crate counts, loot floor.
import { describe, expect, it } from 'vitest';
import {
  FIXED_POI_CRATES, ISLAND_LAND_RADIUS, SPAWN_RING_RADIUS, scatterCrateCount,
} from '@shared/constants';
import { buildHeightGrid, sampleHeight, terrainParams, RUINS_FLOOR_HEIGHT, RUINS_RADIUS } from '@shared/terrain';
import {
  assignSpawnIndices, generateWorld, MIDDLE_ISLAND_LOOT_SPOTS,
} from '@shared/worldgen';
import { World } from '../client/src/world';

const SEED = 123456789;

describe('deterministic generation (§9 M3)', () => {
  it('same seed → byte-identical world on host and client', () => {
    const a = generateWorld(SEED, 4);
    const b = generateWorld(SEED, 4);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('same seed → identical height grids', () => {
    const g1 = buildHeightGrid(terrainParams(SEED));
    const g2 = buildHeightGrid(terrainParams(SEED));
    expect(g1).toEqual(g2);
  });

  it('different seed → different world', () => {
    const a = generateWorld(SEED, 3);
    const b = generateWorld(SEED + 1, 3);
    expect(JSON.stringify(a.spawns)).not.toBe(JSON.stringify(b.spawns));
  });
});

describe('spawn POIs (§5.3)', () => {
  const gen = generateWorld(SEED, 5);

  it('exactly 5, all on the 80 m ring', () => {
    expect(gen.spawns).toHaveLength(5);
    for (const sp of gen.spawns) {
      expect(Math.hypot(sp.x, sp.z)).toBeCloseTo(SPAWN_RING_RADIUS, 6);
    }
  });

  it('72° apart', () => {
    for (let i = 1; i < 5; i++) {
      const d = gen.spawns[i].angle - gen.spawns[i - 1].angle;
      expect(d).toBeCloseTo((2 * Math.PI) / 5, 6);
    }
  });

  it('loot floor per spawn: melee + pistol + reserve ammo + 2 bandages within 20 m', () => {
    for (const sp of gen.spawns) {
      const items = gen.spawnFloorItems.filter((gi) => gi.id.startsWith(`spawn${sp.index}-`));
      expect(items).toHaveLength(5);
      const kinds = items.map((i) => i.item);
      expect(kinds.filter((k) => k === 'machete' || k === 'spear')).toHaveLength(1);
      expect(kinds.filter((k) => k === 'pistol')).toHaveLength(1);
      expect(kinds.filter((k) => k === 'pistolAmmo')).toHaveLength(1);
      expect(kinds.filter((k) => k === 'bandageItem')).toHaveLength(2);
      for (const gi of items) {
        expect(Math.hypot(gi.x - sp.x, gi.z - sp.z)).toBeLessThan(20);
      }
    }
  });
});

describe('crates (§3, §5.2)', () => {
  it('12 fixed POI crates + 3×N scatter for every N', () => {
    for (const n of [2, 3, 4, 5]) {
      const gen = generateWorld(SEED + n, n);
      expect(gen.crates).toHaveLength(FIXED_POI_CRATES + scatterCrateCount(n));
      const fixed = gen.crates.filter((c) => c.poi !== 'scatter');
      expect(fixed).toHaveLength(FIXED_POI_CRATES);
    }
  });

  it('keeps current POI loot tiers coupled to risk', () => {
    const gen = generateWorld(SEED, 3);
    expect(gen.crates.filter((c) => c.poi === 'ruins').every((c) => c.tier === 'top')).toBe(true);
    expect(gen.crates.filter((c) => c.poi === 'wreck').every((c) => c.tier === 'top')).toBe(true);
    expect(gen.crates.filter((c) => c.poi === 'watchtower').map((c) => c.tier).sort())
      .toEqual(['good', 'top']);
    expect(gen.crates.filter((c) => c.poi === 'bunker').every((c) => c.tier === 'good')).toBe(true);
    expect(gen.crates.filter((c) => c.poi === 'forest').every((c) => c.tier === 'common')).toBe(true);
  });

  it('crates are on the island', () => {
    const gen = generateWorld(SEED, 5);
    for (const c of gen.crates) {
      expect(Math.hypot(c.x, c.z)).toBeLessThan(ISLAND_LAND_RADIUS);
    }
  });

  it('keeps care, crates and spawn loot clear of generated objects across many seeds', () => {
    const failures: string[] = [];
    const verify = (condition: boolean, message: string) => {
      if (!condition && failures.length < 25) failures.push(message);
    };
    const circleClearOfBox = (
      x: number, z: number, radius: number,
      box: { x: number; z: number; w: number; d: number; rotY: number },
    ) => {
      const dx = x - box.x, dz = z - box.z;
      const c = Math.cos(box.rotY), s = Math.sin(box.rotY);
      const localX = c * dx - s * dz;
      const localZ = s * dx + c * dz;
      const nearestX = Math.max(-box.w / 2, Math.min(box.w / 2, localX));
      const nearestZ = Math.max(-box.d / 2, Math.min(box.d / 2, localZ));
      return Math.hypot(localX - nearestX, localZ - nearestZ) >= radius;
    };

    for (let seed = 1; seed <= 1_000; seed++) {
      const gen = generateWorld(seed, 5);
      verify(
        Math.hypot(gen.carePackagePos.x, gen.carePackagePos.z) > 3,
        `care package too close to centre at seed ${seed}`,
      );

      const solidStructures = gen.pois.flatMap((poi) => poi.structures.filter((part) =>
          (part.yOffset ?? 0) + part.h / 2
            - Math.abs(Math.cos(part.rotX ?? 0)) * part.h / 2
            - Math.abs(Math.sin(part.rotX ?? 0)) * part.d / 2 < 1.25));
      const loot = [
        ...gen.crates.map((entry) => ({ ...entry, radius: 0.8, label: entry.id })),
        ...gen.spawnFloorItems.map((entry) => ({ ...entry, radius: 0.5, label: entry.id })),
        { ...gen.carePackagePos, radius: 1.2, label: 'care' },
      ];

      for (const entry of loot) {
        verify(
          Math.hypot(entry.x, entry.z) >= entry.radius + 1.8,
          `${entry.label} overlaps central brazier at seed ${seed}`,
        );
        verify(
          solidStructures.every((part) => circleClearOfBox(entry.x, entry.z, entry.radius, part)),
          `${entry.label} overlaps structure at seed ${seed}`,
        );
        verify(
          gen.centralStructures.every((part) => part.shape === 'cylinder'
            ? Math.hypot(entry.x - part.x, entry.z - part.z) >= entry.radius + part.radius
            : circleClearOfBox(entry.x, entry.z, entry.radius, part)),
          `${entry.label} overlaps middle-island structure at seed ${seed}`,
        );
        verify(
          gen.vegetation.every((plant) => {
            const plantRadius = plant.kind === 'bush' ? 0.95 * plant.scale : plant.colliderRadius;
            return Math.hypot(entry.x - plant.x, entry.z - plant.z) >= entry.radius + plantRadius;
          }),
          `${entry.label} overlaps vegetation at seed ${seed}`,
        );
        verify(
          gen.decorations.every((detail) => {
            const detailRadius = (detail.kind === 'rubble' ? 0.48 : 0.42) * detail.scale;
            return Math.hypot(entry.x - detail.x, entry.z - detail.z)
              >= entry.radius + detailRadius;
          }),
          `${entry.label} overlaps decoration at seed ${seed}`,
        );
        verify(
          gen.navigationLights.every((light) =>
            Math.hypot(entry.x - light.x, entry.z - light.z) >= entry.radius + 0.32),
          `${entry.label} overlaps navigation light at seed ${seed}`,
        );
      }
      for (let i = 0; i < loot.length; i++) {
        for (let j = i + 1; j < loot.length; j++) {
          verify(
            Math.hypot(loot[i].x - loot[j].x, loot[i].z - loot[j].z)
              >= loot[i].radius + loot[j].radius,
            `${loot[i].label} overlaps ${loot[j].label} at seed ${seed}`,
          );
        }
      }
    }
    expect(failures).toEqual([]);
  });
});

describe('terrain features (§5.1)', () => {
  it('supports the complete central platform without floating edges', () => {
    for (const seed of [1, 7, 42, SEED]) {
      const params = terrainParams(seed);
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const x = Math.cos(angle) * 18;
        const z = Math.sin(angle) * 18;
        expect(sampleHeight(params, x, z)).toBeCloseTo(RUINS_FLOOR_HEIGHT, 5);
      }
    }
  });
  const p = terrainParams(SEED);

  it('ruins pad is flattened to a walkable floor', () => {
    expect(sampleHeight(p, 0, 0)).toBeCloseTo(RUINS_FLOOR_HEIGHT, 5);
    expect(sampleHeight(p, 5, 5)).toBeCloseTo(RUINS_FLOOR_HEIGHT, 1);
    void RUINS_RADIUS;
  });

  it('sea floor is below water level, land above', () => {
    expect(sampleHeight(p, 120, 0)).toBeLessThan(0);
    expect(sampleHeight(p, 0, 40)).toBeGreaterThan(0.6);
  });
});

describe('authored middle island', () => {
  const gen = generateWorld(SEED, 3);

  it('loads Blender-authored primitive colliders and two walkable ramps', () => {
    expect(gen.centralStructures).toHaveLength(99);
    expect(gen.centralStructures.filter((part) => part.shape === 'cylinder')).toHaveLength(3);
    expect(gen.centralStructures.filter((part) =>
      part.shape === 'box' && part.walkSurface)).toHaveLength(2);
    expect(gen.centralStructures.some((part) => part.name === 'Cover_High_Ruins_01')).toBe(true);
    expect(gen.centralStructures.some((part) => part.name === 'Brazier_StoneBase')).toBe(true);
    const outerCover = gen.centralStructures.filter((part) =>
      part.shape === 'box' && part.name.startsWith('Cover_High_Outer_'));
    expect(outerCover).toHaveLength(8);
    expect(outerCover.every((part) => part.shape === 'box' && part.h >= 2.2)).toBe(true);
  });

  it('places the three contested top crates on the authored loot pads', () => {
    const crates = gen.crates.filter((crate) => crate.poi === 'ruins');
    expect(crates).toHaveLength(3);
    for (const [x, z] of MIDDLE_ISLAND_LOOT_SPOTS) {
      expect(crates.some((crate) =>
        Math.hypot(crate.x - x, crate.z - z) < 0.001)).toBe(true);
    }
  });
});

describe('assignSpawnIndices (§3)', () => {
  it('deterministic and unique per player', () => {
    const ids = ['zz', 'aa', 'mm', 'bb'];
    const a = assignSpawnIndices(SEED, 1, ids);
    const b = assignSpawnIndices(SEED, 1, [...ids].reverse()); // order-independent
    expect([...a.entries()].sort()).toEqual([...b.entries()].sort());
    expect(new Set(a.values()).size).toBe(4);
  });

  it('rotates between rounds', () => {
    const ids = ['a', 'b', 'c'];
    const r1 = assignSpawnIndices(SEED, 1, ids);
    const r2 = assignSpawnIndices(SEED, 2, ids);
    expect(JSON.stringify([...r1])).not.toBe(JSON.stringify([...r2]));
  });
});

describe('natural cover', () => {
  it('renders pine, broadleaf and palm as distinct fallback batches', () => {
    const gen = generateWorld(SEED, 3);
    const world = new World(gen);
    const batches = world.scene.children
      .filter((object) => typeof object.userData.treeVariant === 'string')
      .map((object) => object.userData.treeVariant);
    expect(new Set(batches)).toEqual(new Set(['pine', 'broadleaf', 'palm']));
    world.dispose();
  });
  it('generates enough walk-through bushes for players to hide', () => {
    const bushes = generateWorld(SEED, 3).vegetation.filter((v) => v.kind === 'bush');
    expect(bushes.length).toBeGreaterThanOrEqual(180);
    expect(bushes.every((b) => b.colliderRadius === 0)).toBe(true);
  });

  it('distributes multiple readable tree and rock silhouettes deterministically', () => {
    const vegetation = generateWorld(SEED, 3).vegetation;
    const treeVariants = new Set(vegetation.filter((v) => v.kind === 'tree').map((v) => v.variant));
    const rockVariants = new Set(vegetation.filter((v) => v.kind === 'rock').map((v) => v.variant));
    expect(treeVariants).toEqual(new Set(['pine', 'broadleaf', 'palm']));
    expect(rockVariants).toEqual(new Set(['boulder', 'slab', 'cluster']));
  });
});

describe('risk/reward landmarks', () => {
  const gen = generateWorld(SEED, 5);

  it('builds exactly one readable wreck, watchtower and bunker with collision primitives', () => {
    expect(gen.pois.map((poi) => poi.id)).toEqual(['wreck', 'watchtower', 'bunker']);
    for (const poi of gen.pois) expect(poi.structures.some((part) => part.collider)).toBe(true);
    expect(gen.pois.find((poi) => poi.id === 'watchtower')!.structures.some((part) => (part.yOffset ?? 0) > 4)).toBe(true);
  });

  it('places high-value loot at exposed landmarks and recovery loot in forest', () => {
    expect(gen.crates.filter((crate) => crate.poi === 'wreck' && crate.tier === 'top')).toHaveLength(3);
    expect(gen.crates.filter((crate) => crate.poi === 'watchtower')).toHaveLength(2);
    expect(gen.crates.filter((crate) => crate.poi === 'bunker' && crate.tier === 'good')).toHaveLength(2);
    expect(gen.crates.filter((crate) => crate.poi === 'forest' && crate.tier === 'common')).toHaveLength(2);
  });

  it('keeps vegetation out of landmark combat footprints', () => {
    for (const poi of gen.pois) {
      const radius = poi.id === 'wreck' ? 8 : 7;
      expect(gen.vegetation.every((veg) => Math.hypot(veg.x - poi.x, veg.z - poi.z) >= radius)).toBe(true);
    }
  });

  it('guarantees one sniper cache at the exposed watchtower each round', () => {
    const gen = generateWorld(SEED, 3);
    const sniperCrates = gen.crates.filter((crate) => crate.guaranteedItem === 'sniper');
    expect(sniperCrates).toHaveLength(1);
    expect(sniperCrates[0]).toMatchObject({ poi: 'watchtower', tier: 'top' });
  });

  it('orients the watchtower stairs and bunker entrance away from the island centre', () => {
    for (const seed of [1, 42, 170, 330, 484]) {
      const world = generateWorld(seed, 2);
      for (const id of ['watchtower', 'bunker'] as const) {
        const poi = world.pois.find((entry) => entry.id === id)!;
        const yaw = poi.structures[0].rotY;
        const outwardX = poi.x / Math.hypot(poi.x, poi.z);
        const outwardZ = poi.z / Math.hypot(poi.x, poi.z);
        // Authored entrances face local +Z. A Three.js Y rotation maps that
        // direction to (sin(yaw), cos(yaw)) in world X/Z.
        expect(Math.sin(yaw) * outwardX + Math.cos(yaw) * outwardZ).toBeGreaterThan(0.999);
      }
    }
  });

  it('keeps the tower and bunker construction pads from overlapping', () => {
    for (let seed = 1; seed <= 250; seed++) {
      const world = generateWorld(seed, 2);
      const tower = world.pois.find((poi) => poi.id === 'watchtower')!;
      const bunker = world.pois.find((poi) => poi.id === 'bunker')!;
      expect(Math.hypot(tower.x - bunker.x, tower.z - bunker.z)).toBeGreaterThan(38);
    }
  });

  it('keeps tower access and the entire bunker footprint level on formerly broken seeds', () => {
    for (const seed of [42, 170, 330, 484, 496]) {
      const world = generateWorld(seed, 2);
      const tower = world.pois.find((poi) => poi.id === 'watchtower')!;
      const towerYaw = tower.structures[0].rotY;
      const towerBase = sampleHeight(world.params, tower.x, tower.z);
      const stairFootX = tower.x + Math.sin(towerYaw) * 7.5;
      const stairFootZ = tower.z + Math.cos(towerYaw) * 7.5;
      expect(sampleHeight(world.params, stairFootX, stairFootZ)).toBeCloseTo(towerBase, 5);

      const bunker = world.pois.find((poi) => poi.id === 'bunker')!;
      const bunkerYaw = bunker.structures[0].rotY;
      const c = Math.cos(bunkerYaw), s = Math.sin(bunkerYaw);
      const bunkerBase = sampleHeight(world.params, bunker.x, bunker.z);
      for (const lx of [-4.25, 0, 4.25]) {
        for (const lz of [-3.25, 0, 3.25]) {
          const x = bunker.x + c * lx + s * lz;
          const z = bunker.z - s * lx + c * lz;
          expect(sampleHeight(world.params, x, z)).toBeCloseTo(bunkerBase, 5);
        }
      }
    }
  });
});
