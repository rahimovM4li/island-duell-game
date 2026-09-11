import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { GamePhysics } from '@shared/physics';
import { freshMoveState, stepMovement } from '@shared/movement';
import { generateWorld } from '@shared/worldgen';
import { sampleHeight } from '@shared/terrain';
import type { InputMsg } from '@shared/protocol';
import { firstPersonWeapon } from '../client/src/first-person-weapon';
import { Entities } from '../client/src/entities';

const input = (changes: Partial<InputMsg> = {}): InputMsg => ({
  seq: 0, dt: 1 / 30, mx: 0, mz: 0, yaw: 0, pitch: 0,
  sprint: false, sneak: false, aim: false, jump: false, fire: false, interact: false, ...changes,
});

describe('responsive movement and prediction state', () => {
  function simulatedFloor() {
    const st = freshMoveState({ x: 0, y: 0, z: 0 });
    st.grounded = true;
    let floor = true;
    const phys = {
      setPlayerStance() {},
      moveCharacter(_id: string, d: { x: number; y: number; z: number }) {
        const y = st.pos.y + d.y;
        return { pos: { x: st.pos.x + d.x, y: floor ? Math.max(0, y) : y, z: st.pos.z + d.z }, grounded: floor && y <= 0 };
      },
    } as unknown as GamePhysics;
    return { st, phys, floor: (active: boolean) => { floor = active; } };
  }

  it('allows a late ledge jump but consumes that opportunity once', () => {
    const { st, phys, floor } = simulatedFloor();
    floor(false);
    stepMovement(phys, 'p', st, input());
    stepMovement(phys, 'p', st, input({ jump: true }));
    expect(st.velY).toBeGreaterThan(5);
    stepMovement(phys, 'p', st, input());
    const velocity = st.velY;
    stepMovement(phys, 'p', st, input({ jump: true }));
    expect(st.velY).toBeLessThan(velocity);
  });

  it('expires late jumps and buffers a press just before landing', () => {
    const { st, phys, floor } = simulatedFloor();
    floor(false);
    for (let i = 0; i < 6; i++) stepMovement(phys, 'p', st, input());
    stepMovement(phys, 'p', st, input({ jump: true }));
    expect(st.velY).toBeLessThan(0);
    floor(true);
    stepMovement(phys, 'p', st, input());
    stepMovement(phys, 'p', st, input());
    expect(st.velY).toBeGreaterThan(5);
  });

  it('does not auto-jump when space stays held across landing', () => {
    const { st, phys } = simulatedFloor();
    let jumps = 0;
    for (let i = 0; i < 90; i++) {
      const vy = st.velY;
      stepMovement(phys, 'p', st, input({ jump: true }));
      if (vy <= 0 && st.velY > 0) jumps++;
    }
    expect(jumps).toBe(1);
    expect(st.grounded).toBe(true);
  });

  it('accelerates diagonally at the same rate and prevents exhausted sprint flicker', () => {
    const a = simulatedFloor(), b = simulatedFloor();
    stepMovement(a.phys, 'p', a.st, input({ mz: 1 }));
    stepMovement(b.phys, 'p', b.st, input({ mx: 1, mz: 1 }));
    expect(Math.hypot(a.st.velX, a.st.velZ)).toBeCloseTo(Math.hypot(b.st.velX, b.st.velZ));
    a.st.stamina = 0;
    for (let i = 0; i < 8; i++) {
      stepMovement(a.phys, 'p', a.st, input({ mz: 1, sprint: true }));
      expect(a.st.sprinting).toBe(false);
    }
  });

  it('replays a buffered input from a copied authoritative state identically', () => {
    const a = simulatedFloor(), b = simulatedFloor();
    a.floor(false); b.floor(false);
    stepMovement(a.phys, 'p', a.st, input());
    Object.assign(b.st, structuredClone(a.st));
    for (const jump of [true, true, false, false]) {
      const packet = input({ jump, mx: 1, sprint: true });
      stepMovement(a.phys, 'p', a.st, packet);
      stepMovement(b.phys, 'p', b.st, packet);
    }
    expect(b.st).toEqual(a.st);
  });
});

