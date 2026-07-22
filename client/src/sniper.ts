export const MIN_SNIPER_SCOPE_FOV = 12;
export const MAX_SNIPER_SCOPE_FOV = 38;
export const DEFAULT_SNIPER_SCOPE_FOV = 25;
export const SNIPER_SCOPE_FOV_STEP = 2;

/** Wheel-up uses a smaller FOV (more magnification); wheel-down widens it. */
export function adjustSniperScopeFov(current: number, wheelDeltaY: number): number {
  if (wheelDeltaY === 0) return current;
  const direction = Math.sign(wheelDeltaY);
  return Math.max(
    MIN_SNIPER_SCOPE_FOV,
    Math.min(MAX_SNIPER_SCOPE_FOV, current + direction * SNIPER_SCOPE_FOV_STEP),
  );
}
