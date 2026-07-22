// Island Duell — all balancing constants (PRD v0.1 baseline values).
// Every gameplay number lives here so playtest tuning touches one file.

// ---------- World (§5) ----------
export const WORLD_SIZE = 256; // m, playable square
export const WORLD_HALF = WORLD_SIZE / 2;
export const ISLAND_LAND_RADIUS = 100; // ~200 m land diameter
export const BEACH_INNER_RADIUS = 82; // beach ring between inner and land radius
export const CHUNK_SIZE = 32; // m
export const CHUNKS_PER_SIDE = WORLD_SIZE / CHUNK_SIZE; // 8x8 = 64
export const TERRAIN_CELL = 2; // m per heightfield cell
export const TERRAIN_VERTS = WORLD_SIZE / TERRAIN_CELL + 1; // 129x129
export const WATER_LEVEL = 0;
export const MAX_TERRAIN_HEIGHT = 16;

// Fog (§5.1 / §6.2)
export const FOG_DAY = 120;
export const FOG_NIGHT = 50;

// ---------- Player (§4.1) ----------
export const PLAYER_MAX_HP = 100;
export const WALK_SPEED = 6; // m/s
export const AIM_SPEED = 4.4; // m/s while aiming down sights
export const SNEAK_SPEED = 3.2; // m/s while crouched
export const PRONE_SPEED = 1.8; // m/s while lying down with the sniper
export const SPRINT_SPEED = 9; // m/s
export const GROUND_ACCEL = 36; // m/s²: responsive, but not an instant velocity snap
export const GROUND_DECEL = 44; // m/s²: short, readable stopping distance
export const AIR_ACCEL = 9; // m/s²: limited steering without killing jump momentum
export const JUMP_SPEED = 6.5; // m/s initial vertical velocity
export const GRAVITY = 22; // m/s^2 (gamey, snappy)
export const PLAYER_RADIUS = 0.4;
export const PLAYER_HEIGHT = 1.8; // capsule total height
export const PLAYER_EYE_HEIGHT = 1.62;
export const PLAYER_SNEAK_HEIGHT = 1.22;
export const PLAYER_SNEAK_EYE_HEIGHT = 1.02;
export const PLAYER_PRONE_HEIGHT = 0.86;
export const PLAYER_PRONE_EYE_HEIGHT = 0.48;
// Sprint stamina (§12 open point — default: with slow regen)
export const SPRINT_STAMINA_MAX = 6; // seconds of sprint
export const SPRINT_STAMINA_REGEN = 1.2; // seconds refilled per second not sprinting

// ---------- Scaling over N (§3) ----------
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const SPAWN_RING_RADIUS = 80;
export const SPAWN_POI_COUNT = 5; // 72° apart
export const FIXED_POI_CRATES = 12;
export const scatterCrateCount = (n: number) => 3 * n;
export const finalRingDiameter = (n: number) => 20 + 5 * n; // m

// ---------- Round timeline (§6.1), seconds ----------
export type MatchMode = 'classic' | 'quick';
/** Quick keeps combat physics unchanged and only compresses the world/zone timeline. */
export const MATCH_MODE_PACE: Record<MatchMode, number> = { classic: 1, quick: 1.75 };
export const PHASE_LOOT_END = 180; // 3:00
export const PHASE_CLOSING_END = 480; // 8:00
export const SHRINK1_AT = 180;
export const SHRINK2_AT = 360;
export const SHRINK3_AT = 510; // 8:30
export const FINAL_COLLAPSE_AT = 630; // 10:30 safety: force round end by ~11 min
export const CARE_PACKAGE_AT = 300; // 5:00 (§7)
export const SHRINK_DURATION = [45, 40, 30, 60] as const; // s per shrink step (+ final collapse)
export const ZONE_START_RADIUS = 95; // ~90 % of island
export const ZONE_RADII = [65, 40] as const; // after shrink 1 and 2; shrink 3 → finalRingDiameter/2
export const ZONE_DOT = [2, 5, 10] as const; // HP/s outside, per shrink tier (§6.3)

// Day/night: 0 = full day, 1 = full night
export const NIGHT_START = PHASE_LOOT_END; // dusk begins 3:00
export const NIGHT_FULL = PHASE_CLOSING_END; // full night 8:00

// ---------- Match (§6.4) ----------
export const ROUNDS_PER_MATCH = 3;
export const MAX_SUDDEN_DEATH_ROUNDS = 2;
export const ROUND_END_SCOREBOARD_SECS = 8;

// ---------- Combat (§4.3) ----------
export type WeaponType =
  | 'fists' | 'machete' | 'spear' | 'bow' | 'pistol' | 'rifle' | 'shotgun' | 'sniper'
  | 'grenade' | 'smoke' | 'flash';

export type AmmoType = 'arrow' | 'pistol' | 'rifle' | 'shell' | 'sniper';

