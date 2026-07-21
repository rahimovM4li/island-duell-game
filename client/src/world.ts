// Procedural low-poly island rendering (documented deviation from the PRD's
// suggested Kenney asset pack: all art is generated — zero downloads).
// Terrain is meshed in 8×8 chunks of 32 m (§5); vegetation is instanced.
import * as THREE from 'three';
import {
  CHUNK_SIZE, CHUNKS_PER_SIDE, ISLAND_LAND_RADIUS, TERRAIN_CELL, WORLD_HALF,
} from '@shared/constants';
import { sampleHeight, RUINS_FLOOR_HEIGHT } from '@shared/terrain';
import { fogAt, timeOfDayAt } from '@shared/timeline';
import { bushAt, type WorldGen } from '@shared/worldgen';
import { deriveSeed, mulberry32 } from '@shared/rng';

const DAY_SKY = new THREE.Color(0x87b8dc);
const NIGHT_SKY = new THREE.Color(0x0a1020);
const DAY_FOGC = new THREE.Color(0xa8c8dc);
const NIGHT_FOGC = new THREE.Color(0x0c1424);

function disposeObject(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((obj) => {
    const renderable = obj as THREE.Mesh & THREE.Sprite;
    if (!renderable.isSprite && renderable.geometry) geometries.add(renderable.geometry);
    const mats = Array.isArray(renderable.material)
      ? renderable.material : renderable.material ? [renderable.material] : [];
    for (const mat of mats) {
      materials.add(mat);
      const withMap = mat as THREE.Material & { map?: THREE.Texture };
      if (withMap.map) textures.add(withMap.map);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((mat) => mat.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function terrainColor(h: number, steep: number): THREE.Color {
  // sand → grass → rock by height, rockier when steep
  const c = new THREE.Color();
  if (h < 1.4) c.setHex(0xd8c185);            // beach sand
  else if (h < 2.2) c.lerpColors(new THREE.Color(0xd8c185), new THREE.Color(0x5d8a44), (h - 1.4) / 0.8);
  else if (h < 9) c.setHex(0x5d8a44);          // grass
  else c.lerpColors(new THREE.Color(0x5d8a44), new THREE.Color(0x8a8578), Math.min(1, (h - 9) / 5));
  if (steep > 0.55) c.lerp(new THREE.Color(0x7d7568), Math.min(1, (steep - 0.55) * 2));
  return c;
}

function grassClumpGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.399;
    const radius = 0.08 + (i % 3) * 0.13;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const width = 0.09 + (i % 2) * 0.035;
    const height = 0.9 + (i % 4) * 0.17;
    const sideX = Math.cos(angle + Math.PI / 2) * width;
    const sideZ = Math.sin(angle + Math.PI / 2) * width;
    positions.push(
      cx - sideX, 0, cz - sideZ,
      cx + sideX, 0, cz + sideZ,
      cx + Math.cos(angle) * 0.08, height, cz + Math.sin(angle) * 0.08,
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

export class World {
  readonly scene = new THREE.Scene();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  private water: THREE.Mesh;
  private zoneMesh: THREE.Mesh;
  private zoneTargetMesh: THREE.Mesh;
  private fog: THREE.Fog;
  private resourceInstances = new Map<number, { meshes: THREE.InstancedMesh[]; matrices: THREE.Matrix4[]; index: number }>();
  private depletedNodes = new Set<number>();
  private resourceRemnants = new Map<number, THREE.Object3D>();
  private grassMesh: THREE.InstancedMesh | null = null;
  private localFadedBush: number | null = null;

  constructor(readonly gen: WorldGen) {
    this.fog = new THREE.Fog(DAY_FOGC.clone(), 10, 120);
    this.scene.fog = this.fog;
    this.scene.background = DAY_SKY.clone();

    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x4a5d3a, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
    this.sun.position.set(60, 90, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -115;
    this.sun.shadow.camera.right = 115;
    this.sun.shadow.camera.top = 115;
    this.sun.shadow.camera.bottom = -115;
    this.sun.shadow.camera.near = 8;
    this.sun.shadow.camera.far = 220;
    this.sun.shadow.bias = -0.00045;
    this.scene.add(this.sun);

    this.buildTerrain();
    this.water = this.buildWater();
    this.buildVegetation();
    this.buildRuins();
    this.buildLandmarks();
    this.buildSpawnMarkers();
    this.zoneMesh = this.buildZoneCylinder(0x63d0ff, 0.16);
    this.zoneTargetMesh = this.buildZoneCylinder(0xffffff, 0.05);
    this.scene.add(this.zoneMesh, this.zoneTargetMesh);
  }

  // ---------- terrain: 8×8 chunks of 32 m, vertex-colored ----------
  private buildTerrain(): void {
    const p = this.gen.params;
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const cellsPerChunk = CHUNK_SIZE / TERRAIN_CELL; // 16
    for (let cz = 0; cz < CHUNKS_PER_SIDE; cz++) {
      for (let cx = 0; cx < CHUNKS_PER_SIDE; cx++) {
        const ox = -WORLD_HALF + cx * CHUNK_SIZE;
        const oz = -WORLD_HALF + cz * CHUNK_SIZE;
        const verts = cellsPerChunk + 1;
        const pos = new Float32Array(verts * verts * 3);
        const col = new Float32Array(verts * verts * 3);
        const idx: number[] = [];
        for (let iz = 0; iz < verts; iz++) {
          for (let ix = 0; ix < verts; ix++) {
            const x = ox + ix * TERRAIN_CELL;
            const z = oz + iz * TERRAIN_CELL;
            const h = sampleHeight(p, x, z);
            const i3 = (iz * verts + ix) * 3;
            pos[i3] = x; pos[i3 + 1] = h; pos[i3 + 2] = z;
            const hx = sampleHeight(p, x + 1, z) - sampleHeight(p, x - 1, z);
            const hz = sampleHeight(p, x, z + 1) - sampleHeight(p, x, z - 1);
            const steep = Math.min(1, Math.hypot(hx, hz) / 2);
            const c = terrainColor(h, steep);
            col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
          }
        }
        for (let iz = 0; iz < verts - 1; iz++) {
          for (let ix = 0; ix < verts - 1; ix++) {
            const a = iz * verts + ix, b = a + 1, c = a + verts, d = c + 1;
            idx.push(a, c, b, b, c, d);
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const terrain = new THREE.Mesh(geo, mat);
        terrain.receiveShadow = true;
        this.scene.add(terrain);
      }
    }
  }

  private buildWater(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(900, 900, 1, 1);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x2a6d9e, transparent: true, opacity: 0.82,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.02;
    this.scene.add(m);
    return m;
  }

  // ---------- vegetation: instanced trunks/foliage/rocks/bushes ----------
  private buildVegetation(): void {
    const trees = this.gen.vegetation.filter((v) => v.kind === 'tree');
    const rocks = this.gen.vegetation.filter((v) => v.kind === 'rock');
    const bushes = this.gen.vegetation.filter((v) => v.kind === 'bush');
    const tmp = new THREE.Object3D();

    // Conifer: tapered trunk + three stacked foliage tiers for a full silhouette.
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.44, 3.3, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3f28, flatShading: true });
    const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, trees.length);
    const skirt = new THREE.InstancedMesh(
      new THREE.ConeGeometry(2.35, 2.9, 8),
      new THREE.MeshLambertMaterial({ color: 0x275c2d, flatShading: true }),
      trees.length,
    );
    const crown = new THREE.InstancedMesh(
      new THREE.ConeGeometry(1.85, 3.4, 8),
      new THREE.MeshLambertMaterial({ color: 0x2e6b34, flatShading: true }),
      trees.length,
    );
    const crownTop = new THREE.InstancedMesh(
      new THREE.ConeGeometry(1.2, 2.9, 8),
      new THREE.MeshLambertMaterial({ color: 0x3f7f42, flatShading: true }),
      trees.length,
    );
    trees.forEach((v, i) => {
      tmp.position.set(v.x, v.y + 1.65 * v.scale, v.z);
      tmp.scale.setScalar(v.scale);
      tmp.rotation.set(0, v.rot, 0);
      tmp.updateMatrix();
      trunk.setMatrixAt(i, tmp.matrix);
      tmp.position.y = v.y + 3.5 * v.scale;
      tmp.updateMatrix();
      skirt.setMatrixAt(i, tmp.matrix);
      tmp.position.y = v.y + 4.7 * v.scale;
      tmp.rotation.y = v.rot + 0.5;
      tmp.updateMatrix();
      crown.setMatrixAt(i, tmp.matrix);
      tmp.position.y = v.y + 5.8 * v.scale;
      tmp.scale.setScalar(v.scale * 0.9);
      tmp.rotation.y = v.rot + 1.0;
      tmp.updateMatrix();
      crownTop.setMatrixAt(i, tmp.matrix);
      const meshes = [trunk, skirt, crown, crownTop];
      const matrices = meshes.map((mesh) => { const matrix = new THREE.Matrix4(); mesh.getMatrixAt(i, matrix); return matrix; });
      this.resourceInstances.set(v.id, { meshes, matrices, index: i });
    });

    // Rocks as a two-boulder cluster with a bit more facet detail.
    const rockGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8a857a, flatShading: true });
    const rock = new THREE.InstancedMesh(rockGeo, rockMat, rocks.length);
    const rock2 = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.62, 0),
      new THREE.MeshLambertMaterial({ color: 0x7c776d, flatShading: true }),
      rocks.length,
    );
    rocks.forEach((v, i) => {
      tmp.position.set(v.x, v.y + 0.55 * v.scale, v.z);
      tmp.scale.set(v.scale, v.scale * 0.78, v.scale);
      tmp.rotation.set(0.12, v.rot, 0.08);
      tmp.updateMatrix();
      rock.setMatrixAt(i, tmp.matrix);
      const cos = Math.cos(v.rot), sin = Math.sin(v.rot);
      tmp.position.set(v.x + cos * 0.95 * v.scale, v.y + 0.32 * v.scale, v.z + sin * 0.95 * v.scale);
      tmp.scale.set(v.scale, v.scale * 0.7, v.scale);
      tmp.rotation.set(0.1, v.rot + 1.3, 0.15);
      tmp.updateMatrix();
      rock2.setMatrixAt(i, tmp.matrix);
      const meshes = [rock, rock2];
      const matrices = meshes.map((mesh) => { const matrix = new THREE.Matrix4(); mesh.getMatrixAt(i, matrix); return matrix; });
      this.resourceInstances.set(v.id, { meshes, matrices, index: i });
    });

    const bushGeo = new THREE.SphereGeometry(0.74, 8, 6);
    const bushMeshes = [
      new THREE.InstancedMesh(bushGeo, new THREE.MeshLambertMaterial({ color: 0x2c5a2e, flatShading: true }), bushes.length),
      new THREE.InstancedMesh(bushGeo, new THREE.MeshLambertMaterial({ color: 0x3c7a37, flatShading: true }), bushes.length),
      new THREE.InstancedMesh(bushGeo, new THREE.MeshLambertMaterial({ color: 0x4f9044, flatShading: true }), bushes.length),
    ];
    bushes.forEach((v, i) => {
      const lobes = [
        { x: -0.42, y: 0.7, z: 0.05, sx: 1.05, sy: 0.84, sz: 0.92 },
        { x: 0.4, y: 0.74, z: -0.08, sx: 1, sy: 0.88, sz: 1.02 },
        { x: 0, y: 1.18, z: 0.02, sx: 0.88, sy: 0.76, sz: 0.86 },
      ];
      const matrices: THREE.Matrix4[] = [];
      lobes.forEach((lobe, lobeIndex) => {
        const cos = Math.cos(v.rot), sin = Math.sin(v.rot);
        const ox = (lobe.x * cos - lobe.z * sin) * v.scale;
        const oz = (lobe.x * sin + lobe.z * cos) * v.scale;
        tmp.position.set(v.x + ox, v.y + lobe.y * v.scale, v.z + oz);
        tmp.scale.set(v.scale * lobe.sx, v.scale * lobe.sy, v.scale * lobe.sz);
        tmp.rotation.set(0, v.rot + lobeIndex * 0.7, 0);
        tmp.updateMatrix();
        bushMeshes[lobeIndex].setMatrixAt(i, tmp.matrix);
        const matrix = new THREE.Matrix4();
        bushMeshes[lobeIndex].getMatrixAt(i, matrix);
        matrices.push(matrix);
      });
      this.resourceInstances.set(v.id, { meshes: bushMeshes, matrices, index: i });
    });

    // Dense, deterministic grass clumps provide readable concealment without collision.
    const grassRng = mulberry32(deriveSeed(this.gen.seed, 'cover-grass'));
    const grassPositions: { x: number; y: number; z: number; scale: number; rot: number }[] = [];
    for (let tries = 0; tries < 7000 && grassPositions.length < 760; tries++) {
      const angle = grassRng() * Math.PI * 2;
      const radius = Math.sqrt(grassRng()) * (ISLAND_LAND_RADIUS - 4);
      if (radius < 20) continue;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (this.gen.spawns.some((sp) => Math.hypot(x - sp.x, z - sp.z) < 3.5)) continue;
      const y = sampleHeight(this.gen.params, x, z);
      if (y < 0.75) continue;
      grassPositions.push({ x, y, z, scale: 0.72 + grassRng() * 0.48, rot: grassRng() * Math.PI * 2 });
    }
    const grass = new THREE.InstancedMesh(
      grassClumpGeometry(),
      new THREE.MeshLambertMaterial({
        color: 0x628b40, emissive: 0x15270e, emissiveIntensity: 0.38, side: THREE.DoubleSide,
      }),
      grassPositions.length,
    );
    grassPositions.forEach((patch, i) => {
      tmp.position.set(patch.x, patch.y + 0.02, patch.z);
      tmp.scale.set(patch.scale, patch.scale, patch.scale);
      tmp.rotation.set(0, patch.rot, 0);
      tmp.updateMatrix();
      grass.setMatrixAt(i, tmp.matrix);
    });
    grass.receiveShadow = true;
    this.grassMesh = grass;

    for (const mesh of [trunk, skirt, crown, crownTop, rock, rock2, ...bushMeshes]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.scene.add(trunk, skirt, crown, crownTop, rock, rock2, ...bushMeshes, grass);
  }

  private buildRuins(): void {
    const mat = new THREE.MeshLambertMaterial({ color: 0xa79c88, flatShading: true });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0x8a7f6c, flatShading: true });
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x5d7440, flatShading: true });
    const y = RUINS_FLOOR_HEIGHT - 0.3;
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(17, 18, 0.35, 18),
      new THREE.MeshLambertMaterial({ color: 0x817b70, flatShading: true }),
    );
    plaza.position.y = RUINS_FLOOR_HEIGHT - 0.12;
    plaza.receiveShadow = true;
    this.scene.add(plaza);
    const ruinRng = mulberry32(deriveSeed(this.gen.seed, 'ruin-detail'));
    for (const w of this.gen.ruinWalls) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), mat);
      m.position.set(w.x, y + w.h / 2, w.z);
      m.rotation.y = w.rotY;
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
      // broken top course: a couple of loose blocks sitting on the wall crown
      const blocks = 1 + Math.floor(ruinRng() * 2);
      for (let b = 0; b < blocks; b++) {
        const bw = w.w * (0.18 + ruinRng() * 0.22);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.4, w.d * 1.05), ruinRng() < 0.4 ? mossMat : trimMat);
        const along = (ruinRng() - 0.5) * (w.w - bw);
        cap.position.set(w.x + Math.cos(w.rotY) * along, y + w.h + 0.2, w.z + Math.sin(w.rotY) * along);
        cap.rotation.y = w.rotY + (ruinRng() - 0.5) * 0.3;
        cap.castShadow = true;
        this.scene.add(cap);
      }
    }
    // scattered rubble around the plaza edge for a weathered, lived-in look
    for (let i = 0; i < 14; i++) {
      const a = ruinRng() * Math.PI * 2;
      const r = 6 + ruinRng() * 10;
      const rx = Math.cos(a) * r, rz = Math.sin(a) * r;
      const chunk = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.3 + ruinRng() * 0.4, 0),
        ruinRng() < 0.3 ? mossMat : trimMat,
      );
      chunk.scale.y = 0.6;
      chunk.position.set(rx, sampleHeight(this.gen.params, rx, rz) + 0.15, rz);
      chunk.rotation.set(ruinRng(), ruinRng() * Math.PI, ruinRng());
      chunk.castShadow = true;
      this.scene.add(chunk);
    }
    // Central signal brazier makes the contested ruins readable from a distance.
    const brazier = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 0.8, 8), mat);
    base.position.y = 0.4;
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 1.1, 0.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x31383b }),
    );
    bowl.position.y = 1.05;
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.5, 7),
      new THREE.MeshBasicMaterial({ color: 0xff9e42, transparent: true, opacity: 0.88 }),
    );
    flame.position.y = 2;
    brazier.position.set(0, y + 0.2, 0);
    brazier.add(base, bowl, flame);
    this.scene.add(brazier);
  }

  private buildLandmarks(): void {
    const materials: Record<'wood' | 'metal' | 'stone', THREE.MeshLambertMaterial> = {
      wood: new THREE.MeshLambertMaterial({ color: 0x7d5738, flatShading: true }),
      metal: new THREE.MeshLambertMaterial({ color: 0x5a6a71, flatShading: true }),
      stone: new THREE.MeshLambertMaterial({ color: 0x71776f, flatShading: true }),
    };
    const rustMat = new THREE.MeshLambertMaterial({ color: 0x8a5a3a, flatShading: true });
    const propRng = mulberry32(deriveSeed(this.gen.seed, 'poi-props'));
    for (const poi of this.gen.pois) {
      const group = new THREE.Group();
      group.name = `poi-${poi.id}`;
      for (const s of poi.structures) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), materials[s.material]);
        const baseY = sampleHeight(this.gen.params, s.x, s.z);
        mesh.position.set(s.x, baseY + (s.yOffset ?? 0) + s.h / 2, s.z);
        mesh.rotation.y = s.rotY;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
      // a couple of weathered barrels beside each landmark
      for (let b = 0; b < 2 + Math.floor(propRng() * 2); b++) {
        const a = propRng() * Math.PI * 2;
        const r = 3.2 + propRng() * 1.6;
        const bx = poi.x + Math.cos(a) * r, bz = poi.z + Math.sin(a) * r;
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.36, 0.95, 10),
          propRng() < 0.5 ? rustMat : materials.metal,
        );
        barrel.position.set(bx, sampleHeight(this.gen.params, bx, bz) + 0.48, bz);
        barrel.castShadow = true;
        barrel.receiveShadow = true;
        group.add(barrel);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 6, 12), materials.metal);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(bx, barrel.position.y + 0.28, bz);
        group.add(rim);
      }
      if (poi.id === 'wreck') {
        const sail = new THREE.Mesh(
          new THREE.PlaneGeometry(5.2, 4.4),
          new THREE.MeshLambertMaterial({ color: 0xd5c8a7, side: THREE.DoubleSide }),
        );
        sail.position.set(poi.x, sampleHeight(this.gen.params, poi.x, poi.z) + 5.8, poi.z);
        sail.rotation.y = poi.structures[0].rotY;
        group.add(sail);
      } else if (poi.id === 'watchtower') {
        const signal = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 1.8, 6),
          new THREE.MeshBasicMaterial({ color: 0xffa24d }),
        );
        signal.position.set(poi.x, sampleHeight(this.gen.params, poi.x, poi.z) + 8.25, poi.z);
        group.add(signal);
      } else if (poi.id === 'bunker') {
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(2.7, 0.65, 0.16),
          new THREE.MeshLambertMaterial({ color: 0xb2543f }),
        );
        sign.position.set(poi.x, sampleHeight(this.gen.params, poi.x, poi.z) + 2.1, poi.z);
        sign.rotation.y = poi.structures[0].rotY;
        group.add(sign);
      }
      this.scene.add(group);
    }
  }

  private buildSpawnMarkers(): void {
    for (const sp of this.gen.spawns) {
      const y = sampleHeight(this.gen.params, sp.x, sp.z);
      const marker = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.7, 2.05, 28),
        new THREE.MeshBasicMaterial({ color: 0xf1bd58, side: THREE.DoubleSide, transparent: true, opacity: 0.78 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 3.2, 7),
        new THREE.MeshLambertMaterial({ color: 0x4b3826 }),
      );
      pole.position.y = 1.6;
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.65),
        new THREE.MeshLambertMaterial({ color: 0xe0a63c, side: THREE.DoubleSide }),
      );
      flag.position.set(0.62, 2.55, 0);
      marker.rotation.y = -sp.angle;
      marker.position.set(sp.x, y, sp.z);
      marker.add(ring, pole, flag);
      this.scene.add(marker);
    }
  }

  /** Hide an exhausted resource and leave a small, readable remnant. */
  depleteResourceNode(nodeId: number): void {
    if (this.depletedNodes.has(nodeId)) return;
    const entry = this.resourceInstances.get(nodeId);
    const veg = this.gen.vegetation.find((v) => v.id === nodeId);
    if (!entry || !veg) return;
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    for (const mesh of entry.meshes) {
      mesh.setMatrixAt(entry.index, hidden);
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (veg.kind === 'tree') {
      const stump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3 * veg.scale, 0.38 * veg.scale, 0.35, 7),
        new THREE.MeshLambertMaterial({ color: 0x735036 }),
      );
      stump.position.set(veg.x, veg.y + 0.17, veg.z);
      stump.castShadow = true;
      this.scene.add(stump);
      this.resourceRemnants.set(nodeId, stump);
    } else if (veg.kind === 'rock') {
      const chips = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.35 * veg.scale, 0),
        new THREE.MeshLambertMaterial({ color: 0x77736b, flatShading: true }),
      );
      chips.scale.y = 0.35;
      chips.position.set(veg.x, veg.y + 0.12, veg.z);
      this.scene.add(chips);
      this.resourceRemnants.set(nodeId, chips);
    }
    this.depletedNodes.add(nodeId);
  }

  resetResourceNodes(): void {
    for (const entry of this.resourceInstances.values()) {
      entry.meshes.forEach((mesh, index) => {
        mesh.setMatrixAt(entry.index, entry.matrices[index]);
        mesh.instanceMatrix.needsUpdate = true;
      });
    }
    for (const remnant of this.resourceRemnants.values()) {
      this.scene.remove(remnant);
      disposeObject(remnant);
    }
    this.resourceRemnants.clear();
    this.depletedNodes.clear();
    this.localFadedBush = null;
  }

  /** Reduce only the local player's enclosing bush so first-person cover stays readable. */
  updateLocalCover(x: number, z: number): boolean {
    const next = bushAt(this.gen, x, z)?.id ?? null;
    if (next === this.localFadedBush) return next !== null;
    if (this.localFadedBush !== null && !this.depletedNodes.has(this.localFadedBush)) {
      this.setBushScale(this.localFadedBush, 1);
    }
    this.localFadedBush = next;
    if (next !== null && !this.depletedNodes.has(next)) this.setBushScale(next, 0.34);
    return next !== null;
  }

  private setBushScale(nodeId: number, factor: number): void {
    const entry = this.resourceInstances.get(nodeId);
    const veg = this.gen.vegetation.find((v) => v.id === nodeId);
    if (!entry || veg?.kind !== 'bush') return;
    entry.meshes.forEach((mesh, index) => {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      entry.matrices[index].decompose(position, rotation, scale);
      scale.multiplyScalar(factor);
      mesh.setMatrixAt(entry.index, new THREE.Matrix4().compose(position, rotation, scale));
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  setGraphicsQuality(quality: 'low' | 'medium' | 'high'): void {
    this.grassMesh && (this.grassMesh.visible = quality !== 'low');
    this.sun.castShadow = quality !== 'low';
    const size = quality === 'high' ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) mesh.castShadow = quality === 'high';
    });
  }

  private buildZoneCylinder(color: number, opacity: number): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(1, 1, 70, 96, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.y = 25;
    return m;
  }

  /** Per-frame environment update from round time (fog §6.2, day/night, zone). */
  update(t: number, zoneRadius: number, zoneTarget: number): void {
    const night = timeOfDayAt(t);
    const fogDist = fogAt(t);
    this.fog.near = fogDist * 0.25;
    this.fog.far = fogDist;
    this.fog.color.lerpColors(DAY_FOGC, NIGHT_FOGC, night);
    (this.scene.background as THREE.Color).lerpColors(DAY_SKY, NIGHT_SKY, night);
    this.sun.intensity = 1.4 * (1 - night) + 0.12;
    this.sun.color.setHex(night > 0.5 ? 0x9db8e8 : 0xfff2d8);
    this.hemi.intensity = 0.9 * (1 - night) + 0.18;
    // sun arcs down as night falls
    const el = Math.PI * 0.4 * (1 - night) + 0.12;
    this.sun.position.set(Math.cos(el) * 80, Math.sin(el) * 90 + 8, 40);

    this.zoneMesh.scale.set(zoneRadius, 1, zoneRadius);
    this.zoneTargetMesh.scale.set(zoneTarget, 1, zoneTarget);
    this.zoneTargetMesh.visible = zoneTarget < zoneRadius - 0.5;
  }

  dispose(): void {
    disposeObject(this.scene);
    this.sun.shadow.map?.dispose();
    this.scene.clear();
    this.resourceInstances.clear();
    this.resourceRemnants.clear();
    this.depletedNodes.clear();
    this.grassMesh = null;
    this.localFadedBush = null;
  }
}
