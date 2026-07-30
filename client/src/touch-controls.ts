// On-screen gameplay controls for phones/tablets: a dynamic-origin movement
// stick on the left, drag-to-look on the right and action buttons around the
// fire button. State is read by InputState via the TouchInputSource interface;
// edge-triggered actions (reload, heal, slots) are written straight into the
// per-frame edge flags that the keyboard path uses too.
import type { InputState, TouchInputSource } from './input';

const STICK_RADIUS_PX = 60;
const STICK_DEADZONE = 0.12;
const STICK_SPRINT_THRESHOLD = 0.94;
/** Portion of the screen width whose touches start the movement stick. */
const STICK_ZONE = 0.42;

export interface TouchDetectionEnvironment {
  maxTouchPoints: number;
  coarsePointer: boolean;
  userAgent: string;
}

function browserTouchEnvironment(): TouchDetectionEnvironment {
  return {
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    userAgent: navigator.userAgent,
  };
}

/**
 * Phones and tablets get touch controls; desktops with a touchscreen keep
 * mouse + keyboard (their PRIMARY pointer is fine, not coarse).
 */
export function detectTouchDevice(
  environment: TouchDetectionEnvironment = browserTouchEnvironment(),
): boolean {
  if (environment.maxTouchPoints <= 0) return false;
  if (environment.coarsePointer) return true;
  // iPadOS Safari masquerades as macOS but keeps its touch points
  return /Android|iPhone|iPad|iPod|Mobile/i.test(environment.userAgent);
}

export interface StickVector {
  x: number;
  z: number;
  magnitude: number;
}

/** Map a drag from the stick origin to movement axes (forward = +z). */
export function computeStickVector(
  originX: number,
  originY: number,
  x: number,
  y: number,
  radius = STICK_RADIUS_PX,
  deadzone = STICK_DEADZONE,
): StickVector {
  const dx = (x - originX) / radius;
  const dy = (y - originY) / radius;
  let magnitude = Math.hypot(dx, dy);
  if (magnitude < deadzone) return { x: 0, z: 0, magnitude: 0 };
  const scale = magnitude > 1 ? 1 / magnitude : 1;
  magnitude = Math.min(1, magnitude);
  return { x: dx * scale, z: -dy * scale, magnitude };
}

export interface TouchControlsOptions {
  onPause?: () => void;
}

interface ButtonSpec {
  id: string;
  label: string;
  title: string;
  press: () => void;
  release?: () => void;
}

export class TouchControls implements TouchInputSource {
  moveX = 0;
  moveZ = 0;
  sprint = false;
  fireHeld = false;
  aimHeld = false;
  jumpHeld = false;
  interactHeld = false;

  private shown = false;
  private paused = false;
  private readonly container: HTMLDivElement;
  private readonly stickBase: HTMLDivElement;
  private readonly stickKnob: HTMLDivElement;
  private readonly aimButton: HTMLDivElement;
  private stickPointerId: number | null = null;
  private stickOriginX = 0;
  private stickOriginY = 0;
  private lookPointerId: number | null = null;
  private lookLastX = 0;
  private lookLastY = 0;

  constructor(private readonly input: InputState, options: TouchControlsOptions = {}) {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';

    this.stickBase = document.createElement('div');
    this.stickBase.className = 'touch-stick-base';
    this.stickKnob = document.createElement('div');
    this.stickKnob.className = 'touch-stick-knob';
    this.stickBase.appendChild(this.stickKnob);
    this.container.appendChild(this.stickBase);

    const buttons: ButtonSpec[] = [
      {
        id: 'touch-fire', label: '◉', title: 'Schießen',
        press: () => {
          if (!this.fireHeld) this.input.firePressed = true;
          this.fireHeld = true;
        },
        release: () => {
          if (this.fireHeld) this.input.fireReleased = true;
          this.fireHeld = false;
        },
      },
      {
        id: 'touch-aim', label: '⊕', title: 'Zielen',
        press: () => {
          this.aimHeld = !this.aimHeld;
          this.aimButton.classList.toggle('on', this.aimHeld);
        },
      },
      {
        id: 'touch-jump', label: '⤒', title: 'Springen',
        press: () => { this.jumpHeld = true; },
        release: () => { this.jumpHeld = false; },
      },
      {
        id: 'touch-reload', label: '⟳', title: 'Nachladen',
        press: () => { this.input.reloadPressed = true; },
      },
      {
        id: 'touch-interact', label: '✋', title: 'Interagieren',
        press: () => { this.interactHeld = true; },
        release: () => { this.interactHeld = false; },
      },
      {
        id: 'touch-heal', label: '✚', title: 'Heilen',
        press: () => { this.input.bandagePressed = true; },
      },
      {
        id: 'touch-pause', label: '❚❚', title: 'Pause',
        press: () => options.onPause?.(),
      },
    ];
    let aimButton: HTMLDivElement | null = null;
    for (const spec of buttons) {
      const button = this.buildButton(spec);
      if (spec.id === 'touch-aim') aimButton = button;
      this.container.appendChild(button);
    }
    this.aimButton = aimButton!;

    this.bindStickAndLook();
    this.bindHudTaps();
    document.body.appendChild(this.container);
  }

