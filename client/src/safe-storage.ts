export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): unknown;
  removeItem(key: string): unknown;
}

export interface SafeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): boolean;
  removeItem(key: string): boolean;
}

export type StorageProvider = () => StorageBackend | null | undefined;

function globalStorageProvider(): StorageBackend | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

/**
 * Resolve the provider lazily and contain both provider-level SecurityErrors
 * and failures from individual Storage methods. No fallback persistence is
 * used: callers continue with their normal in-memory runtime state.
 */
export function createSafeStorage(provider: StorageProvider = globalStorageProvider): SafeStorage {
  let resolved = false;
  let backend: StorageBackend | null = null;

  const resolve = (): StorageBackend | null => {
    if (resolved) return backend;
    resolved = true;
    try {
      backend = provider() ?? null;
    } catch {
      backend = null;
    }
    return backend;
  };

  return {
    getItem(key: string): string | null {
      const storage = resolve();
      if (!storage) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },

    setItem(key: string, value: string): boolean {
      const storage = resolve();
      if (!storage) return false;
      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },

    removeItem(key: string): boolean {
      const storage = resolve();
      if (!storage) return false;
      try {
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** Shared browser instance. Creating it performs no Storage access. */
export const safeStorage = createSafeStorage();
