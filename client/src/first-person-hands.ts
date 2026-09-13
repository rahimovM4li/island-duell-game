import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type HandGrip = 'knife' | 'trigger' | 'support' | 'open';

/** Camera-space right hand, authored around the grip rather than an arbitrary arm origin. */
export function firstPersonHand(grip: HandGrip, accentColor: number): THREE.Group {
  const hand = new THREE.Group();
  hand.userData.grip = grip;
  const cloth = new THREE.MeshStandardMaterial({ color: 0x52615d, roughness: 0.96, emissive: 0x182322, emissiveIntensity: 0.32 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x424c4b, roughness: 0.75, emissive: 0x182222, emissiveIntensity: 0.35 });
  const pads = new THREE.MeshStandardMaterial({ color: 0x81918b, roughness: 0.68, metalness: 0.04 });
  const seams = new THREE.MeshStandardMaterial({ color: 0xabb7a6, roughness: 1 });
  const accent = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.85 });
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    hand.add(mesh);
    return mesh;
  };
  const box = (size: [number, number, number], pos: [number, number, number], mat: THREE.Material, radius = 0.025) =>
    add(new RoundedBoxGeometry(...size, 3, radius), mat, pos);
  const tube = (points: number[][], radius: number, mat: THREE.Material, name?: string) => {
    const mesh = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 16, radius, 8, false), mat);
    if (name) mesh.name = name;
    // Rounded fingertips close the tube and remove the old flat finger blocks.
    add(new THREE.SphereGeometry(radius, 10, 6), mat, points.at(-1)! as [number, number, number]);
    return mesh;
  };
  const knife = grip === 'knife';
  const open = grip === 'open';
  // The knife's handles occupy x ±.058, y 0..-.53, z ±.055. Fingers curl around
  // that cross-section; the palm rests behind it and the thumb opposes the fingers.
  const baseY = knife ? -0.21 : -0.13;
  const palm = box([0.19, 0.26, 0.095], [0.064, baseY, 0.105], leather, 0.035);
  palm.rotation.z = -0.08;
  box([0.14, 0.15, 0.022], [0.077, baseY + 0.014, 0.161], pads, 0.018);
  for (let i = 0; i < 4; i++) {
    const y = baseY + 0.10 - i * 0.062;
    const radius = i === 3 ? 0.024 : 0.028;
    const isIndex = i === 0 && grip === 'trigger';
    const reach = open ? -0.25 + i * 0.013 : -0.106;
    const path = isIndex
      ? [[0.028, y, 0.10], [-0.032, y, 0.045], [-0.062, y, -0.04], [-0.027, y, -0.095]]
      : [[0.025, y, 0.10], [-0.055, y + 0.004, 0.09], [reach, y, 0.024],
        [open ? reach - 0.05 : -0.076, y - 0.006, -0.07], [open ? reach - 0.085 : 0.017, y - 0.01, -0.082]];
    tube(path, radius, leather, `finger-${i}`);
    box([0.047, 0.043, 0.019], [-0.018, y, 0.13], pads, 0.009);
    tube([[-0.065, y - 0.025, 0.105], [-0.028, y - 0.025, 0.132], [0.005, y - 0.025, 0.132]], 0.0025, seams);
  }
  tube([[0.142, baseY + 0.06, 0.09], [0.16, baseY + 0.13, 0.045],
    [0.09, baseY + 0.15, -0.05], [0.018, baseY + 0.13, -0.085]], 0.037, leather, 'opposing-thumb');
  box([0.062, 0.065, 0.018], [0.141, baseY + 0.09, 0.115], pads, 0.013);

  // The wrist follows the grip; the elbow is anchored outside the camera in updateHandSleeves.
  const wrist = new THREE.Vector3(0.095, baseY - 0.15, 0.15);
  const sleeve = add(new THREE.CylinderGeometry(0.135, 0.085, 1, 14, 4), cloth);
  sleeve.name = 'tapered-sleeve';
  hand.userData.sleeveWrist = wrist;
  const cuff = box([0.205, 0.09, 0.145], [0.093, baseY - 0.137, 0.142], leather, 0.02);
  cuff.rotation.x = -0.5;
  box([0.075, 0.045, 0.017], [0.106, baseY - 0.13, 0.225], accent, 0.01);

  // Bake the fixed grip by material: five draw calls per hand, independent of finger detail.
  for (const material of [leather, pads, seams, accent]) {
    const parts = hand.children.filter((o): o is THREE.Mesh => o instanceof THREE.Mesh && o.material === material);
    const geometries = parts.map(part => { part.updateMatrix(); return (part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone()).applyMatrix4(part.matrix); });
    const geometry = mergeGeometries(geometries);
    geometries.forEach(g => g.dispose());
    for (const part of parts) { hand.remove(part); part.geometry.dispose(); }
    if (geometry) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = material === leather ? 'glove-fingers-and-palm' : material === cloth ? 'tapered-sleeve' : 'glove-detail';
      hand.add(mesh);
    }
  }
  return hand;
}

const elbowPoint = new THREE.Vector3();
const sleeveDirection = new THREE.Vector3();
const sleeveUp = new THREE.Vector3(0, 1, 0);

/** Bend the forearm toward an off-screen elbow instead of rotating a severed arm with the blade. */
export function updateHandSleeves(viewRoot: THREE.Object3D, camera: THREE.Camera): void {
  viewRoot.updateWorldMatrix(true, true);
  viewRoot.traverse(hand => {
    const wrist = hand.userData.sleeveWrist as THREE.Vector3 | undefined;
    if (!wrist) return;
    const sleeve = hand.getObjectByName('tapered-sleeve')!;
    elbowPoint.set(hand.name === 'support-hand' ? -0.9 : 0.9, -0.85, 0.12);
    camera.localToWorld(elbowPoint);
    hand.worldToLocal(elbowPoint);
    sleeveDirection.copy(elbowPoint).sub(wrist);
    sleeve.scale.y = sleeveDirection.length();
    sleeve.quaternion.setFromUnitVectors(sleeveUp, sleeveDirection.normalize());
    sleeve.position.copy(wrist).add(elbowPoint).multiplyScalar(0.5);
  });
}
