import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { WEAPONS } from '@shared/constants';
import { butterflyKnife, knifePose, KNIFE_DRAW_SECONDS } from '../client/src/butterfly-knife';
import { Entities } from '../client/src/entities';
import { viewWeaponForInventory } from '../client/src/weapon-switch';
import { gameAssets } from '../client/src/game-assets';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { loadModel } from './helpers/load-model';
import { solveArmElbow } from '../client/src/first-person-hands';

beforeAll(async () => {
  const hands = await loadModel('hands.glb');
  const knife = await loadModel('butterfly.glb');
  vi.spyOn(gameAssets, 'cloneHand').mockImplementation(() => clone(hands));
  vi.spyOn(gameAssets, 'cloneButterfly').mockImplementation(() => knife.clone(true));
});
afterAll(() => vi.restoreAllMocks());

describe('permanent butterfly loadout', () => {
  it('keeps the wrist on the grip and preserves both anatomical limb lengths in both attacks', () => {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.08, 400);
    const entities = new Entities(new THREE.Scene(), camera, 42);
    entities.setViewWeapon('knife');
    entities.update(1, 1);
    const hand = entities.viewRoot.getObjectByName('trigger-hand')!;
    const wrist = hand.getObjectByName('view-wrist')!;
    const elbow = hand.getObjectByName('view-elbow')!;
    const shoulder = hand.getObjectByName('view-shoulder')!;
    const rest = hand.userData.armRest;
    const restWrist = wrist.position.clone();
    const arm = hand.getObjectByName('anatomical-arm') as THREE.SkinnedMesh;
    expect(arm.isSkinnedMesh).toBe(true);
    camera.updateMatrixWorld(true);
    arm.skeleton.update();
    const glove = hand.getObjectByName('toigo_gloves_short') as THREE.SkinnedMesh;
    expect(glove.isSkinnedMesh).toBe(true);
    glove.skeleton.update();
    const gripIndex = glove.skeleton.bones.findIndex(bone => bone.name === 'view-grip');
    const fixedVertices: Array<{ index: number; position: THREE.Vector3 }> = [];
    for (let index = 0; index < glove.geometry.attributes.position.count; index += 30) {
      const joints = new THREE.Vector4().fromBufferAttribute(glove.geometry.attributes.skinIndex, index).toArray();
      const weights = new THREE.Vector4().fromBufferAttribute(glove.geometry.attributes.skinWeight, index).toArray();
      if (joints.some((joint, j) => joint === gripIndex && weights[j] === 1)) {
        fixedVertices.push({ index, position: glove.getVertexPosition(index, new THREE.Vector3()) });
      }
    }
    expect(fixedVertices.length).toBeGreaterThan(20);
    for (const attack of ['primary', 'secondary'] as const) {
      entities.meleeSwing(attack);
      for (let i = 0; i < 70; i++) {
        entities.update(0.01, 1 + i * 0.01);
        camera.updateMatrixWorld(true);
        expect(wrist.position.distanceTo(restWrist)).toBeLessThan(0.00001);
        expect(wrist.position.distanceTo(elbow.position)).toBeCloseTo(rest.forearmLength, 5);
        expect(elbow.position.distanceTo(shoulder.position)).toBeCloseTo(rest.upperLength, 5);
        expect(arm.skeleton.bones.map(bone => bone.name)).toEqual(expect.arrayContaining([
          'view-wrist', 'view-elbow', 'view-shoulder',
        ]));
        arm.skeleton.update();
        glove.skeleton.update();
        // Moving the cuff must not drag the gripping fingers off the metal handles.
        for (const vertex of fixedVertices) {
          expect(glove.getVertexPosition(vertex.index, new THREE.Vector3()).distanceTo(vertex.position)).toBeLessThan(0.00001);
        }
        for (let index = 0; index < arm.geometry.attributes.position.count; index += 40) {
          expect(arm.getVertexPosition(index, new THREE.Vector3()).toArray().every(Number.isFinite)).toBe(true);
        }
      }
    }
    entities.dispose();
  });

  it('preserves limb lengths for unreachable, coincident and collinear arm targets', () => {
    for (const target of [[0, 0, 0], [0, 1, 0], [5, 0, 0], [0, 0, -0.4]]) {
      const wrist = new THREE.Vector3();
      const shoulder = new THREE.Vector3(...target);
      const pole = shoulder.clone();
      const elbow = new THREE.Vector3();
      solveArmElbow(wrist, shoulder, pole, 0.32, 0.34, elbow);
      expect(elbow.toArray().every(Number.isFinite)).toBe(true);
      expect(elbow.distanceTo(wrist)).toBeCloseTo(0.32, 6);
      expect(elbow.distanceTo(shoulder)).toBeCloseTo(0.34, 6);
    }
  });

  it('fits the production hilt inside the finger row with the opposing thumb on its surface', async () => {
    const hand = await loadModel('hands.glb');
    const knife = await loadModel('butterfly.glb');
    const tips = hand.getObjectByName('anatomical_hand')!.userData.grip_tips;
    const thumb = new THREE.Vector3(...tips.thumb);
    const handles = new THREE.Box3();
    knife.updateMatrixWorld(true);
    for (const name of ['knife-safe-handle', 'knife-bite-pivot']) {
      handles.union(new THREE.Box3().setFromObject(knife.getObjectByName(name)!));
    }
    // Anatomical joint centers sit within the glove padding of the metal surface.
    expect(handles.distanceToPoint(thumb)).toBeLessThan(0.025);
    expect(thumb.y).toBeGreaterThan(tips.pinky[1]);
    expect(thumb.y).toBeLessThan(tips.index[1]);
    for (const finger of ['index', 'middle', 'ring', 'pinky']) {
      expect(tips[finger][1]).toBeGreaterThan(handles.min.y);
      expect(tips[finger][1]).toBeLessThan(handles.max.y);
    }
    const rowLength = tips.index[1] - tips.pinky[1];
    expect(handles.getSize(new THREE.Vector3()).y / rowLength).toBeLessThan(1.6);
    expect(handles.getSize(new THREE.Vector3()).x).toBeLessThan(0.085);
  });
  it('has exactly one melee weapon and resolves all four slots', () => {
    expect(Object.values(WEAPONS).filter(w => w.kind === 'melee').map(w => w.type)).toEqual(['knife']);
    const inv = { primary: { type: 'rifle' as const, mag: 20 }, secondary: { type: 'pistol' as const, mag: 7 }, activeThrow: 'smoke' as const };
    expect([1, 2, 3, 4].map(active => viewWeaponForInventory({ ...inv, active: active as 1 | 2 | 3 | 4 })))
      .toEqual(['knife', 'rifle', 'pistol', 'smoke']);
  });

  it('builds separate handles and a finite beveled blade with a restrained geometry budget', () => {
    const model = butterflyKnife();
    expect(model.getObjectByName('knife-safe-handle')).toBeDefined();
    expect(model.getObjectByName('knife-bite-pivot')?.parent?.name).toBe('knife-blade-pivot');
    let triangles = 0;
    model.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      const p = o.geometry.getAttribute('position');
      expect(Array.from(p.array).every(Number.isFinite)).toBe(true);
      triangles += (o.geometry.index?.count ?? p.count) / 3;
    });
    expect(triangles).toBeLessThan(22000);
    expect(new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).length()).toBeLessThan(1.5);
  });

  it('opens on equip, interrupts inspection for a stab, and resets on a rapid firearm switch', () => {
    const entities = new Entities(new THREE.Scene(), new THREE.PerspectiveCamera(), 42);
    entities.setViewWeapon('knife');
    entities.update(0.16, 0.16);
    expect(entities.viewmodelStats().knifeBladeAngle).toBeGreaterThan(Math.PI);
    entities.update(KNIFE_DRAW_SECONDS, 1.08);
    expect(entities.viewmodelStats().knifeAnimating).toBe(false);
    entities.inspectKnife();
    entities.update(0.4, 1.48);
    expect(entities.viewmodelStats().knifeInspecting).toBe(true);
    entities.meleeSwing();
    entities.update(0.02, 1.5);
    expect(entities.viewmodelStats()).toMatchObject({ knifeAnimating: false, knifeBladeAngle: 0, stabbing: true });
    entities.setViewWeapon('rifle', true);
    entities.update(0.02, 1.52);
    expect(entities.viewmodelStats()).toMatchObject({ knifeAnimating: false, stabbing: false });
    entities.setViewWeapon('knife', true);
    expect(entities.viewmodelStats().knifeAnimating).toBe(true);
    entities.dispose();
  });

  it('keeps reduced-motion hinges still and finishes at the same open combat pose', () => {
    expect(knifePose(0.4, true, true)).toEqual(knifePose(-1));
    expect(knifePose(1)).toEqual(knifePose(-1));
    const end = knifePose(0.99999);
    expect(Math.cos(end.blade)).toBeCloseTo(1);
    expect(end.bite).toBeCloseTo(0);
  });
});
