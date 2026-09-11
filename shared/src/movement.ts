// Shared kinematic movement (§4.1): identical on host (authority) and client
// (prediction), so reconciliation errors stay tiny on LAN.
import {
  AIM_SPEED, AIR_ACCEL, GRAVITY, GROUND_ACCEL, GROUND_DECEL, JUMP_SPEED,
  PRONE_AIM_SPEED, PRONE_SPEED,
  SNEAK_SPEED, SPRINT_SPEED, SPRINT_STAMINA_MAX, SPRINT_STAMINA_REGEN, WALK_SPEED,
  WEAPON_MOVE_MULTIPLIER, type WeaponType,
} from './constants';
import type { GamePhysics, Vec3 } from './physics';
import type { InputMsg } from './protocol';
import { clamp } from './terrain';

export const MAX_INPUT_DT = 0.05; // s; clamp both sides so cheating dt is capped
export const COYOTE_TIME = 0.1;
export const JUMP_BUFFER_TIME = 0.1;
export const SPRINT_RECOVERY = 0.65;

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
  coyoteTime: number;
  jumpBuffer: number;
  jumpHeld: boolean;
  sprintExhausted: boolean;
}

export function freshMoveState(pos: Vec3): MoveState {
  return {
    pos: { ...pos }, velX: 0, velY: 0, velZ: 0, grounded: false,
    stamina: SPRINT_STAMINA_MAX, sprinting: false, sneaking: false, prone: false,
    coyoteTime: 0, jumpBuffer: 0, jumpHeld: false, sprintExhausted: false,
  };
}

export function stanceForWeapon(weapon: WeaponType, controlHeld: boolean): { sneak: boolean; prone: boolean } {
  if (!controlHeld) return { sneak: false, prone: false };
  return weapon === 'sniper'
    ? { sneak: false, prone: true }
    : { sneak: true, prone: false };
}

export function movementSpeedFor(
  weapon: WeaponType,
  prone: boolean,
  sneaking: boolean,
  aiming: boolean,
  sprinting: boolean,
): number {
  if (prone) return aiming ? PRONE_AIM_SPEED : PRONE_SPEED;
  if (sneaking) return SNEAK_SPEED;
  if (aiming) return AIM_SPEED;
  const base = sprinting ? SPRINT_SPEED : WALK_SPEED;
  return base * (WEAPON_MOVE_MULTIPLIER[weapon] ?? 1);
}

/** Apply one input to a movement state via the physics character controller. */
export function stepMovement(
  phys: GamePhysics,
  id: string,
  st: MoveState,
  inp: InputMsg,
  weapon: WeaponType = 'knife',
): void {
  const dt = clamp(inp.dt, 0.001, MAX_INPUT_DT);

  let mx = clamp(inp.mx, -1, 1);
  let mz = clamp(inp.mz, -1, 1);
  const len = Math.hypot(mx, mz);
  if (len > 1) { mx /= len; mz /= len; }
  const moving = len > 0.01;

  st.prone = inp.prone === true;
  st.sneaking = inp.sneak && !st.prone;
  phys.setPlayerStance(id, st.sneaking, st.prone, st.pos, inp.yaw);
  if (st.stamina <= 0) st.sprintExhausted = true;
  if (st.stamina >= SPRINT_RECOVERY) st.sprintExhausted = false;
  const wantSprint = inp.sprint && !inp.aim && !st.sneaking && !st.prone && moving && !st.sprintExhausted && st.stamina > 0;
  st.sprinting = wantSprint;
  st.stamina = wantSprint
    ? Math.max(0, st.stamina - dt)
    : Math.min(SPRINT_STAMINA_MAX, st.stamina + SPRINT_STAMINA_REGEN * dt);
  const speed = movementSpeedFor(weapon, st.prone, st.sneaking, inp.aim, wantSprint);

  // yaw convention: yaw = 0 looks toward −Z (three.js)
  const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
  const fwd = { x: -sin, z: -cos };
  const right = { x: cos, z: -sin };
  const desiredX = (right.x * mx + fwd.x * mz) * speed;
  const desiredZ = (right.z * mx + fwd.z * mz) * speed;
  const accel = st.grounded ? (moving ? GROUND_ACCEL : GROUND_DECEL) : (moving ? AIR_ACCEL : 0);
  // Limit the vector, so diagonal starts and reversals take the same time.
  const deltaX = desiredX - st.velX, deltaZ = desiredZ - st.velZ;
  const deltaLength = Math.hypot(deltaX, deltaZ);
  const reversing = st.grounded && st.velX * desiredX + st.velZ * desiredZ < 0;
  const blend = deltaLength > 0 ? Math.min(1, accel * (reversing ? 1.3 : 1) * dt / deltaLength) : 0;
  st.velX += deltaX * blend;
  st.velZ += deltaZ * blend;
  const dx = st.velX * dt;
  const dz = st.velZ * dt;

  st.coyoteTime = st.grounded ? COYOTE_TIME : Math.max(0, st.coyoteTime - dt);
  st.jumpBuffer = inp.jump && !st.jumpHeld ? JUMP_BUFFER_TIME : Math.max(0, st.jumpBuffer - dt);
  st.jumpHeld = inp.jump;
  if (st.sneaking || st.prone) st.jumpBuffer = 0;
  if (st.coyoteTime > 0 && st.jumpBuffer > 0) {
    st.velY = JUMP_SPEED;
    st.coyoteTime = 0;
    st.jumpBuffer = 0;
    st.grounded = false;
  }
  st.velY = Math.max(-30, st.velY - GRAVITY * dt);
  const dy = st.velY * dt;

  const before = st.pos;
  const res = phys.moveCharacter(id, { x: dx, y: dy, z: dz });
  const actualVx = (res.pos.x - before.x) / dt;
  const actualVz = (res.pos.z - before.z) / dt;
  if (st.velY > 0 && (res.pos.y - before.y) / dt < st.velY * 0.2) st.velY = 0;
  if (Math.abs(actualVx) < Math.abs(st.velX) * 0.2) st.velX = actualVx;
  if (Math.abs(actualVz) < Math.abs(st.velZ) * 0.2) st.velZ = actualVz;
  st.pos = res.pos;
  st.grounded = res.grounded;
  if (st.grounded && st.velY < 0) st.velY = -1; // keep pressed to ground on slopes
}
