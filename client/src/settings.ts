import { safeStorage, type StorageBackend } from './safe-storage';

export type GraphicsQuality = 'low' | 'medium' | 'high';
export type BindAction = 'forward' | 'back' | 'left' | 'right' | 'sprint' | 'sneak'
  | 'jump' | 'reload' | 'interact' | 'heal';

export interface PlayerSettings {
  mouseSensitivity: number;
  sniperAimSensitivity: number;
  masterVolume: number;
  effectsVolume: number;
  footstepsVolume: number;
  cameraShake: boolean;
  graphics: GraphicsQuality;
  keybinds: Record<BindAction, string>;
}

export const DEFAULT_KEYBINDS: Record<BindAction, string> = {
  forward: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD',
  sprint: 'ShiftLeft', sneak: 'ControlLeft', jump: 'Space', reload: 'KeyR',
  interact: 'KeyE', heal: 'KeyH',
};

export const DEFAULT_SETTINGS: PlayerSettings = {
  mouseSensitivity: 1,
  sniperAimSensitivity: 0.55,
  masterVolume: 0.7,
  effectsVolume: 0.8,
  footstepsVolume: 0.9,
  cameraShake: true,
  graphics: 'high',
  keybinds: { ...DEFAULT_KEYBINDS },
};

const STORAGE_KEY = 'islandDuellSettingsV1';

const clamp = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(2, value)) : fallback;

export function loadSettings(
  storage: Pick<StorageBackend, 'getItem'> = safeStorage,
): PlayerSettings {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Partial<PlayerSettings>;
    return {
      mouseSensitivity: Math.max(0.25, clamp(value.mouseSensitivity, 1)),
      sniperAimSensitivity: Math.max(0.1, Math.min(1.5,
        clamp(value.sniperAimSensitivity, DEFAULT_SETTINGS.sniperAimSensitivity))),
      masterVolume: Math.min(1, clamp(value.masterVolume, DEFAULT_SETTINGS.masterVolume)),
      effectsVolume: Math.min(1, clamp(value.effectsVolume, DEFAULT_SETTINGS.effectsVolume)),
      footstepsVolume: Math.min(1, clamp(value.footstepsVolume, DEFAULT_SETTINGS.footstepsVolume)),
      cameraShake: typeof value.cameraShake === 'boolean' ? value.cameraShake : true,
      graphics: value.graphics === 'low' || value.graphics === 'medium' || value.graphics === 'high'
        ? value.graphics : 'high',
      keybinds: sanitizeKeybinds(value.keybinds),
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

/** Accept only known actions with plausible string codes from stored data. */
function sanitizeKeybinds(stored: unknown): Record<BindAction, string> {
  const keybinds = { ...DEFAULT_KEYBINDS };
  if (!stored || typeof stored !== 'object') return keybinds;
  for (const action of Object.keys(DEFAULT_KEYBINDS) as BindAction[]) {
    const bind = (stored as Record<string, unknown>)[action];
    if (typeof bind === 'string' && bind.length > 0 && bind.length <= 32) keybinds[action] = bind;
  }
  return keybinds;
}

export function saveSettings(
  settings: PlayerSettings,
  storage: Pick<StorageBackend, 'setItem'> = safeStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function keyLabel(code: string): string {
  const known: Record<string, string> = {
    Space: 'Leertaste', ShiftLeft: 'Links ⇧', ShiftRight: 'Rechts ⇧',
    ControlLeft: 'Links Strg', ControlRight: 'Rechts Strg',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
  };
  return known[code] ?? code.replace(/^Key/, '').replace(/^Digit/, '');
}