describe('wreck routes with real collision', () => {
  beforeAll(async () => { await RAPIER.init(); });

  it('supports stern entry, side entry, ramp ascent and overhead collision across seeds', () => {
    for (const seed of [1, 24, 42, 99]) {
      const gen = generateWorld(seed, 3);
      const poi = gen.pois.find((p) => p.id === 'wreck')!;
      const phys = new GamePhysics(RAPIER, gen);
      const baseY = sampleHeight(gen.params, poi.x, poi.z);
      const point = (x: number, z: number, y = 0.25) => ({
        x: poi.x + Math.cos(poi.rootYaw) * x + Math.sin(poi.rootYaw) * z,
        y: baseY + y,
        z: poi.z - Math.sin(poi.rootYaw) * x + Math.cos(poi.rootYaw) * z,
      });
      const walk = (x: number, z: number, changes: Partial<InputMsg>, count: number) => {
        const st = freshMoveState(point(x, z));
        phys.addPlayer('walker', st.pos);
        for (let i = 0; i < 20; i++) { stepMovement(phys, 'walker', st, input()); phys.step(); }
        let maxY = st.pos.y;
        for (let i = 0; i < count; i++) {
          stepMovement(phys, 'walker', st, input({ yaw: poi.rootYaw, ...changes }));
          phys.step(); maxY = Math.max(maxY, st.pos.y);
        }
        phys.removePlayer('walker');
        return { st, maxY };
      };
      const stern = walk(-8.5, 0.7, { mx: 1 }, 35);
      expect(Math.hypot(stern.st.pos.x - point(-3, 0.7).x, stern.st.pos.z - point(-3, 0.7).z), `stern ${seed}`).toBeLessThan(1.5);
      const side = walk(0, 4.6, { mz: 1 }, 20);
      expect(Math.hypot(side.st.pos.x - point(0, 1).x, side.st.pos.z - point(0, 1).z), `side ${seed}`).toBeLessThan(1.5);
      const ramp = walk(4.5, 8.2, { mz: 1 }, 45);
      expect(ramp.maxY, `ramp ${seed}`).toBeGreaterThan(baseY + 2.65);
      const ceiling = walk(4.4, 0, { jump: true }, 20);
      expect(ceiling.maxY, `ceiling ${seed}`).toBeLessThan(baseY + 0.8);
      expect(ceiling.maxY).toBeGreaterThan(baseY + 0.35);
      const metal = phys.raycast(point(4.4, -3, 6), { x: 0, y: -1, z: 0 }, 6);
      expect(metal?.surface).toBe('metal');
      const wood = phys.raycast(point(-3.4, -1.1, 4), { x: 0, y: -1, z: 0 }, 5);
      expect(wood?.surface).toBe('wood');
      expect(wood?.normal?.y).toBeGreaterThan(0.9);
      phys.dispose();
    }
  });
});

describe('weapon animation and material effects', () => {
  it('turns the legs toward strafing while preserving aim and resets the contact pose', () => {
    const scene = new THREE.Scene();
    const entities = new Entities(scene, new THREE.PerspectiveCamera(), 5);
    entities.ensurePlayer('runner', 0);
    entities.updatePlayer('runner', 0, 0, 0, 0, 0, true, 'rifle', false, false, true, false,
      { speed: 6, vx: 6, vz: 0, grounded: true });
    entities.update(0.4, 0.4);
    const rig = (entities as any).players.get('runner');
    expect(rig.group.rotation.y).toBe(0);
    expect(rig.legLeft.rotation.y).toBeLessThan(-1);
    expect(rig.legRight.rotation.y).toBeLessThan(-1);
    expect(Math.abs(rig.group.rotation.z)).toBeLessThan(0.15);
    entities.resetPlayerAnimations();
    expect(rig.legLeft.position.y).toBe(rig.legLeftY);
    expect(rig.legLeft.rotation.y).toBe(rig.legLeftBase.y);
    entities.dispose();
  });

  it('moves actual weapon parts and restores them on reload cancellation and switching', () => {
    const entities = new Entities(new THREE.Scene(), new THREE.PerspectiveCamera(), 42);
    entities.setViewWeapon('rifle');
    entities.setReloading(true, 1);
    entities.update(0.4, 0.4);
    const magazine = entities.viewRoot.getObjectByName('moving-magazine')!;
    expect(magazine.position.y).toBeLessThan(-0.4);
    entities.setReloading(false);
    entities.update(1 / 60, 0.42);
    expect(magazine.position.y).toBeCloseTo(0);
    entities.setReloading(true, 1);
    entities.update(0.82, 1.24);
    expect(entities.viewRoot.getObjectByName('moving-bolt')!.position.z).toBeGreaterThan(0.1);
    entities.setViewWeapon('pistol', true);
    entities.update(1 / 60, 1.3);
    expect(entities.viewRoot.getObjectByName('moving-magazine')!.position.y).toBeCloseTo(0);
    entities.dispose();
  });

  it('builds finite camera models for every firearm and caps/cleans effects', () => {
    for (const kind of ['pistol', 'rifle', 'shotgun', 'sniper'] as const) {
      const model = firstPersonWeapon(kind)!;
      const bounds = new THREE.Box3().setFromObject(model);
      expect(bounds.isEmpty()).toBe(false);
      expect(bounds.getSize(new THREE.Vector3()).length()).toBeLessThan(3);
    }
    const scene = new THREE.Scene();
    const entities = new Entities(scene, new THREE.PerspectiveCamera(), 42);
    for (let i = 0; i < 100; i++) entities.addImpact(0, 1, 0, 'rifle', i % 2 ? 'wood' : 'stone');
    expect(entities.stats().effects).toBeLessThanOrEqual(207);
    entities.update(1, 1);
    expect(entities.stats().effects).toBe(0);
    entities.dispose();
  });
});
