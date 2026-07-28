import { describe, expect, it } from 'vitest';
import {
  CharacterAnimationStateMachine,
  sampleLocomotionPose,
  selectCharacterAction,
  selectLocomotionState,
  transitionDuration,
} from '../client/src/character-animation';

const base = {
  speed: 0,
  grounded: true,
  sprinting: false,
  sneaking: false,
  prone: false,
  aiming: false,
  reloading: false,
};

describe('character animation state machine', () => {
  it('uses stance and airborne priorities consistently', () => {
    expect(selectLocomotionState(base)).toBe('idle');
    expect(selectLocomotionState({ ...base, speed: 3 })).toBe('walk');
    expect(selectLocomotionState({ ...base, speed: 6, sprinting: true })).toBe('sprint');
    expect(selectLocomotionState({ ...base, speed: 2, sneaking: true, sprinting: true })).toBe('sneak-walk');
    expect(selectLocomotionState({ ...base, speed: 1, prone: true, sneaking: true })).toBe('prone-crawl');
    expect(selectLocomotionState({ ...base, speed: 6, grounded: false, prone: true })).toBe('airborne');
  });

  it('prioritizes short combat actions over persistent aim and reload layers', () => {
    expect(selectCharacterAction({ aiming: true, reloading: true })).toBe('reload');
    expect(selectCharacterAction({ aiming: true, reloading: true }, { fire: true })).toBe('fire');
    expect(selectCharacterAction({ aiming: true, reloading: true }, { hit: true })).toBe('hit');
  });

  it('keeps prone transitions deliberate and sprint motion stronger than walking', () => {
    expect(transitionDuration('walk', 'prone-crawl')).toBeGreaterThan(transitionDuration('walk', 'sprint'));
    const walk = sampleLocomotionPose('walk', 0.15, 4);
    const sprint = sampleLocomotionPose('sprint', 0.15, 6.3);
    const prone = sampleLocomotionPose('prone-crawl', 0.15, 1.6);
    expect(Math.abs(sprint.legLeftX)).toBeGreaterThan(Math.abs(walk.legLeftX));
    expect(prone.rootPitch).toBeCloseTo(-Math.PI / 2);
    expect(prone.weaponCenter).toBe(1);
  });

  it('smoothly blends rather than snapping directly to a new stance', () => {
    const machine = new CharacterAnimationStateMachine();
    machine.update({ ...base, speed: 3 }, 1 / 60);
    const firstProne = machine.update({ ...base, speed: 1.2, prone: true }, 1 / 60);
    expect(firstProne.locomotion).toBe('prone-crawl');
    expect(firstProne.transition).toBeGreaterThan(0);
    expect(firstProne.transition).toBeLessThan(1);
    for (let i = 0; i < 30; i++) machine.update({ ...base, speed: 1.2, prone: true }, 1 / 60);
    const settled = machine.update({ ...base, speed: 1.2, prone: true }, 1 / 60);
    expect(settled.transition).toBe(1);
    expect(settled.pose.rootPitch).toBeCloseTo(-Math.PI / 2);
  });
});
