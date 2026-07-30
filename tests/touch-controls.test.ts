import { describe, expect, it } from 'vitest';
import { computeStickVector, detectTouchDevice } from '../client/src/touch-controls';

describe('touch device detection', () => {
  it('enables touch controls for coarse-pointer devices with touch points', () => {
    expect(detectTouchDevice({
      maxTouchPoints: 5, coarsePointer: true, userAgent: 'Mozilla/5.0 (Linux; Android 14)',
    })).toBe(true);
  });

  it('keeps desktop controls without any touch points', () => {
    expect(detectTouchDevice({
      maxTouchPoints: 0, coarsePointer: false, userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    })).toBe(false);
  });

  it('keeps desktop controls on touchscreen laptops with a fine primary pointer', () => {
    expect(detectTouchDevice({
      maxTouchPoints: 10, coarsePointer: false, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64)',
    })).toBe(false);
  });

  it('detects iPadOS Safari that masquerades as macOS via its touch points', () => {
    expect(detectTouchDevice({
      maxTouchPoints: 5,
      coarsePointer: false,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
    })).toBe(true);
  });
});

describe('virtual stick vector', () => {
  it('ignores drags inside the deadzone', () => {
    expect(computeStickVector(100, 100, 103, 100, 60, 0.12)).toEqual({ x: 0, z: 0, magnitude: 0 });
  });

  it('maps an upward drag to forward movement', () => {
    const vector = computeStickVector(100, 100, 100, 40, 60);
    expect(vector.x).toBeCloseTo(0);
    expect(vector.z).toBeCloseTo(1);
    expect(vector.magnitude).toBeCloseTo(1);
  });

  it('clamps drags beyond the stick radius to unit length', () => {
    const vector = computeStickVector(0, 0, 240, 0, 60);
    expect(vector.x).toBeCloseTo(1);
    expect(vector.z).toBeCloseTo(0);
    expect(vector.magnitude).toBe(1);
  });

  it('keeps analog magnitudes for partial deflection', () => {
    const vector = computeStickVector(0, 0, 30, 0, 60);
    expect(vector.x).toBeCloseTo(0.5);
    expect(vector.magnitude).toBeCloseTo(0.5);
  });

  it('maps diagonal drags to normalized combined axes', () => {
    const vector = computeStickVector(0, 0, 60, -60, 60);
    expect(vector.x).toBeCloseTo(Math.SQRT1_2, 3);
    expect(vector.z).toBeCloseTo(Math.SQRT1_2, 3);
    expect(vector.magnitude).toBe(1);
  });
});
