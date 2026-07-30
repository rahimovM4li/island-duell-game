import { THROW_WEAPON, type WeaponType } from '@shared/constants';
import type { InventoryState } from '@shared/protocol';

export function viewWeaponForInventory(inv: Pick<
  InventoryState,
  'active' | 'primary' | 'secondary' | 'activeThrow'
>): WeaponType {
  if (inv.active === 3) return THROW_WEAPON[inv.activeThrow];
  const slot = inv.active === 1 ? inv.primary : inv.secondary;
  return slot?.type ?? 'fists';
}

export function shouldAnimateWeaponSwitch(
  previous: InventoryState | null,
  next: InventoryState,
): boolean {
  if (!previous) return false;
  return previous.active !== next.active
    || viewWeaponForInventory(previous) !== viewWeaponForInventory(next);
}
