import type { InventoryState } from '@shared/protocol';
import { canSelectSlot } from '@shared/inventory-slots';

type CombatSlot = 1 | 2 | 3 | 4;

/** Cycle only through occupied combat slots. Positive means wheel-down. */
export function nextWeaponSlot(inv: InventoryState, direction: number): CombatSlot {
  if (direction === 0) return inv.active;
  const occupied = ([1, 2, 3, 4] as CombatSlot[]).filter(slot => canSelectSlot(inv, slot));

  const current = occupied.indexOf(inv.active);
  const start = current >= 0 ? current : 0;
  const step = direction > 0 ? 1 : -1;
  return occupied[(start + step + occupied.length) % occupied.length];
}
