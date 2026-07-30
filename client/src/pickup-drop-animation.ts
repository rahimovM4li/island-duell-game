import { WEAPON_DROP_ANIMATION_SECS } from '@shared/constants';

export interface DropPoint {
  x: number;
  y: number;
  z: number;
}

export interface DroppedPickupPose {
  position: DropPoint;
  progress: number;
  rotation: number;
  done: boolean;
}

export const PICKUP_DROP_DURATION = WEAPON_DROP_ANIMATION_SECS;

/**
 * A short deterministic toss. Horizontal travel eases out so the landing is
 * readable; the parabola and rotation are reduced for reduced-motion users.
 */
export function droppedPickupPose(
  start: DropPoint,
  end: DropPoint,
  elapsed: number,
  reducedMotion: boolean,
): DroppedPickupPose {
  const progress = Math.max(0, Math.min(1, elapsed / PICKUP_DROP_DURATION));
  const travel = 1 - Math.pow(1 - progress, 3);
  const arcHeight = reducedMotion ? 0.18 : 0.82;
  const arc = 4 * progress * (1 - progress) * arcHeight;
  const position = progress >= 1
    ? { ...end }
    : {
        x: start.x + (end.x - start.x) * travel,
        y: start.y + (end.y - start.y) * travel + arc,
        z: start.z + (end.z - start.z) * travel,
      };
  return {
    position,
    progress,
    rotation: progress * Math.PI * (reducedMotion ? 0.35 : 2.2),
    done: progress >= 1,
  };
}