/** The three throwables sharing slot 3; cycled with the throwable key. */
export type ThrowKind = 'frag' | 'smoke' | 'flash';
export const THROW_ORDER: readonly ThrowKind[] = ['frag', 'smoke', 'flash'] as const;
/** Weapon identity used for events/viewmodels per throwable kind. */
export const THROW_WEAPON: Record<ThrowKind, WeaponType> = {
  frag: 'grenade', smoke: 'smoke', flash: 'flash',
};

export interface WeaponDef {
  type: WeaponType;
  kind: 'melee' | 'hitscan' | 'projectile' | 'throwable';
  damage: number;       // per hit / per pellet / at grenade center
  headshotDamage?: number;
  cooldown: number;     // s between uses (Kadenz/Draw)
  range: number;        // melee reach or hitscan max range (m)
  ammo?: AmmoType;
  magSize?: number;
  pellets?: number;     // shotgun
  falloffStart?: number; // hitscan damage falloff start (m)
  falloffEnd?: number;   // damage 25 % beyond this
  projectileSpeed?: number;
  loud: boolean;        // triggers ping-on-loud (§6.2)
  reloadTime?: number;
  aimFov?: number;       // camera FOV while aiming (default 55); sniper scope zooms harder
  hipSpread?: number;    // radians-ish direction variance, authoritative on host
  aimSpread?: number;
  moveSpread?: number;   // extra spread at full running speed
  recoilPitch?: number;  // client camera kick in radians
  recoilYaw?: number;
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  fists:   { type: 'fists',   kind: 'melee', damage: 8,  cooldown: 0.5,  range: 1.5, loud: false },
  machete: { type: 'machete', kind: 'melee', damage: 35, cooldown: 0.6,  range: 2.0, loud: false },
  spear:   { type: 'spear',   kind: 'melee', damage: 28, cooldown: 0.8,  range: 3.5, loud: false },
  bow: {
    type: 'bow', kind: 'projectile', damage: 40, headshotDamage: 70, cooldown: 1.0,
    range: 120, ammo: 'arrow', projectileSpeed: 40, loud: false,
  },
  pistol: {
    type: 'pistol', kind: 'hitscan', damage: 22, cooldown: 0.25, range: 60,
    ammo: 'pistol', magSize: 7, falloffStart: 30, falloffEnd: 60, loud: true, reloadTime: 1.4,
    hipSpread: 0.018, aimSpread: 0.002, moveSpread: 0.012, recoilPitch: 0.013, recoilYaw: 0.006,
  },
  rifle: {
    type: 'rifle', kind: 'hitscan', damage: 30, cooldown: 0.15, range: 120,
    ammo: 'rifle', magSize: 20, falloffStart: 80, falloffEnd: 120, loud: true, reloadTime: 2.0,
    hipSpread: 0.012, aimSpread: 0.0015, moveSpread: 0.016, recoilPitch: 0.011, recoilYaw: 0.005,
  },
  shotgun: {
    type: 'shotgun', kind: 'hitscan', damage: 12, cooldown: 0.9, range: 24, pellets: 8,
    ammo: 'shell', magSize: 5, falloffStart: 8, falloffEnd: 20, loud: true, reloadTime: 2.2,
    hipSpread: 0.065, aimSpread: 0.038, moveSpread: 0.015, recoilPitch: 0.035, recoilYaw: 0.012,
  },
  // Bolt-action marksman rifle: one-shot headshot (75 × 1.65 ≈ 123), two body
  // shots, very loud, ammo-starved and hopeless from the hip — no strictly-best item.
  sniper: {
    type: 'sniper', kind: 'hitscan', damage: 75, cooldown: 1.3, range: 200,
    ammo: 'sniper', magSize: 5, loud: true, reloadTime: 3.2, aimFov: 25,
    hipSpread: 0.09, aimSpread: 0.0006, moveSpread: 0.05, recoilPitch: 0.06, recoilYaw: 0.009,
  },
  grenade: {
    type: 'grenade', kind: 'throwable', damage: 60, cooldown: 0.8, range: 5, // range = blast radius
    projectileSpeed: 16, loud: true,
  },
  smoke: {
    type: 'smoke', kind: 'throwable', damage: 0, cooldown: 0.8, range: 4.5, // range = cloud radius
    projectileSpeed: 14, loud: false,
  },
  flash: {
    type: 'flash', kind: 'throwable', damage: 0, cooldown: 0.8, range: 14, // range = blind radius
    projectileSpeed: 16, loud: true,
  },
};

export const GRENADE_FUSE = 3; // s (§4.3); also the cooking budget before a hand detonation
export const GRENADE_RADIUS = 5; // m
export const GRENADE_MIN_THROW_FUSE = 0.2; // s: a fully cooked release still flies briefly

// ---------- Utility throwables ----------
export const SMOKE_FUSE = 1.5;      // s flight before the canister pops
export const SMOKE_RADIUS = 4.5;    // m sight-blocking cloud radius
export const SMOKE_DURATION = 12;   // s cloud lifetime
export const FLASH_FUSE = 1.5;      // s flight before detonation
export const FLASH_RADIUS = 14;     // m maximum blind distance
export const FLASH_MAX_BLIND = 2.5; // s full-intensity blind duration
/** Facing the pop head-on = 1; back turned keeps a small residual sting. */
export const FLASH_BACK_FACTOR = 0.15;

