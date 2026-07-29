import { describe, expect, it } from 'vitest';
import {
  classifyConnectionQuality,
  MAX_INTERPOLATION_DELAY_MS,
  recommendedShotRewindMs,
  sampleRemoteTransform,
  smoothInterpolationDelay,
  targetInterpolationDelayMs,
  type RemoteTransformSample,
} from '../client/src/network-smoothing';

const sample = (
  at: number,
  x: number,
  overrides: Partial<RemoteTransformSample> = {},
): RemoteTransformSample => ({
  at, x, y: 2, z: 0, yaw: 0, pitch: 0,
  vx: 10, vy: 0, vz: 0,
  ...overrides,
});

describe('adaptive network smoothing', () => {
  it('keeps clean links responsive and adds buffer for jitter/loss', () => {
    expect(targetInterpolationDelayMs(2, 0)).toBeLessThan(85);
    expect(targetInterpolationDelayMs(40, 5)).toBeGreaterThan(150);
    expect(targetInterpolationDelayMs(500, 90)).toBe(MAX_INTERPOLATION_DELAY_MS);
    expect(smoothInterpolationDelay(80, 170, 0.1)).toBeGreaterThan(110);
    expect(smoothInterpolationDelay(170, 80, 0.1)).toBeGreaterThan(150);
  });

  it('interpolates yaw across the wrap and bridges only a short loss gap', () => {
    const samples = [
      sample(1_000, 0, { yaw: Math.PI - 0.1 }),
      sample(1_050, 0.5, { yaw: -Math.PI + 0.1 }),
    ];
    const halfway = sampleRemoteTransform(samples, 1_025)!;
    expect(Math.abs(Math.abs(halfway.yaw) - Math.PI)).toBeLessThan(0.02);
    expect(halfway.x).toBeCloseTo(0.25);

    const extrapolated = sampleRemoteTransform(samples, 1_250)!;
    expect(extrapolated.extrapolatedMs).toBe(85);
    expect(extrapolated.x).toBeCloseTo(1.35);
  });

  it('bounds hitscan rewind and exposes clear connection states', () => {
    expect(recommendedShotRewindMs(80, 60)).toBe(110);
    expect(recommendedShotRewindMs(185, 400)).toBe(220);
    expect(classifyConnectionQuality(40, 4, 0)).toBe('excellent');
    expect(classifyConnectionQuality(95, 18, 1.2)).toBe('good');
    expect(classifyConnectionQuality(155, 35, 4)).toBe('unstable');
    expect(classifyConnectionQuality(240, 60, 9)).toBe('poor');
  });
});
