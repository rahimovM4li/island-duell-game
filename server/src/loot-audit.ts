import type { ItemType, WeaponType } from '@shared/constants';
import { WEAPONS } from '@shared/constants';
import { mulberry32 } from '@shared/rng';
import { generateWorld } from '@shared/worldgen';
import { rollCrateLoot } from './loot';

export interface LootAuditReport {
  seeds: number;
  rounds: number;
  playerCount: number;
  simulatedRounds: number;
  failures: string[];
  totals: Record<string, number>;
  averages: {
    firearmsPerRound: number;
    sniperPerRound: number;
    bandagesPerPlayer: number;
    pistolAmmoPerPlayer: number;
  };
  locationAverages: Record<string, {
    firearms: number;
    snipers: number;
    healing: number;
    ammo: number;
  }>;
}

const FIREARMS = new Set<WeaponType>(['pistol', 'rifle', 'shotgun', 'sniper']);

const count = (totals: Record<string, number>, item: ItemType): void => {
  totals[item] = (totals[item] ?? 0) + 1;
};

export function auditLootBalance(
  seeds: number,
  playerCount = 5,
  rounds = 3,
): LootAuditReport {
  const safeSeeds = Math.max(1, Math.floor(seeds));
  const safePlayers = Math.max(2, Math.min(5, Math.floor(playerCount)));
  const safeRounds = Math.max(1, Math.floor(rounds));
  const totals: Record<string, number> = {};
  const locationTotals: Record<string, {
    firearms: number;
    snipers: number;
    healing: number;
    ammo: number;
  }> = {};
  const failures: string[] = [];
  let totalFirearms = 0;
  let totalSnipers = 0;
  let totalBandages = 0;
  let totalPistolAmmo = 0;

  const fail = (message: string): void => {
    if (failures.length < 40) failures.push(message);
  };

  for (let seed = 1; seed <= safeSeeds; seed += 1) {
    const world = generateWorld(seed, safePlayers);
    for (let round = 1; round <= safeRounds; round += 1) {
      const roundCounts: Record<string, number> = {};
      const add = (item: ItemType, location: string): void => {
        count(roundCounts, item);
        count(totals, item);
        const locationStats = locationTotals[location] ??= {
          firearms: 0, snipers: 0, healing: 0, ammo: 0,
        };
        if (FIREARMS.has(item as WeaponType)) locationStats.firearms += 1;
        if (item === 'sniper') locationStats.snipers += 1;
        if (item === 'bandageItem') locationStats.healing += 1;
        if (item.endsWith('Ammo')) locationStats.ammo += 1;
      };
      for (const item of world.spawnFloorItems) add(item.item, 'spawn');

      const rng = mulberry32((seed ^ (round * 0x9e3779b9)) >>> 0);
      let helmetDropped = false;
      for (const crate of world.crates) {
        const roll = rollCrateLoot(crate.tier, rng, {
          guaranteedItem: crate.guaranteedItem,
          guaranteeHelmet: crate.tier === 'top' && !helmetDropped,
        });
        if (roll.helmetDropped) helmetDropped = true;
        for (const item of roll.drops) {
          add(item, crate.poi);
          rng(); // live host consumes one angle roll while placing every drop
        }
      }

      const firearms = Object.entries(roundCounts).reduce((sum, [item, amount]) =>
        item in WEAPONS && FIREARMS.has(item as WeaponType) ? sum + amount : sum, 0);
      const snipers = roundCounts.sniper ?? 0;
      const bandages = roundCounts.bandageItem ?? 0;
      const pistolAmmo = roundCounts.pistolAmmo ?? 0;
      totalFirearms += firearms;
      totalSnipers += snipers;
      totalBandages += bandages;
      totalPistolAmmo += pistolAmmo;

      if (snipers < 1) fail(`seed ${seed} round ${round}: no reachable sniper`);
      if ((roundCounts.helmetItem ?? 0) !== 1) {
        fail(`seed ${seed} round ${round}: expected one helmet, got ${roundCounts.helmetItem ?? 0}`);
      }
      if (bandages < safePlayers * 2) {
        fail(`seed ${seed} round ${round}: healing below two bandages per player`);
      }
      if (pistolAmmo < safePlayers) {
        fail(`seed ${seed} round ${round}: pistol reserve below one pickup per player`);
      }
      if (firearms < safePlayers + 7) {
        fail(`seed ${seed} round ${round}: only ${firearms} firearms`);
      }
    }
  }

  const simulatedRounds = safeSeeds * safeRounds;
  const locationAverages = Object.fromEntries(
    Object.entries(locationTotals).map(([location, stats]) => [
      location,
      {
        firearms: stats.firearms / simulatedRounds,
        snipers: stats.snipers / simulatedRounds,
        healing: stats.healing / simulatedRounds,
        ammo: stats.ammo / simulatedRounds,
      },
    ]),
  );
  return {
    seeds: safeSeeds,
    rounds: safeRounds,
    playerCount: safePlayers,
    simulatedRounds,
    failures,
    totals,
    averages: {
      firearmsPerRound: totalFirearms / simulatedRounds,
      sniperPerRound: totalSnipers / simulatedRounds,
      bandagesPerPlayer: totalBandages / simulatedRounds / safePlayers,
      pistolAmmoPerPlayer: totalPistolAmmo / simulatedRounds / safePlayers,
    },
    locationAverages,
  };
}

export function assertLootBalance(report: LootAuditReport): void {
  if (report.failures.length > 0) {
    throw new Error(`Loot audit failed:\n${report.failures.join('\n')}`);
  }
  if (report.averages.sniperPerRound < 1 || report.averages.sniperPerRound > 3) {
    throw new Error(`Sniper average out of bounds: ${report.averages.sniperPerRound.toFixed(2)}`);
  }
}
