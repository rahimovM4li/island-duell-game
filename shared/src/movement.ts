// Shared kinematic movement (§4.1): identical on host (authority) and client
// (prediction), so reconciliation errors stay tiny on LAN.
import {
  AIM_SPEED, AIR_ACCEL, GRAVITY, GROUND_ACCEL, GROUND_DECEL, JUMP_SPEED, PRONE_SPEED,
  SNEAK_SPEED, SPRINT_SPEED, SPRINT_STAMINA_MAX, SPRINT_STAMINA_REGEN, WALK_SPEED, type WeaponType,
} from './constants';
import type { GamePhysics, Vec3 } from './physics';
import type { InputMsg } from './protocol';
import { clamp } from './terrain';

export const MAX_INPUT_DT = 0.05; // s; clamp both sides so cheating dt is capped

export interface MoveState {
  pos: Vec3;       // feet position
  velX: number;
  velY: number;
  velZ: number;
  grounded: boolean;
  stamina: number; // seconds of sprint left
  sprinting: boolean;
  sneaking: boolean;
  prone: boolean;
}

export function freshMoveState(pos: Vec3): MoveState {
  return {
    pos: { ...pos }, velX: 0, velY: 0, velZ: 0, grounded: false,
    stamina: SPRINT_STAMINA_MAX, sprinting: false, sneaking: false, prone: false,
  };
}

export function stanceForWeapon(weapon: WeaponType, controlHeld: boolean): { sneak: boolean; prone: boolean } {
  if (!controlHeld) return { sneak: false, prone: false };
  return weapon === 'sniper'
    ? { sneak: false, prone: true }
    : { sneak: true, prone: false };
}

/** Apply one input to a movement state via the physics character controller. */
export function stepMovement(phys: GamePhysics, id: string, st: MoveState, inp: InputMsg): void {
  const dt = clamp(inp.dt, 0.001, MAX_INPUT_DT);

  let mx = clamp(inp.mx, -1, 1);
  let mz = clamp(inp.mz, -1, 1);
  const len = Math.hypot(mx, mz);
  if (len > 1) { mx /= len; mz /= len; }
  const moving = len > 0.01;

  st.prone = inp.prone === true;
  st.sneaking = inp.sneak && !st.prone;
  phys.setPlayerStance(id, st.sneaking, st.prone, st.pos);
  const wantSprint = inp.sprint && !inp.aim && !st.sneaking && !st.prone && moving && st.stamina > 0;
  st.sprinting = wantSprint;
  st.stamina = wantSprint
    ? Math.max(0, st.stamina - dt)
    : Math.min(SPRINT_STAMINA_MAX, st.stamina + SPRINT_STAMINA_REGEN * dt);
  const speed = st.prone ? PRONE_SPEED : st.sneaking ? SNEAK_SPEED : inp.aim ? AIM_SPEED : wantSprint ? SPRINT_SPEED : WALK_SPEED;

  // yaw convention: yaw = 0 looks toward −Z (three.js)
  const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
  const fwd = { x: -sin, z: -cos };
  const right = { x: cos, z: -sin };
  const desiredX = (right.x * mx + fwd.x * mz) * speed;
  const desiredZ = (right.z * mx + fwd.z * mz) * speed;
  const accel = st.grounded ? (moving ? GROUND_ACCEL : GROUND_DECEL) : (moving ? AIR_ACCEL : 0);
  const approach = (current: number, target: number, maxDelta: number): number => {
    const delta = target - current;
    return current + Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
  };
  st.velX = approach(st.velX, desiredX, accel * dt);
  st.velZ = approach(st.velZ, desiredZ, accel * dt);
  const dx = st.velX * dt;
  const dz = st.velZ * dt;

  if (st.grounded && inp.jump && !st.sneaking && !st.prone) st.velY = JUMP_SPEED;
  st.velY = Math.max(-30, st.velY - GRAVITY * dt);
  const dy = st.velY * dt;

  const before = st.pos;
  const res = phys.moveCharacter(id, { x: dx, y: dy, z: dz });
  const actualVx = (res.pos.x - before.x) / dt;
  const actualVz = (res.pos.z - before.z) / dt;
  if (Math.abs(actualVx) < Math.abs(st.velX) * 0.2) st.velX = actualVx;
  if (Math.abs(actualVz) < Math.abs(st.velZ) * 0.2) st.velZ = actualVz;
  st.pos = res.pos;
  st.grounded = res.grounded;
  if (st.grounded && st.velY < 0) st.velY = -1; // keep pressed to ground on slopes
}
