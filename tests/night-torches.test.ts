import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { World } from '../client/src/world';
import { generateWorld } from '@shared/worldgen';

describe('night landmark torches', () => {
  it('places a browser-safe set of torches at navigation landmarks', () => {
    const world = new World(generateWorld(424242, 3));
    const torches = world.scene.getObjectByName('night-torches');
    expect(torches).toBeDefined();
    expect(torches?.userData.torchCount).toBeGreaterThanOrEqual(12);
    const lights = torches?.children.filter((child) => child instanceof THREE.PointLight) ?? [];
    expect(lights.length).toBeGreaterThanOrEqual(4);
    expect(lights.length).toBeLessThanOrEqual(8);
    expect(lights.every((light) => !light.castShadow)).toBe(true);
    world.dispose();
  });

  it('shows torches only during the night preset', () => {
    const world = new World(generateWorld(7, 2));
    const torches = world.scene.getObjectByName('night-torches')!;
    world.setLightingPreset('day');
    expect(torches.visible).toBe(false);
    world.setLightingPreset('sunset');
    expect(torches.visible).toBe(false);
    world.setLightingPreset('night');
    expect(torches.visible).toBe(true);
    world.dispose();
  });
});
