import { describe, expect, it } from 'vitest';
import { scoreBotWeapon } from '../server/src/bot';

describe('range-aware bot loadout scoring', () => {
  it('prefers shotgun pressure close and sniper precision far away', () => {
    expect(scoreBotWeapon('shotgun', 6, 12)).toBeGreaterThan(scoreBotWeapon('sniper', 6, 12));
    expect(scoreBotWeapon('sniper', 55, 12)).toBeGreaterThan(scoreBotWeapon('shotgun', 55, 12));
  });

  it('never chooses empty or melee weapons as ranged options', () => {
    expect(scoreBotWeapon('rifle', 25, 0)).toBe(-1);
    expect(scoreBotWeapon('machete', 3, 1)).toBe(-1);
  });
});
