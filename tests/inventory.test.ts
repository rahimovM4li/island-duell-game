import { describe, expect, it } from 'vitest';
import {
  equipWeapon, takeSelectedWeapon, weaponSlotState, type ActiveWeaponInventory,
  type WeaponInventory,
} from '../server/src/inventory';

function emptyInventory(): WeaponInventory {
  return {
    primary: null,
    secondary: null,
    ammo: { pistol: 0, rifle: 0, shell: 0, sniper: 0 },
  };
}

describe('stateful weapon pickups', () => {
  it('never inserts the permanent knife or grenades into firearm storage', () => {
    const inv = emptyInventory();
    expect(equipWeapon(inv, 'knife')).toBe(false);
    expect(equipWeapon(inv, 'grenade')).toBe(false);
    expect(inv.primary).toBeNull();
    expect(inv.secondary).toBeNull();
  });
  it('fresh world weapons start full and grant reserve ammo', () => {
    const inv = emptyInventory();
    expect(equipWeapon(inv, 'pistol')).toBe(true);
    expect(inv.primary).toEqual({ type: 'pistol', mag: 7 });
    expect(inv.ammo.pistol).toBe(14);
  });

  it('dropped weapons preserve their magazine without creating reserve ammo', () => {
    const inv = emptyInventory();
    expect(equipWeapon(inv, 'rifle', { mag: 3, grantStarterAmmo: false })).toBe(true);
    expect(inv.primary).toEqual({ type: 'rifle', mag: 3 });
    expect(inv.ammo.rifle).toBe(0);
  });

  it('clamps untrusted magazine state to the weapon capacity', () => {
    expect(weaponSlotState('shotgun', 999)).toEqual({ type: 'shotgun', mag: 5 });
    expect(weaponSlotState('shotgun', -4)).toEqual({ type: 'shotgun', mag: 0 });
  });

  it('does not grant ammo when both slots are occupied', () => {
    const inv = emptyInventory();
    equipWeapon(inv, 'pistol');
    equipWeapon(inv, 'rifle');
    const rifleAmmo = inv.ammo.rifle;
    expect(equipWeapon(inv, 'rifle')).toBe(false);
    expect(inv.ammo.rifle).toBe(rifleAmmo);
  });
});

describe('dropping the selected weapon', () => {
  const activeInventory = (): ActiveWeaponInventory => ({
    primary: { type: 'rifle', mag: 7 },
    secondary: { type: 'pistol', mag: 0 },
    active: 2,
    ammo: { pistol: 0, rifle: 20, shell: 0, sniper: 0 },
  });

  it('removes exactly the selected weapon, preserves its magazine and selects the other slot', () => {
    const inv = activeInventory();
    expect(takeSelectedWeapon(inv)).toEqual({ type: 'rifle', mag: 7 });
    expect(inv.primary).toBeNull();
    expect(inv.secondary).toEqual({ type: 'pistol', mag: 0 });
    expect(inv.active).toBe(3);
    expect(inv.ammo.rifle).toBe(20);
  });

  it('does nothing for the throwable slot or an empty selected slot', () => {
    const throwable = activeInventory();
    throwable.active = 4;
    expect(takeSelectedWeapon(throwable)).toBeNull();
    expect(throwable.primary).not.toBeNull();

    const empty = activeInventory();
    empty.primary = null;
    expect(takeSelectedWeapon(empty)).toBeNull();
    expect(empty.active).toBe(2);
  });

  it('keeps slot 1 permanent and returns to it after dropping the last firearm', () => {
    const inv = activeInventory();
    inv.active = 1;
    const before = structuredClone(inv);
    expect(takeSelectedWeapon(inv)).toBeNull();
    expect(inv).toEqual(before);
    inv.active = 3;
    takeSelectedWeapon(inv);
    expect(inv.active).toBe(2);
    takeSelectedWeapon(inv);
    expect(inv.active).toBe(1);
  });
});
