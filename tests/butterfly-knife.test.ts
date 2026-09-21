import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { WEAPONS } from '@shared/constants';
import { butterflyKnife, knifePose, KNIFE_DRAW_SECONDS } from '../client/src/butterfly-knife';
import { Entities } from '../client/src/entities';
import { viewWeaponForInventory } from '../client/src/weapon-switch';

describe('permanent butterfly loadout', () => {
  it('restarts inspection on every press, including during equip, without interrupting attacks', () => {
    const entities = new Entities(new THREE.Scene(), new THREE.PerspectiveCamera(), 42);
    entities.setViewWeapon('knife');
    entities.update(0.2, 0.2);
    entities.inspectKnife();
    entities.update(0, 0.2);
    expect(entities.viewmodelStats()).toMatchObject({ knifeInspecting: true, knifeBladeAngle: 0 });
    for (let i = 0; i < 4; i++) {
      entities.update(0.6, 1 + i);
      expect(entities.viewmodelStats().knifeBladeAngle).toBeGreaterThan(0.1);
      entities.inspectKnife();
      entities.update(0, 1 + i);
      expect(entities.viewmodelStats()).toMatchObject({ knifeInspecting: true, knifeBladeAngle: 0 });
    }
    entities.meleeSwing();
    entities.inspectKnife();
    expect(entities.viewmodelStats()).toMatchObject({ knifeAnimating: false, stabbing: true });
    entities.setViewWeapon('rifle');
    entities.inspectKnife();
    expect(entities.viewmodelStats().knifeInspecting).toBe(false);
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
    expect(triangles).toBeLessThan(12000);
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
