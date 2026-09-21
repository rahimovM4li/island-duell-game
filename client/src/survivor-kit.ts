import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { islandMaterial } from './art-direction';

/** Compact field pack: a readable rear silhouette within the existing rig. */
export function survivorKit(color: number): THREE.Group {
  const group = new THREE.Group(); group.name = 'survivor-field-kit';
  const fabric = islandMaterial('rubber'), trim = islandMaterial('dark'), buckle = islandMaterial('brass');
  const accent = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 1, Math.min(w, h, d) * 0.18), mat);
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m);
  };
  box(0.37, 0.38, 0.18, 0, 1.22, 0.29, fabric);
  box(0.39, 0.1, 0.19, 0, 1.39, 0.30, trim);
  box(0.24, 0.13, 0.055, 0, 1.12, 0.395, fabric);
  for (const x of [-0.115, 0.115]) {
    box(0.032, 0.30, 0.016, x, 1.24, 0.39, accent);
    box(0.05, 0.038, 0.022, x, 1.28, 0.40, buckle);
  }
  return group;
}
