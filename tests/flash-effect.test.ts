import { describe, expect, it } from 'vitest';
import { advanceFlashVisual, createFlashVisual } from '../client/src/flash-effect';

describe('flashbang visual envelope', () => {
  it('holds a direct flash nearly opaque for one to two seconds before fading', () => {
    let state = createFlashVisual(1, 2.5);
    expect(state.opacity).toBe(1);
    expect(state.holdRemaining).toBeGreaterThanOrEqual(1);
    expect(state.holdRemaining).toBeLessThanOrEqual(2);

    state = advanceFlashVisual(state, 1);
    expect(state.opacity).toBeGreaterThanOrEqual(0.98);
    state = advanceFlashVisual(state, 0.8);
    expect(state.opacity).toBeLessThan(0.98);
    expect(state.opacity).toBeGreaterThan(0);
  });

  it('keeps glancing and back-turned flashes weaker without a long white hold', () => {
    const state = createFlashVisual(0.25, 0.65);
    expect(state.opacity).toBeLessThan(0.5);
    expect(state.holdRemaining).toBeLessThan(0.15);
  });

  it('merges a stronger second flash instead of shortening the active effect', () => {
    const weak = advanceFlashVisual(createFlashVisual(0.35, 0.9), 0.2);
    const strong = createFlashVisual(1, 2.5, weak);
    expect(strong.opacity).toBe(1);
    expect(strong.holdRemaining).toBeGreaterThan(weak.holdRemaining);
  });
});
