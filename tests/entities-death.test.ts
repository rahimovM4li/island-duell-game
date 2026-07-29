import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Entities } from '../client/src/entities';

describe('remote elimination presentation', () => {
  it('poses a scoped sniper flat on the stomach with centered rifle and supported arms', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 3);
    entities.ensurePlayer('sniper', 0);
    const rig = scene.children.find((child) => child.type === 'Group')!;
    const weapon = rig.getObjectByName('player_weapon_socket')!;
    const armLeft = rig.getObjectByName('player_arm_l_pivot')!;
    const armRight = rig.getObjectByName('player_arm_r_pivot')!;

    entities.updatePlayer(
      'sniper', 0, 0, 0, 0, 0, true, 'sniper', false, true, true, false,
    );
    entities.update(1, 1);

    expect(rig.rotation.x).toBeCloseTo(-Math.PI / 2, 1);
    expect(rig.position.y).toBeGreaterThan(0.15);
    expect(rig.position.y).toBeLessThan(0.4);
    expect(weapon.position.x).toBeCloseTo(0, 2);
    expect(armLeft.rotation.x).toBeGreaterThan(2);
    expect(armRight.rotation.x).toBeGreaterThan(2);
    entities.dispose();
  });

  it('aligns a prone sniper body with its actual yaw instead of leaving it diagonally skewed', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 4);
    entities.ensurePlayer('yaw-sniper', 0);
    const rig = scene.children.find((child) => child.type === 'Group')!;
    const head = rig.getObjectByName('player_head')!;
    const yaw = Math.PI / 3;

    entities.updatePlayer(
      'yaw-sniper', 0, 0, 0, yaw, 0, true, 'sniper', false, true, true, false,
    );
    entities.update(1, 1);
    rig.updateMatrixWorld(true);
    const headWorld = head.getWorldPosition(new THREE.Vector3());
    const proneAxis = new THREE.Vector2(headWorld.x - rig.position.x, headWorld.z - rig.position.z).normalize();
    const expectedForward = new THREE.Vector2(-Math.sin(yaw), -Math.cos(yaw));

    expect(proneAxis.dot(expectedForward)).toBeGreaterThan(0.98);
    expect(rig.rotation.z).toBeCloseTo(0, 4);
    entities.dispose();
  });

  it('shows the helmet only while the remote player has one equipped', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 5);
    entities.ensurePlayer('armored', 0);
    const rig = scene.children.find((child) => child.type === 'Group')!;
    const helmet = rig.getObjectByName('player_helmet')!;

    entities.updatePlayer(
      'armored', 0, 0, 0, 0, 0, true, 'rifle', false, false, false, false,
    );
    expect(helmet.visible).toBe(false);

    entities.updatePlayer(
      'armored', 0, 0, 0, 0, 0, true, 'rifle', false, false, false, true,
    );
    expect(helmet.visible).toBe(true);

    entities.breakHelmet('armored');
    expect(helmet.visible).toBe(false);
    entities.dispose();
  });

  it('makes a flash-affected opponent face visibly self-lit for remote players', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 6);
    entities.ensurePlayer('flashed-opponent', 0);
    const rig = scene.children.find((child) => child.type === 'Group')!;
    const head = rig.getObjectByName('player_head') as THREE.Mesh;
    const material = head.material as THREE.MeshLambertMaterial | THREE.MeshStandardMaterial;
    const baseIntensity = material.emissiveIntensity;

    entities.updatePlayer(
      'flashed-opponent', 0, 0, 0, 0, 0, true, 'rifle', false, false, false, false,
      { flashIntensity: 1 },
    );
    entities.update(0.25, 0.25);

    expect(material.emissiveIntensity).toBeGreaterThan(baseIntensity + 2);
    expect(material.emissive.r).toBeGreaterThan(0.8);
    expect(material.emissive.g).toBeGreaterThan(0.8);
    entities.dispose();
  });

  it('keeps the victim visible while it falls and hides it after the animation', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 7);
    entities.ensurePlayer('victim', 0);
    entities.updatePlayer('victim', 2, 3, 4, 0, 0, true, 'rifle', false, false, false);
    const rig = scene.children.find((child) => child.type === 'Group')!;

    entities.playElimination('victim', true);
    entities.update(0.6, 0.6);
    expect(rig.visible).toBe(true);
    expect(Math.abs(rig.rotation.z)).toBeGreaterThan(0.2);

    entities.update(0.9, 1.5);
    expect(rig.visible).toBe(false);
    entities.dispose();
  });

  it('creates a local third-person winner, plays the celebration, and removes the proxy', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const entities = new Entities(scene, camera, 11);

    const proxyId = entities.startVictoryCelebration(
      'local-player', true, 4, 2, -3, Math.PI / 3, 1, 'rifle', false,
    );
    expect(proxyId).toBe('__victory_local-player');
    const winner = scene.children.find((child) => child.type === 'Group')!;
    expect(winner.visible).toBe(true);

    entities.setVictoryDanceWeight(1);
    entities.update(0.22, 0.22);
    expect(winner.position.y).toBeGreaterThan(2.05);
    expect(Math.abs(winner.rotation.z)).toBeGreaterThan(0.03);

    entities.endVictoryCelebration();
    expect(scene.children).not.toContain(winner);
    entities.dispose();
  });
});
