import * as THREE from 'three';
import { islandMaterial } from './art-direction';

export const KNIFE_DRAW_SECONDS = 0.92;
export const KNIFE_INSPECT_SECONDS = 1.65;
export const KNIFE_MODEL_SCALE = { x: 0.65, y: 0.78, z: 0.72 } as const;

/** Original balisong: separate hinge mechanism, milled handles and a beveled fade blade. */
export function butterflyKnife(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'butterfly-knife';
  root.scale.set(KNIFE_MODEL_SCALE.x, KNIFE_MODEL_SCALE.y, KNIFE_MODEL_SCALE.z);
  const titanium = islandMaterial('dark');
  const steel = new THREE.MeshStandardMaterial({ color: 0xc4dbe3, metalness: 0.8, roughness: 0.2 });
  const accent = islandMaterial('brass');
  const bladeMaterial = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.42, roughness: 0.25, clearcoat: 0.65, clearcoatRoughness: 0.18, iridescence: 0.35, iridescenceIOR: 1.35, emissive: 0x273443, emissiveIntensity: 0.5 });

  const mesh = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, name: string): THREE.Mesh => {
    const part = new THREE.Mesh(geometry, material);
    part.name = name;
    part.castShadow = true;
    parent.add(part);
    return part;
  };
  const extrude = (shape: THREE.Shape, depth: number, bevel = 0.006): THREE.ExtrudeGeometry => {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 10, steps: 1 });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  };
  const handle = (parent: THREE.Group, name: string) => {
    const outline = new THREE.Shape();
    outline.moveTo(-0.04, 0.025);
    outline.quadraticCurveTo(-0.075, -0.2, -0.049, -0.5);
    outline.quadraticCurveTo(0, -0.555, 0.049, -0.5);
    outline.quadraticCurveTo(0.036, -0.26, 0.04, 0.025);
    outline.closePath();
    for (let i = 0; i < 5; i++) {
      const cutout = new THREE.Path();
      cutout.absellipse(-0.006, -0.11 - i * 0.073, 0.019, 0.023, 0, Math.PI * 2, true);
      outline.holes.push(cutout);
    }
    // Two liners leave a real channel for the folded blade.
    for (const side of [-1, 1]) {
      const liner = mesh(parent, extrude(outline, 0.016), titanium, `${name}-liner`);
      liner.position.z = side * 0.039;
      for (const y of [0, -0.48]) {
        const screw = mesh(parent, new THREE.CylinderGeometry(y === 0 ? 0.027 : 0.016, y === 0 ? 0.027 : 0.016, 0.014, 16), steel, `${name}-screw`);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(0, y, side * 0.057);
        const socket = mesh(parent, new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6), titanium, `${name}-socket`);
        socket.rotation.x = Math.PI / 2;
        socket.position.copy(screw.position).add(new THREE.Vector3(0, 0, side * 0.006));
      }
    }
    const spacer = mesh(parent, new THREE.BoxGeometry(0.05, 0.04, 0.065), accent, `${name}-spacer`);
    spacer.position.y = -0.485;
  };
  const safe = new THREE.Group();
  safe.name = 'knife-safe-handle';
  safe.position.x = -0.058;
  root.add(safe);
  const grip = new THREE.Object3D();
  grip.name = 'knife-safe-grip';
  grip.position.y = -0.26;
  safe.add(grip);
  handle(safe, 'safe');
  const rotor = new THREE.Group();
  rotor.name = 'knife-blade-pivot';
  rotor.position.x = -0.058;
  root.add(rotor);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.016, -0.025);
  bladeShape.lineTo(-0.016, 0.09);
  bladeShape.bezierCurveTo(-0.023, 0.30, -0.065, 0.52, -0.09, 0.65);
  bladeShape.bezierCurveTo(0.055, 0.585, 0.132, 0.37, 0.124, 0.24);
  bladeShape.lineTo(0.09, 0.09);
  bladeShape.lineTo(0.115, 0.065);
  bladeShape.lineTo(0.115, -0.025);
  bladeShape.closePath();
  const bladeGeometry = extrude(bladeShape, 0.012, 0.008);
  const positions = bladeGeometry.getAttribute('position');
  const colors: number[] = [];
  const stops = [new THREE.Color('#43cde5'), new THREE.Color('#7764e7'), new THREE.Color('#ee6aaf'), new THREE.Color('#ffd98c')];
  for (let i = 0; i < positions.count; i++) {
    const t = THREE.MathUtils.clamp((positions.getY(i) - 0.04) / 0.61, 0, 1) * 3;
    const index = Math.min(2, Math.floor(t));
    const c = stops[index].clone().lerp(stops[index + 1], t - index);
    colors.push(c.r, c.g, c.b);
  }
  bladeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  mesh(rotor, bladeGeometry, bladeMaterial, 'knife-blade');
  const edge = new THREE.Shape();
  edge.moveTo(-0.09, 0.65);
  edge.bezierCurveTo(0.055, 0.585, 0.132, 0.37, 0.124, 0.24);
  edge.lineTo(0.09, 0.09);
  edge.lineTo(0.08, 0.10);
  edge.bezierCurveTo(0.118, 0.34, 0.08, 0.48, -0.09, 0.65);
  for (const z of [-0.016, 0.016]) {
    const bevel = mesh(rotor, new THREE.ShapeGeometry(edge, 14), steel, 'knife-sharpened-edge');
    bevel.position.z = z;
    if (z < 0) { bevel.rotation.y = Math.PI; bevel.scale.x = -1; }
  }
  const bite = new THREE.Group();
  bite.name = 'knife-bite-pivot';
  bite.position.x = 0.116;
  rotor.add(bite);
  handle(bite, 'bite');
  const latch = mesh(bite, new THREE.TorusGeometry(0.027, 0.009, 6, 12, Math.PI), accent, 'knife-latch');
  latch.position.set(0, -0.54, 0);
  latch.rotation.z = Math.PI;
  return root;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const frames = [
  [0, 1, 1, -0.65], [0.18, 1.5, 0.7, 0.18], [0.42, 2.08, -0.85, -0.16],
  [0.67, 2, 0.34, 0.12], [0.86, 2, -0.055, -0.035], [1, 2, 0, 0],
] as const;
// An inspection starts with the open blade, rolls the free handle through the
// fingers, then holds the open knife briefly before returning to the idle grip.
const inspectFrames = [
  [0, 0, 0, 0], [0.10, 0.08, -0.12, 0.18], [0.24, 0.90, 0.72, -0.20],
  [0.39, 1.65, -0.75, -0.32], [0.54, 2.05, 0.35, 0.12],
  [0.69, 2, 0, 0.14], [0.84, 2, 0, 0.14], [1, 2, 0, 0],
] as const;

