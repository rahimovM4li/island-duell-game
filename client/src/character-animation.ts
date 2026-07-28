export type LocomotionState =
  | 'idle'
  | 'walk'
  | 'sprint'
  | 'sneak-idle'
  | 'sneak-walk'
  | 'prone-idle'
  | 'prone-crawl'
  | 'airborne';

export type CharacterAction = 'none' | 'aim' | 'reload' | 'fire' | 'melee' | 'hit';

export interface CharacterAnimationIntent {
  speed: number;
  grounded: boolean;
  sprinting: boolean;
  sneaking: boolean;
  prone: boolean;
  aiming: boolean;
  reloading: boolean;
}

export interface CharacterPose {
  rootHeight: number;
  rootPitch: number;
  rootRoll: number;
  rootScaleY: number;
  armLeftX: number;
  armRightX: number;
  armLeftZ: number;
  armRightZ: number;
  forearmLeftX: number;
  forearmRightX: number;
  legLeftX: number;
  legRightX: number;
  legLeftZ: number;
  legRightZ: number;
  headLift: number;
  weaponCenter: number;
}

const ZERO_POSE: CharacterPose = {
  rootHeight: 0,
  rootPitch: 0,
  rootRoll: 0,
  rootScaleY: 1,
  armLeftX: 0,
  armRightX: 0,
  armLeftZ: 0,
  armRightZ: 0,
  forearmLeftX: 0,
  forearmRightX: 0,
  legLeftX: 0,
  legRightX: 0,
  legLeftZ: 0,
  legRightZ: 0,
  headLift: 0,
  weaponCenter: 0,
};

const MOTION_THRESHOLD = 0.32;

export function selectLocomotionState(intent: CharacterAnimationIntent): LocomotionState {
  if (!intent.grounded) return 'airborne';
  const moving = intent.speed > MOTION_THRESHOLD;
  if (intent.prone) return moving ? 'prone-crawl' : 'prone-idle';
  if (intent.sneaking) return moving ? 'sneak-walk' : 'sneak-idle';
  if (intent.sprinting && moving) return 'sprint';
  return moving ? 'walk' : 'idle';
}

export function selectCharacterAction(
  intent: Pick<CharacterAnimationIntent, 'aiming' | 'reloading'>,
  pulse: Partial<Record<'fire' | 'melee' | 'hit', boolean>> = {},
): CharacterAction {
  if (pulse.hit) return 'hit';
  if (pulse.melee) return 'melee';
  if (pulse.fire) return 'fire';
  if (intent.reloading) return 'reload';
  if (intent.aiming) return 'aim';
  return 'none';
}

export function transitionDuration(from: LocomotionState, to: LocomotionState): number {
  if (from === to) return 0;
  if (from.startsWith('prone') || to.startsWith('prone')) return 0.28;
  if (from === 'airborne' || to === 'airborne') return 0.12;
  if (from === 'sprint' || to === 'sprint') return 0.18;
  return 0.14;
}

