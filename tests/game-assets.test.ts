import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { findSemanticChild } from '../client/src/game-assets';

describe('Blender semantic child lookup', () => {
  it('resolves scene-global Blender suffixes inside the owning asset root', () => {
    const watchtower = new THREE.Group();
    const lod0 = new THREE.Mesh();
    lod0.name = 'visual_lod0.013';
    watchtower.add(lod0);

    expect(findSemanticChild(watchtower, 'visual_lod0')).toBe(lod0);
  });

  it('prefers a direct exact child and does not cross into another asset root', () => {
    const root = new THREE.Group();
    const exact = new THREE.Mesh();
    exact.name = 'visual_lod0';
    const nestedRoot = new THREE.Group();
    const nested = new THREE.Mesh();
    nested.name = 'visual_lod1.004';
    nestedRoot.add(nested);
    root.add(exact, nestedRoot);

    expect(findSemanticChild(root, 'visual_lod0')).toBe(exact);
    expect(findSemanticChild(root, 'visual_lod1')).toBeUndefined();
  });
});

describe('recognisable weapon GLB silhouettes', () => {
  it('keeps enough authored geometry for the four firearm families to read differently', () => {
    const buffer = readFileSync(path.resolve('client/public/assets/weapons.glb'));
    const jsonLength = buffer.readUInt32LE(12);
    const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength)) as {
      meshes?: Array<{ name?: string; primitives?: Array<{ indices?: number; attributes?: { POSITION?: number } }> }>;
      accessors?: Array<{ count?: number }>;
    };
    const triangles = new Map<string, number>();
    for (const mesh of gltf.meshes ?? []) {
      const count = (mesh.primitives ?? []).reduce((sum, primitive) => {
        const accessor = primitive.indices ?? primitive.attributes?.POSITION;
        return sum + Math.floor((accessor === undefined ? 0 : gltf.accessors?.[accessor]?.count ?? 0) / 3);
      }, 0);
      triangles.set(mesh.name ?? '', count);
    }
    expect(triangles.get('weapon_pistol_visual_mesh')).toBeGreaterThanOrEqual(560);
    expect(triangles.get('weapon_rifle_visual_mesh')).toBeGreaterThanOrEqual(760);
    expect(triangles.get('weapon_shotgun_visual_mesh')).toBeGreaterThanOrEqual(820);
    expect(triangles.get('weapon_sniper_visual_mesh')).toBeGreaterThanOrEqual(980);
  });

  it('keeps machete and bow detailed enough to remain readable in first person', () => {
    const buffer = readFileSync(path.resolve('client/public/assets/weapons.glb'));
    const jsonLength = buffer.readUInt32LE(12);
    const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength)) as {
      meshes?: Array<{ name?: string; primitives?: Array<{ indices?: number; attributes?: { POSITION?: number } }> }>;
      accessors?: Array<{ count?: number }>;
    };
    const triangleCount = (name: string) => {
      const mesh = gltf.meshes?.find((entry) => entry.name === name);
      return (mesh?.primitives ?? []).reduce((sum, primitive) => {
        const accessor = primitive.indices ?? primitive.attributes?.POSITION;
        return sum + Math.floor((accessor === undefined ? 0 : gltf.accessors?.[accessor]?.count ?? 0) / 3);
      }, 0);
    };
    expect(triangleCount('weapon_machete_visual_mesh')).toBeGreaterThanOrEqual(420);
    expect(triangleCount('weapon_bow_visual_mesh')).toBeGreaterThanOrEqual(360);
  });
});
