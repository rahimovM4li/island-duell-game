import { describe, expect, it } from 'vitest';
import type { InventoryState } from '@shared/protocol';
import { nextWeaponSlot } from '../client/src/weapon-navigation';

function inventory(
  active: 1 | 2 | 3,
  secondary = true,
  throwables = true,
): InventoryState {
  return {
    primary: { type: 'pistol', mag: 7 },
    secondary: secondary ? { type: 'machete', mag: 0 } : null,
    active,
    throwables: { frag: throwables ? 1 : 0, smoke: 0, flash: 0 },
    activeThrow: 'frag',
    bandages: 0,
    plates: 0,
    shield: 0,
    helmet: false,
    ammo: { pistol: 0, rifle: 0, shell: 0, sniper: 0 },
    mats: { wood: 0, stone: 0, fiber: 0 },
    reloading: false,
  };
}

describe('mouse-wheel weapon switching', () => {
  it('cycles down and up through every occupied combat slot', () => {
    expect(nextWeaponSlot(inventory(1), 1)).toBe(2);
    expect(nextWeaponSlot(inventory(2), 1)).toBe(3);
    expect(nextWeaponSlot(inventory(3), 1)).toBe(1);
    expect(nextWeaponSlot(inventory(1), -1)).toBe(3);
    expect(nextWeaponSlot(inventory(3), -1)).toBe(2);
  });

  it('skips empty weapon and throwable slots', () => {
    expect(nextWeaponSlot(inventory(1, false, true), 1)).toBe(3);
    expect(nextWeaponSlot(inventory(1, true, false), -1)).toBe(2);
    expect(nextWeaponSlot(inventory(1, false, false), 1)).toBe(1);
  });
});
