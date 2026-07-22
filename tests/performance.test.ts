import { describe, expect, it } from 'vitest';
import { AdaptiveResolution } from '../client/src/performance';

function feed(monitor: AdaptiveResolution, fps: number, seconds = 2.1) {
  let result = null;
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / fps) {
    result = monitor.sample(1 / fps) ?? result;
  }
  return result;
}

describe('adaptive browser resolution', () => {
  it('reduces scale under sustained low FPS and recovers conservatively', () => {
    const monitor = new AdaptiveResolution();
    expect(feed(monitor, 35)?.scale).toBeCloseTo(0.9);
    expect(feed(monitor, 60)?.scale).toBeCloseTo(0.9);
    expect(feed(monitor, 60)?.scale).toBeCloseTo(0.95);
  });

  it('never lowers the scale below its browser-safe floor', () => {
    const monitor = new AdaptiveResolution();
    for (let i = 0; i < 10; i += 1) feed(monitor, 20);
    expect(feed(monitor, 20)?.scale).toBe(0.65);
  });
});
