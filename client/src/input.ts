// Pointer-lock mouse look + WASD state. Edge-triggered keys (slot switch,
// reload, craft) are collected per frame and consumed by main.ts.
import type { Recipe } from '@shared/constants';
import type { PlayerSettings } from './settings';

const MOUSE_SENS = 0.0023;
const TOUCH_LOOK_SENS = 0.0042;
const PITCH_LIMIT = Math.PI / 2 - 0.02;

/** Live state of the on-screen touch controls (see touch-controls.ts). */
export interface TouchInputSource {
  /** True while the overlay is shown and not paused — gates gameplay input. */
  readonly active: boolean;
  readonly moveX: number;
  readonly moveZ: number;
  readonly sprint: boolean;
  readonly fireHeld: boolean;
  readonly aimHeld: boolean;
  readonly jumpHeld: boolean;
  readonly interactHeld: boolean;
}

interface OrientationLockController {
  lock?(orientation: string): Promise<void>;
}

interface KeyboardLockController {
  lock(keyCodes?: string[]): Promise<void>;
  unlock(): void;
}

function keyboardLockController(): KeyboardLockController | undefined {
  return (navigator as Navigator & { keyboard?: KeyboardLockController }).keyboard;
}

/**
 * Browsers such as Edge reserve combinations like Ctrl+D. While pointer lock
 * is active, keys mapped to gameplay must win over the browser shortcut.
 */
export function shouldBlockGameplayKey(
  code: string,
  pointerLocked: boolean,
  settings: PlayerSettings,
  ctrlKey = false,
  metaKey = false,
): boolean {
  if (code === 'KeyW' && (ctrlKey || metaKey)) return true;
  if (!pointerLocked) return false;
  return Object.values(settings.keybinds).includes(code)
    || /^Digit[1-6]$/.test(code)
    || code === 'F3'
    || code === 'Tab'
    || code === 'KeyQ';
}

export class InputState {
  yaw = 0;
  pitch = 0;
  private keys = new Set<string>();
  private fireHeld = false;
  private aimHeld = false;
  private sniperScoped = false;
  private wheelDelta = 0;
  private touch: TouchInputSource | null = null;
  pointerLocked = false;

  // per-frame edge events
  slotPressed: 1 | 2 | 3 | null = null;
  reloadPressed = false;
  dropPressed = false;
  jumpPressed = false;
  craftPressed: Recipe | null = null;
  bandagePressed = false;
  debugToggled = false;
  firePressed = false;
  fireReleased = false;

