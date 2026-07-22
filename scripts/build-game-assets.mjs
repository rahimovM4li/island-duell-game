import { execFileSync } from 'node:child_process';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Reproducible, dependency-light art pipeline for the browser build. The GLBs
// contain only low-poly geometry and UVs. Both files share one external atlas.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'client', 'public', 'assets');
const atlasMaterial = new THREE.MeshStandardMaterial({
  name: 'island_atlas',
  color: 0xffffff,
  roughness: 0.78,
  metalness: 0.12,
  flatShading: true,
});

const TILE = Object.freeze({
  gunmetal: 0, steel: 1, wood: 2, grip: 3,
  rifle: 4, shotgun: 5, sniper: 6, grenade: 7,
  concrete: 8, rust: 9, bunker: 10, sail: 11,
  hazard: 12, rope: 13, signal: 14, dark: 15,
});

function atlasUv(geometry, tile) {
  let uv = geometry.getAttribute('uv');
  if (!uv) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const pos = geometry.getAttribute('position');
    const values = new Float32Array(pos.count * 2);
    const dx = Math.max(0.001, box.max.x - box.min.x);
    const dy = Math.max(0.001, box.max.y - box.min.y);
    for (let i = 0; i < pos.count; i++) {
      values[i * 2] = (pos.getX(i) - box.min.x) / dx;
      values[i * 2 + 1] = (pos.getY(i) - box.min.y) / dy;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(values, 2));
    uv = geometry.getAttribute('uv');
  }
  const col = tile % 4;
  const row = Math.floor(tile / 4);
  // Two-pixel gutter in every 64 px atlas cell prevents mip bleeding.
  const inset = 2 / 256;
  const span = 60 / 256;
  for (let i = 0; i < uv.count; i++) {
    const u = THREE.MathUtils.clamp(uv.getX(i), 0, 1);
    const v = THREE.MathUtils.clamp(uv.getY(i), 0, 1);
    uv.setXY(i, col / 4 + inset + u * span, row / 4 + inset + v * span);
  }
  uv.needsUpdate = true;
  return geometry;
}

