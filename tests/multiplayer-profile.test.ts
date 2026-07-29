import { describe, expect, it } from 'vitest';
import {
  isPlayerSkinId,
  normalizePlayerName,
  uniquePlayerName,
} from '@shared/multiplayer';
import { createGuestName, loadLobbyProfile, saveLobbyProfile } from '../client/src/lobby-profile';
import { resolveMultiplayerUrl } from '../client/src/multiplayer-url';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('public multiplayer profile', () => {
  it('creates and persists a guest profile', () => {
    const storage = new MemoryStorage();
    expect(createGuestName(() => 0.413)).toBe('IslandPlayer471');
    const first = loadLobbyProfile(storage);
    const second = loadLobbyProfile(storage);
    expect(first.name).toMatch(/^IslandPlayer\d{3}$/);
    expect(second).toEqual(first);
  });

  it('normalizes safe names and rejects invalid names and skins', () => {
    expect(normalizePlayerName('  Insel   Held_7  ')).toBe('Insel Held_7');
    expect(normalizePlayerName('<script>')).toBe('script');
    expect(normalizePlayerName('!')).toBeNull();
    expect(normalizePlayerName('x'.repeat(17))).toBeNull();
    expect(isPlayerSkinId('lagoon')).toBe(true);
    expect(isPlayerSkinId('paid-gold')).toBe(false);
  });

  it('adds a short deterministic suffix for duplicate room names', () => {
    expect(uniquePlayerName('InselHeld', ['inselheld', 'InselHeld-2'])).toBe('InselHeld-3');
  });

  it('only saves valid lobby profiles', () => {
    const storage = new MemoryStorage();
    expect(saveLobbyProfile({ name: 'Nova', skin: 'coral' }, storage)).toEqual({
      name: 'Nova',
      skin: 'coral',
    });
    expect(saveLobbyProfile({ name: '!', skin: 'coral' }, storage)).toBeNull();
  });
});

describe('multiplayer URL resolution', () => {
  it('uses localhost only in Vite development', () => {
    expect(resolveMultiplayerUrl({ dev: true, pageProtocol: 'http:' })).toBe('http://localhost:3000');
  });

  it('uses same-origin in production and upgrades an override on HTTPS', () => {
    expect(resolveMultiplayerUrl({ dev: false, pageProtocol: 'https:' })).toBeUndefined();
    expect(resolveMultiplayerUrl({
      dev: false,
      pageProtocol: 'https:',
      override: 'http://island-duell-game.onrender.com/',
    })).toBe('https://island-duell-game.onrender.com');
  });
});
