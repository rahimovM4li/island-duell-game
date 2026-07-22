import { WORLD_HALF } from '@shared/constants';
import type { Vector3 } from 'three';

export const FREECAM_SPEED = 22;
export const FREECAM_FAST_SPEED = 40;

const MAX_FRAME_DELTA = 0.05;
const FREECAM_EDGE = WORLD_HALF + 16;
const FREECAM_MIN_HEIGHT = 2;
const FREECAM_MAX_HEIGHT = 120;

export interface FreecamInput {
  moveX: number;
  moveZ: number;
  rise: boolean;
  descend: boolean;
  yaw: number;
  pitch: number;
  speed: number;
  dt: number;
}

/** Advance the spectator camera locally so it stays independent of network snapshots. */
export function updateFreecam(position: Vector3, input: FreecamInput): void {
  const dt = Math.min(MAX_FRAME_DELTA, Math.max(0, input.dt));
  if (dt === 0) return;

  let moveX = Math.max(-1, Math.min(1, input.moveX));
  let moveZ = Math.max(-1, Math.min(1, input.moveZ));
  const planarLength = Math.hypot(moveX, moveZ);
  if (planarLength > 1) {
    moveX /= planarLength;
    moveZ /= planarLength;
  }

  const sinYaw = Math.sin(input.yaw);
  const cosYaw = Math.cos(input.yaw);
  const sinPitch = Math.sin(input.pitch);
  const cosPitch = Math.cos(input.pitch);
  let velocityX = -sinYaw * cosPitch * moveZ + cosYaw * moveX;
  let velocityY = sinPitch * moveZ + (input.rise ? 1 : 0) - (input.descend ? 1 : 0);
  let velocityZ = -cosYaw * cosPitch * moveZ - sinYaw * moveX;

  const velocityLength = Math.hypot(velocityX, velocityY, velocityZ);
  if (velocityLength > 1) {
    velocityX /= velocityLength;
    velocityY /= velocityLength;
    velocityZ /= velocityLength;
  }

  const step = input.speed * dt;
  position.x = Math.max(-FREECAM_EDGE, Math.min(FREECAM_EDGE, position.x + velocityX * step));
  position.y = Math.max(FREECAM_MIN_HEIGHT, Math.min(FREECAM_MAX_HEIGHT, position.y + velocityY * step));
  position.z = Math.max(-FREECAM_EDGE, Math.min(FREECAM_EDGE, position.z + velocityZ * step));
}
