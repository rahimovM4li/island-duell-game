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
  const state = weaponSlotState(type, options.mag);
  if (!inv.primary) inv.primary = state;
  else if (!inv.secondary) inv.secondary = state;
  else return false;
  if (options.grantStarterAmmo !== false) grantStarterAmmo(inv, type);
  return true;
}
