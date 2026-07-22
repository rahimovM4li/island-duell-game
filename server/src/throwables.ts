import {
  FLASH_BACK_FACTOR, FLASH_RADIUS, GRENADE_FUSE, GRENADE_MIN_THROW_FUSE,
  THROW_ORDER, type ThrowKind,
} from '@shared/constants';
import type { Vec3 } from '@shared/physics';

/** Does the segment from-to pass through the sphere at center with radius? */
export function segmentThroughSphere(from: Vec3, to: Vec3, center: Vec3, radius: number): boolean {
  const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  const len2 = dx * dx + dy * dy + dz * dz;
  const px = center.x - from.x, py = center.y - from.y, pz = center.z - from.z;
  const k = len2 > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy + pz * dz) / len2)) : 0;
  const cx = px - dx * k, cy = py - dy * k, cz = pz - dz * k;
  return cx * cx + cy * cy + cz * cz <= radius * radius;
}

export function flashIntensityAt(dist: number, facing: number): number {
  if (dist > FLASH_RADIUS) return 0;
  const facingFactor = FLASH_BACK_FACTOR
    + (1 - FLASH_BACK_FACTOR) * Math.max(0, Math.min(1, facing));
  return Math.min(1, (1 - dist / FLASH_RADIUS) * 1.25) * facingFactor;
}

export function cookRemainingFuse(t: number, cookingSince: number): number {
  return Math.max(GRENADE_MIN_THROW_FUSE, GRENADE_FUSE - (t - cookingSince));
}

export function nextOwnedThrow(current: ThrowKind, counts: Record<ThrowKind, number>): ThrowKind {
  const start = THROW_ORDER.indexOf(current);
  for (let step = 1; step <= THROW_ORDER.length; step += 1) {
    const kind = THROW_ORDER[(start + step) % THROW_ORDER.length];
    if (counts[kind] > 0) return kind;
  }
  return current;
}
