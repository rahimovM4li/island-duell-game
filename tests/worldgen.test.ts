// §3/§5: deterministic generation, spawn ring geometry, crate counts, loot floor.
import { describe, expect, it } from 'vitest';
import {
  FIXED_POI_CRATES, ISLAND_LAND_RADIUS, SPAWN_RING_RADIUS, scatterCrateCount,
} from '@shared/constants';
import { buildHeightGrid, sampleHeight, terrainParams, RUINS_FLOOR_HEIGHT, RUINS_RADIUS } from '@shared/terrain';
import { assignSpawnIndices, generateWorld } from '@shared/worldgen';

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

  it('loot floor per spawn: 1 melee + 1 ranged + 2 bandages within 20 m', () => {
    for (const sp of gen.spawns) {
      const items = gen.spawnFloorItems.filter((gi) => gi.id.startsWith(`spawn${sp.index}-`));
      expect(items).toHaveLength(4);
      const kinds = items.map((i) => i.item);
      expect(kinds.filter((k) => k === 'machete' || k === 'spear')).toHaveLength(1);
      expect(kinds.filter((k) => k === 'pistol' || k === 'bow')).toHaveLength(1);
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

  it('risk-coupled tiers: ruins & beach = top, plateau = good, forest = common (§5.2)', () => {
    const gen = generateWorld(SEED, 3);
    for (const c of gen.crates) {
      if (c.poi === 'ruins' || c.poi === 'beach') expect(c.tier).toBe('top');
      if (c.poi === 'plateau') expect(c.tier).toBe('good');
      if (c.poi === 'forest') expect(c.tier).toBe('common');
    }
  });

  it('crates are on the island', () => {
    const gen = generateWorld(SEED, 5);
    for (const c of gen.crates) {
      expect(Math.hypot(c.x, c.z)).toBeLessThan(ISLAND_LAND_RADIUS);
    }
  });
});

describe('terrain features (§5.1)', () => {
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
  it('generates enough walk-through bushes for players to hide', () => {
    const bushes = generateWorld(SEED, 3).vegetation.filter((v) => v.kind === 'bush');
    expect(bushes.length).toBeGreaterThanOrEqual(180);
    expect(bushes.every((b) => b.colliderRadius === 0)).toBe(true);
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
});
