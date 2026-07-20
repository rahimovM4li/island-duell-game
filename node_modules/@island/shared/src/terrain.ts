// Deterministic island terrain. Height is an analytic pure function of (seed, x, z)
// so host and every client generate pixel-identical geometry from the match seed (§9 M3).
import {
  BEACH_INNER_RADIUS, ISLAND_LAND_RADIUS, MAX_TERRAIN_HEIGHT, TERRAIN_CELL,
  TERRAIN_VERTS, WORLD_HALF,
} from './constants';
import { deriveSeed } from './rng';

function hash2(seed: number, xi: number, zi: number): number {
  let h = (seed ^ Math.imul(xi, 374761393) ^ Math.imul(zi, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function valueNoise(seed: number, x: number, z: number): number {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const v00 = hash2(seed, xi, zi);
  const v10 = hash2(seed, xi + 1, zi);
  const v01 = hash2(seed, xi, zi + 1);
  const v11 = hash2(seed, xi + 1, zi + 1);
  return lerp(lerp(v00, v10, smooth(xf)), lerp(v01, v11, smooth(xf)), smooth(zf));
}

function fbm(seed: number, x: number, z: number, octaves = 4): number {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(seed + o * 1013, x * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm; // [0,1]
}

export interface TerrainParams {
  seed: number;
  plateauAngle: number; // where the highground POI sits
}

export function terrainParams(seed: number): TerrainParams {
  // plateau direction derived from seed, stable across clients
  const a = (deriveSeed(seed, 'plateau') / 4294967296) * Math.PI * 2;
  return { seed: deriveSeed(seed, 'terrain'), plateauAngle: a };
}

export function plateauCenter(p: TerrainParams): { x: number; z: number } {
  const r = 55;
  return { x: Math.cos(p.plateauAngle) * r, z: Math.sin(p.plateauAngle) * r };
}

export const RUINS_RADIUS = 20;
export const RUINS_FLOOR_HEIGHT = 5.5;
export const PLATEAU_RADIUS = 16;
export const PLATEAU_EXTRA_HEIGHT = 7;

/** World-space terrain height at (x, z). Water level is y = 0. */
export function sampleHeight(p: TerrainParams, x: number, z: number): number {
  const d = Math.hypot(x, z);
  // base rolling hills
  const n = fbm(p.seed, x / 48 + 100, z / 48 + 100);
  let h = 1.5 + n * (MAX_TERRAIN_HEIGHT - 4);
  // island falloff: land → beach → sea floor
  const landMask = 1 - smoothstep(BEACH_INNER_RADIUS, ISLAND_LAND_RADIUS, d);
  const seaMask = smoothstep(ISLAND_LAND_RADIUS, ISLAND_LAND_RADIUS + 14, d);
  h = h * landMask + 1.1 * (1 - landMask); // beach ring sits just above water
  h -= seaMask * 8; // drop to sea floor
  // plateau highground POI
  const pc = plateauCenter(p);
  const pd = Math.hypot(x - pc.x, z - pc.z);
  h += (1 - smoothstep(PLATEAU_RADIUS * 0.4, PLATEAU_RADIUS, pd)) * PLATEAU_EXTRA_HEIGHT * landMask;
  // flatten central ruins pad
  const ruinBlend = 1 - smoothstep(RUINS_RADIUS * 0.55, RUINS_RADIUS, d);
  h = lerp(h, RUINS_FLOOR_HEIGHT, ruinBlend);
  return h;
}

/** Full heightfield grid (TERRAIN_VERTS × TERRAIN_VERTS), row-major over z then x. */
export function buildHeightGrid(p: TerrainParams): Float32Array {
  const g = new Float32Array(TERRAIN_VERTS * TERRAIN_VERTS);
  for (let iz = 0; iz < TERRAIN_VERTS; iz++) {
    for (let ix = 0; ix < TERRAIN_VERTS; ix++) {
      const x = -WORLD_HALF + ix * TERRAIN_CELL;
      const z = -WORLD_HALF + iz * TERRAIN_CELL;
      g[iz * TERRAIN_VERTS + ix] = sampleHeight(p, x, z);
    }
  }
  return g;
}

export const isOnLand = (p: TerrainParams, x: number, z: number) =>
  sampleHeight(p, x, z) > 0.6 && Math.hypot(x, z) < ISLAND_LAND_RADIUS;
