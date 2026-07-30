import { describe, expect, it } from 'vitest';
import type { InventoryState } from '@shared/protocol';
import { shouldAnimateWeaponSwitch, viewWeaponForInventory } from '../client/src/weapon-switch';

function inventory(
  active: 1 | 2 | 3,
  primary: InventoryState['primary'] = { type: 'rifle', mag: 20 },
  secondary: InventoryState['secondary'] = { type: 'rifle', mag: 20 },
): InventoryState {
  return {
    primary,
    secondary,
    active,
    throwables: { frag: 1, smoke: 0, flash: 0 },
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

describe('first-person weapon switching', () => {
  it('uses fists for an empty selected weapon slot', () => {
    expect(viewWeaponForInventory(inventory(2, null, null))).toBe('fists');
  });

  it('animates a slot change even when both slots contain the same weapon', () => {
    expect(shouldAnimateWeaponSwitch(inventory(1), inventory(2))).toBe(true);
  });

  it('animates different equipped weapons but ignores ordinary inventory updates', () => {
    expect(shouldAnimateWeaponSwitch(
      inventory(1),
      inventory(1, { type: 'shotgun', mag: 5 }),
    )).toBe(true);
    expect(shouldAnimateWeaponSwitch(inventory(1), {
      ...inventory(1),
      bandages: 2,
    })).toBe(false);
    expect(shouldAnimateWeaponSwitch(null, inventory(1))).toBe(false);
  });
});
