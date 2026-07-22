import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SNIPER_SCOPE_FOV, MAX_SNIPER_SCOPE_FOV, MIN_SNIPER_SCOPE_FOV,
  adjustSniperScopeFov,
} from '../client/src/sniper';

describe('sniper scope zoom', () => {
  it('zooms in with wheel-up and out with wheel-down', () => {
    expect(adjustSniperScopeFov(DEFAULT_SNIPER_SCOPE_FOV, -100)).toBeLessThan(DEFAULT_SNIPER_SCOPE_FOV);
    expect(adjustSniperScopeFov(DEFAULT_SNIPER_SCOPE_FOV, 100)).toBeGreaterThan(DEFAULT_SNIPER_SCOPE_FOV);
  });

  it('clamps the scope to readable browser-safe limits', () => {
    expect(adjustSniperScopeFov(MIN_SNIPER_SCOPE_FOV, -100)).toBe(MIN_SNIPER_SCOPE_FOV);
    expect(adjustSniperScopeFov(MAX_SNIPER_SCOPE_FOV, 100)).toBe(MAX_SNIPER_SCOPE_FOV);
    expect(adjustSniperScopeFov(DEFAULT_SNIPER_SCOPE_FOV, 0)).toBe(DEFAULT_SNIPER_SCOPE_FOV);
  });
});
