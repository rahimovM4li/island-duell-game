import { describe, expect, it } from 'vitest';
import {
  PICKUP_DROP_DURATION, droppedPickupPose,
} from '../client/src/pickup-drop-animation';

describe('dropped weapon animation', () => {
  const start = { x: 0, y: 1.1, z: 0 };
  const end = { x: 0, y: 0.58, z: -2 };

  it('moves forward through a readable arc and lands exactly on the pickup position', () => {
    const middle = droppedPickupPose(start, end, PICKUP_DROP_DURATION / 2, false);
    expect(middle.progress).toBeCloseTo(0.5);
    expect(middle.position.z).toBeLessThan(-1);
    expect(middle.position.y).toBeGreaterThan(start.y);
    expect(middle.rotation).toBeGreaterThan(0);

    const landed = droppedPickupPose(start, end, PICKUP_DROP_DURATION, false);
    expect(landed.position).toEqual(end);
    expect(landed.progress).toBe(1);
    expect(landed.done).toBe(true);
  });

  it('keeps reduced-motion feedback short and close to the direct path', () => {
    const normal = droppedPickupPose(start, end, PICKUP_DROP_DURATION / 2, false);
    const reduced = droppedPickupPose(start, end, PICKUP_DROP_DURATION / 2, true);
    expect(reduced.position.y).toBeLessThan(normal.position.y);
    expect(reduced.rotation).toBeLessThan(normal.rotation);
  });
});
