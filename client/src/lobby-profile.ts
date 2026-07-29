import {
  DEFAULT_PLAYER_SKIN,
  isPlayerSkinId,
  normalizePlayerName,
  type PlayerSkinId,
} from '@shared/multiplayer';

export interface LobbyProfile {
  name: string;
  skin: PlayerSkinId;
}

const NAME_KEY = 'islandName';
const SKIN_KEY = 'islandSkin';

export function createGuestName(random = Math.random): string {
  return `IslandPlayer${Math.floor(random() * 900 + 100)}`;
}

export function loadLobbyProfile(storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): LobbyProfile {
  const storedName = storage.getItem(NAME_KEY);
  const name = normalizePlayerName(storedName) ?? createGuestName();
  const storedSkin = storage.getItem(SKIN_KEY);
  const skin = isPlayerSkinId(storedSkin) ? storedSkin : DEFAULT_PLAYER_SKIN;
  storage.setItem(NAME_KEY, name);
  storage.setItem(SKIN_KEY, skin);
  return { name, skin };
}

export function saveLobbyProfile(
  profile: LobbyProfile,
  storage: Pick<Storage, 'setItem'> = localStorage,
): LobbyProfile | null {
  const name = normalizePlayerName(profile.name);
  if (!name || !isPlayerSkinId(profile.skin)) return null;
  const next = { name, skin: profile.skin };
  storage.setItem(NAME_KEY, next.name);
  storage.setItem(SKIN_KEY, next.skin);
  return next;
}
