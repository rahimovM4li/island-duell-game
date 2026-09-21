import type { InventoryState } from './protocol';

/** An empty magazine is still a weapon; slot 4 needs at least one owned grenade. */
export function canSelectSlot(
  inv: Pick<InventoryState, 'primary' | 'secondary' | 'throwables'>,
  slot: InventoryState['active'],
): boolean {
  if (slot === 1) return true;
  if (slot === 2) return inv.primary !== null;
  if (slot === 3) return inv.secondary !== null;
  return inv.throwables.frag + inv.throwables.smoke + inv.throwables.flash > 0;
}
