// §F5: pure profile aggregation — practice matches land in the history but
// never inflate the ranked career numbers.
import { describe, expect, it } from 'vitest';
import {
  HISTORY_LIMIT, freshProfile, mergeMatchIntoProfile, accuracyPct, kdRatio,
  type MatchResult,
} from '../client/src/profile';

const result = (over: Partial<MatchResult> = {}): MatchResult => ({
  seed: 42,
  placement: 2,
  points: 5,
  players: 4,
  rounds: 3,
  deaths: 2,
  stats: { kills: 4, damageDealt: 310, damageTaken: 220, shotsFired: 40, hits: 18, headshots: 3, pickups: 9 },
  practice: false,
  date: '2026-07-21T12:00:00.000Z',
  ...over,
});

describe('profile aggregation (§F5)', () => {
  it('folds a ranked match into career and history', () => {
    const p = mergeMatchIntoProfile(freshProfile(), result());
    expect(p.career.matches).toBe(1);
    expect(p.career.wins).toBe(0);
    expect(p.career.kills).toBe(4);
    expect(p.career.deaths).toBe(2);
    expect(p.career.bestPlacement).toBe(2);
    expect(p.career.roundsPlayed).toBe(3);
    expect(p.history).toHaveLength(1);
    expect(p.history[0].practice).toBe(false);
  });

  it('counts wins and tracks the best placement', () => {
    let p = mergeMatchIntoProfile(freshProfile(), result({ placement: 3 }));
    p = mergeMatchIntoProfile(p, result({ placement: 1 }));
    expect(p.career.wins).toBe(1);
    expect(p.career.bestPlacement).toBe(1);
    p = mergeMatchIntoProfile(p, result({ placement: 4 }));
    expect(p.career.bestPlacement).toBe(1);
  });

  it('keeps practice matches in history but out of the career', () => {
    const p = mergeMatchIntoProfile(freshProfile(), result({ practice: true, placement: 1 }));
    expect(p.career.matches).toBe(0);
    expect(p.career.wins).toBe(0);
    expect(p.career.kills).toBe(0);
    expect(p.history).toHaveLength(1);
    expect(p.history[0].practice).toBe(true);
  });

  it('is pure: the input profile is not mutated', () => {
    const before = freshProfile();
    mergeMatchIntoProfile(before, result());
    expect(before.career.matches).toBe(0);
    expect(before.history).toHaveLength(0);
  });

  it('caps the history at the limit, newest first', () => {
    let p = freshProfile();
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      p = mergeMatchIntoProfile(p, result({ seed: i }));
    }
    expect(p.history).toHaveLength(HISTORY_LIMIT);
    expect(p.history[0].seed).toBe(HISTORY_LIMIT + 4);
  });

  it('derives accuracy and K/D', () => {
    const p = mergeMatchIntoProfile(freshProfile(), result());
    expect(accuracyPct(p.career)).toBe(45); // 18/40
    expect(kdRatio(p.career)).toBe('2.00'); // 4/2
    expect(accuracyPct(freshProfile().career)).toBeNull();
    expect(kdRatio(freshProfile().career)).toBe('—');
  });
});
