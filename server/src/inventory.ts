import {
  AMMO_CAP, WEAPONS, WEAPON_START_AMMO,
  type AmmoType, type WeaponType,
} from '@shared/constants';
import type { WeaponSlotState } from '@shared/protocol';

export interface WeaponInventory {
  primary: WeaponSlotState | null;
  secondary: WeaponSlotState | null;
  ammo: Record<AmmoType, number>;
}

export interface ActiveWeaponInventory extends WeaponInventory {
  active: 1 | 2 | 3 | 4;
}

export interface EquipWeaponOptions {
  /** Existing magazine state for a dropped weapon. Undefined means a fresh world spawn. */
  mag?: number;
  grantStarterAmmo?: boolean;
}

export function weaponSlotState(type: WeaponType, mag?: number): WeaponSlotState {
  const max = WEAPONS[type].magSize ?? 0;
  return { type, mag: Math.max(0, Math.min(max, mag ?? max)) };
}

export function grantStarterAmmo(inv: WeaponInventory, type: WeaponType): void {
  const def = WEAPONS[type];
  const start = WEAPON_START_AMMO[type];
  if (!def.ammo || !start) return;
  inv.ammo[def.ammo] = Math.min(AMMO_CAP[def.ammo], inv.ammo[def.ammo] + start);
}

export function equipWeapon(inv: WeaponInventory, type: WeaponType, options: EquipWeaponOptions = {}): boolean {
  if (WEAPONS[type].kind !== 'hitscan') return false;
  const state = weaponSlotState(type, options.mag);
  if (!inv.primary) inv.primary = state;
  else if (!inv.secondary) inv.secondary = state;
  else return false;
  if (options.grantStarterAmmo !== false) grantStarterAmmo(inv, type);
  return true;
}

/**
 * Remove only the firearm currently held in slot 2/3. The knife is permanent.
 * Throwables are managed
 * separately and an empty selected slot is intentionally a no-op.
 */
export function takeSelectedWeapon(inv: ActiveWeaponInventory): WeaponSlotState | null {
  if (inv.active === 1 || inv.active === 4) return null;
  const slot = inv.active === 2 ? 'primary' : 'secondary';
  const selected = inv[slot];
  if (!selected) return null;
  inv[slot] = null;

  const otherSlot = inv.active === 2 ? 'secondary' : 'primary';
  inv.active = inv[otherSlot] ? (inv.active === 2 ? 3 : 2) : 1;
  return selected;
}
