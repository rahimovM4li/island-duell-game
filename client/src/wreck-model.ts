import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WRECK_PARTS } from '@shared/wreck';

/** Weathered ship with open routes; structural meshes exactly match the shared proxies. */
export function buildWreck(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'poi-wreck';
  const timber = new THREE.MeshStandardMaterial({ color: 0xa78561, roughness: 0.94, emissive: 0x63472e, emissiveIntensity: 0.24 });
  const deck = new THREE.MeshStandardMaterial({ color: 0xb6976b, roughness: 0.88, emissive: 0x705137, emissiveIntensity: 0.18 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x454c4b, roughness: 0.63, metalness: 0.65 });
  const paint = new THREE.MeshStandardMaterial({ color: 0x2a5558, roughness: 0.86 });
  const box = (parent: THREE.Object3D, size: number[], pos: number[], mat: THREE.Material): THREE.Mesh => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  for (const part of WRECK_PARTS) {
    const group = new THREE.Group();
    group.name = part.name;
    group.position.set(...part.center);
    group.rotation.set(part.pitch ?? 0, part.yaw, 0);
    root.add(group);
    box(group, part.size, [0, 0, 0], part.walkSurface ? deck : part.name.includes('rail') ? iron : timber);
    const [w, h, d] = part.size;
    if (part.name.includes('cargo')) {
      for (const x of [-w * 0.36, w * 0.36]) box(group, [0.09, h + 0.03, d + 0.03], [x, 0, 0], iron);
      box(group, [w + 0.02, 0.09, d + 0.02], [0, h * 0.3, 0], iron);
    } else if (!part.walkSurface && w > 3) {
      // Raised seams and worn paint strips break the silhouette without filling openings.
      for (let y = -h / 2 + 0.23; y < h / 2; y += 0.34) {
        box(group, [w, 0.025, d + 0.016], [0, y, 0], deck);
      }
      box(group, [w, 0.16, d + 0.025], [0, h * 0.22, 0], paint);
      for (let x = -w / 2 + 0.35; x < w / 2; x += 1.4) {
        box(group, [0.08, h, d + 0.04], [x, 0, 0], iron);
      }
    } else if (part.walkSurface) {
      for (let z = -d / 2 + 0.3; z < d / 2; z += 0.4) {
        box(group, [w, 0.012, 0.015], [0, h / 2 + 0.003, z], timber);
      }
    }
  }
  const yard = box(root, [5.4, 0.15, 0.15], [-0.6, 7.2, -2.6], timber);
  yard.rotation.z = -0.08;
  const sailGeo = new THREE.PlaneGeometry(4.8, 3.1, 14, 9);
  const positions = sailGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    if (y < -1) positions.setY(i, y + (Math.sin(x * 7.1) + 1) * 0.22);
  }
  const sail = new THREE.Mesh(sailGeo, new THREE.MeshStandardMaterial({
    color: 0xe6d5b2, roughness: 1, side: THREE.DoubleSide, emissive: 0x8e8061, emissiveIntensity: 0.2,
  }));
  sail.name = 'wreck-torn-sail';
  sail.position.set(-0.6, 5.55, -2.57);
  sail.userData.restPositions = Float32Array.from(positions.array);
  root.add(sail);
  // Rope stays above all player paths.
  for (const x of [-3.2, 2]) {
    const curve = new THREE.LineCurve3(new THREE.Vector3(-0.6, 8.4, -2.6), new THREE.Vector3(x, 7, -2.6));
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 1, 0.025, 4), deck));
  }
  // Keep the detailed static ship to one draw per material; only the sail deforms.
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || mesh === sail) return;
    const mat = mesh.material as THREE.Material;
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    const batch = batches.get(mat) ?? [];
    batch.push(geometry); batches.set(mat, batch);
    mesh.geometry.dispose();
  });
  root.clear();
  root.add(sail);
  for (const [mat, geometries] of batches) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Wreck geometry batch could not be merged');
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    geometries.forEach((part) => part.dispose());
  }
  return root;
}
