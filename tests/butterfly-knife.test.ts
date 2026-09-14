import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { WEAPONS } from '@shared/constants';
import { butterflyKnife, knifePose, KNIFE_DRAW_SECONDS } from '../client/src/butterfly-knife';
import { Entities } from '../client/src/entities';
import { viewWeaponForInventory } from '../client/src/weapon-switch';
import { gameAssets } from '../client/src/game-assets';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { loadModel } from './helpers/load-model';

beforeAll(async () => {
  const hands = await loadModel('hands.glb');
  const knife = await loadModel('butterfly.glb');
  vi.spyOn(gameAssets, 'cloneHand').mockImplementation(() => clone(hands));
  vi.spyOn(gameAssets, 'cloneButterfly').mockImplementation(() => knife.clone(true));
});
afterAll(() => vi.restoreAllMocks());

describe('permanent butterfly loadout', () => {
  it('keeps the anatomical wrist fixed to the grip and the elbow off camera in both attacks', () => {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.08, 400);
    const entities = new Entities(new THREE.Scene(), camera, 42);
    entities.setViewWeapon('knife');
    entities.update(1, 1);
    const hand = entities.viewRoot.getObjectByName('trigger-hand')!;
    const wrist = hand.getObjectByName('view-wrist')!;
    const restWrist = wrist.position.clone();
    const arm = hand.getObjectByName('anatomical-arm') as THREE.SkinnedMesh;
    expect(arm.isSkinnedMesh).toBe(true);
    camera.updateMatrixWorld(true);
    arm.skeleton.update();
    const wristWorld = wrist.getWorldPosition(new THREE.Vector3());
    const elbowWorld = hand.getObjectByName('view-elbow')!.getWorldPosition(new THREE.Vector3());
    const screenStart = wristWorld.clone().project(camera);
    const screenEnd = wristWorld.clone().lerp(elbowWorld, 0.25).project(camera);
    const axis = new THREE.Vector2(screenEnd.x - screenStart.x, screenEnd.y - screenStart.y).normalize();
    const widths: number[] = [];
    for (let i = 0; i < arm.geometry.attributes.position.count; i++) {
      const p = arm.localToWorld(arm.getVertexPosition(i, new THREE.Vector3())).project(camera);
      if (p.y < -0.65 && p.y > -1 && p.z < 1 && p.z > -1) {
        widths.push((p.x - screenStart.x) * -axis.y + (p.y - screenStart.y) * axis.x);
      }
    }
    // The forearm must retain volume; merely translating its elbow collapses it to a strip.
    expect(widths.length).toBeGreaterThan(10);
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(0.055);
    for (const attack of ['primary', 'secondary'] as const) {
      entities.meleeSwing(attack);
      for (let i = 0; i < 70; i++) {
        entities.update(0.01, 1 + i * 0.01);
        camera.updateMatrixWorld(true);
        expect(wrist.position.distanceTo(restWrist)).toBeLessThan(0.00001);
        const elbow = hand.getObjectByName('view-elbow')!.getWorldPosition(new THREE.Vector3());
        expect(camera.worldToLocal(elbow).z).toBeGreaterThan(0.08);
        arm.skeleton.update();
        for (let index = 0; index < arm.geometry.attributes.position.count; index += 40) {
          expect(arm.getVertexPosition(index, new THREE.Vector3()).toArray().every(Number.isFinite)).toBe(true);
        }
      }
    }
    entities.dispose();
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