  constructor(private canvas: HTMLElement, private settings: PlayerSettings) {
    document.addEventListener('keydown', (e) => {
      if (shouldBlockGameplayKey(e.code, this.pointerLocked, this.settings, e.ctrlKey, e.metaKey)) {
        e.preventDefault();
      }
      if (e.repeat) return;
      const k = e.code;
      this.keys.add(k);
      if (k === 'Digit1') this.slotPressed = 1;
      else if (k === 'Digit2') this.slotPressed = 2;
      else if (k === 'Digit3') this.slotPressed = 3;
      else if (k === this.settings.keybinds.reload) this.reloadPressed = true;
      else if (k === 'KeyQ' && this.pointerLocked) this.dropPressed = true;
      else if (k === this.settings.keybinds.jump) { this.jumpPressed = true; e.preventDefault(); }
      else if (k === 'Digit4') this.craftPressed = 'bandage';
      else if (k === 'Digit5') this.craftPressed = 'plate';
      else if (k === this.settings.keybinds.heal) this.bandagePressed = true;
      else if (k === 'F3') { this.debugToggled = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear(); this.fireHeld = false; this.aimHeld = false;
      this.dropPressed = false;
      keyboardLockController()?.unlock();
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked) return;
      if (e.button === 0) {
        if (!this.fireHeld) this.firePressed = true;
        this.fireHeld = true;
      }
      if (e.button === 2) this.aimHeld = true;
    });
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        if (this.fireHeld) this.fireReleased = true;
        this.fireHeld = false;
      }
      if (e.button === 2) this.aimHeld = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('wheel', (e) => {
      if (!this.pointerLocked) return;
      e.preventDefault();
      this.wheelDelta += e.deltaY;
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      const scopeMultiplier = this.sniperScoped ? this.settings.sniperAimSensitivity : 1;
      this.yaw -= e.movementX * MOUSE_SENS * this.settings.mouseSensitivity * scopeMultiplier;
      this.pitch -= e.movementY * MOUSE_SENS * this.settings.mouseSensitivity * scopeMultiplier;
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) {
        keyboardLockController()?.unlock();
        this.keys.clear();
        this.fireHeld = false;
        this.aimHeld = false;
        this.wheelDelta = 0;
        this.dropPressed = false;
      }
    });
  }

  /** Touch devices replace pointer lock with the on-screen overlay. */
  attachTouchSource(source: TouchInputSource): void {
    this.touch = source;
  }

  get touchMode(): boolean { return this.touch !== null; }

  /** True while gameplay owns the input: pointer lock or an active touch overlay. */
  get gameplayActive(): boolean {
    return this.pointerLocked || (this.touch?.active ?? false);
  }

  /** Apply a touch-look drag in CSS pixels with the same sensitivity chain as the mouse. */
  applyLookDelta(dxPixels: number, dyPixels: number): void {
    const scopeMultiplier = this.sniperScoped ? this.settings.sniperAimSensitivity : 1;
    this.yaw -= dxPixels * TOUCH_LOOK_SENS * this.settings.mouseSensitivity * scopeMultiplier;
    this.pitch -= dyPixels * TOUCH_LOOK_SENS * this.settings.mouseSensitivity * scopeMultiplier;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
  }

  requestLock(): void {
    void this.requestImmersiveLock();
  }

  private async requestImmersiveLock(): Promise<void> {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch {
      // Fullscreen may be denied outside a direct user gesture.
    }

    if (this.touch) {
      // no pointer/keyboard lock on touch devices — just try to pin landscape
      try {
        await (screen.orientation as unknown as OrientationLockController).lock?.('landscape');
      } catch {
        // Orientation lock needs fullscreen and is unsupported on iOS — the
        // rotate hint covers the portrait case instead.
      }
      return;
    }

    const keyboard = keyboardLockController();
    if (keyboard) {
      try {
        await keyboard.lock(['KeyW']);
      } catch {
        // preventDefault remains the fallback when Keyboard Lock is unavailable.
      }
    }

    try {
      const pending = this.canvas.requestPointerLock?.();
      if (pending && typeof (pending as Promise<void>).catch === 'function') {
        await (pending as Promise<void>);
      }
    } catch {
      keyboard?.unlock();
      // Unsupported or denied; the pause hint remains available.
    }
  }

  setSettings(settings: PlayerSettings): void { this.settings = settings; }
  setSniperScoped(scoped: boolean): void { this.sniperScoped = scoped; }

  consumeWheelDelta(): number {
    const delta = this.wheelDelta;
    this.wheelDelta = 0;
    return delta;
  }

  applyRecoil(pitchKick: number, yawKick: number): void {
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch + pitchKick));
    this.yaw += yawKick;
  }

  private get touchActive(): boolean { return this.touch?.active ?? false; }

  get moveX(): number {
    const keyboard = (this.keys.has(this.settings.keybinds.right) ? 1 : 0)
      - (this.keys.has(this.settings.keybinds.left) ? 1 : 0);
    const touch = this.touchActive ? this.touch!.moveX : 0;
    return Math.max(-1, Math.min(1, keyboard + touch));
  }
  get moveZ(): number {
    const keyboard = (this.keys.has(this.settings.keybinds.forward) ? 1 : 0)
      - (this.keys.has(this.settings.keybinds.back) ? 1 : 0);
    const touch = this.touchActive ? this.touch!.moveZ : 0;
    return Math.max(-1, Math.min(1, keyboard + touch));
  }
  get sprint(): boolean {
    return this.keys.has(this.settings.keybinds.sprint) || (this.touchActive && this.touch!.sprint);
  }
  get sneak(): boolean { return this.keys.has(this.settings.keybinds.sneak); }
  get jumpHeld(): boolean {
    return this.keys.has(this.settings.keybinds.jump) || (this.touchActive && this.touch!.jumpHeld);
  }
  get fire(): boolean {
    return (this.fireHeld && this.pointerLocked) || (this.touchActive && this.touch!.fireHeld);
  }
  get aim(): boolean {
    return (this.aimHeld && this.pointerLocked) || (this.touchActive && this.touch!.aimHeld);
  }
  get interact(): boolean {
    return this.keys.has(this.settings.keybinds.interact) || (this.touchActive && this.touch!.interactHeld);
  }
  get roundRosterHeld(): boolean { return this.keys.has('Tab'); }

  /** Reset one-frame edge flags; call at the end of each frame. */
  clearEdges(): void {
    this.slotPressed = null;
    this.reloadPressed = false;
    this.dropPressed = false;
    this.jumpPressed = false;
    this.craftPressed = null;
    this.bandagePressed = false;
    this.debugToggled = false;
    this.firePressed = false;
    this.fireReleased = false;
  }
}
