// §8 message type guards (defensive server parsing).
import { describe, expect, it } from 'vitest';
import {
  isCraftMsg, isInputMsg, isJoinMsg, isKickMsg, isReadyMsg, isStartMatchMsg,
  isStartPracticeMsg, PROTOCOL_VERSION,
} from '@shared/protocol';

describe('isJoinMsg', () => {
  it('accepts a valid join', () => {
    expect(isJoinMsg({ v: PROTOCOL_VERSION, name: 'Ali' })).toBe(true);
    expect(isJoinMsg({ v: PROTOCOL_VERSION, name: 'Ali', resumeToken: 'abc123' })).toBe(true);
  });
  it('rejects garbage', () => {
    expect(isJoinMsg(null)).toBe(false);
    expect(isJoinMsg({})).toBe(false);
    expect(isJoinMsg({ v: 1, name: '' })).toBe(false);
    expect(isJoinMsg({ v: 1, name: 'x'.repeat(25) })).toBe(false);
    expect(isJoinMsg({ v: 'x', name: 'ok' })).toBe(false);
    expect(isJoinMsg({ v: PROTOCOL_VERSION - 1, name: 'ok' })).toBe(false);
    expect(isJoinMsg({ v: PROTOCOL_VERSION, name: 'ok', resumeToken: 'x'.repeat(97) })).toBe(false);
  });
});

describe('isInputMsg', () => {
  const valid = {
    seq: 1, dt: 0.016, mx: 0, mz: 1, yaw: 0.5, pitch: -0.1,
    sprint: false, sneak: false, prone: false, aim: false,
    jump: false, fire: false, interact: false,
  };
  it('accepts a valid input', () => {
    expect(isInputMsg(valid)).toBe(true);
    expect(isInputMsg({ ...valid, slot: 2, reload: true })).toBe(true);
  });
  it('rejects malformed inputs', () => {
    expect(isInputMsg(null)).toBe(false);
    expect(isInputMsg({ ...valid, seq: 'a' })).toBe(false);
    expect(isInputMsg({ ...valid, yaw: NaN })).toBe(false);
    expect(isInputMsg({ ...valid, dt: Infinity })).toBe(false);
    expect(isInputMsg({ ...valid, slot: 4 })).toBe(false);
    expect(isInputMsg({ ...valid, fire: 1 })).toBe(false);
    expect(isInputMsg({ ...valid, sneak: 'yes' })).toBe(false);
    expect(isInputMsg({ ...valid, prone: 'yes' })).toBe(false);
    expect(isInputMsg({ ...valid, aim: undefined })).toBe(false);
  });
});

describe('isCraftMsg / isReadyMsg', () => {
  it('validates recipes', () => {
    expect(isCraftMsg({ recipe: 'arrows' })).toBe(true);
    expect(isCraftMsg({ recipe: 'bandage' })).toBe(true);
    expect(isCraftMsg({ recipe: 'plate' })).toBe(true);
    expect(isCraftMsg({ recipe: 'nuke' })).toBe(false);
    expect(isCraftMsg(null)).toBe(false);
  });
  it('validates ready flag', () => {
    expect(isReadyMsg({ ready: true })).toBe(true);
    expect(isReadyMsg({ ready: 'yes' })).toBe(false);
  });
});

describe('isKickMsg', () => {
  it('accepts only a bounded player id', () => {
    expect(isKickMsg({ playerId: '0123456789abcdef' })).toBe(true);
    expect(isKickMsg({ playerId: '' })).toBe(false);
    expect(isKickMsg({ playerId: 'x'.repeat(65) })).toBe(false);
    expect(isKickMsg({ playerId: 42 })).toBe(false);
  });
});

describe('match mode guards', () => {
  it('accepts only explicit browser-safe match modes', () => {
    expect(isStartMatchMsg({ mode: 'quick' })).toBe(true);
    expect(isStartMatchMsg({ mode: 'classic' })).toBe(true);
    expect(isStartMatchMsg({ mode: 'turbo' })).toBe(false);
    expect(isStartPracticeMsg({ bots: 3, difficulty: 'normal', mode: 'quick' })).toBe(true);
    expect(isStartPracticeMsg({ bots: 3, difficulty: 'normal' })).toBe(false);
  });
});
