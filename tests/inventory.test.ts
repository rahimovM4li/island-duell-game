import { describe, expect, it } from 'vitest';
import { equipWeapon, weaponSlotState, type WeaponInventory } from '../server/src/inventory';

function emptyInventory(): WeaponInventory {
  return {
    primary: null,
    secondary: null,
    ammo: { arrow: 0, pistol: 0, rifle: 0, shell: 0 },
  };
}

describe('stateful weapon pickups', () => {
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
    equipWeapon(inv, 'machete');
    equipWeapon(inv, 'bow');
    const arrows = inv.ammo.arrow;
    expect(equipWeapon(inv, 'bow')).toBe(false);
    expect(inv.ammo.arrow).toBe(arrows);
  });
});
