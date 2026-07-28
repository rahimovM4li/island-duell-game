import { describe, expect, it } from 'vitest';
import {
  distanceAttenuation, footstepCue, footstepIntensity, footstepSurfaceAt,
} from '../client/src/surface-audio';
import { generateWorld } from '@shared/worldgen';
import { sampleHeight } from '@shared/terrain';

describe('surface-aware spatial audio', () => {
  it('distinguishes center stone, beach sand and inland grass', () => {
    const gen = generateWorld(42, 3);
    expect(footstepSurfaceAt(gen, 0, sampleHeight(gen.params, 0, 0), 0)).toBe('stone');
    expect(footstepSurfaceAt(gen, 112, sampleHeight(gen.params, 112, 0), 0)).toBe('sand');
    expect(footstepSurfaceAt(gen, 45, sampleHeight(gen.params, 45, 0), 0)).toBe('grass');
  });

  it('recognizes the authored wooden watchtower ramp at its physical floor height', () => {
    const gen = generateWorld(42, 3);
    const tower = gen.pois.find((poi) => poi.id === 'watchtower')!;
    const ramp = tower.structures.find((part) => part.name === 'tower_stair_ramp')!;
    const pitch = ramp.rotX ?? 0;
    const floorY = sampleHeight(gen.params, tower.x, tower.z)
      + (ramp.yOffset ?? 0) + ramp.h / 2 + ramp.h / (2 * Math.cos(pitch));
    expect(footstepSurfaceAt(gen, ramp.x, floorY, ramp.z)).toBe('wood');
  });

  it('uses separate prone cues and keeps sneaking quieter than normal movement', () => {
    expect(footstepCue('wood', 'normal')).toBe('stepWood');
    expect(footstepCue('metal', 'prone')).toBe('crawlMetal');
    expect(footstepIntensity('prone', false, false))
      .toBeLessThan(footstepIntensity('sneak', false, false));
    expect(footstepIntensity('sneak', false, false))
      .toBeLessThan(footstepIntensity('normal', false, false));
  });

  it('keeps gunshots audible farther away than footsteps without a constant floor', () => {
    expect(distanceAttenuation(45, 'weapon')).toBeGreaterThan(distanceAttenuation(45, 'footstep'));
    expect(distanceAttenuation(60, 'footstep')).toBe(0);
    expect(distanceAttenuation(140, 'weapon')).toBe(0);
  });
});
