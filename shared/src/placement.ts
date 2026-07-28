/**
 * Deterministic 2D footprint reservations for world generation.
 *
 * Detailed render meshes never participate here. Gameplay objects reserve
 * simple circles or oriented boxes so later loot, props and vegetation can
 * prove that their interaction footprint remains free.
 */
export interface PlacementPoint {
  x: number;
  z: number;
}

export interface CircleFootprint extends PlacementPoint {
  shape: 'circle';
  radius: number;
  label?: string;
}

export interface BoxFootprint extends PlacementPoint {
  shape: 'box';
  width: number;
  depth: number;
  yaw: number;
  label?: string;
}

export type PlacementFootprint = CircleFootprint | BoxFootprint;

export interface NearbySearch {
  maxDistance: number;
  step?: number;
  angles?: number;
  phase?: number;
  allowed?: (x: number, z: number) => boolean;
}

function circleIntersectsBox(
  x: number, z: number, radius: number, box: BoxFootprint,
): boolean {
  const dx = x - box.x;
  const dz = z - box.z;
  const c = Math.cos(box.yaw);
  const s = Math.sin(box.yaw);
  const localX = c * dx - s * dz;
  const localZ = s * dx + c * dz;
  const closestX = Math.max(-box.width / 2, Math.min(box.width / 2, localX));
  const closestZ = Math.max(-box.depth / 2, Math.min(box.depth / 2, localZ));
  return Math.hypot(localX - closestX, localZ - closestZ) < radius;
}

export function circleIntersectsFootprint(
  x: number, z: number, radius: number, footprint: PlacementFootprint,
): boolean {
  if (footprint.shape === 'circle') {
    return Math.hypot(x - footprint.x, z - footprint.z) < radius + footprint.radius;
  }
  return circleIntersectsBox(x, z, radius, footprint);
}

export class PlacementMap {
  private readonly footprints: PlacementFootprint[] = [];
  private readonly grid = new Map<string, number[]>();
  private readonly cellSize = 8;

  private addFootprint(
    footprint: PlacementFootprint,
    halfExtentX: number,
    halfExtentZ: number,
  ): void {
    const index = this.footprints.push(footprint) - 1;
    const minCellX = Math.floor((footprint.x - halfExtentX) / this.cellSize);
    const maxCellX = Math.floor((footprint.x + halfExtentX) / this.cellSize);
    const minCellZ = Math.floor((footprint.z - halfExtentZ) / this.cellSize);
    const maxCellZ = Math.floor((footprint.z + halfExtentZ) / this.cellSize);
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
        const key = `${cellX}:${cellZ}`;
        const entries = this.grid.get(key);
        if (entries) entries.push(index);
        else this.grid.set(key, [index]);
      }
    }
  }

  reserveCircle(x: number, z: number, radius: number, label?: string): void {
    this.addFootprint({ shape: 'circle', x, z, radius, label }, radius, radius);
  }

  reserveBox(
    x: number, z: number, width: number, depth: number, yaw: number, label?: string,
  ): void {
    const c = Math.abs(Math.cos(yaw));
    const s = Math.abs(Math.sin(yaw));
    const halfExtentX = c * width / 2 + s * depth / 2;
    const halfExtentZ = s * width / 2 + c * depth / 2;
    this.addFootprint(
      { shape: 'box', x, z, width, depth, yaw, label },
      halfExtentX,
      halfExtentZ,
    );
  }

  canPlaceCircle(x: number, z: number, radius: number): boolean {
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellZ = Math.floor((z - radius) / this.cellSize);
    const maxCellZ = Math.floor((z + radius) / this.cellSize);
    const candidates = new Set<number>();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
        for (const index of this.grid.get(`${cellX}:${cellZ}`) ?? []) candidates.add(index);
      }
    }
    for (const index of candidates) {
      if (circleIntersectsFootprint(x, z, radius, this.footprints[index])) return false;
    }
    return true;
  }

  /**
   * Find the nearest free point in deterministic rings around a preferred
   * anchor. The caller controls the phase, so no global/random state is used.
   */
  findFreeCircleNear(
    preferredX: number, preferredZ: number, radius: number, search: NearbySearch,
  ): PlacementPoint | null {
    const allowed = search.allowed ?? (() => true);
    if (allowed(preferredX, preferredZ) && this.canPlaceCircle(preferredX, preferredZ, radius)) {
      return { x: preferredX, z: preferredZ };
    }

    const step = search.step ?? 0.75;
    const angles = Math.max(4, search.angles ?? 16);
    const phase = search.phase ?? 0;
    const rings = Math.ceil(search.maxDistance / step);
    for (let ring = 1; ring <= rings; ring++) {
      const distance = Math.min(search.maxDistance, ring * step);
      for (let index = 0; index < angles; index++) {
        const angle = phase + (index / angles) * Math.PI * 2;
        const x = preferredX + Math.cos(angle) * distance;
        const z = preferredZ + Math.sin(angle) * distance;
        if (allowed(x, z) && this.canPlaceCircle(x, z, radius)) return { x, z };
      }
    }
    return null;
  }
}
