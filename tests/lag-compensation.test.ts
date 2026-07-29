import { describe, expect, it } from 'vitest';
import {
  appendHistoricalPose, clampedRewindSeconds, sampleHistoricalPose,
  type HistoricalPlayerPose,
} from '../server/src/lag-compensation';

const pose = (
  t: number,
  x: number,
  overrides: Partial<HistoricalPlayerPose> = {},
): HistoricalPlayerPose => ({
  t,
  feet: { x, y: 1, z: 0 },
  yaw: 0,
  sneaking: false,
  prone: false,
  ...overrides,
});

describe('bounded server hitscan rewind', () => {
  it('interpolates position/yaw and switches discrete stance at the midpoint', () => {
    const history = [
      pose(1, 0, { yaw: Math.PI - 0.2 }),
      pose(1.1, 1, { yaw: -Math.PI + 0.2, prone: true }),
    ];
    const early = sampleHistoricalPose(history, 1.04)!;
    const late = sampleHistoricalPose(history, 1.06)!;
    expect(early.feet.x).toBeCloseTo(0.4);
    expect(Math.abs(Math.abs(early.yaw) - Math.PI)).toBeLessThan(0.05);
    expect(early.prone).toBe(false);
    expect(late.prone).toBe(true);
  });

  it('keeps a bounded rolling history and rejects excessive rewinds', () => {
    const history: HistoricalPlayerPose[] = [];
    appendHistoricalPose(history, pose(1, 0), 0);
    appendHistoricalPose(history, pose(1.1, 1), 0);
    appendHistoricalPose(history, pose(1.2, 2), 1.15);
    expect(history[0].t).toBe(1.1);
    expect(clampedRewindSeconds(500, 220)).toBeCloseTo(0.22);
    expect(clampedRewindSeconds(100, 220, 40)).toBeCloseTo(4);
    expect(clampedRewindSeconds(undefined, 220)).toBe(0);
  });
});
