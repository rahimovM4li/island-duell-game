import * as THREE from 'three';
import { gameAssets } from './game-assets';

export type HandGrip = 'knife' | 'trigger' | 'support' | 'open';
type ArmRest = { forearm: THREE.Vector3; upper: THREE.Vector3; forearmLength: number; upperLength: number };

/** One anatomical hand and complete arm. Every clone has an independent skin. */
export function firstPersonHand(grip: HandGrip, accentColor: number): THREE.Group {
  const hand = gameAssets.cloneHand() ?? new THREE.Group();
  hand.userData.grip = grip;
  hand.userData.accentColor = accentColor;
  const wrist = hand.getObjectByName('view-wrist');
  const elbow = hand.getObjectByName('view-elbow');
  const shoulder = hand.getObjectByName('view-shoulder');
  if (wrist && elbow && shoulder) {
    const forearm = elbow.position.clone().sub(wrist.position);
    const upper = shoulder.position.clone().sub(elbow.position);
    hand.userData.armRest = { forearmLength: forearm.length(), upperLength: upper.length(),
      forearm: forearm.normalize(), upper: upper.normalize() } satisfies ArmRest;
  }
  hand.traverse(object => {
    if ((object as THREE.SkinnedMesh).isSkinnedMesh) object.frustumCulled = false;
  });
  return hand;
}

const axis = new THREE.Vector3();
const bend = new THREE.Vector3();
/** Two-bone IK: preserve both limb lengths, allowing the shoulder to follow an unreachable hand. */
export function solveArmElbow(wrist: THREE.Vector3, shoulder: THREE.Vector3, pole: THREE.Vector3,
  forearm: number, upper: number, result: THREE.Vector3): void {
  axis.copy(shoulder).sub(wrist);
  const distance = THREE.MathUtils.clamp(axis.length(), Math.abs(forearm - upper) + 0.0001, forearm + upper - 0.0001);
  if (axis.lengthSq() < 1e-12) axis.set(0, 0, 1);
  else axis.normalize();
  shoulder.copy(wrist).addScaledVector(axis, distance);
  const along = (forearm * forearm - upper * upper + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, forearm * forearm - along * along));
  bend.copy(pole).sub(wrist).addScaledVector(axis, -bend.dot(axis));
  if (bend.lengthSq() < 0.000001) {
    bend.set(Math.abs(axis.x) < 0.9 ? 1 : 0, 0, Math.abs(axis.x) < 0.9 ? 0 : 1);
    bend.addScaledVector(axis, -bend.dot(axis));
  }
  bend.normalize();
  result.copy(wrist).addScaledVector(axis, along).addScaledVector(bend, height);
}

const shoulderTarget = new THREE.Vector3();
const elbowPole = new THREE.Vector3();
const direction = new THREE.Vector3();

/** The wrist stays on the hilt; the elbow bends and the upper arm leads off screen. */
export function updateHandArms(viewRoot: THREE.Object3D, camera: THREE.Camera): void {
  camera.updateMatrixWorld(true);
  viewRoot.traverse(hand => {
    const rest = hand.userData.armRest as ArmRest | undefined;
    if (!rest) return;
    const wrist = hand.getObjectByName('view-wrist')!;
    const elbow = hand.getObjectByName('view-elbow')!;
    const shoulder = hand.getObjectByName('view-shoulder')!;
    const parent = wrist.parent!;
    const side = hand.name === 'support-hand' ? -1 : 1;
    shoulderTarget.set(side * 0.34, -0.43, -0.04);
    elbowPole.set(side * 0.68, -0.46, -0.22);
    parent.worldToLocal(camera.localToWorld(shoulderTarget));
    parent.worldToLocal(camera.localToWorld(elbowPole));
    solveArmElbow(wrist.position, shoulderTarget, elbowPole, rest.forearmLength, rest.upperLength, elbow.position);
    shoulder.position.copy(shoulderTarget);
    elbow.quaternion.setFromUnitVectors(rest.forearm, direction.copy(elbow.position).sub(wrist.position).normalize());
    // Share the turn with the wrist to avoid collapsing the first forearm rings.
    // The glove cuff shares this joint; its fingers remain on the fixed grip anchor.
    wrist.quaternion.identity().slerp(elbow.quaternion, 0.7);
    shoulder.quaternion.setFromUnitVectors(rest.upper, direction.copy(shoulder.position).sub(elbow.position).normalize());
    parent.updateMatrixWorld(true);
  });
}
