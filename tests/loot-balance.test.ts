import { describe, expect, it } from 'vitest';
import { assertLootBalance, auditLootBalance } from '../server/src/loot-audit';

describe('multi-seed loot balance audit', () => {
  it('keeps every simulated round supplied and the sniper rare but reachable', () => {
    const report = auditLootBalance(400, 5, 3);
    expect(() => assertLootBalance(report)).not.toThrow();
    expect(report.failures).toEqual([]);
    expect(report.simulatedRounds).toBe(1_200);
    expect(report.averages.bandagesPerPlayer).toBeGreaterThanOrEqual(2);
    expect(report.averages.pistolAmmoPerPlayer).toBeGreaterThanOrEqual(1);
    expect(report.averages.sniperPerRound).toBeGreaterThanOrEqual(1);
    expect(report.averages.sniperPerRound).toBeLessThanOrEqual(3);
    expect(report.locationAverages.watchtower.snipers).toBeGreaterThanOrEqual(1);
    expect(report.locationAverages.spawn.healing).toBe(10);
  });
});
