// Pointer-lock mouse look + WASD state. Edge-triggered keys (slot switch,
// reload, craft) are collected per frame and consumed by main.ts.
import type { Recipe } from '@shared/constants';

const MOUSE_SENS = 0.0023;
const PITCH_LIMIT = Math.PI / 2 - 0.02;

export class InputState {
  yaw = 0;
  pitch = 0;
  private keys = new Set<string>();
  private fireHeld = false;
  pointerLocked = false;

  // per-frame edge events
  slotPressed: 1 | 2 | 3 | null = null;
  reloadPressed = false;
  jumpPressed = false;
  craftPressed: Recipe | null = null;
  bandagePressed = false;
  debugToggled = false;

  constructor(private canvas: HTMLElement) {
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.code;
      this.keys.add(k);
      if (k === 'Digit1') this.slotPressed = 1;
      else if (k === 'Digit2') this.slotPressed = 2;
      else if (k === 'Digit3') this.slotPressed = 3;
      else if (k === 'KeyR') this.reloadPressed = true;
      else if (k === 'Space') { this.jumpPressed = true; e.preventDefault(); }
      else if (k === 'Digit4') this.craftPressed = 'arrows';
      else if (k === 'Digit5') this.craftPressed = 'bandage';
      else if (k === 'Digit6') this.craftPressed = 'plate';
      else if (k === 'KeyH') this.bandagePressed = true;
      else if (k === 'F3') { this.debugToggled = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.fireHeld = false; });

    document.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked) return;
      if (e.button === 0) this.fireHeld = true;
    });
    document.addEventListener('mouseup', (e) => { if (e.button === 0) this.fireHeld = false; });

    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * MOUSE_SENS;
      this.pitch -= e.movementY * MOUSE_SENS;
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
  }

  requestLock(): void {
    this.canvas.requestPointerLock?.();
  }

  get moveX(): number {
    return (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
  }
  get moveZ(): number {
    return (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
  }
  get sprint(): boolean { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'); }
  get jumpHeld(): boolean { return this.keys.has('Space'); }
  get fire(): boolean { return this.fireHeld && this.pointerLocked; }
  get interact(): boolean { return this.keys.has('KeyE'); }

  /** Reset one-frame edge flags; call at the end of each frame. */
  clearEdges(): void {
    this.slotPressed = null;
    this.reloadPressed = false;
    this.jumpPressed = false;
    this.craftPressed = null;
    this.bandagePressed = false;
    this.debugToggled = false;
  }
}
