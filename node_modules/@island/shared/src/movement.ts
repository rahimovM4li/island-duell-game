// Shared kinematic movement (§4.1): identical on host (authority) and client
// (prediction), so reconciliation errors stay tiny on LAN.
import {
  GRAVITY, JUMP_SPEED, SPRINT_SPEED, SPRINT_STAMINA_MAX, SPRINT_STAMINA_REGEN,
  WALK_SPEED,
} from './constants';
import type { GamePhysics, Vec3 } from './physics';
import type { InputMsg } from './protocol';
import { clamp } from './terrain';

export const MAX_INPUT_DT = 0.05; // s; clamp both sides so cheating dt is capped

export interface MoveState {
  pos: Vec3;       // feet position
  velY: number;
  grounded: boolean;
  stamina: number; // seconds of sprint left
  sprinting: boolean;
}

export function freshMoveState(pos: Vec3): MoveState {
  return { pos: { ...pos }, velY: 0, grounded: false, stamina: SPRINT_STAMINA_MAX, sprinting: false };
}

/** Apply one input to a movement state via the physics character controller. */
export function stepMovement(phys: GamePhysics, id: string, st: MoveState, inp: InputMsg): void {
  const dt = clamp(inp.dt, 0.001, MAX_INPUT_DT);

  let mx = clamp(inp.mx, -1, 1);
  let mz = clamp(inp.mz, -1, 1);
  const len = Math.hypot(mx, mz);
  if (len > 1) { mx /= len; mz /= len; }
  const moving = len > 0.01;

  const wantSprint = inp.sprint && moving && st.stamina > 0;
  st.sprinting = wantSprint;
  st.stamina = wantSprint
    ? Math.max(0, st.stamina - dt)
    : Math.min(SPRINT_STAMINA_MAX, st.stamina + SPRINT_STAMINA_REGEN * dt);
  const speed = wantSprint ? SPRINT_SPEED : WALK_SPEED;

  // yaw convention: yaw = 0 looks toward −Z (three.js)
  const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
  const fwd = { x: -sin, z: -cos };
  const right = { x: cos, z: -sin };
  const dx = (right.x * mx + fwd.x * mz) * speed * dt;
  const dz = (right.z * mx + fwd.z * mz) * speed * dt;

  if (st.grounded && inp.jump) st.velY = JUMP_SPEED;
  st.velY = Math.max(-30, st.velY - GRAVITY * dt);
  const dy = st.velY * dt;

  const res = phys.moveCharacter(id, { x: dx, y: dy, z: dz });
  st.pos = res.pos;
  st.grounded = res.grounded;
  if (st.grounded && st.velY < 0) st.velY = -1; // keep pressed to ground on slopes
}
