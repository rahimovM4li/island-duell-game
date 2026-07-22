import { describe, expect, it } from 'vitest';
import { shouldBlockGameplayKey } from '../client/src/input';
import { DEFAULT_SETTINGS } from '../client/src/settings';

describe('browser shortcut suppression while playing', () => {
  it('blocks Edge Ctrl+D because both keys are active gameplay controls', () => {
    expect(shouldBlockGameplayKey('ControlLeft', true, DEFAULT_SETTINGS)).toBe(true);
    expect(shouldBlockGameplayKey('KeyD', true, DEFAULT_SETTINGS)).toBe(true);
  });

  it('does not take browser shortcuts while pointer lock is released', () => {
    expect(shouldBlockGameplayKey('ControlLeft', false, DEFAULT_SETTINGS)).toBe(false);
    expect(shouldBlockGameplayKey('KeyD', false, DEFAULT_SETTINGS)).toBe(false);
    expect(shouldBlockGameplayKey('KeyL', false, DEFAULT_SETTINGS)).toBe(false);
  });

  it('does not block unrelated browser keys during gameplay', () => {
    expect(shouldBlockGameplayKey('KeyL', true, DEFAULT_SETTINGS)).toBe(false);
    expect(shouldBlockGameplayKey('F5', true, DEFAULT_SETTINGS)).toBe(false);
  });
});
