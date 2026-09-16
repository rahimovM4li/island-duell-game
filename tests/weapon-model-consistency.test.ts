import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createHash } from 'node:crypto';
import { Entities } from '../client/src/entities';
import { gameAssets } from '../client/src/game-assets';

function appearance(root: THREE.Object3D) {
  const meshes: unknown[] = [];
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = object.material as THREE.MeshStandardMaterial;
    meshes.push({
      name: object.name, position: object.position.toArray(), rotation: object.quaternion.toArray(),
      vertices: createHash('sha256').update(Buffer.from(object.geometry.attributes.position.array.buffer)).digest('hex'),
      color: material.color.getHex(), metalness: material.metalness, roughness: material.roughness,
    });
  });
  return meshes;
}

beforeEach(() => vi.stubGlobal('document', {
  createElement: () => ({ getContext: () => ({
    beginPath() {}, roundRect() {}, fill() {}, stroke() {}, fillText() {},
  }) }),
}));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('consistent weapon appearance', () => {
  it.each(['pistol', 'rifle', 'shotgun', 'sniper'] as const)(
    'uses the held %s model for spawned loot, dropped loot and other players even when GLBs are loaded', type => {
      // Simulate the loaded alternative that previously replaced only world weapons.
      vi.spyOn(gameAssets, 'cloneWeapon').mockImplementation(() => {
        const alternative = new THREE.Group();
        alternative.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0xff00ff })));
        return alternative;
      });
      const scene = new THREE.Scene();
      const entities = new Entities(scene, new THREE.PerspectiveCamera(), 1);
      try {
        entities.setViewWeapon(type);
        const held = entities.viewRoot.getObjectByName(`view-${type}`)!;
        expect(held).toBeDefined();
        const expected = appearance(held);
        for (const dropped of [false, true]) {
          entities.addPickup({ id: `loot-${dropped}`, item: type, x: 3, y: 0, z: 2,
            ...(dropped ? { dropOrigin: { x: 0, y: 1, z: 0 } } : {}) });
          const holder = scene.children.at(-1)!;
          expect(appearance(holder.children[0])).toEqual(expected);
        }
        entities.ensurePlayer('rival', 0x338899);
        entities.updatePlayer('rival', 1, 0, 2, 0, 0, true, type, false, false, false, false);
        const remote = scene.getObjectByName(`view-${type}`)!;
        expect(remote).toBeDefined();
        expect(appearance(remote)).toEqual(expected);
        expect(remote.getObjectByName('trigger-hand')).toBeUndefined();
        const movingMagazine = held.getObjectByName('moving-magazine')!;
        movingMagazine.position.y = -0.3;
        expect(remote.getObjectByName('moving-magazine')!.position.y).toBe(0);
      } finally {
        entities.dispose();
      }
    },
  );
});
