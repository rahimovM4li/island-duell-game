import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AMMO_CAP, AMMO_PICKUP, RECIPES, WEAPONS, WEAPON_START_AMMO,
} from '@shared/constants';
import { generateWorld } from '@shared/worldgen';

function glbNodeNames(filename: string): string[] {
  const buffer = readFileSync(path.resolve(`client/public/assets/${filename}`));
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength)) as {
    nodes?: Array<{ name?: string }>;
  };
  return (gltf.nodes ?? []).flatMap((node) => node.name ? [node.name] : []);
}

describe('removed bow and arrows', () => {
  it('has no remaining runtime definitions or crafting recipe', () => {
    expect(WEAPONS).not.toHaveProperty('bow');
    expect(RECIPES).not.toHaveProperty('arrows');
    expect(AMMO_PICKUP).not.toHaveProperty('arrow');
    expect(AMMO_CAP).not.toHaveProperty('arrow');
    expect(WEAPON_START_AMMO).not.toHaveProperty('bow');
  });

  it('transfers the complete ranged spawn floor to pistols', () => {
    for (let seed = 1; seed <= 24; seed += 1) {
      const world = generateWorld(seed, 5);
      const spawnWeapons = world.spawnFloorItems.filter((item) =>
        item.item === 'pistol');
      expect(spawnWeapons).toHaveLength(5);
    }
  });

  it('does not ship bow or arrow meshes in browser GLBs', () => {
    expect(glbNodeNames('weapons.glb')).not.toContain('weapon_bow');
    expect(glbNodeNames('props.glb')).not.toContain('prop_arrow_bundle');
    expect(glbNodeNames('props.glb')).not.toContain('prop_projectile_arrow');
  });
});
