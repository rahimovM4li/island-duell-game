// Procedural low-poly island rendering (documented deviation from the PRD's
// suggested Kenney asset pack: all art is generated — zero downloads).
// Terrain is meshed in 8×8 chunks of 32 m (§5); vegetation is instanced.
import * as THREE from 'three';
import {
  CHUNK_SIZE, CHUNKS_PER_SIDE, TERRAIN_CELL, WORLD_HALF,
} from '@shared/constants';
import { sampleHeight, RUINS_FLOOR_HEIGHT } from '@shared/terrain';
import { fogAt, timeOfDayAt } from '@shared/timeline';
import type { WorldGen } from '@shared/worldgen';

const DAY_SKY = new THREE.Color(0x87b8dc);
const NIGHT_SKY = new THREE.Color(0x0a1020);
const DAY_FOGC = new THREE.Color(0xa8c8dc);
const NIGHT_FOGC = new THREE.Color(0x0c1424);

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

export class World {
  readonly scene = new THREE.Scene();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  private water: THREE.Mesh;
  private zoneMesh: THREE.Mesh;
  private zoneTargetMesh: THREE.Mesh;
  private fog: THREE.Fog;

  constructor(readonly gen: WorldGen) {
    this.fog = new THREE.Fog(DAY_FOGC.clone(), 10, 120);
    this.scene.fog = this.fog;
    this.scene.background = DAY_SKY.clone();

    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x4a5d3a, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
    this.sun.position.set(60, 90, 40);
    this.scene.add(this.sun);

    this.buildTerrain();
    this.water = this.buildWater();
    this.buildVegetation();
    this.buildRuins();
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
        this.scene.add(new THREE.Mesh(geo, mat));
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

    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.4, 3.2, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2f });
    const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, trees.length);
    const crownGeo = new THREE.ConeGeometry(1.9, 3.6, 7);
    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2e6b34 });
    const crown = new THREE.InstancedMesh(crownGeo, crownMat, trees.length);
    trees.forEach((v, i) => {
      tmp.position.set(v.x, v.y + 1.6 * v.scale, v.z);
      tmp.scale.setScalar(v.scale);
      tmp.rotation.set(0, v.rot, 0);
      tmp.updateMatrix();
      trunk.setMatrixAt(i, tmp.matrix);
      tmp.position.y = v.y + (3.2 + 1.4) * v.scale;
      tmp.updateMatrix();
      crown.setMatrixAt(i, tmp.matrix);
    });

    const rockGeo = new THREE.IcosahedronGeometry(1.1, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8d8778, flatShading: true });
    const rock = new THREE.InstancedMesh(rockGeo, rockMat, rocks.length);
    rocks.forEach((v, i) => {
      tmp.position.set(v.x, v.y + 0.55 * v.scale, v.z);
      tmp.scale.set(v.scale, v.scale * 0.75, v.scale);
      tmp.rotation.set(0, v.rot, 0);
      tmp.updateMatrix();
      rock.setMatrixAt(i, tmp.matrix);
    });

    const bushGeo = new THREE.SphereGeometry(0.9, 6, 5);
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x3f7d3a });
    const bush = new THREE.InstancedMesh(bushGeo, bushMat, bushes.length);
    bushes.forEach((v, i) => {
      tmp.position.set(v.x, v.y + 0.5 * v.scale, v.z);
      tmp.scale.set(v.scale, v.scale * 0.72, v.scale);
      tmp.rotation.set(0, v.rot, 0);
      tmp.updateMatrix();
      bush.setMatrixAt(i, tmp.matrix);
    });

    this.scene.add(trunk, crown, rock, bush);
  }

  private buildRuins(): void {
    const mat = new THREE.MeshLambertMaterial({ color: 0x9d9484 });
    const y = RUINS_FLOOR_HEIGHT - 0.3;
    for (const w of this.gen.ruinWalls) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), mat);
      m.position.set(w.x, y + w.h / 2, w.z);
      m.rotation.y = w.rotY;
      this.scene.add(m);
    }
  }

  private buildSpawnMarkers(): void {
    const mat = new THREE.MeshLambertMaterial({ color: 0xcf9f4a });
    for (const sp of this.gen.spawns) {
      const y = sampleHeight(this.gen.params, sp.x, sp.z);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.4, 6), mat);
      m.position.set(sp.x, y + 1.2, sp.z);
      this.scene.add(m);
    }
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
}
