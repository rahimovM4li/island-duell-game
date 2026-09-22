import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Ring = [z: number, halfWidth: number, halfHeight: number, centerY: number];

/** Connected cross sections keep the wrist, palm and sleeve from looking like stacked blocks. */
function contour(rings: Ring[]): THREE.BufferGeometry {
  const positions: number[] = [], indices: number[] = [];
  const sides = 20;
  for (const [z, w, h, y] of rings) for (let i = 0; i < sides; i++) {
    const a = i / sides * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    positions.push(Math.sign(c) * Math.abs(c) ** 0.8 * w, y + Math.sign(s) * Math.abs(s) ** 0.8 * h, z);
  }
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < sides; i++) {
    const a = r * sides + i, b = r * sides + (i + 1) % sides;
    indices.push(a, b, a + sides, b, b + sides, a + sides);
  }
  for (const [r, reverse] of [[0, true], [rings.length - 1, false]] as const) {
    const index = positions.length / 3;
    positions.push(0, rings[r][3], rings[r][0]);
    for (let i = 0; i < sides; i++) {
      const a = r * sides + i, b = r * sides + (i + 1) % sides;
      indices.push(index, reverse ? b : a, reverse ? a : b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Camera-sized tactical glove; local -Z points toward the curled fingers. */
export function viewHandModel(teamColor: number): THREE.Group {
  const root = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x3b454b, roughness: 0.94 });
  const glove = new THREE.MeshStandardMaterial({ color: 0x292f33, roughness: 0.88 });
  const pads = new THREE.MeshStandardMaterial({ color: 0x4c5559, roughness: 0.74 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x171e23, roughness: 0.86 });
  const thread = new THREE.MeshStandardMaterial({ color: 0x858d89, roughness: 1 });
  const accent = new THREE.MeshStandardMaterial({ color: new THREE.Color(teamColor).lerp(new THREE.Color(0x657878), 0.55), roughness: 0.88 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); root.add(mesh); return mesh;
  };
  const panel = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) =>
    add(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.35), material, x, y, z);
  const curve = (points: number[][], radius: number, material: THREE.Material, segments = 12) =>
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, 8, false), material);

  add(contour([[0.19, 0.089, 0.073, -0.03], [0.23, 0.101, 0.082, -0.038],
    [0.38, 0.121, 0.092, -0.057], [0.61, 0.134, 0.106, -0.083],
    [0.86, 0.143, 0.114, -0.2], [1.14, 0.15, 0.12, -0.43],
    [1.6, 0.16, 0.13, -0.94]]), cloth);
  add(contour([[-0.135, 0.099, 0.047, -0.004], [-0.105, 0.114, 0.063, -0.003],
    [-0.02, 0.11, 0.067, -0.008], [0.075, 0.079, 0.054, -0.022],
    [0.17, 0.081, 0.06, -0.028], [0.23, 0.09, 0.069, -0.036]]), glove);
  // Fitted wrist strap, a small team tab and raised stitching replace the wide colour ring.
  add(contour([[0.14, 0.084, 0.064, -0.027], [0.155, 0.092, 0.07, -0.028],
    [0.205, 0.097, 0.076, -0.033], [0.217, 0.092, 0.071, -0.035]]), trim);
  panel(0.075, 0.022, 0.048, 0.031, 0.04, 0.181, pads);
  panel(0.039, 0.006, 0.032, 0.035, 0.055, 0.181, accent);
  panel(0.138, 0.021, 0.112, 0.005, 0.06, -0.013, pads);
  for (const x of [-0.057, 0.067]) for (let z = -0.051; z <= 0.035; z += 0.019)
    panel(0.003, 0.003, 0.009, x, 0.072, z, thread);
  for (const x of [-0.035, 0.018, 0.071])
    curve([[x, 0.04, 0.07], [x * 1.2, 0.045, 0.012], [x * 1.1, 0.05, -0.075]], 0.003, trim);

  // Separate rounded knuckles and a relaxed curl: the fingertips return beneath the palm.
  for (const [i, x, length] of [[0, -0.078, 0.105], [1, -0.027, 0.128], [2, 0.027, 0.119], [3, 0.076, 0.092]]) {
    const radius = i === 3 ? 0.02 : 0.023;
    const endZ = -0.12 - length;
    curve([[x, 0.003, -0.112], [x, 0.001, endZ + 0.025], [x, -0.042, endZ],
      [x, -0.083, endZ + 0.035], [x, -0.086, endZ + 0.068]], radius, glove);
    add(new THREE.SphereGeometry(radius * 0.98, 10, 8), glove, x, -0.086, endZ + 0.068);
    panel(radius * 1.65, 0.018, 0.05, x, 0.024, -0.139, pads);
    for (let j = 0; j < 2; j++) panel(radius * 1.5, 0.004, 0.008, x, 0.024, -0.18 - j * 0.016, trim);
  }
  // The thumb grows from the side of the palm and closes against the fingers.
  const thumbBase = add(new THREE.SphereGeometry(1, 14, 10), glove, -0.097, -0.029, -0.007);
  thumbBase.scale.set(0.058, 0.045, 0.084); thumbBase.rotation.y = 0.32;
  curve([[-0.114, -0.019, -0.028], [-0.15, -0.035, -0.089],
    [-0.149, -0.066, -0.139], [-0.112, -0.09, -0.165]], 0.027, glove);
  add(new THREE.SphereGeometry(0.027, 12, 8), glove, -0.112, -0.09, -0.165);
  curve([[-0.121, 0.009, -0.017], [-0.151, -0.009, -0.079], [-0.16, -0.036, -0.115]], 0.003, thread);
  for (const x of [-0.098, 0.098]) curve([[x, -0.025, 0.25], [x * 1.15, -0.04, 0.4], [x * 1.24, -0.063, 0.61]], 0.003, trim);

  // Six material batches per hand; each viewmodel owns and disposes its resources.
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  for (const object of [...root.children]) {
    const mesh = object as THREE.Mesh;
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    // The contour is untextured, so only position/normal are needed by every batch.
    geometry.deleteAttribute('uv');
    const material = mesh.material as THREE.Material;
    const batch = batches.get(material) ?? []; batch.push(geometry); batches.set(material, batch);
    mesh.geometry.dispose(); root.remove(mesh);
  }
  for (const [material, geometries] of batches) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Incompatible view hand geometry');
    const mesh = new THREE.Mesh(geometry, material); mesh.name = 'view-glove';
    mesh.castShadow = true; root.add(mesh); geometries.forEach(g => g.dispose());
  }
  return root;
}
