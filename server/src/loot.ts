import {
  SNIPER_CRATE_CHANCE, type ItemType,
} from '@shared/constants';
import { pick, type Rng } from '@shared/rng';
import type { CrateTier } from '@shared/worldgen';

export interface CrateLootOptions {
  guaranteedItem?: ItemType;
  guaranteeHelmet: boolean;
}

export interface CrateLootRoll {
  drops: ItemType[];
  helmetDropped: boolean;
}

/** Pure crate roller shared by the live host and the multi-seed balance audit. */
export function rollCrateLoot(
  tier: CrateTier,
  rng: Rng,
  options: CrateLootOptions,
): CrateLootRoll {
  const drops: ItemType[] = [];
  let helmetDropped = false;
  if (tier === 'top' && options.guaranteeHelmet) {
    drops.push('helmetItem');
    helmetDropped = true;
  }
  if (tier === 'top') {
    const guaranteedSniper = options.guaranteedItem === 'sniper';
    if (guaranteedSniper || rng() < SNIPER_CRATE_CHANCE) {
      drops.push('sniper');
      drops.push(guaranteedSniper || rng() < 0.6 ? 'sniperAmmo' : 'bandageItem');
    } else {
      drops.push(pick(rng, ['rifle', 'shotgun'] as ItemType[]));
      drops.push(pick(
        rng,
        ['rifleAmmo', 'shellAmmo', 'grenade', 'flashGrenade', 'bandageItem'] as ItemType[],
      ));
    }
    if (rng() < 0.5) drops.push('bandageItem');
  } else if (tier === 'good') {
    drops.push(pick(rng, ['pistol', 'pistol', 'grenade'] as ItemType[]));
    drops.push(pick(
      rng,
      ['pistolAmmo', 'pistolAmmo', 'bandageItem', 'smokeGrenade', 'flashGrenade'] as ItemType[],
    ));
  } else {
    drops.push(pick(rng, ['machete', 'spear', 'pistol', 'bandageItem'] as ItemType[]));
    if (rng() < 0.6) drops.push('pistolAmmo');
  }
  return { drops, helmetDropped };
}
