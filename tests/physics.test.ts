// §10: Rapier heightfield orientation must match sampleHeight, and the shared
// character controller must walk on the terrain (host + prediction parity).
import { beforeAll, describe, expect, it } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { GamePhysics } from '@shared/physics';
import { freshMoveState, stepMovement } from '@shared/movement';
import { sampleHeight } from '@shared/terrain';
import { generateWorld } from '@shared/worldgen';
import type { InputMsg } from '@shared/protocol';

const SEED = 424242;

const idleInput = (over: Partial<InputMsg> = {}): InputMsg => ({
  seq: 0, dt: 0.033, mx: 0, mz: 0, yaw: 0, pitch: 0,
  sprint: false, sneak: false, aim: false,
  jump: false, fire: false, interact: false, ...over,
});

describe('heightfield collider', () => {
  let phys: GamePhysics;
  let gen: ReturnType<typeof generateWorld>;

  beforeAll(async () => {
    await RAPIER.init();
    gen = generateWorld(SEED, 3);
    phys = new GamePhysics(RAPIER, gen);
  });

  it('raycast down hits terrain at sampleHeight (orientation check, incl. x≠z asymmetric points)', () => {
    // asymmetric sample points would expose a transposed heightfield immediately
    const points = [[10, 60], [60, 10], [-40, 25], [25, -40], [0, 0], [-70, -12]];
    for (const [x, z] of points) {
      const hit = phys.raycast({ x, y: 60, z }, { x: 0, y: -1, z: 0 }, 200);
      expect(hit, `no hit at ${x},${z}`).not.toBeNull();
      const expected = sampleHeight(gen.params, x, z);
      // heightfield is a linear interpolation of the 2 m grid → small tolerance
      expect(Math.abs(hit!.point.y - expected)).toBeLessThan(0.35);
    }
  });

  it('character falls onto the terrain and reports grounded', () => {
    const x = 30, z = -20;
    phys.addPlayer('p1', { x, y: sampleHeight(gen.params, x, z) + 5, z });
    const st = freshMoveState({ x, y: sampleHeight(gen.params, x, z) + 5, z });
    for (let i = 0; i < 120; i++) {
      stepMovement(phys, 'p1', st, idleInput());
      phys.step();
    }
    expect(st.grounded).toBe(true);
    expect(Math.abs(st.pos.y - sampleHeight(gen.params, st.pos.x, st.pos.z))).toBeLessThan(0.4);
    phys.removePlayer('p1');
  });

  it('uses distinct walking, sprinting and aiming speeds', () => {
    // flat, obstacle-free sea floor (no vegetation/ruins colliders out there)
    const start = { x: 0, y: sampleHeight(gen.params, 0, -118) + 0.2, z: -118 };
    for (const [sprint, aim, speed] of [[false, false, 6], [true, false, 9], [true, true, 4.4]] as const) {
      phys.addPlayer('p2', start);
      const st = freshMoveState(start);
      // settle on ground
      for (let i = 0; i < 30; i++) { stepMovement(phys, 'p2', st, idleInput()); phys.step(); }
      const from = { ...st.pos };
      const steps = 60; // 2 s of movement, walking +X along the rim
      for (let i = 0; i < steps; i++) {
        stepMovement(phys, 'p2', st, idleInput({ mz: 1, sprint, aim, yaw: -Math.PI / 2 }));
        phys.step();
      }
      const d = Math.hypot(st.pos.x - from.x, st.pos.z - from.z);
      const measured = d / (steps * 0.033);
      expect(measured).toBeGreaterThan(speed * 0.8);
      expect(measured).toBeLessThan(speed * 1.1);
      if (aim) expect(st.sprinting).toBe(false);
      phys.removePlayer('p2');
    }
  });

  it('jump lifts off and lands again (no double jump: velY only set when grounded)', () => {
    const start = { x: 2, y: sampleHeight(gen.params, 2, 2) + 0.2, z: 2 };
    phys.addPlayer('p3', start);
    const st = freshMoveState(start);
    for (let i = 0; i < 30; i++) { stepMovement(phys, 'p3', st, idleInput()); phys.step(); }
    const groundY = st.pos.y;
    stepMovement(phys, 'p3', st, idleInput({ jump: true }));
    phys.step();
    let peak = st.pos.y;
    for (let i = 0; i < 90; i++) {
      stepMovement(phys, 'p3', st, idleInput());
      phys.step();
      peak = Math.max(peak, st.pos.y);
    }
    expect(peak).toBeGreaterThan(groundY + 0.5);
    expect(st.grounded).toBe(true);
    expect(Math.abs(st.pos.y - groundY)).toBeLessThan(0.3);
    phys.removePlayer('p3');
  });

  it('accelerates responsively and decelerates to a stable stop', () => {
    const start = { x: 0, y: sampleHeight(gen.params, 0, -118) + 0.2, z: -118 };
    phys.addPlayer('smooth', start);
    const st = freshMoveState(start);
    for (let i = 0; i < 30; i++) { stepMovement(phys, 'smooth', st, idleInput()); phys.step(); }

    stepMovement(phys, 'smooth', st, idleInput({ mz: 1, yaw: -Math.PI / 2 }));
    phys.step();
    expect(Math.hypot(st.velX, st.velZ)).toBeGreaterThan(0.5);
    expect(Math.hypot(st.velX, st.velZ)).toBeLessThan(6);

    for (let i = 0; i < 12; i++) {
      stepMovement(phys, 'smooth', st, idleInput({ mz: 1, yaw: -Math.PI / 2 }));
      phys.step();
    }
    expect(Math.hypot(st.velX, st.velZ)).toBeGreaterThan(5.5);

    for (let i = 0; i < 8; i++) { stepMovement(phys, 'smooth', st, idleInput()); phys.step(); }
    expect(Math.hypot(st.velX, st.velZ)).toBeLessThan(0.1);
    phys.removePlayer('smooth');
  });

  it('sneaking is slower, blocks sprinting and lowers the collision capsule', () => {
    const start = { x: -35, y: sampleHeight(gen.params, -35, -80) + 0.2, z: -80 };
    phys.addPlayer('sneak', start);
    const st = freshMoveState(start);
    for (let i = 0; i < 30; i++) { stepMovement(phys, 'sneak', st, idleInput()); phys.step(); }
    const from = { ...st.pos };
    for (let i = 0; i < 30; i++) {
      stepMovement(phys, 'sneak', st, idleInput({
        mz: 1, sprint: true, sneak: true, yaw: -Math.PI / 2,
      }));
      phys.step();
    }
    const speed = Math.hypot(st.pos.x - from.x, st.pos.z - from.z) / (30 * 0.033);
    expect(speed).toBeGreaterThan(2.5);
    expect(speed).toBeLessThan(4);
    expect(st.sprinting).toBe(false);
    expect(st.sneaking).toBe(true);
    const highRay = phys.raycast(
      { x: st.pos.x - 2, y: st.pos.y + 1.55, z: st.pos.z },
      { x: 1, y: 0, z: 0 }, 4,
    );
    expect(highRay?.playerId).not.toBe('sneak');
    phys.removePlayer('sneak');
  });

  it('raycast can hit a player capsule and reports the id', () => {
    phys.addPlayer('target', { x: 50, y: sampleHeight(gen.params, 50, 0), z: 0 });
    phys.step();
    const eye = { x: 46, y: sampleHeight(gen.params, 50, 0) + 0.9, z: 0 };
    const hit = phys.raycast(eye, { x: 1, y: 0, z: 0 }, 10, []);
    expect(hit?.playerId).toBe('target');
    phys.removePlayer('target');
  });
});
