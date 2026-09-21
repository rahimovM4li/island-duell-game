import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sampleHeight } from '@shared/terrain';
import type { WorldGen } from '@shared/worldgen';
import { islandMaterial, ISLAND_STYLE } from './art-direction';

/** Visible cover uses exactly the same position and outer dimensions as Rapier. */
export function buildCombatScenery(gen: WorldGen): THREE.Group {
  const root = new THREE.Group();
  root.name = 'combat-scenery';
  const stone = islandMaterial('stone'), wood = islandMaterial('wood'), metal = islandMaterial('dark');
  const edge = new THREE.MeshStandardMaterial({ color: ISLAND_STYLE.stoneEdge, roughness: 0.95 });
  const amber = islandMaterial('brass');
  const box = (parent: THREE.Object3D, name: string, w: number, h: number, d: number,
    x: number, y: number, z: number, material: THREE.Material, bevel = 0.035) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 1, Math.min(bevel, w / 8, h / 8, d / 8)), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const cover = (name: string, x: number, y: number, z: number, w: number, h: number, d: number, yaw: number, wooden: boolean) => {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(x, y, z); group.rotation.y = yaw;
    box(group, 'solid-cover', w, h, d, 0, 0, 0, wooden ? wood : stone);
    // Shallow inset seams retain a solid silhouette; no fake openings to shoot through.
    const courses = Math.max(2, Math.ceil(h / (wooden ? 0.32 : 0.48)));
    for (const sign of [-1, 1]) {
      for (let i = 1; i < courses; i++) box(group, 'course-seam', w - 0.08, 0.018, 0.008,
        0, -h / 2 + h * i / courses, sign * (d / 2 + 0.002), metal, 0);
      if (wooden) {
        for (const side of [-1, 1]) box(group, 'end-binding', 0.09, h - 0.1, 0.016,
          side * (w / 2 - 0.13), 0, sign * (d / 2 + 0.005), metal, 0.008);
      } else {
        // Staggered mortar makes masonry distinct from the timber barricades.
        for (let row = 0; row < courses; row++) {
          for (let x = -w / 2 + (row % 2 ? 0.55 : 1.1); x < w / 2 - 0.15; x += 1.1) {
            box(group, 'stone-joint', 0.016, h / courses - 0.018, 0.008,
              x, -h / 2 + h * (row + 0.5) / courses, sign * (d / 2 + 0.002), metal, 0);
          }
        }
      }
    }
    box(group, 'cap', w - 0.025, 0.08, d - 0.025, 0, h / 2 - 0.04, 0, wooden ? wood : edge);
    root.add(group);
  };
  for (const poi of gen.pois) {
    const base = sampleHeight(gen.params, poi.x, poi.z);
    for (const p of poi.structures) {
      if (p.name.startsWith('combat-cover')) cover(`${poi.id}-${p.name}`, p.x, base + (p.yOffset ?? 0) + p.h / 2,
        p.z, p.w, p.h, p.d, p.rotY, p.material === 'wood');
    }
    if (poi.id !== 'bunker') continue;
    const bunker = new THREE.Group(); bunker.name = 'poi-bunker';
    // Shared world-space solids replace the old closed-back GLB.
    for (const p of poi.structures.filter(p => !p.name.startsWith('combat-cover'))) {
      const mesh = box(bunker, p.name, p.w, p.h, p.d, p.x, base + (p.yOffset ?? 0) + p.h / 2, p.z, stone);
      mesh.rotation.y = p.rotY;
    }
    const details = new THREE.Group(); details.position.set(poi.x, base, poi.z); details.rotation.y = poi.rootYaw;
    for (const z of [-3.27, 3.27]) {
      box(details, 'entry-marker', 1.6, 0.18, 0.045, 0, 2.58, z, amber);
      for (const x of [-3.5, 3.5]) box(details, 'corner-pier', 0.18, 2.3, 0.035, x, 1.2, z, edge);
    }
    for (const x of [-2.8, 0, 2.8]) box(details, 'roof-rib', 0.16, 0.09, 6.2, x, 2.84, 0, metal);
    bunker.add(details); root.add(bunker);
  }
  for (const p of gen.centralStructures) if (p.shape === 'box' && p.name.startsWith('Combat_')) {
    cover(p.name, p.x, p.y, p.z, p.w, p.h, p.d, p.rotY, false);
  }
  // Batch static trim by material instead of paying a draw call per seam.
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object.name === 'solid-cover') return;
    const material = object.material as THREE.Material;
    const batch = batches.get(material) ?? [];
    batch.push(object); batches.set(material, batch);
  });
  for (const [material, meshes] of batches) {
    const geometries = meshes.map(mesh => mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    const merged = new THREE.Mesh(mergeGeometries(geometries)!, material);
    merged.name = 'combat-details'; merged.castShadow = merged.receiveShadow = true;
    for (const mesh of meshes) { mesh.removeFromParent(); mesh.geometry.dispose(); }
    geometries.forEach(geometry => geometry.dispose());
    root.add(merged);
  }
  return root;
}
