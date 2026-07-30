import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSafeStorage, type StorageBackend } from '../client/src/safe-storage';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../client/src/settings';

const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

function restoreLocalStorage(): void {
  if (originalLocalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
  } else {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }
}

function backendWith(overrides: Partial<StorageBackend>): StorageBackend {
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    ...overrides,
  };
}

afterEach(() => {
  restoreLocalStorage();
  vi.restoreAllMocks();
});

describe('safe browser storage', () => {
  it('contains a SecurityError thrown while resolving globalThis.localStorage', () => {
    let accesses = 0;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        accesses += 1;
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });

    const storage = createSafeStorage();
    expect(accesses).toBe(0);
    expect(storage.getItem('key')).toBeNull();
    expect(storage.setItem('key', 'value')).toBe(false);
    expect(storage.removeItem('key')).toBe(false);
    expect(accesses).toBe(1);
  });

  it('returns null when getItem throws', () => {
    const storage = createSafeStorage(() => backendWith({
      getItem: () => { throw new DOMException('Read blocked', 'SecurityError'); },
    }));
    expect(storage.getItem('key')).toBeNull();
  });

  it('returns false when setItem throws', () => {
    const storage = createSafeStorage(() => backendWith({
      setItem: () => { throw new DOMException('Write blocked', 'SecurityError'); },
    }));
    expect(storage.setItem('key', 'value')).toBe(false);
  });

  it('returns false when removeItem throws', () => {
    const storage = createSafeStorage(() => backendWith({
      removeItem: () => { throw new DOMException('Remove blocked', 'SecurityError'); },
    }));
    expect(storage.removeItem('key')).toBe(false);
  });

  it('falls back to defaults for damaged persisted JSON', () => {
    const storage = createSafeStorage(() => backendWith({
      getItem: () => '{"mouseSensitivity":',
    }));
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });

  it('preserves normal read, write, remove, and settings behavior', () => {
    const values = new Map<string, string>();
    const storage = createSafeStorage(() => ({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: (key) => { values.delete(key); },
    }));
    const settings = {
      ...DEFAULT_SETTINGS,
      mouseSensitivity: 1.4,
      sniperAimSensitivity: 0.7,
      keybinds: { ...DEFAULT_SETTINGS.keybinds, interact: 'KeyF' },
    };

    expect(storage.setItem('temporary', 'value')).toBe(true);
    expect(storage.getItem('temporary')).toBe('value');
    expect(storage.removeItem('temporary')).toBe(true);
    expect(storage.getItem('temporary')).toBeNull();

    saveSettings(settings, storage);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it('does not emit repetitive console warnings for unavailable storage', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const storage = createSafeStorage(() => { throw new Error('blocked'); });
    storage.getItem('one');
    storage.setItem('two', 'value');
    storage.removeItem('three');
    expect(warning).not.toHaveBeenCalled();
  });
});
