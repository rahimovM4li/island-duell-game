// Rapier physics wrapper (§10): heightfield collider from the noise terrain,
// static colliders for trees/rocks/ruins, kinematic capsule character controller.
// The SAME code runs on the host (authoritative) and on clients (prediction),
// so predicted movement matches the authority almost exactly.
import type RAPIER from '@dimforge/rapier3d-compat';
import {
  PLAYER_HEIGHT, PLAYER_RADIUS, PLAYER_SNEAK_HEIGHT, TERRAIN_VERTS, WORLD_SIZE,
} from './constants';
import { buildHeightGrid, sampleHeight, TerrainParams } from './terrain';
import type { WorldGen } from './worldgen';

export type RapierModule = typeof RAPIER;

export interface Vec3 { x: number; y: number; z: number }

const CAPSULE_HALF = (PLAYER_HEIGHT - 2 * PLAYER_RADIUS) / 2; // 0.5
const SNEAK_CAPSULE_HALF = (PLAYER_SNEAK_HEIGHT - 2 * PLAYER_RADIUS) / 2;
const SNEAK_CAPSULE_CENTER_Y = SNEAK_CAPSULE_HALF + PLAYER_RADIUS;
export const CAPSULE_CENTER_Y = CAPSULE_HALF + PLAYER_RADIUS; // feet → capsule center

/** Rapier heightfields are column-major (col = x index, row = z index). */
export function toRapierHeights(grid: Float32Array): Float32Array {
  const n = TERRAIN_VERTS;
  const out = new Float32Array(n * n);
  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      out[ix * n + iz] = grid[iz * n + ix];
    }
  }
  return out;
}

export interface RayHit {
  dist: number;
  point: Vec3;
  playerId: string | null; // null → terrain / obstacle
}

export interface PhysicsStats {
  engine: 'Rapier';
  timestep: number;
  rigidBodies: number;
  colliders: number;
  playerCapsules: number;
  ccdBodies: number;
  sensors: number;
}

export class GamePhysics {
  readonly R: RapierModule;
  readonly world: RAPIER.World;
  private controller: RAPIER.KinematicCharacterController;
  private players = new Map<string, RAPIER.Collider>();
  private handleToPlayer = new Map<number, string>();
  private sneakingPlayers = new Set<string>();

  constructor(R: RapierModule, gen: WorldGen, grid?: Float32Array) {
    this.R = R;
    this.world = new R.World({ x: 0, y: -9.81, z: 0 });

    const heights = toRapierHeights(grid ?? buildHeightGrid(gen.params));
    const sub = TERRAIN_VERTS - 1;
    this.world.createCollider(
      R.ColliderDesc.heightfield(sub, sub, heights, { x: WORLD_SIZE, y: 1, z: WORLD_SIZE })
        .setTranslation(0, 0, 0),
    );

    // static obstacles: tree trunks + rocks + authored landmark primitives.
    for (const v of gen.vegetation) {
      if (v.colliderRadius <= 0) continue;
      const h = v.kind === 'tree' ? 5 * v.scale : 1.6 * v.scale;
      this.world.createCollider(
        R.ColliderDesc.cylinder(h / 2, v.colliderRadius).setTranslation(v.x, v.y + h / 2, v.z),
      );
    }
    for (const w of gen.ruinWalls) {
      const y = RUINS_WALL_BASE(gen.params);
      this.world.createCollider(
        R.ColliderDesc.cuboid(w.w / 2, w.h / 2, w.d / 2)
          .setTranslation(w.x, y + w.h / 2, w.z)
          .setRotation(quatFromYaw(w.rotY)),
      );
    }
    for (const poi of gen.pois) {
      for (const s of poi.structures) {
        if (!s.collider) continue;
        const y = sampleHeight(gen.params, s.x, s.z);
        this.world.createCollider(
          R.ColliderDesc.cuboid(s.w / 2, s.h / 2, s.d / 2)
            .setTranslation(s.x, y + (s.yOffset ?? 0) + s.h / 2, s.z)
            .setRotation(quatFromYaw(s.rotY)),
        );
      }
    }

    this.controller = this.world.createCharacterController(0.05);
    this.controller.enableAutostep(0.6, 0.3, true);
    this.controller.enableSnapToGround(0.5);
    this.controller.setMaxSlopeClimbAngle((60 * Math.PI) / 180);
    this.controller.setMinSlopeSlideAngle((75 * Math.PI) / 180);
    this.world.step(); // build query structures
  }