export function sampleLocomotionPose(
  state: LocomotionState,
  stateTime: number,
  speed: number,
): CharacterPose {
  const t = Math.max(0, stateTime);
  const movementScale = Math.min(1, Math.max(0.35, speed / 6.3));
  const pose = { ...ZERO_POSE };

  switch (state) {
    case 'idle': {
      const breath = Math.sin(t * 2.15);
      pose.rootHeight = breath * 0.012;
      pose.armLeftX = breath * 0.018;
      pose.armRightX = -breath * 0.018;
      break;
    }
    case 'walk':
    case 'sprint': {
      const sprint = state === 'sprint';
      const rate = sprint ? 11.2 : 8.2;
      const phase = Math.sin(t * rate);
      const doublePhase = Math.sin(t * rate * 2);
      const legAmount = (sprint ? 0.78 : 0.5) * movementScale;
      const armAmount = (sprint ? 0.58 : 0.38) * movementScale;
      pose.rootHeight = Math.abs(doublePhase) * (sprint ? 0.055 : 0.032);
      pose.rootPitch = sprint ? -0.11 : -0.025;
      pose.rootRoll = phase * (sprint ? 0.035 : 0.02);
      pose.legLeftX = phase * legAmount;
      pose.legRightX = -phase * legAmount;
      pose.armLeftX = -phase * armAmount;
      pose.armRightX = phase * armAmount;
      break;
    }
    case 'sneak-idle':
    case 'sneak-walk': {
      const moving = state === 'sneak-walk';
      const phase = moving ? Math.sin(t * 6.3) : Math.sin(t * 1.8) * 0.08;
      pose.rootScaleY = 0.68;
      pose.rootHeight = moving ? Math.abs(Math.sin(t * 12.6)) * 0.018 : 0;
      pose.rootPitch = 0.08;
      pose.legLeftX = phase * 0.28 * movementScale;
      pose.legRightX = -phase * 0.28 * movementScale;
      pose.armLeftX = -phase * 0.18 * movementScale;
      pose.armRightX = phase * 0.18 * movementScale;
      break;
    }
    case 'prone-idle':
    case 'prone-crawl': {
      const moving = state === 'prone-crawl';
      const phase = moving ? Math.sin(t * 4.6) : Math.sin(t * 1.7) * 0.04;
      pose.rootHeight = 0.36 + (moving ? Math.abs(Math.sin(t * 9.2)) * 0.012 : 0);
      pose.rootPitch = -Math.PI / 2;
      pose.armLeftX = 2.3 + phase * 0.13;
      pose.armRightX = 2.3 - phase * 0.13;
      pose.armLeftZ = -0.62;
      pose.armRightZ = 0.62;
      pose.forearmLeftX = 0.7 - phase * 0.12;
      pose.forearmRightX = 0.7 + phase * 0.12;
      pose.legLeftX = 0.12 - phase * 0.11;
      pose.legRightX = 0.08 + phase * 0.11;
      pose.legLeftZ = -0.08;
      pose.legRightZ = 0.08;
      pose.headLift = 0.34;
      pose.weaponCenter = 1;
      break;
    }
    case 'airborne':
      pose.rootPitch = -0.055;
      pose.armLeftX = -0.2;
      pose.armRightX = -0.2;
      pose.legLeftX = 0.18;
      pose.legRightX = -0.12;
      break;
  }
  return pose;
}

function mixPose(a: CharacterPose, b: CharacterPose, alpha: number): CharacterPose {
  const t = Math.max(0, Math.min(1, alpha));
  const result = {} as CharacterPose;
  for (const key of Object.keys(ZERO_POSE) as (keyof CharacterPose)[]) {
    result[key] = a[key] + (b[key] - a[key]) * t;
  }
  return result;
}

export interface CharacterAnimationFrame {
  locomotion: LocomotionState;
  previous: LocomotionState;
  transition: number;
  pose: CharacterPose;
}

export class CharacterAnimationStateMachine {
  private current: LocomotionState = 'idle';
  private previous: LocomotionState = 'idle';
  private stateTime = 0;
  private previousTime = 0;
  private transition = 1;
  private duration = 0;

  reset(state: LocomotionState = 'idle'): void {
    this.current = state;
    this.previous = state;
    this.stateTime = 0;
    this.previousTime = 0;
    this.transition = 1;
    this.duration = 0;
  }

  update(intent: CharacterAnimationIntent, dt: number): CharacterAnimationFrame {
    const next = selectLocomotionState(intent);
    if (next !== this.current) {
      this.previous = this.current;
      this.previousTime = this.stateTime;
      this.current = next;
      this.stateTime = 0;
      this.transition = 0;
      this.duration = transitionDuration(this.previous, this.current);
    }
    const safeDt = Math.max(0, dt);
    this.stateTime += safeDt;
    this.previousTime += safeDt;
    this.transition = this.duration <= 0
      ? 1
      : Math.min(1, this.transition + safeDt / this.duration);
    const eased = this.transition * this.transition * (3 - 2 * this.transition);
    return {
      locomotion: this.current,
      previous: this.previous,
      transition: eased,
      pose: mixPose(
        sampleLocomotionPose(this.previous, this.previousTime, intent.speed),
        sampleLocomotionPose(this.current, this.stateTime, intent.speed),
        eased,
      ),
    };
  }
}
