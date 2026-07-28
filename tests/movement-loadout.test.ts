import { describe, expect, it } from 'vitest';
import { AIM_SPEED, PRONE_AIM_SPEED, PRONE_SPEED, SNEAK_SPEED } from '@shared/constants';
import { movementSpeedFor } from '@shared/movement';

describe('active-weapon movement tuning', () => {
  it('applies the agreed modifiers to walking and sprinting only', () => {
    expect(movementSpeedFor('machete', false, false, false, false)).toBeCloseTo(6 * 1.08);
    expect(movementSpeedFor('machete', false, false, false, true)).toBeCloseTo(9 * 1.08);
    expect(movementSpeedFor('spear', false, false, false, false)).toBeCloseTo(6 * 1.05);
    expect(movementSpeedFor('spear', false, false, false, true)).toBeCloseTo(9 * 1.05);
    expect(movementSpeedFor('sniper', false, false, false, false)).toBeCloseTo(6 * 0.9);
    expect(movementSpeedFor('sniper', false, false, false, true)).toBeCloseTo(9 * 0.9);
  });

  it('keeps aiming, sneaking and prone speeds independent of the held weapon', () => {
    expect(movementSpeedFor('sniper', false, false, true, false)).toBeCloseTo(AIM_SPEED);
    expect(movementSpeedFor('machete', false, true, false, false)).toBeCloseTo(SNEAK_SPEED);
    expect(movementSpeedFor('sniper', true, false, false, false)).toBeCloseTo(PRONE_SPEED);
    expect(movementSpeedFor('sniper', true, false, true, false)).toBeCloseTo(PRONE_AIM_SPEED);
  });
});
