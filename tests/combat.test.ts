import { describe, expect, it } from 'vitest';
import { isHeadshotHeight } from '../server/src/game';
import { WEAPONS } from '@shared/constants';

describe('combat readability and hit regions', () => {
  it('uses distinct standing and sneaking head regions', () => {
    expect(isHeadshotHeight(4, false, 5.37)).toBe(false);
    expect(isHeadshotHeight(4, false, 5.38)).toBe(true);
    expect(isHeadshotHeight(4, true, 4.91)).toBe(false);
    expect(isHeadshotHeight(4, true, 4.92)).toBe(true);
    expect(isHeadshotHeight(4, false, 4.54, true)).toBe(false);
    expect(isHeadshotHeight(4, false, 4.55, true)).toBe(true);
  });

  it('defines authoritative hip, aim, movement spread and recoil for every firearm', () => {
    for (const name of ['pistol', 'rifle', 'shotgun', 'sniper'] as const) {
      const weapon = WEAPONS[name];
      expect(weapon.aimSpread).toBeLessThan(weapon.hipSpread!);
      expect(weapon.moveSpread).toBeGreaterThan(0);
      expect(weapon.recoilPitch).toBeGreaterThan(0);
      expect(weapon.recoilYaw).toBeGreaterThan(0);
    }
  });
});

describe('sniper rifle (§F1)', () => {
  const sniper = WEAPONS.sniper;

  it('one-shots on a headshot but needs two body hits', () => {
    // hitscanShot applies the shared 1.65× headshot multiplier
    expect(sniper.damage * 1.65).toBeGreaterThanOrEqual(100);
    expect(sniper.damage).toBeLessThan(100);
    expect(sniper.damage * 2).toBeGreaterThanOrEqual(100);
  });

  it('keeps full damage at long range (no falloff)', () => {
    expect(sniper.falloffStart).toBeUndefined();
    expect(sniper.falloffEnd).toBeUndefined();
    expect(sniper.range).toBeGreaterThanOrEqual(200);
  });

  it('is hopeless from the hip and while moving, precise when scoped', () => {
    expect(sniper.hipSpread!).toBeGreaterThan(WEAPONS.rifle.hipSpread!);
    expect(sniper.moveSpread!).toBeGreaterThan(WEAPONS.rifle.moveSpread!);
    expect(sniper.aimSpread!).toBeLessThan(WEAPONS.rifle.aimSpread!);
  });

  it('pays for its power: slow bolt, long reload, loud, small mag, hard zoom', () => {
    expect(sniper.cooldown).toBeGreaterThan(1);
    expect(sniper.reloadTime!).toBeGreaterThan(WEAPONS.rifle.reloadTime!);
    expect(sniper.loud).toBe(true);
    expect(sniper.magSize).toBeLessThanOrEqual(5);
    expect(sniper.aimFov!).toBeLessThan(40);
  });
});