  /** True while the overlay is shown and not paused (read by InputState). */
  get active(): boolean {
    return this.shown && !this.paused;
  }

  /** Show/hide with match state; resets held inputs so nothing sticks. */
  setActive(next: boolean): void {
    if (this.shown === next) return;
    this.shown = next;
    this.container.classList.toggle('active', next && !this.paused);
    if (!next) this.resetHeld();
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.container.classList.toggle('active', this.shown && !paused);
    if (paused) this.resetHeld();
  }

  private resetHeld(): void {
    if (this.fireHeld) this.input.fireReleased = true;
    this.moveX = 0; this.moveZ = 0; this.sprint = false;
    this.fireHeld = false; this.aimHeld = false;
    this.jumpHeld = false; this.interactHeld = false;
    this.aimButton.classList.remove('on');
    this.stickPointerId = null;
    this.lookPointerId = null;
    this.stickBase.classList.remove('engaged');
    this.stickKnob.style.transform = 'translate(-50%, -50%)';
  }

  private buildButton(spec: ButtonSpec): HTMLDivElement {
    const button = document.createElement('div');
    button.id = spec.id;
    button.className = 'touch-btn';
    button.textContent = spec.label;
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', spec.title);
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.setPointerCapture(event.pointerId);
      button.classList.add('pressed');
      spec.press();
    });
    const release = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      button.classList.remove('pressed');
      spec.release?.();
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    return button;
  }

  /** Movement stick (left zone, dynamic origin) + drag-to-look (rest of the screen). */
  private bindStickAndLook(): void {
    this.container.addEventListener('pointerdown', (event) => {
      if (event.target !== this.container) return;
      event.preventDefault();
      this.container.setPointerCapture(event.pointerId);
      if (event.clientX < window.innerWidth * STICK_ZONE && this.stickPointerId === null) {
        this.stickPointerId = event.pointerId;
        this.stickOriginX = event.clientX;
        this.stickOriginY = event.clientY;
        this.stickBase.classList.add('engaged');
        this.stickBase.style.left = `${event.clientX}px`;
        this.stickBase.style.top = `${event.clientY}px`;
        this.stickKnob.style.transform = 'translate(-50%, -50%)';
      } else if (this.lookPointerId === null) {
        this.lookPointerId = event.pointerId;
        this.lookLastX = event.clientX;
        this.lookLastY = event.clientY;
      }
    });
    this.container.addEventListener('pointermove', (event) => {
      if (event.pointerId === this.stickPointerId) {
        const vector = computeStickVector(
          this.stickOriginX, this.stickOriginY, event.clientX, event.clientY,
        );
        this.moveX = vector.x;
        this.moveZ = vector.z;
        this.sprint = vector.magnitude >= STICK_SPRINT_THRESHOLD;
        const knobX = vector.x * STICK_RADIUS_PX;
        const knobY = -vector.z * STICK_RADIUS_PX;
        this.stickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
      } else if (event.pointerId === this.lookPointerId) {
        this.input.applyLookDelta(event.clientX - this.lookLastX, event.clientY - this.lookLastY);
        this.lookLastX = event.clientX;
        this.lookLastY = event.clientY;
      }
    });
    const releasePointer = (event: PointerEvent) => {
      if (event.pointerId === this.stickPointerId) {
        this.stickPointerId = null;
        this.moveX = 0; this.moveZ = 0; this.sprint = false;
        this.stickBase.classList.remove('engaged');
        this.stickKnob.style.transform = 'translate(-50%, -50%)';
      } else if (event.pointerId === this.lookPointerId) {
        this.lookPointerId = null;
      }
    };
    this.container.addEventListener('pointerup', releasePointer);
    this.container.addEventListener('pointercancel', releasePointer);
    this.container.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  /** Weapon slots and craft recipes stay where they are — taps switch/craft. */
  private bindHudTaps(): void {
    const slots: Array<[string, 1 | 2 | 3]> = [['slot1', 1], ['slot2', 2], ['slot3', 3]];
    for (const [id, slot] of slots) {
      document.getElementById(id)?.addEventListener('pointerdown', (event) => {
        if (!this.active) return;
        event.preventDefault();
        this.input.slotPressed = slot;
      });
    }
    for (const span of document.querySelectorAll<HTMLElement>('#craft-recipes span[data-recipe]')) {
      span.addEventListener('pointerdown', (event) => {
        if (!this.active) return;
        event.preventDefault();
        this.input.craftPressed = span.dataset.recipe as 'bandage' | 'plate';
      });
    }
  }
}
