export const PLAYER_SKINS = [
  { id: 'coral', label: 'Koralle', color: 0xe85d5d },
  { id: 'lagoon', label: 'Lagune', color: 0x3d9df2 },
  { id: 'jungle', label: 'Dschungel', color: 0x46c46e },
  { id: 'sun', label: 'Sonne', color: 0xd8b43a },
  { id: 'orchid', label: 'Orchidee', color: 0xb26ee0 },
] as const;

export type PlayerSkinId = typeof PLAYER_SKINS[number]['id'];

export const DEFAULT_PLAYER_SKIN: PlayerSkinId = 'lagoon';
export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 16;

export function isPlayerSkinId(value: unknown): value is PlayerSkinId {
  return typeof value === 'string' && PLAYER_SKINS.some((skin) => skin.id === value);
}

export function playerSkinColor(id: PlayerSkinId): number {
  return PLAYER_SKINS.find((skin) => skin.id === id)?.color ?? PLAYER_SKINS[1].color;
}

export function normalizePlayerName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  const length = [...normalized].length;
  if (length < PLAYER_NAME_MIN_LENGTH || length > PLAYER_NAME_MAX_LENGTH) return null;
  return normalized;
}

export function uniquePlayerName(requested: string, names: Iterable<string>): string {
  const occupied = new Set([...names].map((name) => name.toLocaleLowerCase()));
  if (!occupied.has(requested.toLocaleLowerCase())) return requested;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const marker = `-${suffix}`;
    const base = [...requested].slice(0, PLAYER_NAME_MAX_LENGTH - marker.length).join('');
    const candidate = `${base}${marker}`;
    if (!occupied.has(candidate.toLocaleLowerCase())) return candidate;
  }
  return `${[...requested].slice(0, PLAYER_NAME_MAX_LENGTH - 4).join('')}-${Date.now() % 1000}`;
}