export interface KnifePose { blade: number; bite: number; wrist: number; inspect: number; grip: number }

/** One timeline drives hinges, wrist and finger contact. -1 is the open combat pose. */
export function knifePose(progress: number, inspect = false, reducedMotion = false): KnifePose {
  if (progress < 0 || progress >= 1 || reducedMotion) return { blade: 0, bite: 0, wrist: 0, inspect: 0, grip: 0 };
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const timeline = inspect ? inspectFrames : frames;
  const end = timeline.findIndex((f) => f[0] > t);
  const b = timeline[end < 0 ? timeline.length - 1 : end];
  const a = timeline[Math.max(0, (end < 0 ? timeline.length - 1 : end) - 1)];
  const k = smooth((t - a[0]) / (b[0] - a[0] || 1));
  const grip = inspect
    ? smooth(THREE.MathUtils.clamp((t - 0.13) / 0.16, 0, 1))
      * (1 - smooth(THREE.MathUtils.clamp((t - 0.59) / 0.14, 0, 1)))
    : smooth(THREE.MathUtils.clamp((t - 0.12) / 0.14, 0, 1))
      * (1 - smooth(THREE.MathUtils.clamp((t - 0.76) / 0.17, 0, 1)));
  const presentation = inspect
    ? smooth(THREE.MathUtils.clamp(t / 0.08, 0, 1))
      * (1 - smooth(THREE.MathUtils.clamp((t - 0.82) / 0.18, 0, 1))) : 0;
  return {
    blade: THREE.MathUtils.lerp(a[1], b[1], k) * Math.PI,
    bite: THREE.MathUtils.lerp(a[2], b[2], k) * Math.PI,
    wrist: THREE.MathUtils.lerp(a[3], b[3], k),
    inspect: presentation,
    grip,
  };
}

export function applyKnifePose(model: THREE.Object3D, pose: KnifePose): void {
  const blade = model.getObjectByName('knife-blade-pivot');
  const bite = model.getObjectByName('knife-bite-pivot');
  if (blade) blade.rotation.z = pose.blade;
  if (bite) bite.rotation.z = pose.bite;
}

export function animateKnife(model: THREE.Object3D, progress: number, inspect: boolean, reducedMotion: boolean): KnifePose {
  const pose = knifePose(progress, inspect, reducedMotion);
  applyKnifePose(model, pose);
  return pose;
}
