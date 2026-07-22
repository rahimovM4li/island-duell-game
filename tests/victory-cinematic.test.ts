import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  computeVictoryCameraPose,
  type VictoryCameraPose,
} from '../client/src/victory-cinematic';

const pose = (): VictoryCameraPose => ({
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  danceWeight: 0,
});

describe('last-kill victory cinematic', () => {
  const subject = {
    winner: new THREE.Vector3(10, 2, 5),
    winnerYaw: 0,
    victim: new THREE.Vector3(6, 2, 5),
  };

  it('starts with both duelists framed and ends in front of the winner', () => {
    const opening = computeVictoryCameraPose(0, subject, false, pose());
    expect(opening.target.x).toBeCloseTo(8);
    expect(opening.danceWeight).toBe(0);

    const winnerShot = computeVictoryCameraPose(2.2, subject, false, pose());
    const cameraFromWinner = winnerShot.position.clone().sub(subject.winner);
    const winnerFacing = new THREE.Vector3(0, 0, -1);
    expect(cameraFromWinner.dot(winnerFacing)).toBeGreaterThan(3);
    expect(winnerShot.target.x).toBeCloseTo(subject.winner.x);
    expect(winnerShot.danceWeight).toBeGreaterThan(0.95);
  });

  it('keeps the settled reduced-motion winner shot static', () => {
    const first = computeVictoryCameraPose(0.9, subject, true, pose());
    const later = computeVictoryCameraPose(1.3, subject, true, pose());
    expect(later.position.distanceTo(first.position)).toBeLessThan(0.0001);
    expect(later.target.distanceTo(first.target)).toBeLessThan(0.0001);
  });
});