  addPlayer(id: string, feet: Vec3): void {
    const desc = this.R.ColliderDesc.capsule(CAPSULE_HALF, PLAYER_RADIUS)
      .setTranslation(feet.x, feet.y + CAPSULE_CENTER_Y, feet.z);
    const col = this.world.createCollider(desc);
    this.players.set(id, col);
    this.handleToPlayer.set(col.handle, id);
  }

  removePlayer(id: string): void {
    const col = this.players.get(id);
    if (col) {
      this.handleToPlayer.delete(col.handle);
      this.world.removeCollider(col, false);
      this.players.delete(id);
      this.sneakingPlayers.delete(id);
    }
  }

  setPlayerPos(id: string, feet: Vec3): void {
    const col = this.players.get(id);
    const center = this.sneakingPlayers.has(id) ? SNEAK_CAPSULE_CENTER_Y : CAPSULE_CENTER_Y;
    col?.setTranslation({ x: feet.x, y: feet.y + center, z: feet.z });
  }

  /** Keep the collision capsule aligned with the current standing/crouched pose. */
  setPlayerSneaking(id: string, sneaking: boolean, feet: Vec3): void {
    const col = this.players.get(id);
    if (!col || sneaking === this.sneakingPlayers.has(id)) return;
    if (sneaking) this.sneakingPlayers.add(id);
    else this.sneakingPlayers.delete(id);
    col.setHalfHeight(sneaking ? SNEAK_CAPSULE_HALF : CAPSULE_HALF);
    this.setPlayerPos(id, feet);
  }

  playerIdForHandle(handle: number): string | null {
    return this.handleToPlayer.get(handle) ?? null;
  }

  /**
   * Move a capsule by `disp` with collision resolution.
   * Players do not collide with each other (LAN duel: no body-blocking).
   * Returns new feet position + grounded flag.
   */
  moveCharacter(id: string, disp: Vec3): { pos: Vec3; grounded: boolean } {
    const col = this.players.get(id);
    if (!col) throw new Error(`no collider for ${id}`);
    this.controller.computeColliderMovement(
      col, disp, undefined, undefined,
      (other) => !this.handleToPlayer.has(other.handle),
    );
    const mv = this.controller.computedMovement();
    const cur = col.translation();
    const center = this.sneakingPlayers.has(id) ? SNEAK_CAPSULE_CENTER_Y : CAPSULE_CENTER_Y;
    let nx = cur.x + mv.x, ny = cur.y + mv.y, nz = cur.z + mv.z;
    // hard world bound: don't swim off the map
    const r = Math.hypot(nx, nz);
    const maxR = WORLD_SIZE / 2 - 6;
    if (r > maxR) { nx *= maxR / r; nz *= maxR / r; }
    col.setTranslation({ x: nx, y: ny, z: nz });
    return {
      pos: { x: nx, y: ny - center, z: nz },
      grounded: this.controller.computedGrounded(),
    };
  }

  /** Raycast vs terrain, obstacles and player capsules. */
  raycast(origin: Vec3, dir: Vec3, maxDist: number, excludePlayerIds?: string[]): RayHit | null {
    const ray = new this.R.Ray(origin, dir);
    const exclude = new Set(
      (excludePlayerIds ?? [])
        .map((id) => this.players.get(id)?.handle)
        .filter((h): h is number => h !== undefined),
    );
    const hit = this.world.castRay(
      ray, maxDist, true, undefined, undefined, undefined, undefined,
      (c) => !exclude.has(c.handle),
    );
    if (!hit) return null;
    const p = ray.pointAt(hit.timeOfImpact);
    return {
      dist: hit.timeOfImpact,
      point: { x: p.x, y: p.y, z: p.z },
      playerId: this.handleToPlayer.get(hit.collider.handle) ?? null,
    };
  }

  /** Refresh spatial query structures after collider moves. Call once per tick. */
  step(): void {
    this.world.step();
  }

  stats(): PhysicsStats {
    return {
      engine: 'Rapier',
      timestep: this.world.timestep,
      rigidBodies: this.world.bodies.len(),
      colliders: this.world.colliders.len(),
      playerCapsules: this.players.size,
      ccdBodies: 0,
      sensors: 0,
    };
  }

  /** Release the WASM allocation when leaving or restarting a match. */
  dispose(): void {
    this.players.clear();
    this.handleToPlayer.clear();
    this.sneakingPlayers.clear();
    this.world.free();
  }
}

export function quatFromYaw(yaw: number): { x: number; y: number; z: number; w: number } {
  return { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) };
}

// ruins walls sit on the flattened pad
import { RUINS_FLOOR_HEIGHT } from './terrain';
function RUINS_WALL_BASE(_p: TerrainParams): number {
  return RUINS_FLOOR_HEIGHT - 0.3;
}
