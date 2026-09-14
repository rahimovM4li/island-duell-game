import * as THREE from 'three';
import { gameAssets } from './game-assets';

export type HandGrip = 'knife' | 'trigger' | 'support' | 'open';

/** Textured anatomical forearm and sewn glove exported from Blender. */
export function firstPersonHand(grip: HandGrip, accentColor: number): THREE.Group {
  const hand = gameAssets.cloneHand() ?? new THREE.Group();
  hand.userData.grip = grip;
  hand.userData.accentColor = accentColor;
  const wrist = hand.getObjectByName('view-wrist');
  const elbow = hand.getObjectByName('view-elbow');
  if (wrist && elbow) hand.userData.forearmDirection = elbow.position.clone().sub(wrist.position).normalize();
  return hand;
}

const elbowTarget = new THREE.Vector3();
const armDirection = new THREE.Vector3();
const armRotation = new THREE.Quaternion();

/** Keep the anatomical forearm connected to an off-camera elbow; never move the grip. */
export function updateHandSleeves(viewRoot: THREE.Object3D, camera: THREE.Camera): void {
  camera.updateMatrixWorld(true);
  viewRoot.traverse(object => {
    if (object.name !== 'trigger-hand' && object.name !== 'support-hand') return;
    const elbow = object.getObjectByName('view-elbow');
    const wrist = object.getObjectByName('view-wrist');
    const restDirection = object.userData.forearmDirection as THREE.Vector3 | undefined;
    if (!elbow?.parent || !wrist || !restDirection) return;
    elbowTarget.set(object.name === 'support-hand' ? -0.65 : 0.68, -0.7, 0.12);
    camera.localToWorld(elbowTarget);
    elbow.position.copy(elbow.parent.worldToLocal(elbowTarget));
    armDirection.copy(elbow.position).sub(wrist.position).normalize();
    armRotation.setFromUnitVectors(restDirection, armDirection);
    // Rotate the cross-section as well as translating the elbow; translation
    // alone turns a side-on forearm into a paper-thin strip.
    wrist.quaternion.copy(armRotation);
    elbow.quaternion.copy(armRotation);
    wrist.updateMatrixWorld(true);
    elbow.updateMatrixWorld(true);
    object.traverse(child => {
      const mesh = child as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) mesh.frustumCulled = false;
    });
  });
}
