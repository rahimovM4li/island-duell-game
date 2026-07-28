import type { InventoryState } from '@shared/protocol';

type CombatSlot = 1 | 2 | 3;

function hasThrowable(inv: InventoryState): boolean {
  return inv.throwables.frag + inv.throwables.smoke + inv.throwables.flash > 0;
}

/** Cycle only through occupied combat slots. Positive means wheel-down. */
export function nextWeaponSlot(inv: InventoryState, direction: number): CombatSlot {
  if (direction === 0) return inv.active;
  const occupied: CombatSlot[] = [];
  if (inv.primary) occupied.push(1);
  if (inv.secondary) occupied.push(2);
  if (hasThrowable(inv)) occupied.push(3);
  if (occupied.length === 0) return inv.active;

  const current = occupied.indexOf(inv.active);
  const start = current >= 0 ? current : 0;
  const step = direction > 0 ? 1 : -1;
  return occupied[(start + step + occupied.length) % occupied.length];
}
