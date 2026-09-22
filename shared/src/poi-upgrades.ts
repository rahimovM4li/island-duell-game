import type { CentralStructure, LandmarkPoi, PoiStructure } from './worldgen';
import type { CombatRoute } from './combat-layout';
import { sampleHeight, type TerrainParams } from './terrain';

export function poiPoint(poi: LandmarkPoi, x: number, z: number): { x: number; z: number } {
  const c = Math.cos(poi.rootYaw), s = Math.sin(poi.rootYaw);
  return { x: poi.x + c * x + s * z, z: poi.z - s * x + c * z };
}

/** Authored additions use the same boxes for visible geometry and both physics peers. */
export function upgradePois(params: TerrainParams, pois: LandmarkPoi[], central: CentralStructure[], routes: CombatRoute[]): void {
  for (const poi of pois) {
    const add = (name: string, x: number, y: number, z: number, w: number, h: number, d: number,
      material: PoiStructure['material'], pitch = 0, walkSurface = false) => {
      poi.structures.push({ name: `poi-upgrade-${name}`, ...poiPoint(poi, x, z),
        w, h, d, yOffset: y - h / 2, rotY: poi.rootYaw, rotX: pitch, material, collider: true, walkSurface });
    };
    if (poi.id === 'watchtower') {
      // The new stair joins this deck from outside. Use continuous floor snapping
      // at the join; its underside still blocks players approaching from below.
      const rearDeck = poi.structures.find(part => part.name === 'tower_deck_back');
      if (rearDeck) rearDeck.walkSurface = true;
      const rise = 5.41, run = 9.65, pitch = -Math.atan2(rise, run), thickness = 0.22;
      add('rear-stair', 0, 2.785 - thickness / (2 * Math.cos(pitch)), -7.475,
        1.9, thickness, Math.hypot(run, rise), 'wood', pitch, true);
      routes.push({ name: 'watchtower-rear-approach', width: 2.4,
        points: [-19, -12.6].map(z => poiPoint(poi, 0, z)) });
      // A covered equipment station beside, rather than beneath, the stairwell.
      add('supply-locker', -4.1, 0.65, -2.5, 1.3, 1.3, 1.2, 'wood');
    } else if (poi.id === 'bunker') {
      // Recessed front opening and wall-side consoles leave a clear central axis.
      for (const side of [-1, 1]) {
        add(`front-shoulder-${side}`, side * 2.9, 1.2, 3.02, 1.7, 2.4, 0.46, 'stone');
        add(`console-${side}`, side * 2.95, 0.5, -0.8, 0.95, 1, 2.15, 'metal');
      }
      add('radio-housing', -1.85, 3.15, -0.7, 1.45, 0.6, 1.15, 'metal');
    } else if (poi.id === 'wreck') {
      add('deck-winch', 4.7, 3.12, -1.1, 0.85, 0.7, 0.9, 'metal');
      // Cargo occupies the shore-side pockets, keeping the stern and side breach free.
      for (const [i, x, z, w, h, d] of [[0, -4.8, 5.7, 2.2, 1.25, 1.4], [1, -2.6, -5.5, 2.3, 1.65, 1.35]]) {
        const p = poiPoint(poi, x, z);
        const base = sampleHeight(params, poi.x, poi.z);
        const height = sampleHeight(params, p.x, p.z) - base;
        add(`salvage-${i}`, x, height + h / 2 - 0.08, z, w, h + 0.16, d, 'wood');
      }
      routes.push({ name: 'wreck-side-approach', width: 2,
        points: [8.8, 4, 1].map(z => poiPoint(poi, 0, z)) });
    }
  }
  // Four monumental, partly broken gates identify the arena from every approach.
  // Pillars sit outside the 2.8 m clear path; the overhead stone starts above heads.
  for (let i = 0; i < 4; i++) {
    const yaw = i * Math.PI / 2, c = Math.cos(yaw), s = Math.sin(yaw);
    const point = (x: number) => ({ x: c * x + s * 20.4, z: -s * x + c * 20.4 });
    const left = point(-2.5), right = point(2.5);
    const top = Math.max(sampleHeight(params, left.x, left.z), sampleHeight(params, right.x, right.z)) + 3.9;
    for (const [side, p] of [[-1, left], [1, right]] as const) {
      const bottom = sampleHeight(params, p.x, p.z) - 0.4;
      central.push({ name: `Poi_gate_${i}_pillar_${side}`, shape: 'box', ...p,
        y: (bottom + top) / 2, w: 1.1, h: top - bottom, d: 1.25, rotY: yaw, rotX: 0, walkSurface: false });
    }
    // Alternating intact and broken lintels keep a weathered silhouette.
    const intact = i % 2 === 0;
    const p = point(intact ? 0 : -1.9);
    central.push({ name: `Poi_gate_${i}_lintel`, shape: 'box', ...p,
      y: top + 0.24, w: intact ? 6.1 : 2.1, h: 0.48, d: 1.3, rotY: yaw, rotX: 0, walkSurface: false });
  }
}
