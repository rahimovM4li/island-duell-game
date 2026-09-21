import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { generateWorld } from '@shared/worldgen';
import { sampleHeight } from '@shared/terrain';
import { routeDistance } from '@shared/combat-layout';
import { GamePhysics } from '@shared/physics';
import { freshMoveState, stepMovement } from '@shared/movement';
import { buildCombatScenery } from '../client/src/combat-scenery';

describe('authored combat approaches', () => {
  beforeAll(async () => { await RAPIER.init(); });

  it('keeps routes clear of resources and loot across generated matches', () => {
    const failures: string[] = [];
    for (let seed = 1; seed <= 100; seed++) {
      const gen = generateWorld(seed, 5);
      for (const route of gen.combatRoutes) {
        for (const v of gen.vegetation) if (routeDistance(route, v.x, v.z)
          < route.width / 2 + (v.kind === 'bush' ? 0.95 * v.scale : v.colliderRadius) - 0.001) failures.push(`${seed}/${route.name}/vegetation-${v.id}`);
        for (const c of gen.crates) if (routeDistance(route, c.x, c.z) < route.width / 2 + 0.79) failures.push(`${seed}/${route.name}/${c.id}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('walks both covered flanks and through the rear bunker door using the real controller', () => {
    for (const seed of [1, 2, 7, 24, 42, 99, 170, 330, 484, 496, 123456789]) {
      const gen = generateWorld(seed, 3), phys = new GamePhysics(RAPIER, gen);
      try {
        const paths = gen.combatRoutes.filter(r => r.name.includes('flank') || r.name === 'bunker-rear-entry');
        for (const route of paths) {
          const first = route.points[0];
          const st = freshMoveState({ ...first, y: sampleHeight(gen.params, first.x, first.z) + 0.15 });
          phys.addPlayer('walker', st.pos);
          for (const end of route.points.slice(1)) {
            let steps = 0;
            while (Math.hypot(end.x - st.pos.x, end.z - st.pos.z) > 0.35 && steps++ < 240) {
              stepMovement(phys, 'walker', st, {
                seq: steps, dt: 1 / 30, mx: 0, mz: 1, yaw: Math.atan2(st.pos.x - end.x, st.pos.z - end.z), pitch: 0,
                sprint: false, sneak: false, aim: false, jump: false, fire: false, interact: false,
              }, 'pistol');
              phys.step();
            }
            expect(Math.hypot(end.x - st.pos.x, end.z - st.pos.z), `${seed}/${route.name} end=${JSON.stringify(end)} pos=${JSON.stringify(st.pos)} ground=${sampleHeight(gen.params, st.pos.x, st.pos.z)}`).toBeLessThan(0.4);
          }
          phys.removePlayer('walker');
        }
        const bunker = gen.pois.find(p => p.id === 'bunker')!;
        const base = sampleHeight(gen.params, bunker.x, bunker.z);
        const direction = { x: Math.sin(bunker.rootYaw), y: 0, z: Math.cos(bunker.rootYaw) };
        const origin = { x: bunker.x - direction.x * 5, y: base + 1.4, z: bunker.z - direction.z * 5 };
        expect(phys.raycast(origin, direction, 8), `rear sightline ${seed}`).toBeNull();
      } finally { phys.dispose(); }
    }
  });

  it('renders every new solid at its authoritative collider transform', () => {
    const gen = generateWorld(42, 3), model = buildCombatScenery(gen);
    model.updateMatrixWorld(true);
    for (const poi of gen.pois) for (const part of poi.structures.filter(p => p.name.startsWith('combat-cover'))) {
      const mesh = model.getObjectByName(`${poi.id}-${part.name}`)!.getObjectByName('solid-cover') as THREE.Mesh;
      const center = mesh.getWorldPosition(new THREE.Vector3());
      expect(center.x).toBeCloseTo(part.x, 5); expect(center.z).toBeCloseTo(part.z, 5);
      expect(center.y).toBeCloseTo(sampleHeight(gen.params, poi.x, poi.z) + (part.yOffset ?? 0) + part.h / 2, 5);
      mesh.geometry.computeBoundingBox();
      const size = mesh.geometry.boundingBox!.getSize(new THREE.Vector3());
      expect(size.x).toBeCloseTo(part.w, 5); expect(size.y).toBeCloseTo(part.h, 5); expect(size.z).toBeCloseTo(part.d, 5);
    }
  });
});
