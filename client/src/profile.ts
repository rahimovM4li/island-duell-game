// Local player profile + match history (§F5). Pure aggregation logic is kept
// framework-free so it unit-tests without a DOM; localStorage I/O lives at the edge.
import type { CombatStats } from '@shared/protocol';

export interface CareerStats {
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  headshots: number;
  shotsFired: number;
  hits: number;
  roundsPlayed: number;
  bestPlacement: number; // 0 = none yet
}

export interface MatchHistoryEntry {
  date: string;       // ISO
  seed: number;
  placement: number;
  points: number;
  kills: number;
  deaths: number;
  headshots: number;
  damageDealt: number;
  players: number;
  practice: boolean;
}

export interface PlayerProfile {
  version: 1;
  /** Ranked career — human matches only; practice runs are history-only. */
  career: CareerStats;
  history: MatchHistoryEntry[]; // newest first
}

export interface MatchResult {
  seed: number;
  placement: number;
  points: number;
  players: number;
  rounds: number;
  deaths: number;
  stats: CombatStats;
  practice: boolean;
  date?: string;
}

export const HISTORY_LIMIT = 25;

export function freshProfile(): PlayerProfile {
  return {
    version: 1,
    career: {
      matches: 0, wins: 0, kills: 0, deaths: 0, damageDealt: 0, damageTaken: 0,
      headshots: 0, shotsFired: 0, hits: 0, roundsPlayed: 0, bestPlacement: 0,
    },
    history: [],
  };
}

/** Fold one finished match into the profile. Pure: returns a new object. */
export function mergeMatchIntoProfile(profile: PlayerProfile, result: MatchResult): PlayerProfile {
  const entry: MatchHistoryEntry = {
    date: result.date ?? new Date().toISOString(),
    seed: result.seed,
    placement: result.placement,
    points: result.points,
    kills: result.stats.kills,
    deaths: result.deaths,
    headshots: result.stats.headshots,
    damageDealt: result.stats.damageDealt,
    players: result.players,
    practice: result.practice,
  };
  const career: CareerStats = { ...profile.career };
  if (!result.practice) {
    career.matches += 1;
    if (result.placement === 1) career.wins += 1;
    career.kills += result.stats.kills;
    career.deaths += result.deaths;
    career.damageDealt += result.stats.damageDealt;
    career.damageTaken += result.stats.damageTaken;
    career.headshots += result.stats.headshots;
    career.shotsFired += result.stats.shotsFired;
    career.hits += result.stats.hits;
    career.roundsPlayed += result.rounds;
    career.bestPlacement = career.bestPlacement === 0
      ? result.placement
      : Math.min(career.bestPlacement, result.placement);
  }
  return {
    version: 1,
    career,
    history: [entry, ...profile.history].slice(0, HISTORY_LIMIT),
  };
}

export function accuracyPct(career: CareerStats): number | null {
  return career.shotsFired > 0 ? Math.round((career.hits / career.shotsFired) * 100) : null;
}

export function kdRatio(career: CareerStats): string {
  if (career.deaths === 0) return career.kills > 0 ? `${career.kills.toFixed(1)}` : '—';
  return (career.kills / career.deaths).toFixed(2);
}

// ---------- storage edge ----------
const keyFor = (name: string): string => `islandProfile:${name.trim().toLocaleLowerCase()}`;

export function loadProfile(name: string): PlayerProfile {
  try {
    const raw = localStorage.getItem(keyFor(name));
    if (!raw) return freshProfile();
    const parsed = JSON.parse(raw) as PlayerProfile;
    if (parsed?.version !== 1 || !parsed.career || !Array.isArray(parsed.history)) return freshProfile();
    return { ...freshProfile(), ...parsed, career: { ...freshProfile().career, ...parsed.career } };
  } catch {
    return freshProfile();
  }
}

export function saveProfile(name: string, profile: PlayerProfile): void {
  try {
    localStorage.setItem(keyFor(name), JSON.stringify(profile));
  } catch { /* storage full/blocked: profile is a nice-to-have */ }
}
