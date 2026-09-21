import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { WeaponType } from '@shared/constants';
import { islandMaterial } from './art-direction';

const smooth = (a: number, b: number, t: number): number => {
  const k = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

export function reloadPose(progress: number): { magazine: number; bolt: number; reach: number } {
  if (progress < 0 || progress >= 1) return { magazine: 0, bolt: 0, reach: 0 };
  return {
    magazine: smooth(0.15, 0.34, progress) * (1 - smooth(0.48, 0.68, progress)),
    bolt: smooth(0.74, 0.82, progress) * (1 - smooth(0.84, 0.94, progress)),
    reach: smooth(0.05, 0.18, progress) * (1 - smooth(0.7, 0.96, progress)),
  };
}

/** Detailed models shared by held weapons, world pickups and remote players. */
export function firstPersonWeapon(type: WeaponType | 'none'): THREE.Group | null {
  if (!['pistol', 'rifle', 'shotgun', 'sniper'].includes(type)) return null;
  const root = new THREE.Group();
  root.name = `view-${type}`;
  const steel = islandMaterial('steel');
  const dark = islandMaterial('dark');
  const rubber = islandMaterial('rubber');
  const wood = islandMaterial('wood');
  const brass = islandMaterial('brass');
  const glass = new THREE.MeshStandardMaterial({ color: 0x76c8c1, metalness: 0.35, roughness: 0.15, emissive: 0x173b35, emissiveIntensity: 0.3 });
  const box = (name: string, size: number[], pos: number[], mat: THREE.Material, parent: THREE.Object3D = root): THREE.Mesh => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(...size) * 0.13), mat);
    mesh.name = name;
    mesh.position.set(pos[0], pos[1], pos[2]);
    parent.add(mesh);
    return mesh;
  };
  const tube = (name: string, radius: number, length: number, pos: number[], mat: THREE.Material): THREE.Mesh => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), mat);
    mesh.name = name;
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(pos[0], pos[1], pos[2]);
    root.add(mesh);
    return mesh;
  };
  const magazine = new THREE.Group();
  magazine.name = 'moving-magazine';
  const bolt = new THREE.Group();
  bolt.name = 'moving-bolt';
  root.add(magazine, bolt);
  if (type === 'pistol') {
    box('frame', [0.15, 0.1, 0.5], [0, -0.045, -0.15], dark);
    box('slide', [0.16, 0.15, 0.53], [0, 0.065, -0.15], steel, bolt);
    box('grip', [0.135, 0.27, 0.16], [0, -0.2, 0.035], rubber).rotation.x = -0.18;
    box('magazine-body', [0.105, 0.21, 0.12], [0, -0.23, 0.025], dark, magazine);
    box('magazine-base', [0.155, 0.035, 0.17], [0, -0.345, 0.025], steel, magazine);
    box('front-sight', [0.026, 0.032, 0.04], [0, 0.16, -0.36], brass, bolt);
    for (const x of [-0.047, 0.047]) box('rear-sight', [0.022, 0.038, 0.03], [x, 0.163, 0.08], dark, bolt);
    for (let i = 0; i < 5; i++) box('slide-serration', [0.166, 0.095, 0.01], [0, 0.065, -0.02 + i * 0.024], dark, bolt);
    tube('muzzle', 0.04, 0.04, [0, 0.045, -0.425], dark);
  } else {
    const sniper = type === 'sniper', shotgun = type === 'shotgun';
    box('receiver', [0.16, 0.19, 0.62], [0, 0.01, -0.14], steel);
    box('stock', [0.13, 0.23, 0.48], [0, -0.05, 0.42], sniper ? rubber : wood);
    box('butt-pad', [0.16, 0.25, 0.055], [0, -0.05, 0.67], rubber);
    box('grip', [0.11, 0.26, 0.16], [0, -0.19, 0.04], rubber).rotation.x = -0.23;
    const barrelLength = sniper ? 1.0 : 0.7;
    tube('barrel', shotgun ? 0.045 : 0.027, barrelLength, [0, 0.04, -0.74 - barrelLength * 0.22], steel);
    tube('muzzle', shotgun ? 0.052 : 0.041, 0.09, [0, 0.04, -0.74 - barrelLength * 0.72], dark);
    box('handguard', [0.155, 0.14, 0.48], [0, -0.02, -0.62], shotgun ? wood : rubber);
    for (let i = 0; i < 7; i++) box('handguard-rib', [0.165, 0.145, 0.018], [0, -0.02, -0.8 + i * 0.06], dark);
    box('ejection-port', [0.008, 0.075, 0.18], [0.085, 0.04, -0.12], dark);
    box('bolt-handle', [0.15, 0.027, 0.035], [0.12, 0.075, 0.01], steel, bolt);
    if (shotgun) {
      tube('tube-magazine', 0.035, 0.85, [0, -0.055, -0.78], dark);
      box('loading-shell', [0.048, 0.05, 0.11], [0, -0.16, -0.17], brass, magazine);
    } else {
      box('magazine-body', [0.105, sniper ? 0.16 : 0.3, 0.19], [0, sniper ? -0.16 : -0.24, -0.21], dark, magazine);
      for (let i = 0; i < 3; i++) box('magazine-rib', [0.115, 0.025, 0.19], [0, -0.16 - i * 0.055, -0.21], steel, magazine);
    }
    for (let i = 0; i < 11; i++) box('rail-tooth', [0.08, 0.025, 0.024], [0, 0.12, -0.44 + i * 0.05], dark);
    if (sniper) {
      tube('scope', 0.069, 0.48, [0, 0.24, -0.14], dark);
      for (const z of [-0.36, 0.08]) {
        tube('scope-ring', 0.085, 0.065, [0, 0.24, z], steel);
        tube('scope-glass', 0.065, 0.005, [0, 0.24, z + (z > 0 ? 0.035 : -0.035)], glass);
      }
      for (const z of [-0.24, -0.02]) box('scope-mount', [0.08, 0.14, 0.05], [0, 0.17, z], dark);
    } else {
      for (const z of [-0.65, 0.08]) box('iron-sight', [0.05, 0.075, 0.032], [0, 0.155, z], dark);
      box('sight-dot', [0.017, 0.017, 0.006], [0, 0.175, -0.63], brass);
    }
  }
  box('trigger-guard', [0.045, 0.08, 0.025], [0, -0.12, -0.105], dark);
  box('trigger-guard-base', [0.055, 0.025, 0.14], [0, -0.16, -0.045], dark);
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return root;
}
