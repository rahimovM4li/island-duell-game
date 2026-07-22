// §F2/§F3 pure logic: smoke occlusion geometry, flash intensity, frag cooking
// fuse math and the slot-3 throwable cycle. These exact functions drive the
// authoritative paths in server/src/game.ts.
import { describe, expect, it } from 'vitest';
import {
  cookRemainingFuse, flashIntensityAt, nextOwnedThrow, segmentThroughSphere,
} from '../server/src/throwables';
import {
  FLASH_BACK_FACTOR, FLASH_RADIUS, GRENADE_FUSE, GRENADE_MIN_THROW_FUSE,
  SMOKE_RADIUS, WEAPONS,
} from '@shared/constants';

describe('smoke occlusion (segment vs sphere)', () => {
  const cloud = { x: 0, y: 1.5, z: 0 };

  it('blocks a shot passing straight through the cloud', () => {
    expect(segmentThroughSphere(
      { x: -20, y: 1.5, z: 0 }, { x: 20, y: 1.5, z: 0 }, cloud, SMOKE_RADIUS,
    )).toBe(true);
  });

  it('blocks a shot clipping the cloud edge', () => {
    expect(segmentThroughSphere(
      { x: -20, y: 1.5, z: SMOKE_RADIUS - 0.1 }, { x: 20, y: 1.5, z: SMOKE_RADIUS - 0.1 },
      cloud, SMOKE_RADIUS,
    )).toBe(true);
  });

  it('does not block a shot passing beside the cloud', () => {
    expect(segmentThroughSphere(
      { x: -20, y: 1.5, z: SMOKE_RADIUS + 0.5 }, { x: 20, y: 1.5, z: SMOKE_RADIUS + 0.5 },
      cloud, SMOKE_RADIUS,
    )).toBe(false);
  });

  it('does not block when the cloud lies beyond the segment end', () => {
    expect(segmentThroughSphere(
      { x: -20, y: 1.5, z: 0 }, { x: -SMOKE_RADIUS - 2, y: 1.5, z: 0 }, cloud, SMOKE_RADIUS,
    )).toBe(false);
  });

  it('blocks shots over the cloud only within its vertical extent', () => {
    expect(segmentThroughSphere(
      { x: -20, y: 1.5 + SMOKE_RADIUS + 1, z: 0 }, { x: 20, y: 1.5 + SMOKE_RADIUS + 1, z: 0 },
      cloud, SMOKE_RADIUS,
    )).toBe(false);
  });
});

describe('flashbang intensity (§F2)', () => {
  it('is strongest when close and facing the pop', () => {
    expect(flashIntensityAt(1, 1)).toBeCloseTo(1, 5); // capped at 1
  });

  it('drops with distance and is zero beyond the radius', () => {
    expect(flashIntensityAt(FLASH_RADIUS * 0.5, 1)).toBeLessThan(flashIntensityAt(1, 1));
    expect(flashIntensityAt(FLASH_RADIUS + 0.01, 1)).toBe(0);
  });

  it('a back-turned player keeps only the residual factor', () => {
    const facing = flashIntensityAt(4, 1);
    const backTurned = flashIntensityAt(4, -1);
    expect(backTurned).toBeCloseTo(facing * FLASH_BACK_FACTOR, 5);
    expect(backTurned).toBeGreaterThan(0);
  });

  it('scales smoothly with the facing angle', () => {
    expect(flashIntensityAt(6, 0.5)).toBeGreaterThan(flashIntensityAt(6, 0.1));
    expect(flashIntensityAt(6, 0.5)).toBeLessThan(flashIntensityAt(6, 1));
  });
});

describe('frag cooking fuse (§F3)', () => {
  it('a released frag keeps exactly the uncooked remainder', () => {
    expect(cookRemainingFuse(10.8, 10)).toBeCloseTo(GRENADE_FUSE - 0.8, 5);
  });

  it('never drops below the minimum throw fuse', () => {
    expect(cookRemainingFuse(10 + GRENADE_FUSE + 5, 10)).toBe(GRENADE_MIN_THROW_FUSE);
  });

  it('cook budget equals the grenade fuse (held past it = hand detonation)', () => {
    expect(GRENADE_FUSE).toBeGreaterThan(GRENADE_MIN_THROW_FUSE);
  });
});

describe('slot-3 throwable cycle (§F2)', () => {
  it('cycles frag → smoke → flash among owned types', () => {
    const counts = { frag: 1, smoke: 1, flash: 1 };
    expect(nextOwnedThrow('frag', counts)).toBe('smoke');
    expect(nextOwnedThrow('smoke', counts)).toBe('flash');
    expect(nextOwnedThrow('flash', counts)).toBe('frag');
  });

  it('skips unowned types', () => {
    expect(nextOwnedThrow('frag', { frag: 2, smoke: 0, flash: 1 })).toBe('flash');
    expect(nextOwnedThrow('flash', { frag: 0, smoke: 1, flash: 1 })).toBe('smoke');
  });

  it('stays put when nothing else is owned', () => {
    expect(nextOwnedThrow('frag', { frag: 1, smoke: 0, flash: 0 })).toBe('frag');
    expect(nextOwnedThrow('smoke', { frag: 0, smoke: 0, flash: 0 })).toBe('smoke');
  });
});

describe('throwable weapon definitions', () => {
  it('smoke and flash deal no direct damage; the frag stays lethal', () => {
    expect(WEAPONS.smoke.damage).toBe(0);
    expect(WEAPONS.flash.damage).toBe(0);
    expect(WEAPONS.grenade.damage).toBeGreaterThan(0);
  });

  it('flash is loud (ping-on-loud) while smoke stays silent', () => {
    expect(WEAPONS.flash.loud).toBe(true);
    expect(WEAPONS.smoke.loud).toBe(false);
  });
});
