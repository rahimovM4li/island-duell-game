import { sampleHeight } from '@shared/terrain';
import type { PoiStructure, WorldGen } from '@shared/worldgen';

export type FootstepSurface = 'grass' | 'sand' | 'stone' | 'wood' | 'metal';
export type FootstepStance = 'normal' | 'sneak' | 'prone';
export type FootstepCue =
  | 'stepGrass' | 'stepSand' | 'stepStone' | 'stepWood' | 'stepMetal'
  | 'crawlGrass' | 'crawlSand' | 'crawlStone' | 'crawlWood' | 'crawlMetal';

function insideRotatedBox(
  x: number, z: number,
  box: { x: number; z: number; w: number; d: number; rotY: number },
  padding = 0,
): { inside: boolean; localZ: number } {
  const dx = x - box.x;
  const dz = z - box.z;
  const c = Math.cos(box.rotY);
  const s = Math.sin(box.rotY);
  const localX = c * dx - s * dz;
  const localZ = s * dx + c * dz;
  return {
    inside: Math.abs(localX) <= box.w / 2 + padding && Math.abs(localZ) <= box.d / 2 + padding,
    localZ,
  };
}

function poiSurfaceY(baseY: number, part: PoiStructure, localZ: number): number {
  const pitch = part.rotX ?? 0;
  if (part.walkSurface && Math.abs(pitch) > 0.001) {
    const cp = Math.cos(pitch);
    return baseY + (part.yOffset ?? 0) + part.h / 2
      + part.h / (2 * cp)
      - Math.tan(pitch) * localZ;
  }
  return baseY + (part.yOffset ?? 0) + part.h;
}

export function footstepSurfaceAt(
  gen: WorldGen,
  x: number,
  y: number,
  z: number,
): FootstepSurface {
  let best: { surface: FootstepSurface; delta: number } | null = null;
  for (const poi of gen.pois) {
    const baseY = sampleHeight(gen.params, poi.x, poi.z);
    for (const part of poi.structures) {
      const point = insideRotatedBox(x, z, part, 0.08);
      if (!point.inside) continue;
      const surfaceY = poiSurfaceY(baseY, part, point.localZ);
      const delta = Math.abs(y - surfaceY);
      if (delta <= 0.72 && (!best || delta < best.delta)) {
        best = { surface: part.material, delta };
      }
    }
    if (poi.id === 'bunker' && Math.hypot(x - poi.x, z - poi.z) < 5.2
      && Math.abs(y - baseY) < 0.75) {
      best ??= { surface: 'stone', delta: Math.abs(y - baseY) };
    }
  }
  if (best) return best.surface;

  for (const part of gen.centralStructures) {
    if (part.shape !== 'box') continue;
    const point = insideRotatedBox(x, z, {
      x: part.x, z: part.z, w: part.w, d: part.d, rotY: part.rotY,
    }, 0.05);
    if (!point.inside) continue;
    const surfaceY = part.walkSurface && Math.abs(part.rotX) > 0.001
      ? part.y + part.h / (2 * Math.cos(part.rotX)) - Math.tan(part.rotX) * point.localZ
      : part.y + part.h / 2;
    if (Math.abs(y - surfaceY) <= 0.7) return 'stone';
  }
  if (Math.hypot(x, z) < 20.5) return 'stone';
  return sampleHeight(gen.params, x, z) < 2.15 ? 'sand' : 'grass';
}

export function footstepCue(surface: FootstepSurface, stance: FootstepStance): FootstepCue {
  const suffix = `${surface[0].toUpperCase()}${surface.slice(1)}`;
  return `${stance === 'prone' ? 'crawl' : 'step'}${suffix}` as FootstepCue;
}

export function footstepIntensity(
  stance: FootstepStance,
  sprinting: boolean,
  remote: boolean,
): number {
  const base = stance === 'prone' ? 0.075 : stance === 'sneak' ? 0.18 : sprinting ? 0.9 : 0.56;
  return base * (remote ? 0.9 : 1);
}

export function distanceAttenuation(
  distance: number,
  category: 'weapon' | 'footstep' | 'effect' = 'effect',
): number {
  const d = Math.max(0, distance);
  const near = category === 'weapon' ? 14 : category === 'footstep' ? 7 : 10;
  const mid = category === 'weapon' ? 55 : category === 'footstep' ? 24 : 38;
  const far = category === 'weapon' ? 135 : category === 'footstep' ? 55 : 95;
  if (d <= near) return 1;
  if (d <= mid) return 1 - ((d - near) / (mid - near)) * 0.55;
  if (d >= far) return 0;
  return 0.45 * (1 - (d - mid) / (far - mid));
}
