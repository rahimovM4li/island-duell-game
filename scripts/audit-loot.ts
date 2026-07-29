import { assertLootBalance, auditLootBalance } from '../server/src/loot-audit';

const requestedSeeds = Number(process.argv[2] ?? 2_000);
const seeds = Number.isFinite(requestedSeeds) ? Math.max(1, Math.floor(requestedSeeds)) : 2_000;
const report = auditLootBalance(seeds, 5, 3);
assertLootBalance(report);

console.log(`Loot-Audit bestanden: ${report.simulatedRounds} Runden aus ${report.seeds} Seeds`);
console.table({
  'Schusswaffen/Runde': report.averages.firearmsPerRound.toFixed(2),
  'Sniper/Runde': report.averages.sniperPerRound.toFixed(2),
  'Verbände/Spieler': report.averages.bandagesPerPlayer.toFixed(2),
  'Pistolenmunition/Spieler': report.averages.pistolAmmoPerPlayer.toFixed(2),
});
console.log('Durchschnittliche Drops pro Runde und Fundort:');
console.table(Object.fromEntries(
  Object.entries(report.locationAverages).map(([location, stats]) => [
    location,
    {
      Schusswaffen: stats.firearms.toFixed(2),
      Sniper: stats.snipers.toFixed(2),
      Heilung: stats.healing.toFixed(2),
      Munition: stats.ammo.toFixed(2),
    },
  ]),
));
