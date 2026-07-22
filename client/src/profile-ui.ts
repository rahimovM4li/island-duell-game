import type { CombatStats, PlacementEntry } from '@shared/protocol';
import {
  accuracyPct, kdRatio, loadProfile, mergeMatchIntoProfile, saveProfile,
} from './profile';

const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

export function recordProfileMatch(options: {
  name: string;
  playerId: string;
  seed: number;
  rounds: number;
  deaths: number;
  practice: boolean;
  standings: PlacementEntry[];
  stats: Record<string, CombatStats>;
}): void {
  const mine = options.standings.find((entry) => entry.id === options.playerId);
  if (!mine || !options.name) return;
  const myStats = options.stats[options.playerId]
    ?? { kills: 0, damageDealt: 0, damageTaken: 0, shotsFired: 0, hits: 0, headshots: 0, pickups: 0 };
  const merged = mergeMatchIntoProfile(loadProfile(options.name), {
    seed: options.seed,
    placement: mine.place,
    points: mine.points,
    players: options.standings.length,
    rounds: options.rounds,
    deaths: options.deaths,
    stats: myStats,
    practice: options.practice,
  });
  saveProfile(options.name, merged);
}

export function renderProfile(name: string): void {
  const profile = loadProfile(name);
  const career = profile.career;
  $('profile-name').textContent = name
    ? `Karriere von ${name} (nur echte Matches)`
    : 'Bitte zuerst einen Namen eingeben.';
  const winRate = career.matches > 0 ? `${Math.round((career.wins / career.matches) * 100)}%` : '—';
  const accuracy = accuracyPct(career);
  const headshotRate = career.hits > 0 ? `${Math.round((career.headshots / career.hits) * 100)}%` : '—';
  const tiles: [string, string][] = [
    ['Matches', String(career.matches)], ['Siege', `${career.wins} (${winRate})`],
    ['K/D', kdRatio(career)], ['Kills', String(career.kills)],
    ['Präzision', accuracy === null ? '—' : `${accuracy}%`], ['Kopftreffer', headshotRate],
    ['Schaden', String(career.damageDealt)],
    ['Beste Platzierung', career.bestPlacement > 0 ? `${career.bestPlacement}.` : '—'],
  ];

  const tileRoot = $('profile-tiles');
  tileRoot.replaceChildren(...tiles.map(([label, value]) => {
    const tile = document.createElement('div');
    tile.className = 'profile-tile';
    const strong = document.createElement('strong');
    strong.textContent = value;
    const caption = document.createElement('span');
    caption.textContent = label;
    tile.append(strong, caption);
    return tile;
  }));

  const body = $('profile-history-body');
  body.replaceChildren();
  if (profile.history.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="color:#9fb3c4">Noch keine Matches gespielt.</td>';
    body.appendChild(row);
  }
  for (const entry of profile.history) {
    const row = document.createElement('tr');
    const date = new Date(entry.date);
    const dateText = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    row.innerHTML = `<td></td><td>${entry.placement}. / ${entry.players}</td><td>${entry.kills}</td><td>${entry.damageDealt}</td><td>${entry.points}</td><td>${entry.practice ? '<span class="practice-badge">Übung</span>' : ''}</td>`;
    (row.children[0] as HTMLElement).textContent = dateText;
    body.appendChild(row);
  }
}
