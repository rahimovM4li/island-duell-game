// Placement points over 3 rounds (§6.4). N=2 reduces exactly to best-of-3.

/** Points for a placement (1-based). N=2: winner 3 / loser 0; N≥3: 3/2/1/0/0. */
export function placementPoints(place: number, n: number): number {
  if (n === 2) return place === 1 ? 3 : 0;
  if (place === 1) return 3;
  if (place === 2) return 2;
  if (place === 3) return 1;
  return 0;
}

/**
 * Convert an elimination sequence to placements.
 * `eliminationGroups`: first eliminated first; players eliminated simultaneously
 * without a decisive damage attribution share a group. The final group is the
 * winner (last survivor, or the tie-broken double-KO winner).
 * Shared placement: everyone in a group gets the better place value (§6.4 default).
 */
export function placementsFromEliminations(eliminationGroups: string[][]): Map<string, number> {
  const placements = new Map<string, number>();
  const total = eliminationGroups.reduce((s, g) => s + g.length, 0);
  let playersBelow = 0; // count of players already placed (all worse than upcoming groups)
  for (const group of eliminationGroups) {
    const bestPlace = total - playersBelow - (group.length - 1);
    for (const id of group) placements.set(id, bestPlace);
    playersBelow += group.length;
  }
  return placements;
}

export interface RoundResult {
  placements: Map<string, number>;
  points: Map<string, number>;
}

export function scoreRound(eliminationGroups: string[][], n: number): RoundResult {
  const placements = placementsFromEliminations(eliminationGroups);
  const points = new Map<string, number>();
  for (const [id, place] of placements) points.set(id, placementPoints(place, n));
  return { placements, points };
}

export interface MatchDecision {
  finished: boolean;
  winners: string[]; // >1 → tie, needs sudden death
}

/** After the scheduled rounds: single leader wins, tied leaders → sudden death (§6.4). */
export function decideMatch(totals: Map<string, number>): MatchDecision {
  let best = -1;
  for (const v of totals.values()) best = Math.max(best, v);
  const winners = [...totals.entries()].filter(([, v]) => v === best).map(([id]) => id).sort();
  return { finished: winners.length === 1, winners };
}
