import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { gameAssets } from '../client/src/game-assets';
import { Entities } from '../client/src/entities';
import { loadModel } from './helpers/load-model';

const library = gameAssets as unknown as {
  character: THREE.Object3D | null;
  knife: THREE.Object3D | null;
  atlasMaterial: THREE.MeshStandardMaterial | null;
};
const saved = { ...library };

beforeAll(async () => {
  const character = await loadModel('character.glb');
  library.character = character.getObjectByName('player_survivor')!;
  library.knife = await loadModel('butterfly.glb');
  library.atlasMaterial = new THREE.MeshStandardMaterial();
});
afterAll(() => {
  library.atlasMaterial?.dispose();
  library.character = saved.character;
  library.knife = saved.knife;
  library.atlasMaterial = saved.atlasMaterial;
});

describe('production anatomical models', () => {
  it('clones independent skeletons and deforms the jacket with the arm', () => {
    const first = gameAssets.cloneCharacter(0x227799)!;
    const second = gameAssets.cloneCharacter(0xbb7733)!;
    const jacket = first.body as THREE.SkinnedMesh;
    const other = second.body as THREE.SkinnedMesh;
    expect(jacket.isSkinnedMesh).toBe(true);
    expect(jacket.skeleton.bones).toHaveLength(53);
    expect(first.armRight).not.toBe(second.armRight);
    expect(jacket.skeleton).not.toBe(other.skeleton);
    expect(jacket.geometry).toBe(other.geometry);
    expect(jacket.material).not.toBe(other.material);
    const original = second.armRight.quaternion.clone();
    first.group.updateMatrixWorld(true);
    jacket.skeleton.update();
    const before = Array.from({ length: jacket.geometry.attributes.position.count }, (_, i) =>
      jacket.getVertexPosition(i, new THREE.Vector3()));
    first.armRight.rotation.x += 0.8;
    first.group.updateMatrixWorld(true);
    jacket.skeleton.update();
    const movement = before.map((p, i) => p.distanceTo(jacket.getVertexPosition(i, new THREE.Vector3())));
    expect(Math.max(...movement)).toBeGreaterThan(0.1);
    expect(second.armRight.quaternion.equals(original)).toBe(true);
    expect(first.group.quaternion.angleTo(new THREE.Quaternion())).toBeLessThan(0.00001);
    second.group.updateMatrixWorld(true);
    other.skeleton.update();
    const bounds = new THREE.Box3().setFromObject(second.group);
    expect(bounds.min.y).toBeCloseTo(0, 1);
    expect(bounds.max.y).toBeGreaterThan(1.8);
    expect(bounds.max.y).toBeLessThan(2);
  });

  it('keeps the remote weapon on the real hand when aiming, crouching and going prone', () => {
    const scene = new THREE.Scene();
    const entities = new Entities(scene, new THREE.PerspectiveCamera(), 3);
    entities.ensurePlayer('rival', 0x338899);
    const root = scene.getObjectByName('player_survivor')!;
    const socket = root.getObjectByName('player_weapon_socket')!;
    const hand = root.getObjectByName('hand_r')!;
    for (const weapon of ['knife', 'rifle'] as const) {
      for (const pose of [{ crouch: false, prone: false }, { crouch: true, prone: false }, { crouch: false, prone: true }]) {
        entities.updatePlayer('rival', 1, 0, 2, 0.7, 0.2, true, weapon, pose.crouch, pose.prone, true, true);
        for (let i = 0; i < 30; i++) entities.update(1 / 60, i / 60);
        root.updateMatrixWorld(true);
        expect(socket.getWorldPosition(new THREE.Vector3()).distanceTo(hand.getWorldPosition(new THREE.Vector3())))
          .toBeLessThan(0.09);
        expect(root.getObjectByName('player_helmet')!.getWorldPosition(new THREE.Vector3()).distanceTo(
          root.getObjectByName('player_head')!.getWorldPosition(new THREE.Vector3()),
        )).toBeLessThan(0.25);
      }
    }
    entities.dispose();
  });
});