function addMesh(group, geometry, tile, pos = [0, 0, 0], rot = [0, 0, 0], name = '') {
  atlasUv(geometry, tile);
  const mesh = new THREE.Mesh(geometry, atlasMaterial);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

const box = (g, size, pos, tile, rot = [0, 0, 0], name = '') =>
  addMesh(g, new THREE.BoxGeometry(...size), tile, pos, rot, name);
const cylinder = (g, radius, length, pos, tile, rot = [0, 0, 0], sides = 8, radiusTop = radius) =>
  addMesh(g, new THREE.CylinderGeometry(radiusTop, radius, length, sides), tile, pos, rot);
const cone = (g, radius, height, pos, tile, rot = [0, 0, 0], sides = 6) =>
  addMesh(g, new THREE.ConeGeometry(radius, height, sides), tile, pos, rot);
const torus = (g, radius, tube, pos, tile, rot = [0, 0, 0], arc = Math.PI * 2) =>
  addMesh(g, new THREE.TorusGeometry(radius, tube, 6, 20, arc), tile, pos, rot);

function cylinderBetween(group, from, to, radius, tile, sides = 6) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const direction = b.clone().sub(a);
  const mesh = addMesh(group, new THREE.CylinderGeometry(radius, radius, direction.length(), sides), tile);
  mesh.position.copy(a.add(b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function mergeModelParts(group) {
  group.updateMatrixWorld(true);
  const parts = [];
  group.traverse((object) => {
    if (!object.isMesh) return;
    const geometry = object.geometry.index
      ? object.geometry.toNonIndexed()
      : object.geometry.clone();
    parts.push(geometry.applyMatrix4(object.matrixWorld));
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error(`Could not merge geometry for ${group.name}`);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  group.clear();
  const mesh = new THREE.Mesh(merged, atlasMaterial);
  mesh.name = `${group.name}_mesh`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function weapon(name, build) {
  const group = new THREE.Group();
  group.name = `weapon_${name}`;
  build(group);
  mergeModelParts(group);
  return group;
}

function weaponScene() {
  const scene = new THREE.Scene();
  scene.name = 'island_weapon_kit';

  scene.add(weapon('machete', (g) => {
    box(g, [0.14, 0.72, 0.035], [0, 0.35, -0.03], TILE.steel);
    cone(g, 0.105, 0.22, [0, 0.82, -0.03], TILE.steel, [0, Math.PI / 4, 0], 4);
    box(g, [0.22, 0.055, 0.12], [0, -0.02, 0], TILE.hazard);
    cylinder(g, 0.05, 0.29, [0, -0.2, 0], TILE.grip, [0, 0, 0], 8);
    for (let i = 0; i < 4; i++) torus(g, 0.052, 0.008, [0, -0.1 - i * 0.065, 0], TILE.rope, [Math.PI / 2, 0, 0]);
    cylinder(g, 0.065, 0.05, [0, -0.37, 0], TILE.hazard, [0, 0, 0], 8);
  }));

  scene.add(weapon('spear', (g) => {
    cylinder(g, 0.035, 2.15, [0, 0, -0.45], TILE.wood, [Math.PI / 2, 0, 0], 8, 0.028);
    cone(g, 0.13, 0.46, [0, 0, -1.75], TILE.steel, [-Math.PI / 2, 0, 0], 6);
    cylinder(g, 0.05, 0.26, [0, 0, -1.5], TILE.rope, [Math.PI / 2, 0, 0], 8);
    cone(g, 0.055, 0.15, [0, 0, 0.72], TILE.gunmetal, [Math.PI / 2, 0, 0], 6);
  }));

  scene.add(weapon('bow', (g) => {
    torus(g, 0.5, 0.038, [0, 0, 0], TILE.wood, [0, 0, -Math.PI * 0.75], Math.PI * 1.5);
    cylinderBetween(g, [0.02, -0.51, 0], [-0.14, 0, 0], 0.008, TILE.sail, 5);
    cylinderBetween(g, [-0.14, 0, 0], [0.02, 0.51, 0], 0.008, TILE.sail, 5);
    cylinder(g, 0.032, 0.25, [-0.02, 0, 0], TILE.grip, [0, 0, 0], 8);
    cylinder(g, 0.016, 1.02, [-0.02, 0.02, -0.12], TILE.wood, [Math.PI / 2, 0, 0], 6);
    cone(g, 0.045, 0.13, [-0.02, 0.02, -0.68], TILE.steel, [-Math.PI / 2, 0, 0], 5);
  }));

  scene.add(weapon('pistol', (g) => {
    box(g, [0.15, 0.15, 0.58], [0, 0.06, -0.17], TILE.gunmetal);
    box(g, [0.155, 0.045, 0.54], [0, 0.155, -0.15], TILE.steel);
    box(g, [0.13, 0.3, 0.16], [0, -0.2, 0.02], TILE.grip, [-0.22, 0, 0]);
    box(g, [0.07, 0.13, 0.16], [0, -0.09, -0.08], TILE.dark);
    cylinder(g, 0.045, 0.13, [0, 0.06, -0.49], TILE.dark, [Math.PI / 2, 0, 0], 10);
    box(g, [0.025, 0.035, 0.025], [0, 0.18, -0.42], TILE.hazard);
    box(g, [0.065, 0.035, 0.025], [0, 0.18, 0.08], TILE.hazard);
  }));

  scene.add(weapon('rifle', (g) => {
    box(g, [0.16, 0.2, 0.84], [0, 0, -0.2], TILE.rifle);
    box(g, [0.14, 0.15, 0.48], [0, 0.01, -0.75], TILE.gunmetal);
    cylinder(g, 0.03, 0.7, [0, 0.04, -1.13], TILE.steel, [Math.PI / 2, 0, 0], 8);
    cylinder(g, 0.048, 0.12, [0, 0.04, -1.47], TILE.dark, [Math.PI / 2, 0, 0], 8);
    box(g, [0.17, 0.22, 0.5], [0, -0.02, 0.46], TILE.wood, [0.09, 0, 0]);
    box(g, [0.12, 0.3, 0.16], [0, -0.23, -0.18], TILE.grip, [-0.2, 0, 0]);
    box(g, [0.12, 0.3, 0.12], [0, -0.24, 0.02], TILE.gunmetal, [0.25, 0, 0]);
    cylinder(g, 0.052, 0.42, [0, 0.2, -0.25], TILE.dark, [Math.PI / 2, 0, 0], 10);
    cylinder(g, 0.062, 0.045, [0, 0.2, -0.48], TILE.rifle, [Math.PI / 2, 0, 0], 10);
  }));

  scene.add(weapon('shotgun', (g) => {
    cylinder(g, 0.052, 1.35, [0, 0.1, -0.48], TILE.gunmetal, [Math.PI / 2, 0, 0], 10);
    cylinder(g, 0.04, 1.05, [0, 0.015, -0.35], TILE.dark, [Math.PI / 2, 0, 0], 8);
    box(g, [0.14, 0.16, 0.36], [0, 0.04, 0.05], TILE.shotgun);
    cylinder(g, 0.075, 0.27, [0, 0.015, -0.53], TILE.wood, [Math.PI / 2, 0, 0], 8);
    for (let i = 0; i < 4; i++) torus(g, 0.076, 0.009, [0, 0.015, -0.42 - i * 0.065], TILE.grip, [0, 0, 0]);
    box(g, [0.17, 0.22, 0.58], [0, -0.01, 0.51], TILE.wood, [0.1, 0, 0]);
    cylinder(g, 0.021, 0.03, [0, 0.165, -1.12], TILE.hazard, [Math.PI / 2, 0, 0], 6);
  }));

  scene.add(weapon('sniper', (g) => {
    box(g, [0.16, 0.2, 0.86], [0, 0, -0.15], TILE.sniper);
    cylinder(g, 0.032, 1.16, [0, 0.04, -1.13], TILE.steel, [Math.PI / 2, 0, 0], 8);
    box(g, [0.13, 0.1, 0.15], [0, 0.04, -1.73], TILE.dark);
    box(g, [0.17, 0.22, 0.56], [0, -0.02, 0.54], TILE.wood, [0.08, 0, 0]);
    box(g, [0.12, 0.29, 0.17], [0, -0.23, -0.1], TILE.grip, [-0.2, 0, 0]);
    cylinder(g, 0.07, 0.55, [0, 0.24, -0.26], TILE.dark, [Math.PI / 2, 0, 0], 12);
    cylinder(g, 0.085, 0.055, [0, 0.24, -0.56], TILE.sniper, [Math.PI / 2, 0, 0], 12);
    cylinderBetween(g, [-0.12, -0.05, -0.75], [-0.25, -0.52, -0.98], 0.018, TILE.gunmetal, 6);
    cylinderBetween(g, [0.12, -0.05, -0.75], [0.25, -0.52, -0.98], 0.018, TILE.gunmetal, 6);
  }));

  scene.add(weapon('grenade', (g) => {
    addMesh(g, new THREE.IcosahedronGeometry(0.2, 1), TILE.grenade);
    cylinder(g, 0.075, 0.1, [0, 0.22, 0], TILE.dark, [0, 0, 0], 8);
    box(g, [0.055, 0.2, 0.045], [0.105, 0.27, 0], TILE.hazard, [0, 0, -0.5]);
    torus(g, 0.07, 0.012, [0.14, 0.37, 0], TILE.steel, [Math.PI / 2, 0, 0]);
  }));

  scene.add(weapon('smoke', (g) => {
    cylinder(g, 0.12, 0.38, [0, 0.03, 0], TILE.concrete, [0, 0, 0], 12);
    box(g, [0.245, 0.08, 0.03], [0, 0.02, -0.115], TILE.signal);
    cylinder(g, 0.065, 0.08, [0, 0.26, 0], TILE.dark, [0, 0, 0], 8);
    box(g, [0.05, 0.17, 0.04], [0.1, 0.3, 0], TILE.steel, [0, 0, -0.55]);
  }));

  scene.add(weapon('flash', (g) => {
    cylinder(g, 0.115, 0.36, [0, 0.03, 0], TILE.sail, [0, 0, 0], 12);
    for (let y = -0.08; y <= 0.14; y += 0.11) {
      for (let a = 0; a < 6; a++) {
        const angle = a * Math.PI / 3;
        cylinder(g, 0.013, 0.025, [Math.cos(angle) * 0.11, y, Math.sin(angle) * 0.11], TILE.dark, [Math.PI / 2, 0, 0], 6);
      }
    }
    cylinder(g, 0.065, 0.08, [0, 0.25, 0], TILE.dark, [0, 0, 0], 8);
    box(g, [0.05, 0.17, 0.04], [0.1, 0.29, 0], TILE.hazard, [0, 0, -0.55]);
  }));

  return scene;
}

function landmark(name, build) {
  const group = new THREE.Group();
  group.name = `poi_${name}`;
  build(group);
  mergeModelParts(group);
  return group;
}

function barrel(g, x, z, tile = TILE.rust) {
  cylinder(g, 0.36, 0.95, [x, 0.48, z], tile, [0, 0, 0], 10);
  for (const y of [0.16, 0.78]) torus(g, 0.365, 0.03, [x, y, z], TILE.gunmetal, [Math.PI / 2, 0, 0]);
}

function landmarkScene() {
  const scene = new THREE.Scene();
  scene.name = 'island_landmark_kit';

  scene.add(landmark('wreck', (g) => {
    box(g, [10, 1.25, 3.2], [0, 0.72, 0], TILE.wood);
    box(g, [9.5, 0.32, 0.28], [0, 1.48, -1.48], TILE.rust, [0, 0, 0.03]);
    box(g, [8.4, 0.32, 0.28], [-0.5, 1.48, 1.48], TILE.rust, [0, 0, -0.03]);
    box(g, [0.55, 8.5, 0.55], [0, 4.25, -0.7], TILE.wood);
    cylinderBetween(g, [-3.2, 1.4, -1.1], [0, 7.8, -0.7], 0.07, TILE.rope, 7);
    cylinderBetween(g, [3.2, 1.4, 1.1], [0, 7.8, -0.7], 0.07, TILE.rope, 7);
    box(g, [5.2, 4.15, 0.08], [-0.1, 5.45, -0.62], TILE.sail, [0, 0, -0.05]);
    box(g, [2.4, 0.18, 0.12], [3.9, 2.1, 0.1], TILE.rust, [0, 0, 0.3]);
    box(g, [1.2, 0.7, 0.08], [0.75, 8.05, -0.65], TILE.signal);
    barrel(g, -3.6, 2.3);
    barrel(g, -2.7, 2.5, TILE.gunmetal);
  }));

  scene.add(landmark('watchtower', (g) => {
    for (const x of [-2.1, 2.1]) for (const z of [-2.1, 2.1]) {
      box(g, [0.45, 5.5, 0.45], [x, 2.75, z], TILE.wood);
    }
    for (let i = 0; i < 12; i++) {
      box(g, [1.8, (i + 1) * 0.42, 0.62], [0, (i + 1) * 0.21, 7.5 - i * 0.58], TILE.wood);
    }
    box(g, [5.6, 0.45, 5.6], [0, 5.265, 0], TILE.wood);
    for (const x of [-2.55, 2.55]) for (const z of [-2.55, 2.55]) {
      box(g, [0.16, 1.75, 0.16], [x, 6.15, z], TILE.rust);
    }
    box(g, [6.4, 0.3, 6.4], [0, 7.35, 0], TILE.rust);
    box(g, [5.5, 0.18, 0.18], [0, 6.0, -2.62], TILE.rope);
    box(g, [5.5, 0.18, 0.18], [0, 6.0, 2.62], TILE.rope);
    box(g, [0.18, 0.18, 5.5], [-2.62, 6.0, 0], TILE.rope);
    box(g, [0.18, 0.18, 5.5], [2.62, 6.0, 0], TILE.rope);
    cone(g, 0.75, 1.9, [0, 8.42, 0], TILE.signal, [0, 0, 0], 7);
    cylinder(g, 0.1, 1.2, [0, 8.1, 0], TILE.dark, [0, 0, 0], 8);
    barrel(g, -3.1, 1.2);
  }));

  scene.add(landmark('bunker', (g) => {
    box(g, [8.5, 0.45, 6.5], [0, 2.625, 0], TILE.concrete);
    box(g, [0.7, 2.4, 6.5], [3.9, 1.2, 0], TILE.bunker);
    box(g, [0.7, 2.4, 6.5], [-3.9, 1.2, 0], TILE.bunker);
    box(g, [8.5, 2.4, 0.7], [0, 1.2, 2.9], TILE.bunker);
    box(g, [2.8, 0.7, 0.09], [0, 1.75, -3.26], TILE.signal);
    for (let x = -3.3; x <= 3.3; x += 1.1) box(g, [0.12, 0.12, 0.1], [x, 2.72, -2.5], TILE.hazard, [0, 0, 0.7]);
    cylinder(g, 0.08, 3.8, [2.7, 4.55, 1.8], TILE.gunmetal, [0, 0, 0], 8);
    box(g, [1.6, 0.7, 0.08], [3.5, 5.8, 1.8], TILE.signal);
    barrel(g, -2.7, -4.0, TILE.gunmetal);
    barrel(g, -1.8, -4.2);
  }));

  return scene;
}

const palette = [
  [45, 57, 66], [174, 187, 195], [121, 77, 43], [52, 38, 31],
  [116, 88, 164], [198, 99, 48], [55, 145, 129], [75, 105, 61],
  [112, 119, 112], [129, 78, 49], [56, 78, 65], [218, 204, 170],
  [226, 174, 55], [166, 131, 75], [184, 66, 51], [19, 25, 30],
];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const tag = Buffer.from(type);
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  tag.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([tag, data])), 8 + data.length);
  return chunk;
}

async function writeAtlas(path) {
  const size = 256;
  const scanlines = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    scanlines[row] = 0;
    for (let x = 0; x < size; x++) {
      const tile = Math.floor(x / 64) + Math.floor(y / 64) * 4;
      let [r, g, b] = palette[tile];
      const localX = x % 64;
      const localY = y % 64;
      let shade = ((x * 17 + y * 31 + tile * 13) % 9) - 4;
      if (tile === TILE.wood && localY % 13 < 2) shade -= 16;
      if ((tile === TILE.gunmetal || tile === TILE.steel) && localX % 16 === 0) shade += 12;
      if (tile === TILE.concrete && (x * 7 + y * 11) % 31 < 3) shade -= 15;
      if (tile === TILE.rust && (x * 5 + y * 3) % 23 < 5) shade += 18;
      if (tile === TILE.hazard && (localX + localY) % 24 < 8) {
        r = 28; g = 33; b = 35; shade = 0;
      }
      const i = row + 1 + x * 4;
      scanlines[i] = Math.max(0, Math.min(255, r + shade));
      scanlines[i + 1] = Math.max(0, Math.min(255, g + shade));
      scanlines[i + 2] = Math.max(0, Math.min(255, b + shade));
      scanlines[i + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  await writeFile(path, png);
}

if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    result = null;
    error = null;
    onloadend = null;
    onerror = null;
    async readAsArrayBuffer(blob) {
      try {
        this.result = await blob.arrayBuffer();
        this.onloadend?.({ target: this });
      } catch (error) {
        this.error = error;
        this.onerror?.(error);
      }
    }
  };
}

async function exportGlb(scene, rawPath) {
  const exporter = new GLTFExporter();
  const data = await exporter.parseAsync(scene, {
    binary: true,
    onlyVisible: true,
    trs: false,
  });
  await writeFile(rawPath, Buffer.from(data));
}

async function buildGlb(name, scene) {
  const raw = join(outDir, `${name}.raw.glb`);
  const welded = join(outDir, `${name}.weld.glb`);
  const output = join(outDir, `${name}.glb`);
  await exportGlb(scene, raw);
  const cli = join(root, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');
  execFileSync(process.execPath, [cli, 'weld', raw, welded], {
    cwd: root,
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [cli, 'meshopt', welded, output, '--level', 'high'], {
    cwd: root,
    stdio: 'inherit',
  });
  await Promise.all([unlink(raw), unlink(welded)]);
}

await mkdir(outDir, { recursive: true });
await writeAtlas(join(outDir, 'island-atlas.png'));
await buildGlb('weapons', weaponScene());
await buildGlb('landmarks', landmarkScene());
console.log('Generated client/public/assets: island-atlas.png, weapons.glb, landmarks.glb');
