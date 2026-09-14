import * as THREE from 'three';
import { gameAssets } from './game-assets';

export const KNIFE_DRAW_SECONDS = 0.92;
export const KNIFE_INSPECT_SECONDS = 1.65;

/** Authored balisong with separate handle hinges and beveled steel blade. */
export function butterflyKnife(): THREE.Group {
  const model = gameAssets.cloneButterfly() ?? new THREE.Group();
  model.name = 'butterfly-knife';
  return model;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const frames = [
  [0, 1, 1, -0.65], [0.18, 1.5, 0.7, 0.18], [0.42, 2.08, -0.85, -0.16],
  [0.67, 2, 0.34, 0.12], [0.86, 2, -0.055, -0.035], [1, 2, 0, 0],
] as const;

/** Time-based hinge keyframes; -1 is the open combat pose. Angles never reset mid-flip. */
export function knifePose(progress: number, inspect = false, reducedMotion = false) {
  if (progress < 0 || progress >= 1 || reducedMotion) return { blade: 0, bite: 0, wrist: 0, inspect: 0 };
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const phase = inspect ? (t < 0.25 ? -1 : (t - 0.25) / 0.75) : t;
  let blade = 0, bite = 0, wrist = 0;
  if (phase >= 0) {
    const end = frames.findIndex((f) => f[0] > phase);
    const b = frames[end < 0 ? frames.length - 1 : end];
    const a = frames[Math.max(0, (end < 0 ? frames.length - 1 : end) - 1)];
    const k = smooth((phase - a[0]) / (b[0] - a[0] || 1));
    blade = THREE.MathUtils.lerp(a[1], b[1], k) * Math.PI;
    bite = THREE.MathUtils.lerp(a[2], b[2], k) * Math.PI;
    wrist = THREE.MathUtils.lerp(a[3], b[3], k);
  } else {
    const fold = smooth(t / 0.25);
    blade = fold * Math.PI;
    bite = fold * Math.PI;
    wrist = fold * -0.65;
  }
  return { blade, bite, wrist, inspect: inspect ? Math.sin(t * Math.PI) : 0 };
}

export function animateKnife(model: THREE.Object3D, progress: number, inspect: boolean, reducedMotion: boolean): ReturnType<typeof knifePose> {
  const pose = knifePose(progress, inspect, reducedMotion);
  const blade = model.getObjectByName('knife-blade-pivot');
  const bite = model.getObjectByName('knife-bite-pivot');
  if (blade) blade.rotation.z = pose.blade;
  if (bite) bite.rotation.z = pose.bite;
  return pose;
}
