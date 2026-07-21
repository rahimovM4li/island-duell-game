import { describe, expect, it } from 'vitest';
import { isHeadshotHeight } from '../server/src/game';
import { WEAPONS } from '@shared/constants';

describe('combat readability and hit regions', () => {
  it('uses distinct standing and sneaking head regions', () => {
    expect(isHeadshotHeight(4, false, 5.37)).toBe(false);
    expect(isHeadshotHeight(4, false, 5.38)).toBe(true);
    expect(isHeadshotHeight(4, true, 4.91)).toBe(false);
    expect(isHeadshotHeight(4, true, 4.92)).toBe(true);
  });

  it('defines authoritative hip, aim, movement spread and recoil for every firearm', () => {
    for (const name of ['pistol', 'rifle', 'shotgun'] as const) {
      const weapon = WEAPONS[name];
      expect(weapon.aimSpread).toBeLessThan(weapon.hipSpread!);
      expect(weapon.moveSpread).toBeGreaterThan(0);
      expect(weapon.recoilPitch).toBeGreaterThan(0);
      expect(weapon.recoilYaw).toBeGreaterThan(0);
    }
  });
});
