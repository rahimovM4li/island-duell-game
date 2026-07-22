import { describe, expect, it } from 'vitest';
import { advanceOnboarding, ONBOARDING_STAGES } from '../client/src/onboarding';

describe('contextual onboarding progression', () => {
  it('advances only for the currently explained action', () => {
    expect(advanceOnboarding(0, 'aim')).toBe(0);
    expect(advanceOnboarding(0, 'move')).toBe(1);
    expect(advanceOnboarding(1, 'loot')).toBe(2);
    expect(advanceOnboarding(2, 'aim')).toBe(3);
    expect(advanceOnboarding(3, 'cover')).toBe(ONBOARDING_STAGES.length);
  });
});
