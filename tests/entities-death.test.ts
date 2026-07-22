import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Entities } from '../client/src/entities';

describe('remote elimination presentation', () => {
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
