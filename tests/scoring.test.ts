// §6.4: placement points, shared placement, double-KO groups, sudden death.
import { describe, expect, it } from 'vitest';
import {
  decideMatch, placementPoints, placementsFromEliminations, scoreRound,
} from '@shared/scoring';

describe('placementPoints', () => {
  it('N≥3 gives 3/2/1/0/0', () => {
    expect([1, 2, 3, 4, 5].map((p) => placementPoints(p, 5))).toEqual([3, 2, 1, 0, 0]);
    expect([1, 2, 3].map((p) => placementPoints(p, 3))).toEqual([3, 2, 1]);
  });

  it('N=2 reduces to winner 3 / loser 0 (best-of-3)', () => {
    expect(placementPoints(1, 2)).toBe(3);
    expect(placementPoints(2, 2)).toBe(0);
  });
});

describe('placementsFromEliminations', () => {
  it('orders first-eliminated last', () => {
    // a died first, then b, c survived
    const p = placementsFromEliminations([['a'], ['b'], ['c']]);
    expect(p.get('c')).toBe(1);
    expect(p.get('b')).toBe(2);
    expect(p.get('a')).toBe(3);
  });

  it('shared placement: a simultaneous group gets the better place (§6.4)', () => {
    // 4 players: d died first, then b+c to the same zone tick, a survived
    const p = placementsFromEliminations([['d'], ['b', 'c'], ['a']]);
    expect(p.get('a')).toBe(1);
    expect(p.get('b')).toBe(2); // both share place 2 (the better one)
    expect(p.get('c')).toBe(2);
    expect(p.get('d')).toBe(4); // nobody gets place 3
  });

  it('double-KO with damage attribution: last damage dealer is ordered later (wins)', () => {
    // server sorts the same-tick deaths by lastDamageDealtAt and pushes them as
    // separate groups: victim first, then the "winner" of the double-KO
    const p = placementsFromEliminations([['loser'], ['winner']]);
    expect(p.get('winner')).toBe(1);
    expect(p.get('loser')).toBe(2);
  });
});

describe('scoreRound', () => {
  it('full 5-player round', () => {
    const { points } = scoreRound([['e'], ['d'], ['c'], ['b'], ['a']], 5);
    expect(points.get('a')).toBe(3);
    expect(points.get('b')).toBe(2);
    expect(points.get('c')).toBe(1);
    expect(points.get('d')).toBe(0);
    expect(points.get('e')).toBe(0);
  });

  it('shared group in a 3-player round', () => {
    const { placements, points } = scoreRound([['b', 'c'], ['a']], 3);
    expect(placements.get('b')).toBe(2);
    expect(placements.get('c')).toBe(2);
    expect(points.get('b')).toBe(2);
    expect(points.get('c')).toBe(2);
    expect(points.get('a')).toBe(3);
  });
});

describe('decideMatch (sudden death §6.4)', () => {
  it('single leader finishes the match', () => {
    const d = decideMatch(new Map([['a', 6], ['b', 3], ['c', 0]]));
    expect(d.finished).toBe(true);
    expect(d.winners).toEqual(['a']);
  });

  it('tied leaders → not finished → sudden death round', () => {
    const d = decideMatch(new Map([['a', 4], ['b', 4], ['c', 1]]));
    expect(d.finished).toBe(false);
    expect(d.winners.sort()).toEqual(['a', 'b']);
  });

  it('N=2 best-of-3: 2 round wins decide by round 2 or 3', () => {
    // a won rounds 1+2 → 6:0 after round 2; even after 3 rounds max 3:6
    const d = decideMatch(new Map([['a', 6], ['b', 3]]));
    expect(d.finished).toBe(true);
    expect(d.winners).toEqual(['a']);
  });
});
