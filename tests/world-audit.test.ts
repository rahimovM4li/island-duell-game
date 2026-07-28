import { describe, expect, it } from 'vitest';
import { PLAYER_RADIUS } from '@shared/constants';
import { auditWorld } from '@shared/world-audit';
import { generateWorld } from '@shared/worldgen';
import { World } from '../client/src/world';

describe('world collider and navigation audit', () => {
  it('keeps authored passages wider than a player capsule across seeds', () => {
    for (const seed of [1, 7, 42, 123456789]) {
      const report = auditWorld(generateWorld(seed, 5));
      expect(report.namedPassages.map((entry) => entry.name))
        .toEqual(['Bunker-Eingang', 'Turm-Bodenöffnung']);
      expect(report.namedPassages.every((entry) => entry.width > PLAYER_RADIUS * 2)).toBe(true);
      expect(report.errors).toBe(0);
    }
  });

  it('audits every authored ramp and collider from one deterministic report', () => {
    const gen = generateWorld(123456789, 3);
    const report = auditWorld(gen);
    const expectedWalkSurfaces = gen.centralStructures.filter((entry) =>
      entry.shape === 'box' && entry.walkSurface).length
      + gen.pois.flatMap((poi) => poi.structures).filter((entry) => entry.walkSurface).length;
    expect(report.walkSurfaces).toBe(expectedWalkSurfaces);
    expect(report.colliders).toBeGreaterThan(300);
  });

  it('keeps the complete audit clean across many generated matches', () => {
    const failures: string[] = [];
    for (let seed = 1; seed <= 100; seed++) {
      const report = auditWorld(generateWorld(seed, 5));
      if (report.errors > 0 || report.warnings > 0) {
        failures.push(`seed ${seed}: ${report.issues.map((issue) => issue.object).join(', ')}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('renders the authoritative static proxies as a batched F3 overlay', () => {
    const world = new World(generateWorld(42, 3));
    expect(world.stats().colliderDebug.visible).toBe(false);
    world.setColliderDebugVisible(true);
    expect(world.stats().colliderDebug).toEqual({ visible: true, meshes: 3 });
    expect(world.scene.getObjectByName('debug-walk-surfaces')).toBeDefined();
    expect(world.worldAudit().errors).toBe(0);
    world.dispose();
  });

  it('fails loudly for malformed or duplicate gameplay collision proxies', () => {
    const gen = generateWorld(99, 3);
    const original = gen.centralStructures.find((entry) => entry.shape === 'box')!;
    gen.centralStructures.push({ ...original });
    gen.centralStructures.push({ ...original, name: 'Broken_Collider', w: -1 });
    const report = auditWorld(gen);
    expect(report.issues.some((issue) => issue.kind === 'duplicate-collider')).toBe(true);
    expect(report.issues.some((issue) => issue.kind === 'invalid-collider')).toBe(true);
    expect(report.errors).toBeGreaterThanOrEqual(2);
  });
});