// ---------- Sniper scope breath (client-side hold-breath meter) ----------
export const SCOPE_BREATH_MAX = 4;     // s of held breath
export const SCOPE_BREATH_REGEN = 1.2; // s refilled per second not holding
export const MELEE_CONE_COS = 0.5; // ~60° half-angle cone for melee hits
export const LOUD_PING_SECONDS = 2; // §6.2 minimap ping duration
export const PICKUP_RADIUS = 1.4; // walk-over pickup distance
export const INTERACT_RANGE = 2.8; // resource / swap interact distance
export const INTERACT_HOLD_SECS = 1.5; // §4.2
export const RESPAWN_INVULN_SECS = 0; // no respawn during a round (spectate)

// ---------- Crafting (§4.4) ----------
export type Recipe = 'arrows' | 'bandage' | 'plate';
export interface RecipeDef {
  recipe: Recipe;
  input: { wood?: number; stone?: number; fiber?: number };
  time: number; // s
  output: string;
}
export const RECIPES: Record<Recipe, RecipeDef> = {
  arrows:  { recipe: 'arrows',  input: { wood: 2 },  time: 1, output: '4 arrows' },
  bandage: { recipe: 'bandage', input: { fiber: 2 }, time: 1, output: '1 bandage' },
  plate:   { recipe: 'plate',   input: { stone: 3 }, time: 2, output: '1 armor plate' },
};
export const ARROWS_PER_CRAFT = 4;
export const BANDAGE_HEAL = 30; // HP over 3 s
export const BANDAGE_DURATION = 3;
export const BANDAGE_USE_TIME = 1;
export const PLATE_DAMAGE_REDUCTION = 0.2; // −20 % damage, 1 charge each
export const MAX_PLATES = 3;
export const MAX_GRENADES = 2; // §4.3 "1–2 Stück"
export const MAX_SMOKE = 2;
export const MAX_FLASH = 2;
export const MAX_BANDAGES = 5;
export const RESOURCE_YIELD = 2; // per completed harvest
export const RESOURCE_NODE_CHARGES = 3;

// ---------- Networking (§8) ----------
export const SNAPSHOT_HZ = 20;
export const SERVER_TICK_HZ = 30;
export const INTERP_DELAY_MS = 100;
export const DEFAULT_PORT = 3000;
export const RECONCILE_SNAP_DIST = 0.6; // m: prediction error before hard snap
export const RECONNECT_GRACE_MS = 12_000;

// ---------- Loot ----------
export type ItemType =
  | WeaponType
  | 'bandageItem' | 'arrowBundle' | 'pistolAmmo' | 'rifleAmmo' | 'shellAmmo' | 'sniperAmmo'
  | 'plateItem' | 'smokeGrenade' | 'flashGrenade';

export interface AmmoPickupAmounts { arrow: number; pistol: number; rifle: number; shell: number; sniper: number }
export const AMMO_PICKUP: AmmoPickupAmounts = { arrow: 6, pistol: 14, rifle: 20, shell: 8, sniper: 5 };
// Weapon pickups come with a starter mag/reserve
export const WEAPON_START_AMMO: Partial<Record<WeaponType, number>> = {
  bow: 6, pistol: 14, rifle: 20, shotgun: 8, sniper: 5,
};
export const AMMO_CAP: Record<AmmoType, number> = { arrow: 24, pistol: 56, rifle: 60, shell: 24, sniper: 15 };
/** Chance a top-tier crate rolls the sniper instead of rifle/shotgun (kept rare). */
export const SNIPER_CRATE_CHANCE = 0.18;

// ---------- Bots (host-only practice AI; §F4) ----------
export type BotDifficulty = 'easy' | 'normal' | 'hard';
export interface BotDifficultyDef {
  reaction: number;     // s between acquiring a target and the first shot
  aimError: number;     // radians of gaussian-ish aim wobble
  detectRange: number;  // m base sight range in full daylight
  detectFovCos: number; // cos of the half-angle the bot notices enemies in
  aggression: number;   // 0..1: chance to push instead of holding ground
  throwSkill: number;   // 0..1: how readily grenades/smokes are used
}
export const BOT_DIFFICULTIES: Record<BotDifficulty, BotDifficultyDef> = {
  easy:   { reaction: 0.55, aimError: 0.085, detectRange: 55, detectFovCos: 0.35, aggression: 0.35, throwSkill: 0.25 },
  normal: { reaction: 0.30, aimError: 0.045, detectRange: 75, detectFovCos: 0.15, aggression: 0.6,  throwSkill: 0.55 },
  hard:   { reaction: 0.18, aimError: 0.022, detectRange: 95, detectFovCos: 0.0,  aggression: 0.85, throwSkill: 0.8 },
};
export const BOT_NAMES = ['Bot Alpha', 'Bot Bravo', 'Bot Charlie', 'Bot Delta'] as const;
export const MAX_PRACTICE_BOTS = 4;
