import type { CentralStructure, LandmarkPoi, PoiStructure } from './worldgen';
import { sampleHeight, type TerrainParams } from './terrain';
import { PlacementMap } from './placement';

export interface CombatRoute {
  name: string;
  points: Array<{ x: number; z: number }>;
  width: number;
}

// Two genuinely open entrances; the rear door is 2.2 m wide and full height.
export const BUNKER_PARTS: Array<{
  name: string; center: [number, number, number]; size: [number, number, number]; yaw: number;
}> = [
  { name: 'bunker_roof', center: [0, 2.625, 0], size: [8.5, 0.45, 6.5], yaw: 0 },
  { name: 'bunker_left', center: [-3.9, 1.2, 0], size: [0.7, 2.4, 6.5], yaw: 0 },
  { name: 'bunker_right', center: [3.9, 1.2, 0], size: [0.7, 2.4, 6.5], yaw: 0 },
  { name: 'bunker_back_left', center: [-2.675, 1.2, -2.9], size: [3.15, 2.4, 0.7], yaw: 0 },
  { name: 'bunker_back_right', center: [2.675, 1.2, -2.9], size: [3.15, 2.4, 0.7], yaw: 0 },
];

export function routeDistance(route: CombatRoute, x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1], b = route.points[i];
    const dx = b.x - a.x, dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
  }
  return best;
}

export function reserveCombatRoutes(placement: PlacementMap, routes: CombatRoute[]): void {
  for (const route of routes) for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1], b = route.points[i];
    placement.reserveBox((a.x + b.x) / 2, (a.z + b.z) / 2,
      route.width, Math.hypot(a.x - b.x, a.z - b.z), Math.atan2(b.x - a.x, b.z - a.z), route.name);
    placement.reserveCircle(a.x, a.z, route.width / 2, route.name);
    placement.reserveCircle(b.x, b.z, route.width / 2, route.name);
  }
}

/** Authored choices on every seed: exposed short entry or longer covered flank. */
export function buildCombatLayout(params: TerrainParams, pois: LandmarkPoi[], central: CentralStructure[]): CombatRoute[] {
  const routes: CombatRoute[] = [];
  for (const poi of pois.filter(p => p.id === 'bunker' || p.id === 'watchtower')) {
    const point = (x: number, z: number) => ({
      x: poi.x + Math.cos(poi.rootYaw) * x + Math.sin(poi.rootYaw) * z,
      z: poi.z - Math.sin(poi.rootYaw) * x + Math.cos(poi.rootYaw) * z,
    });
    const route = (name: string, points: number[][]) => routes.push({
      name: `${poi.id}-${name}`, points: points.map(([x, z]) => point(x, z)), width: 2.2,
    });
    route('approach', [[0, 18], [0, poi.id === 'bunker' ? 4 : 10]]);
    for (const side of [-1, 1]) {
      route(`flank-${side}`, [[side * 6.8, 16], [side * 6.8, 7], [side * 6.8, -6], [0, -6]]);
    }
    if (poi.id === 'bunker') route('rear-entry', [[0, -6], [0, 1]]);
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
      const p = point(side * (i === 1 ? 10 : 3.6), [12, 1, -8.5][i]);
      const h = i === 1 ? 1.85 : 1.15;
      const w = i === 1 ? 1.2 : 3.1, d = i === 1 ? 3.2 : 0.9;
      // Bury a short foundation to cover the sloping ground at all four corners.
      const heights = [-1, 1].flatMap(sx => [-1, 1].map(sz => {
        const c = Math.cos(poi.rootYaw), s = Math.sin(poi.rootYaw);
        return sampleHeight(params, p.x + c * sx * w / 2 + s * sz * d / 2,
          p.z - s * sx * w / 2 + c * sz * d / 2);
      }));
      const bottom = Math.min(...heights) - 0.12, top = Math.max(...heights) + h;
      const part: PoiStructure = {
        name: `combat-cover-${side}-${i}`, ...p, w, d, h: top - bottom,
        rotY: poi.rootYaw, yOffset: bottom - sampleHeight(params, poi.x, poi.z),
        material: poi.id === 'watchtower' ? 'wood' : 'stone', collider: true,
      };
      poi.structures.push(part);
    }
  }
  // Four open approach lanes, with staggered stone cover on either side.
  for (let i = 0; i < 4; i++) {
    const yaw = i * Math.PI / 2;
    routes.push({ name: `ruins-approach-${i}`, width: 2.8, points: [19, 32].map(r => ({ x: Math.sin(yaw) * r, z: Math.cos(yaw) * r })) });
    for (const side of [-1, 1]) {
      const x = Math.sin(yaw) * (side < 0 ? 24 : 28) + Math.cos(yaw) * side * 4.5;
      const z = Math.cos(yaw) * (side < 0 ? 24 : 28) - Math.sin(yaw) * side * 4.5;
      const heights = [-1, 1].flatMap(sx => [-1, 1].map(sz => sampleHeight(params,
        x + Math.cos(yaw) * sx * 1.6 + Math.sin(yaw) * sz * 0.55,
        z - Math.sin(yaw) * sx * 1.6 + Math.cos(yaw) * sz * 0.55)));
      const bottom = Math.min(...heights) - 0.12, top = Math.max(...heights) + (side < 0 ? 1.15 : 1.8);
      central.push({ name: `Combat_ruins_${i}_${side}`, shape: 'box', x, z,
        y: (bottom + top) / 2, w: 3.2, d: 1.1, h: top - bottom, rotY: yaw, rotX: 0, walkSurface: false });
    }
  }
  return routes;
}
