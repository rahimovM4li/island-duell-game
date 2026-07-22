import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { updateFreecam } from '../client/src/spectator';

const idleFlight = {
  moveX: 0,
  moveZ: 0,
  rise: false,
  descend: false,
  yaw: 0,
  pitch: 0,
  speed: 24,
};

describe('spectator freecam', () => {
  it('moves smoothly from render-frame deltas without network snapshots', () => {
    const position = new THREE.Vector3(0, 10, 0);

    for (let frame = 0; frame < 60; frame++) {
      updateFreecam(position, { ...idleFlight, moveZ: 1, dt: 1 / 60 });
    }

    expect(position.x).toBeCloseTo(0);
    expect(position.y).toBeCloseTo(10);
    expect(position.z).toBeCloseTo(-24);
  });

  it('supports vertical flight and caps long frame spikes', () => {
    const position = new THREE.Vector3(0, 10, 0);

    updateFreecam(position, { ...idleFlight, rise: true, dt: 1 });

    expect(position.y).toBeCloseTo(11.2);
  });
});
