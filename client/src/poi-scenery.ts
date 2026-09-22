import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sampleHeight } from '@shared/terrain';
import type { WorldGen } from '@shared/worldgen';
import { islandMaterial, ISLAND_STYLE } from './art-direction';

/** POI silhouettes and detail, with solids generated directly from the shared layout. */
export function buildPoiScenery(gen: WorldGen): THREE.Group {
  const root = new THREE.Group(); root.name = 'poi-upgrades';
  const wood = islandMaterial('wood'), stone = islandMaterial('stone'), metal = islandMaterial('dark');
  const steel = islandMaterial('steel'), brass = islandMaterial('brass');
  const pale = new THREE.MeshStandardMaterial({ color: ISLAND_STYLE.stoneEdge, roughness: 0.95 });
  const teal = new THREE.MeshStandardMaterial({ color: 0x496f6b, roughness: 0.85 });
  const rust = new THREE.MeshStandardMaterial({ color: 0xa16e49, roughness: 0.94 });
  const lamp = new THREE.MeshStandardMaterial({ color: 0xffd79a, emissive: 0xf3b55e, emissiveIntensity: 0.7 });
  const mesh = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material,
    x: number, y: number, z: number, name = 'poi-detail') => {
    const m = new THREE.Mesh(geometry, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number,
    mat: THREE.Material, name?: string) => mesh(parent,
      new RoundedBoxGeometry(w, h, d, 1, Math.min(w, h, d) * 0.06), mat, x, y, z, name);
  const beam = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, radius: number, mat: THREE.Material) => {
    const m = mesh(parent, new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 6), mat,
      (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return m;
  };
  const sign = (parent: THREE.Object3D, text: string, x: number, y: number, z: number, width: number) => {
    box(parent, width, 0.38, 0.06, x, y, z, metal);
    // Unit tests and server-side previews can build geometry without a DOM.
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#35464c'; ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = '#e2c28b'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 51);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const label = mesh(parent, new THREE.PlaneGeometry(width - 0.06, 0.34),
      new THREE.MeshBasicMaterial({ map }), x, y, z + 0.034, 'poi-sign');
    label.castShadow = false;
  };
  for (const poi of gen.pois) {
    const group = new THREE.Group(); group.name = `detail-${poi.id}`;
    const base = sampleHeight(gen.params, poi.x, poi.z);
    group.position.set(poi.x, base, poi.z); group.rotation.y = poi.rootYaw; root.add(group);
    for (const p of poi.structures.filter(p => p.name.startsWith('poi-upgrade-'))) {
      const solid = mesh(root, new THREE.BoxGeometry(p.w, p.h, p.d),
        p.material === 'wood' ? wood : p.material === 'stone' ? stone : metal,
        p.x, base + (p.yOffset ?? 0) + p.h / 2, p.z, `${poi.id}/${p.name}`);
      solid.rotation.set(p.rotX ?? 0, p.rotY, 0, 'YXZ');
      solid.userData.authoritativeSolid = true;
      if (p.name.includes('salvage') || p.name.includes('supply-locker')) {
        for (const side of [-1, 1]) box(solid, 0.08, p.h + 0.02, p.d + 0.025, side * p.w * 0.35, 0, 0, steel);
        box(solid, p.w + 0.02, 0.08, p.d + 0.02, 0, p.h * 0.28, 0, teal);
      }
    }
    if (poi.id === 'bunker') {
      sign(group, 'FUNKSTATION', 0, 2.62, 3.31, 2.9);
      for (const side of [-1, 1]) {
        box(group, 0.83, 0.09, 2.05, side * 2.95, 1.035, -0.8, steel);
        // Wall-mounted equipment stays within the wall/console footprint.
        for (let z = -1.6; z <= 0; z += 0.8) {
          box(group, 0.075, 0.38, 0.47, side * 3.48, 1.45, z, metal);
          box(group, 0.082, 0.21, 0.31, side * 3.46, 1.47, z, teal);
        }
        box(group, 0.38, 0.085, 0.1, side * 2.8, 2.26, 2.76, lamp);
        // Concrete buttress detailing sits on existing side-wall faces.
        for (const z of [-2.2, 0, 2.2]) box(group, 0.1, 2.25, 0.24, side * 4.25, 1.13, z, pale);
        for (let i = 0; i < 5; i++) box(group, 0.02, 0.045, 0.85, side * 4.31, 1.45 + i * 0.09, -0.8, metal);
      }
      beam(group, new THREE.Vector3(-1.85, 3.4, -0.7), new THREE.Vector3(-1.85, 5.8, -0.7), 0.065, steel);
      for (const y of [4.9, 5.45]) beam(group, new THREE.Vector3(-2.65, y, -0.7), new THREE.Vector3(-1.05, y, -0.7), 0.025, steel);
      const dish = mesh(group, new THREE.SphereGeometry(0.62, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.47), pale, 1.9, 3.55, 0.2);
      dish.rotation.z = -0.8;
      beam(group, new THREE.Vector3(1.9, 2.86, 0.2), new THREE.Vector3(1.9, 3.6, 0.2), 0.08, metal);
      box(group, 0.14, 0.22, 0.14, -1.85, 5.88, -0.7, lamp);
    } else if (poi.id === 'watchtower') {
      sign(group, 'AUSSICHT', 2.1, 4.65, 2.38, 1.35);
      const stair = poi.structures.find(p => p.name === 'poi-upgrade-rear-stair')!;
      const pitch = stair.rotX!, cy = (stair.yOffset ?? 0) + stair.h / 2;
      // Thin treads sit directly on the continuous walk surface.
      for (let z = -12.05; z < -2.75; z += 0.4) {
        const y = cy + stair.h / (2 * Math.cos(pitch)) - Math.tan(pitch) * (z + 7.475);
        box(group, 1.86, 0.025, 0.27, 0, y + 0.012, z, pale);
      }
      for (const x of [-0.98, 0.98]) {
        beam(group, new THREE.Vector3(x, 0.8, -12.1), new THREE.Vector3(x, 6.2, -2.65), 0.035, brass);
        for (const z of [-11.6, -8, -4.2]) {
          const y = cy + stair.h / (2 * Math.cos(pitch)) - Math.tan(pitch) * (z + 7.475);
          beam(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + 0.75, z), 0.045, wood);
        }
      }
      // A pennant and a signal crossbar distinguish the lookout at distance.
      beam(group, new THREE.Vector3(2.35, 7.1, 0), new THREE.Vector3(2.35, 9.2, 0), 0.04, steel);
      const flag = new THREE.Shape(); flag.moveTo(0, 0); flag.lineTo(1.2, -0.18); flag.lineTo(0, -0.55); flag.closePath();
      const cloth = new THREE.MeshStandardMaterial({ color: 0xc39958, roughness: 1, side: THREE.DoubleSide });
      mesh(group, new THREE.ShapeGeometry(flag), cloth, 2.35, 9.1, 0);
    } else if (poi.id === 'wreck') {
      sign(group, 'BERGUNG', -4.8, 1.03, 6.425, 1.65);
      for (const x of [4.4, 5]) {
        const wheel = mesh(group, new THREE.TorusGeometry(0.3, 0.055, 6, 12), rust, x, 3.35, -1.1);
        wheel.rotation.y = Math.PI / 2;
      }
      beam(group, new THREE.Vector3(4.25, 3.35, -1.1), new THREE.Vector3(5.15, 3.35, -1.1), 0.09, steel);
      // Rope coils and a painted hull emblem add maritime details without blocking routes.
      for (let i = 0; i < 3; i++) {
        const coil = mesh(group, new THREE.TorusGeometry(0.3 + i * 0.065, 0.024, 5, 18), brass, -5.4, 0.23, -0.9);
        coil.rotation.x = Math.PI / 2;
      }
      for (const side of [-1, 1]) box(group, 1.1, 0.55, 0.035, 5.5, 1.4, side * 3.17, teal);
    }
  }
  for (const p of gen.centralStructures) if (p.shape === 'box' && p.name.startsWith('Poi_')) {
    const m = box(root, p.w, p.h, p.d, p.x, p.y, p.z, p.name.includes('lintel') ? pale : stone, p.name);
    m.rotation.y = p.rotY; m.userData.authoritativeSolid = true;
    if (p.name.includes('pillar')) {
      for (let y = -p.h / 2 + 0.7; y < p.h / 2; y += 0.7) box(m, p.w + 0.012, 0.025, p.d + 0.012, 0, y, 0, metal);
      box(m, p.w + 0.04, 0.15, p.d + 0.04, 0, p.h / 2 - 0.1, 0, pale);
      box(m, 0.18, 0.75, 0.04, 0, 0.3, p.d / 2 + 0.015, brass);
    }
  }
  // Preserve solid names for audit, batch every cosmetic mesh per material.
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object.userData.authoritativeSolid || object.name === 'poi-sign') return;
    const mat = object.material as THREE.Material;
    const batch = batches.get(mat) ?? []; batch.push(object); batches.set(mat, batch);
  });
  for (const [mat, meshes] of batches) {
    const parts = meshes.map(m => (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld));
    const geometry = mergeGeometries(parts);
    if (!geometry) throw new Error('POI detail geometries have incompatible attributes');
    const combined = new THREE.Mesh(geometry, mat);
    combined.name = 'poi-details-batch'; combined.castShadow = combined.receiveShadow = true;
    meshes.forEach(m => { m.removeFromParent(); m.geometry.dispose(); });
    parts.forEach(p => p.dispose()); root.add(combined);
  }
  return root;
}
