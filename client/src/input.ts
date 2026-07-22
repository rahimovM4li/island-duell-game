// Pointer-lock mouse look + WASD state. Edge-triggered keys (slot switch,
// reload, craft) are collected per frame and consumed by main.ts.
import type { Recipe } from '@shared/constants';
import type { PlayerSettings } from './settings';

const MOUSE_SENS = 0.0023;
const PITCH_LIMIT = Math.PI / 2 - 0.02;

/**
 * Browsers such as Edge reserve combinations like Ctrl+D. While pointer lock
 * is active, keys mapped to gameplay must win over the browser shortcut.
 */
export function shouldBlockGameplayKey(
  code: string, pointerLocked: boolean, settings: PlayerSettings,
): boolean {
  if (!pointerLocked) return false;
  return Object.values(settings.keybinds).includes(code)
    || /^Digit[1-6]$/.test(code)
    || code === 'F3';
}

export class InputState {
  yaw = 0;
  pitch = 0;
  private keys = new Set<string>();
  private fireHeld = false;
  private aimHeld = false;
  private sniperScoped = false;
  private sniperZoomWheel = 0;
  pointerLocked = false;

  // per-frame edge events
  slotPressed: 1 | 2 | 3 | null = null;
  reloadPressed = false;
  jumpPressed = false;
  craftPressed: Recipe | null = null;
  bandagePressed = false;
  debugToggled = false;
  firePressed = false;
  fireReleased = false;

  constructor(private canvas: HTMLElement, private settings: PlayerSettings) {
    document.addEventListener('keydown', (e) => {
      if (shouldBlockGameplayKey(e.code, this.pointerLocked, this.settings)) e.preventDefault();
      if (e.repeat) return;
      const k = e.code;
      this.keys.add(k);
      if (k === 'Digit1') this.slotPressed = 1;
      else if (k === 'Digit2') this.slotPressed = 2;
      else if (k === 'Digit3') this.slotPressed = 3;
      else if (k === this.settings.keybinds.reload) this.reloadPressed = true;
      else if (k === this.settings.keybinds.jump) { this.jumpPressed = true; e.preventDefault(); }
      else if (k === 'Digit4') this.craftPressed = 'arrows';
      else if (k === 'Digit5') this.craftPressed = 'bandage';
      else if (k === 'Digit6') this.craftPressed = 'plate';
      else if (k === this.settings.keybinds.heal) this.bandagePressed = true;
      else if (k === 'F3') { this.debugToggled = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear(); this.fireHeld = false; this.aimHeld = false;
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
      if (!this.pointerLocked || !this.sniperScoped) return;
      e.preventDefault();
      this.sniperZoomWheel += e.deltaY;
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
        this.keys.clear();
        this.fireHeld = false;
        this.aimHeld = false;
        this.sniperZoomWheel = 0;
      }
    });
  }

  requestLock(): void {
    try {
      const pending = this.canvas.requestPointerLock?.();
      if (pending && typeof (pending as Promise<void>).catch === 'function') {
        void (pending as Promise<void>).catch(() => { /* user can retry via the pause hint */ });
      }
    } catch { /* unsupported or denied; the pause hint remains available */ }
  }

  setSettings(settings: PlayerSettings): void { this.settings = settings; }
  setSniperScoped(scoped: boolean): void { this.sniperScoped = scoped; }

  consumeSniperZoomWheel(): number {
    const delta = this.sniperZoomWheel;
    this.sniperZoomWheel = 0;
    return delta;
  }

  applyRecoil(pitchKick: number, yawKick: number): void {
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch + pitchKick));
    this.yaw += yawKick;
  }

  get moveX(): number {
    return (this.keys.has(this.settings.keybinds.right) ? 1 : 0)
      - (this.keys.has(this.settings.keybinds.left) ? 1 : 0);
  }
  get moveZ(): number {
    return (this.keys.has(this.settings.keybinds.forward) ? 1 : 0)
      - (this.keys.has(this.settings.keybinds.back) ? 1 : 0);
  }
  get sprint(): boolean { return this.keys.has(this.settings.keybinds.sprint); }
  get sneak(): boolean { return this.keys.has(this.settings.keybinds.sneak); }
  get jumpHeld(): boolean { return this.keys.has(this.settings.keybinds.jump); }
  get fire(): boolean { return this.fireHeld && this.pointerLocked; }
  get aim(): boolean { return this.aimHeld && this.pointerLocked; }
  get interact(): boolean { return this.keys.has(this.settings.keybinds.interact); }

  /** Reset one-frame edge flags; call at the end of each frame. */
  clearEdges(): void {
    this.slotPressed = null;
    this.reloadPressed = false;
    this.jumpPressed = false;
    this.craftPressed = null;
    this.bandagePressed = false;
    this.debugToggled = false;
    this.firePressed = false;
    this.fireReleased = false;
  }
}
