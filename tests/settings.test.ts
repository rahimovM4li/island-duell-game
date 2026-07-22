import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings } from '../client/src/settings';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  },
  configurable: true,
});

describe('player settings migration', () => {
  beforeEach(() => values.clear());

  it('adds a safe sniper scope multiplier to existing settings', () => {
    values.set('islandDuellSettingsV1', JSON.stringify({ mouseSensitivity: 1.35 }));
    const settings = loadSettings();
    expect(settings.mouseSensitivity).toBe(1.35);
    expect(settings.sniperAimSensitivity).toBe(DEFAULT_SETTINGS.sniperAimSensitivity);
  });

  it('clamps corrupted sniper sensitivity values', () => {
    values.set('islandDuellSettingsV1', JSON.stringify({ sniperAimSensitivity: 99 }));
    expect(loadSettings().sniperAimSensitivity).toBe(1.5);
  });
});
