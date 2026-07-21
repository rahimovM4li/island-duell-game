// Host-authoritative game room (§8): lobby → 3-round match → scoring → rematch.
// All hit detection, damage, loot and timers are resolved here; clients render.
import type { Server, Socket } from 'socket.io';
import { randomBytes } from 'node:crypto';
import {
  AMMO_CAP, AMMO_PICKUP, ARROWS_PER_CRAFT, BANDAGE_DURATION, BANDAGE_HEAL,
  BANDAGE_USE_TIME, BOT_DIFFICULTIES, BOT_NAMES, BotDifficulty, CARE_PACKAGE_AT,
  FLASH_BACK_FACTOR, FLASH_FUSE, FLASH_MAX_BLIND, FLASH_RADIUS,
  GRENADE_FUSE, GRENADE_MIN_THROW_FUSE, GRENADE_RADIUS,
  INTERACT_HOLD_SECS, INTERACT_RANGE, ItemType, LOUD_PING_SECONDS, MAX_BANDAGES,
  MAX_FLASH, MAX_GRENADES, MAX_PLATES, MAX_PLAYERS, MAX_PRACTICE_BOTS, MAX_SMOKE,
  MELEE_CONE_COS, MIN_PLAYERS,
  PICKUP_RADIUS, PLATE_DAMAGE_REDUCTION, PLAYER_EYE_HEIGHT, PLAYER_MAX_HP,
  PLAYER_SNEAK_EYE_HEIGHT, RECONNECT_GRACE_MS, SMOKE_DURATION, SMOKE_FUSE,
  SMOKE_RADIUS, SNIPER_CRATE_CHANCE, SPRINT_SPEED,
  RECIPES, Recipe, RESOURCE_NODE_CHARGES, RESOURCE_YIELD, ROUNDS_PER_MATCH,
  MAX_SUDDEN_DEATH_ROUNDS, ROUND_END_SCOREBOARD_SECS, SERVER_TICK_HZ,
  SNAPSHOT_HZ, THROW_ORDER, THROW_WEAPON, ThrowKind, WEAPONS, WeaponType, AmmoType,
} from '@shared/constants';
import { GamePhysics, RapierModule, Vec3 } from '@shared/physics';
import { freshMoveState, MAX_INPUT_DT, MoveState, stepMovement } from '@shared/movement';
import {
  C2S, CombatStats, GameEvent, InputMsg, InventoryState, isCraftMsg, isInputMsg, isJoinMsg,
  isReadyMsg, isStartPracticeMsg, LobbyStateMsg, PickupInfo, PlacementEntry, PlayerInfo, S2C,
  SmokeSnap, SnapPlayer, SnapProjectile, SnapshotMsg, WeaponSlotState,
} from '@shared/protocol';
import { decideMatch, scoreRound } from '@shared/scoring';
import { fogAt, loudPingActiveAt, phaseAt, timeOfDayAt, zoneAt } from '@shared/timeline';
import { buildHeightGrid, sampleHeight } from '@shared/terrain';
import { generateWorld, assignSpawnIndices, CrateTier, WorldGen } from '@shared/worldgen';
import { deriveSeed, mulberry32, pick, Rng } from '@shared/rng';
import {
  BotCtx, BotEnemy, BotMemory, computeBotInput, freshBotMemory,
} from './bot';
import { equipWeapon, grantStarterAmmo, weaponSlotState } from './inventory';

interface Conn {
  socket: Socket;
  id: string;
  name: string;
  ready: boolean;
  token: string;
  connected: boolean;
}

interface Inventory {
  primary: WeaponSlotState | null;
  secondary: WeaponSlotState | null;
  active: 1 | 2 | 3;
  throwables: Record<ThrowKind, number>;
  activeThrow: ThrowKind;
  bandages: number;
  plates: number;
  ammo: Record<AmmoType, number>;
  mats: { wood: number; stone: number; fiber: number };
}

interface SmokeCloud {
  id: number;
  x: number; y: number; z: number;
  radius: number;
  bornAt: number;
  expiresAt: number;
}

interface MatchPlayer {
  id: string;
  name: string;
  isBot: boolean;
  connected: boolean;
  alive: boolean;
  hp: number;
  move: MoveState;
  yaw: number;
  pitch: number;
  aiming: boolean;
  lastSeq: number;
  inputs: InputMsg[];
  prevInteract: boolean;
  prevFire: boolean;
  inv: Inventory;
  cooldownUntil: number;
  reloadUntil: number;   // 0 = not reloading
  bandageBusyUntil: number;
  healRemaining: number;
  craftDoneAt: number;
  craftRecipe: Recipe | null;
  harvestNodeId: number;
  harvestProgress: number;
  lastDamagedBy: {
    id: string; at: number; weapon: WeaponType; headshot: boolean; amount: number; distance: number;
  } | null;
  lastDamageDealtAt: number;
  kills: number;
  zoneDamageAcc: number;
  deathTick: number; // for double-KO grouping
  stats: CombatStats;
  /** Round time cooking started (frag held with a pulled pin), or null. */
  cookingSince: number | null;
  /** Round time until which a flashbang keeps this player blinded (bots read it). */
  blindUntil: number;
}

interface Projectile {
  id: number;
  kind: 'arrow' | 'grenade' | 'smoke' | 'flash';
  owner: string;
  pos: Vec3;
  vel: Vec3;
  bornAt: number;
  fuseAt: number; // grenades/smoke/flash detonation time
}

interface AddPickupOptions {
  amount?: number;
  fixedId?: string;
  weaponMag?: number;
}

export interface GameRoomOptions {
  timeScale?: number; // accelerates the round clock (tests)
}

const dist2d = (ax: number, az: number, bx: number, bz: number) => Math.hypot(ax - bx, az - bz);

// ---------- exported pure helpers (unit-tested; used by the room below) ----------

/** Does the segment from→to pass through the sphere at center with radius? */
export function segmentThroughSphere(from: Vec3, to: Vec3, center: Vec3, radius: number): boolean {
  const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  const len2 = dx * dx + dy * dy + dz * dz;
  const px = center.x - from.x, py = center.y - from.y, pz = center.z - from.z;
  const k = len2 > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy + pz * dz) / len2)) : 0;
  const cx = px - dx * k, cy = py - dy * k, cz = pz - dz * k;
  return cx * cx + cy * cy + cz * cz <= radius * radius;
}

/**
 * Flashbang blind intensity 0..1 from distance and facing (§F2).
 * facing = cos of the angle between the view direction and the direction to
 * the pop; a back-turned player keeps only FLASH_BACK_FACTOR of the effect.
 */
export function flashIntensityAt(dist: number, facing: number): number {
  if (dist > FLASH_RADIUS) return 0;
  const facingFactor = FLASH_BACK_FACTOR + (1 - FLASH_BACK_FACTOR) * Math.max(0, Math.min(1, facing));
  return Math.min(1, (1 - dist / FLASH_RADIUS) * 1.25) * facingFactor;
}

/** Fuse left on a cooked frag released at time t (§F3): never below the safety floor. */
export function cookRemainingFuse(t: number, cookingSince: number): number {
  return Math.max(GRENADE_MIN_THROW_FUSE, GRENADE_FUSE - (t - cookingSince));
}

/** Next owned throwable after `current` in frag→smoke→flash order, or current if alone. */
export function nextOwnedThrow(current: ThrowKind, counts: Record<ThrowKind, number>): ThrowKind {
  const start = THROW_ORDER.indexOf(current);
  for (let step = 1; step <= THROW_ORDER.length; step++) {
    const kind = THROW_ORDER[(start + step) % THROW_ORDER.length];
    if (counts[kind] > 0) return kind;
  }
  return current;
}

export class GameRoom {
  private io: Server;
  private R: RapierModule;
  private conns = new Map<string, Conn>();
  private hostId: string | null = null;
  private disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private timeScale: number;

  // ----- match state -----
  private inMatch = false;
  private seed = 0;
  private n = 0;
  private gen!: WorldGen;
  private phys!: GamePhysics;
  private players = new Map<string, MatchPlayer>();
  private round = 0;
  private suddenDeathRounds = 0;
  private totals = new Map<string, number>();
  private roundActive = false;
  private t = 0; // round clock, s (scaled)
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private roundTransitionHandle: ReturnType<typeof setTimeout> | null = null;
  private lastTickAt = 0;
  private snapshotAcc = 0;
  private tickCounter = 0;

  private pickups = new Map<string, PickupInfo>();
  private pickupSeq = 0;
  private nodeCharges = new Map<number, number>();
  private projectiles = new Map<number, Projectile>();
  private projSeq = 0;
  private pings = new Map<string, { x: number; z: number; until: number }>();
  private smokes = new Map<number, SmokeCloud>();
  private smokeSeq = 0;
  private practice = false;
  private botDifficulty: BotDifficulty = 'normal';
  private botMems = new Map<string, BotMemory>();
  private matchRoster: PlayerInfo[] = [];
  private care: { state: 'none' | 'incoming' | 'landed'; x: number; z: number; landsAt: number } =
    { state: 'none', x: 0, z: 0, landsAt: 0 };
  private careSpawned = false;
  private eliminationGroups: string[][] = [];
  private lootRng: Rng = mulberry32(1);
  private combatRng: Rng = mulberry32(2);
  private zoneTierAnnounced = 0;
  private currentSpawns: Record<string, number> = {};
  private currentSuddenDeath = false;
  private matchStats = new Map<string, CombatStats>();

  constructor(io: Server, rapier: RapierModule, opts: GameRoomOptions = {}) {
    this.io = io;
    this.R = rapier;
    this.timeScale = opts.timeScale ?? Number(process.env.TIME_SCALE ?? 1);
    io.on('connection', (socket) => this.onConnection(socket));
  }

  // =============================== lobby ===============================

  private onConnection(socket: Socket): void {
    socket.on(C2S.join, (msg: unknown) => {
      if (!isJoinMsg(msg)) return socket.emit(S2C.joinError, { reason: 'bad join message' });
      const resumed = msg.resumeToken
        ? [...this.conns.values()].find((conn) => conn.token === msg.resumeToken)
        : undefined;
      if (resumed) {
        if (resumed.connected && resumed.socket.id !== socket.id) {
          return socket.emit(S2C.joinError, { reason: 'Diese Sitzung ist bereits verbunden' });
        }
        const timer = this.disconnectTimers.get(resumed.id);
        if (timer) clearTimeout(timer);
        this.disconnectTimers.delete(resumed.id);
        resumed.socket = socket;
        resumed.connected = true;
        socket.data.playerId = resumed.id;
        const player = this.players.get(resumed.id);
        if (player) { player.connected = true; player.inputs = []; }
        socket.emit(S2C.session, {
          playerId: resumed.id, resumeToken: resumed.token, resumed: true,
          reconnectGraceMs: RECONNECT_GRACE_MS,
        });
        if (this.inMatch) this.resumeMatchFor(resumed);
        this.io.emit(S2C.connectionNotice, { type: 'reconnected', playerId: resumed.id });
        this.broadcastLobby();
        return;
      }
      if (this.inMatch) return socket.emit(S2C.joinError, { reason: 'Match läuft — Lobby ist gesperrt' });
      if (this.conns.size >= MAX_PLAYERS) return socket.emit(S2C.joinError, { reason: 'Lobby voll (max 5)' });
      const id = randomBytes(8).toString('hex');
      const conn: Conn = {
        socket, id, name: msg.name.trim().slice(0, 16) || 'Player', ready: false,
        token: randomBytes(24).toString('hex'), connected: true,
      };
      socket.data.playerId = id;
      this.conns.set(id, conn);
      if (!this.hostId) this.hostId = id;
      socket.emit(S2C.session, {
        playerId: id, resumeToken: conn.token, resumed: false,
        reconnectGraceMs: RECONNECT_GRACE_MS,
      });
      this.broadcastLobby();
    });

    socket.on(C2S.setReady, (msg: unknown) => {
      const c = this.connFor(socket);
      if (!c || !isReadyMsg(msg) || this.inMatch) return;
      c.ready = msg.ready;
      this.broadcastLobby();
    });

    socket.on(C2S.startMatch, () => {
      if (socket.data.playerId !== this.hostId || this.inMatch) return;
      if (!this.canStart()) return;
      this.startMatch();
    });

    socket.on(C2S.startPractice, (msg: unknown) => {
      if (socket.data.playerId !== this.hostId || this.inMatch) return;
      if (!isStartPracticeMsg(msg)) return;
      this.startPractice(msg.bots, msg.difficulty);
    });

    socket.on(C2S.input, (msg: unknown) => {
      if (!this.inMatch || !isInputMsg(msg)) return;
      const p = this.players.get(socket.data.playerId as string);
      if (!p || !p.connected) return;
      if (p.inputs.length < 12) p.inputs.push(msg);
    });

    socket.on(C2S.craft, (msg: unknown) => {
      if (!this.inMatch || !isCraftMsg(msg)) return;
      this.tryCraft(socket.data.playerId as string, msg.recipe);
    });

    socket.on(C2S.useBandage, () => {
      if (this.inMatch) this.tryBandage(socket.data.playerId as string);
    });

    socket.on(C2S.rematch, () => {
      const c = this.connFor(socket);
      if (c && !this.inMatch) { c.ready = true; this.broadcastLobby(); }
    });

    socket.on(C2S.pingProbe, (sent: unknown, ack: unknown) => {
      if (typeof sent === 'number' && typeof ack === 'function') (ack as (value: number) => void)(sent);
    });
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private connFor(socket: Socket): Conn | undefined {
    const id = socket.data.playerId;
    return typeof id === 'string' ? this.conns.get(id) : undefined;
  }

  private handleDisconnect(socket: Socket): void {
    const c = this.connFor(socket);
    if (!c || c.socket.id !== socket.id) return;
    c.connected = false;
    const p = this.players.get(c.id);
    if (!this.inMatch || !p) {
      this.conns.delete(c.id);
      this.migrateHost(c.id);
      this.broadcastLobby();
      return;
    }
    p.connected = false;
    p.inputs = [];
    this.io.emit(S2C.connectionNotice, { type: 'lost', playerId: c.id, graceMs: RECONNECT_GRACE_MS });
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(c.id);
      if (c.connected) return;
      this.conns.delete(c.id);
      if (p.alive && this.roundActive) this.kill(p, null, 'zone');
      this.migrateHost(c.id);
      // bots keep `connected` forever — a match must end when the humans are gone
      const humansInMatch = [...this.players.values()].filter((q) => q.connected && !q.isBot).length;
      if (humansInMatch < 1 || (!this.practice && humansInMatch < 2)) this.endMatchEarly();
      this.broadcastLobby();
    }, RECONNECT_GRACE_MS);
    this.disconnectTimers.set(c.id, timer);
    this.broadcastLobby();
  }

  private migrateHost(oldHost: string): void {
    if (this.hostId !== oldHost) return;
    this.hostId = [...this.conns.values()].find((conn) => conn.connected)?.id ?? null;
    if (this.hostId) this.io.emit(S2C.connectionNotice, { type: 'hostChanged', playerId: this.hostId });
  }

  private canStart(): boolean {
    if (this.conns.size < MIN_PLAYERS || this.conns.size > MAX_PLAYERS) return false;
    for (const c of this.conns.values()) if (!c.connected || (!c.ready && c.id !== this.hostId)) return false;
    return true;
  }

  private lobbyState(): LobbyStateMsg {
    return {
      players: [...this.conns.values()].map((c): PlayerInfo => ({
        id: c.id, name: c.name, ready: c.ready || c.id === this.hostId,
        isHost: c.id === this.hostId, connected: c.connected,
      })),
      maxPlayers: MAX_PLAYERS,
      inMatch: this.inMatch,
      canStart: this.canStart(),
    };
  }

  private broadcastLobby(): void {
    const state = this.lobbyState();
    for (const conn of this.conns.values()) if (conn.connected) conn.socket.emit(S2C.lobbyState, state);
  }

  // =============================== match ===============================

  private startMatch(): void {
    this.beginMatch(
      [...this.conns.values()].map((c) => ({ id: c.id, name: c.name, bot: false })),
      false,
    );
  }

  /** Solo practice (§F4): every connected lobby human + K tactical bots. */
  private startPractice(botCount: number, difficulty: BotDifficulty): void {
    const humans = [...this.conns.values()].filter((c) => c.connected);
    if (humans.length < 1) return;
    const bots = Math.min(botCount, MAX_PRACTICE_BOTS, MAX_PLAYERS - humans.length);
    if (bots < 1) return;
    this.botDifficulty = difficulty;
    const participants = [
      ...humans.map((c) => ({ id: c.id, name: c.name, bot: false })),
      ...Array.from({ length: bots }, (_, k) => ({ id: `bot-${k}`, name: BOT_NAMES[k], bot: true })),
    ];
    this.beginMatch(participants, true);
  }

  private beginMatch(
    participants: { id: string; name: string; bot: boolean }[], practice: boolean,
  ): void {
    this.inMatch = true;
    this.practice = practice;
    this.seed = randomBytes(4).readUInt32LE(0); // rematch => fresh, OS-backed seed
    this.n = participants.length;
    this.gen = generateWorld(this.seed, this.n);
    const grid = buildHeightGrid(this.gen.params);
    this.phys = new GamePhysics(this.R, this.gen, grid);
    this.round = 0;
    this.suddenDeathRounds = 0;
    this.totals = new Map();
    this.players = new Map();
    this.matchStats = new Map();
    this.botMems.clear();
    this.botRng = mulberry32(deriveSeed(this.seed, 'bot-brain'));
    const botRng = mulberry32(deriveSeed(this.seed, 'bots'));
    for (const part of participants) {
      this.totals.set(part.id, 0);
      this.players.set(part.id, this.freshMatchPlayer(part.id, part.name, part.bot));
      this.matchStats.set(part.id, this.freshStats());
      this.phys.addPlayer(part.id, { x: 0, y: 20, z: 0 });
      if (part.bot) this.botMems.set(part.id, freshBotMemory(mulberry32(deriveSeed(this.seed, `bot-${part.id}-${botRng()}`))));
    }
    this.matchRoster = participants.map((part): PlayerInfo => ({
      id: part.id, name: part.name, ready: true,
      isHost: part.id === this.hostId, connected: true,
    }));
    this.io.emit(S2C.matchStart, {
      n: this.n, seed: this.seed, players: this.matchRoster,
      ...(practice ? { practice: true } : {}),
    });
    this.broadcastLobby(); // now locked
    this.startRound(false);
    this.lastTickAt = Date.now();
    this.tickHandle = setInterval(() => this.tick(), 1000 / SERVER_TICK_HZ);
  }

  private freshMatchPlayer(id: string, name: string, isBot = false): MatchPlayer {
    return {
      id, name, isBot, connected: true, alive: true, hp: PLAYER_MAX_HP,
      move: freshMoveState({ x: 0, y: 20, z: 0 }), yaw: 0, pitch: 0, aiming: false,
      lastSeq: 0, inputs: [], prevInteract: false, prevFire: false,
      inv: this.freshInventory(),
      cooldownUntil: 0, reloadUntil: 0, bandageBusyUntil: 0, healRemaining: 0,
      craftDoneAt: 0, craftRecipe: null, harvestNodeId: -1, harvestProgress: 0,
      lastDamagedBy: null, lastDamageDealtAt: -1, kills: 0, zoneDamageAcc: 0, deathTick: -1,
      stats: this.freshStats(),
      cookingSince: null, blindUntil: 0,
    };
  }

  private freshStats(): CombatStats {
    return { kills: 0, damageDealt: 0, damageTaken: 0, shotsFired: 0, hits: 0, headshots: 0, pickups: 0 };
  }

  private freshInventory(): Inventory {
    return {
      primary: null, secondary: null, active: 1,
      throwables: { frag: 0, smoke: 0, flash: 0 }, activeThrow: 'frag',
      bandages: 0, plates: 0,
      ammo: { arrow: 0, pistol: 0, rifle: 0, shell: 0, sniper: 0 },
      mats: { wood: 0, stone: 0, fiber: 0 },
    };
  }

  private startRound(suddenDeath: boolean): void {
    this.round += 1;
    if (suddenDeath) this.suddenDeathRounds += 1;
    this.roundActive = false; // no pickupSpawn events while placing initial loot
    this.t = 0;
    this.snapshotAcc = 0;
    this.tickCounter = 0;
    this.eliminationGroups = [];
    this.placedIds.clear();
    this.projectiles.clear();
    this.pings.clear();
    this.pickups.clear();
    this.smokes.clear();
    this.zoneTierAnnounced = 0;
    this.currentSuddenDeath = suddenDeath;
    this.care = { state: 'none', x: this.gen.carePackagePos.x, z: this.gen.carePackagePos.z, landsAt: 0 };
    this.careSpawned = false;
    this.lootRng = mulberry32((this.seed ^ (this.round * 0x9e3779b9)) >>> 0);
    this.combatRng = mulberry32(deriveSeed(this.seed, `combat-round-${this.round}`));

    // reset resource nodes
    this.nodeCharges.clear();
    for (const v of this.gen.vegetation) this.nodeCharges.set(v.id, RESOURCE_NODE_CHARGES);

    // spawn assignment: N of the 5 ring POIs (§3)
    const ids = [...this.players.keys()];
    const spawnIdx = assignSpawnIndices(this.seed, this.round, ids);
    const spawnRecord: Record<string, number> = {};
    for (const [id, p] of this.players) {
      const idx = spawnIdx.get(id) ?? 0;
      spawnRecord[id] = idx;
      const sp = this.gen.spawns[idx];
      const y = sampleHeight(this.gen.params, sp.x, sp.z) + 0.3;
      p.alive = p.connected;
      p.hp = PLAYER_MAX_HP;
      p.move = freshMoveState({ x: sp.x, y, z: sp.z });
      p.aiming = false;
      p.inv = this.freshInventory();
      p.inputs = [];
      p.cooldownUntil = 0; p.reloadUntil = 0; p.bandageBusyUntil = 0; p.healRemaining = 0;
      p.craftDoneAt = 0; p.craftRecipe = null;
      p.harvestNodeId = -1; p.harvestProgress = 0;
      p.lastDamagedBy = null; p.lastDamageDealtAt = -1; p.zoneDamageAcc = 0; p.deathTick = -1;
      p.stats = this.freshStats();
      p.cookingSince = null;
      p.blindUntil = 0;
      this.phys.setPlayerSneaking(id, false, p.move.pos);
      this.phys.setPlayerPos(id, p.move.pos);
      if (!p.connected) this.eliminationGroups.push([id]); // disconnected: eliminated at start
      const mem = this.botMems.get(id);
      if (mem) {
        this.botMems.set(id, freshBotMemory(mulberry32(deriveSeed(this.seed, `bot-${id}-r${this.round}`))));
      }
    }
    this.currentSpawns = spawnRecord;

    // loot: spawn-floor items (§5.3) + crates (§3)
    for (const gi of this.gen.spawnFloorItems) this.addPickup(gi.item, gi.x, gi.z, { fixedId: gi.id });
    for (const c of this.gen.crates) {
      this.pickups.set(c.id, {
        id: c.id, item: 'crate', tier: c.tier, x: c.x,
        y: sampleHeight(this.gen.params, c.x, c.z), z: c.z,
      });
    }

    const totals: Record<string, number> = {};
    for (const [id, v] of this.totals) totals[id] = v;
    this.roundActive = true;
    this.io.emit(S2C.roundStart, {
      round: this.round, suddenDeath, spawns: spawnRecord, totals,
      pickups: [...this.pickups.values()],
    });
    // everyone gets a fresh (empty) inventory
    for (const p of this.players.values()) this.pushInventory(p);
  }

  private resumeMatchFor(conn: Conn): void {
    conn.socket.emit(S2C.matchStart, {
      n: this.n, seed: this.seed, players: this.matchRoster,
      ...(this.practice ? { practice: true } : {}),
    });
    const totals: Record<string, number> = {};
    for (const [id, value] of this.totals) totals[id] = value;
    conn.socket.emit(S2C.roundStart, {
      round: this.round, suddenDeath: this.currentSuddenDeath,
      spawns: this.currentSpawns, totals, pickups: [...this.pickups.values()],
    });
    const player = this.players.get(conn.id);
    if (player) this.pushInventory(player);
    conn.socket.emit(S2C.snapshot, this.buildSnapshot());
  }

  // =============================== tick ===============================

  private tick(): void {
    const now = Date.now();
    const rawDt = Math.min(0.25, (now - this.lastTickAt) / 1000);
    this.lastTickAt = now;
    const dt = rawDt * this.timeScale; // scaled round clock
    if (!this.roundActive) return;
    this.t += dt;
    this.tickCounter += 1;

    const events: GameEvent[] = [];

    this.tickBots();
    for (const p of this.players.values()) this.processPlayerInputs(p, events);
    this.phys.step();

    this.updateProjectiles(rawDt, events);
    this.updateZoneDamage(dt, events);
    this.updateHealsAndTimers(dt, events);
    this.updateSmokes();
    this.updateCarePackage(events);
    this.updatePickupsWalkover(events);
    this.updatePings();
    this.announceZoneSteps(events);

    this.flushDeaths(events);
    if (events.length) this.io.emit(S2C.event, events);

    this.snapshotAcc += rawDt;
    if (this.snapshotAcc >= 1 / SNAPSHOT_HZ) {
      this.snapshotAcc = 0;
      this.io.emit(S2C.snapshot, this.buildSnapshot());
    }

    this.checkRoundEnd();
  }

  private processPlayerInputs(p: MatchPlayer, events: GameEvent[]): void {
    const queue = p.inputs;
    p.inputs = [];
    if (!p.alive || !p.connected) return;
    for (const inp of queue) {
      p.yaw = inp.yaw;
      p.pitch = inp.pitch;
      p.aiming = inp.aim;
      p.lastSeq = inp.seq;
      stepMovement(this.phys, p.id, p.move, inp);

      if (inp.slot && inp.slot !== p.inv.active) {
        // switching away from a cooking frag commits the throw (pin is pulled)
        if (p.cookingSince !== null) this.releaseCookedFrag(p);
        p.inv.active = inp.slot;
        if (inp.slot === 3) this.ensureOwnedThrow(p);
        this.cancelReload(p, false);
        this.pushInventory(p);
      }
      if (inp.throwCycle && p.inv.active === 3 && p.cookingSince === null) {
        this.cycleThrow(p);
      }
      if (p.reloadUntil > 0 && inp.sprint && p.move.sprinting) this.cancelReload(p);
      if (inp.reload) this.tryReload(p);
      if (p.inv.active === 3) this.handleThrowable(p, inp);
      else if (inp.fire) this.tryFire(p, events);
      this.handleInteract(p, inp, events);
      p.prevFire = inp.fire;
      p.prevInteract = inp.interact;
    }
  }

  // =============================== throwables (§F2/F3) ===============================

  /** Slot 3 selects the first owned throwable so the HUD never shows an empty hand. */
  private ensureOwnedThrow(p: MatchPlayer): void {
    if (p.inv.throwables[p.inv.activeThrow] > 0) return;
    const owned = THROW_ORDER.find((kind) => p.inv.throwables[kind] > 0);
    if (owned) p.inv.activeThrow = owned;
  }

  private cycleThrow(p: MatchPlayer): void {
    const next = nextOwnedThrow(p.inv.activeThrow, p.inv.throwables);
    if (next !== p.inv.activeThrow) {
      p.inv.activeThrow = next;
      this.pushInventory(p);
    }
  }

  /**
   * Fire edges on slot 3. Frag: press pulls the pin (cooking starts, §F3),
   * release throws with the remaining fuse. Smoke/flash: press throws directly.
   */
  private handleThrowable(p: MatchPlayer, inp: InputMsg): void {
    const kind = p.inv.activeThrow;
    const rising = inp.fire && !p.prevFire;
    const falling = !inp.fire && p.prevFire;

    if (kind === 'frag') {
      if (rising && p.cookingSince === null
        && p.inv.throwables.frag > 0
        && this.t >= p.cooldownUntil && this.t >= p.bandageBusyUntil) {
        p.inv.throwables.frag -= 1; // pin pulled: the grenade is committed
        p.cookingSince = this.t;
        this.pushInventory(p);
      } else if (falling && p.cookingSince !== null) {
        this.releaseCookedFrag(p);
      }
      return;
    }

    if (rising && p.inv.throwables[kind] > 0
      && this.t >= p.cooldownUntil && this.t >= p.bandageBusyUntil) {
      p.inv.throwables[kind] -= 1;
      p.cooldownUntil = this.t + WEAPONS[THROW_WEAPON[kind]].cooldown;
      this.spawnProjectile(kind, p);
      this.ensureOwnedThrow(p);
      this.pushInventory(p);
      this.notifyLoud(p, WEAPONS[THROW_WEAPON[kind]].loud);
    }
  }

  /** Throw the currently cooking frag with whatever fuse is left. */
  private releaseCookedFrag(p: MatchPlayer): void {
    if (p.cookingSince === null) return;
    const remaining = cookRemainingFuse(this.t, p.cookingSince);
    p.cookingSince = null;
    p.cooldownUntil = this.t + WEAPONS.grenade.cooldown;
    this.spawnProjectile('grenade', p, remaining);
    this.ensureOwnedThrow(p);
    this.pushInventory(p);
    this.notifyLoud(p, WEAPONS.grenade.loud);
  }

  /** Held past the fuse: the frag detonates in hand for full self damage. */
  private checkCookout(p: MatchPlayer, events: GameEvent[]): void {
    if (p.cookingSince === null || this.t - p.cookingSince < GRENADE_FUSE) return;
    p.cookingSince = null;
    const chest = { x: p.move.pos.x, y: p.move.pos.y + 0.9, z: p.move.pos.z };
    events.push({ type: 'cookout', by: p.id, x: chest.x, y: chest.y, z: chest.z });
    this.explode({
      id: -1, kind: 'grenade', owner: p.id, pos: chest,
      vel: { x: 0, y: 0, z: 0 }, bornAt: this.t, fuseAt: this.t,
    }, events);
    this.ensureOwnedThrow(p);
    this.pushInventory(p);
  }

  // =============================== combat ===============================

  private activeWeapon(p: MatchPlayer): { type: WeaponType; slotState: WeaponSlotState | null } {
    if (p.inv.active === 3) return { type: THROW_WEAPON[p.inv.activeThrow], slotState: null };
    const s = p.inv.active === 1 ? p.inv.primary : p.inv.secondary;
    return s ? { type: s.type, slotState: s } : { type: 'fists', slotState: null };
  }

  private eyePos(p: MatchPlayer): Vec3 {
    const height = p.move.sneaking ? PLAYER_SNEAK_EYE_HEIGHT : PLAYER_EYE_HEIGHT;
    return { x: p.move.pos.x, y: p.move.pos.y + height, z: p.move.pos.z };
  }

  private viewDir(p: MatchPlayer): Vec3 {
    const cp = Math.cos(p.pitch);
    return { x: -Math.sin(p.yaw) * cp, y: Math.sin(p.pitch), z: -Math.cos(p.yaw) * cp };
  }

  private tryFire(p: MatchPlayer, events: GameEvent[]): void {
    if (this.t < p.cooldownUntil || this.t < p.bandageBusyUntil) return;
    if (p.reloadUntil > 0) this.cancelReload(p); // firing intentionally interrupts reload
    const { type, slotState } = this.activeWeapon(p);
    const def = WEAPONS[type];

    if (def.kind === 'melee') {
      p.cooldownUntil = this.t + def.cooldown;
      events.push({ type: 'melee', by: p.id, weapon: type });
      this.meleeAttack(p, type, events);
      return;
    }

    // ranged weapons need ammo in the mag
    if (!slotState) return;
    if (def.kind === 'projectile') { // bow: mag = nocked arrows, draws from arrow pool
      if (p.inv.ammo.arrow <= 0) return;
      p.inv.ammo.arrow -= 1;
      p.stats.shotsFired += 1;
      p.cooldownUntil = this.t + def.cooldown;
      this.spawnProjectile('arrow', p);
      this.pushInventory(p);
      const o = this.eyePos(p), d = this.viewDir(p);
      events.push({ type: 'shot', by: p.id, weapon: type, ox: o.x, oy: o.y, oz: o.z, dx: d.x, dy: d.y, dz: d.z, primary: true });
      return;
    }

    // hitscan
    if (slotState.mag <= 0) { this.tryReload(p); return; }
    slotState.mag -= 1;
    p.stats.shotsFired += def.pellets ?? 1;
    p.cooldownUntil = this.t + def.cooldown;
    this.hitscanShot(p, type, events);
    this.pushInventory(p);
    this.notifyLoud(p, def.loud);
    if (slotState.mag === 0) this.tryReload(p);
  }

  private notifyLoud(p: MatchPlayer, loud: boolean): void {
    // ping-on-loud (§6.2): only while there is still daylight
    if (loud && loudPingActiveAt(this.t)) {
      this.pings.set(p.id, { x: p.move.pos.x, z: p.move.pos.z, until: this.t + LOUD_PING_SECONDS });
    }
  }

  private meleeAttack(p: MatchPlayer, weapon: WeaponType, events: GameEvent[]): void {
    const def = WEAPONS[weapon];
    const dir = this.viewDir(p);
    const eye = this.eyePos(p);
    for (const q of this.players.values()) {
      if (q.id === p.id || !q.alive) continue;
      const to = {
        x: q.move.pos.x - p.move.pos.x,
        y: (q.move.pos.y + 0.9) - eye.y,
        z: q.move.pos.z - p.move.pos.z,
      };
      const d = Math.hypot(to.x, to.y, to.z);
      if (d > def.range + 0.4) continue;
      const dot = (to.x * dir.x + to.y * dir.y + to.z * dir.z) / (d || 1);
      if (dot < MELEE_CONE_COS) continue;
      // line of sight (walls block melee through cover)
      const los = this.phys.raycast(eye, { x: to.x / d, y: to.y / d, z: to.z / d }, d + 0.5, [p.id]);
      if (los && los.playerId !== q.id && los.dist < d - 0.2) continue;
      this.applyDamage(q, p, def.damage, weapon, 'weapon', events, false);
      break; // melee hits one target
    }
  }

  private hitscanShot(p: MatchPlayer, weapon: WeaponType, events: GameEvent[]): void {
    const def = WEAPONS[weapon];
    const eye = this.eyePos(p);
    const base = this.viewDir(p);
    const pellets = def.pellets ?? 1;
    const moveFactor = Math.min(1, Math.hypot(p.move.velX, p.move.velZ) / SPRINT_SPEED)
      * (p.move.sneaking ? 0.35 : 1);
    const spread = ((p.aiming ? def.aimSpread : def.hipSpread) ?? 0)
      + (def.moveSpread ?? 0) * moveFactor;
    for (let i = 0; i < pellets; i++) {
      let dir = base;
      if (spread > 0) {
        dir = normalize({
          x: base.x + (this.combatRng() - 0.5) * 2 * spread,
          y: base.y + (this.combatRng() - 0.5) * 2 * spread,
          z: base.z + (this.combatRng() - 0.5) * 2 * spread
        });
      }
      const hit = this.phys.raycast(eye, dir, def.range, [p.id]);
      const ev: GameEvent = {
        type: 'shot', by: p.id, weapon,
        ox: eye.x, oy: eye.y, oz: eye.z, dx: dir.x, dy: dir.y, dz: dir.z,
        primary: i === 0,
      };
      if (hit) { ev.hx = hit.point.x; ev.hy = hit.point.y; ev.hz = hit.point.z; }
      if (i === 0 || (hit && hit.playerId)) events.push(ev);
      if (hit?.playerId) {
        const target = this.players.get(hit.playerId);
        // an active smoke cloud on the bullet path blocks the hit (§F2)
        if (target?.alive && !this.smokeBlocks(eye, hit.point)) {
          let dmg = def.damage;
          const fs = def.falloffStart ?? Infinity;
          const fe = def.falloffEnd ?? Infinity;
          if (hit.dist > fs) {
            const k = Math.min(1, (hit.dist - fs) / Math.max(0.01, fe - fs));
            dmg *= 1 - 0.65 * k; // down to 35 % at falloffEnd
          }
          const headshot = isHeadshotHeight(target.move.pos.y, target.move.sneaking, hit.point.y);
          if (headshot) dmg *= 1.65;
          this.applyDamage(target, p, dmg, weapon, 'weapon', events, headshot);
        }
      }
    }
  }

  private spawnProjectile(
    kind: Projectile['kind'], p: MatchPlayer, fuseOverride?: number,
  ): void {
    const weapon: WeaponType = kind === 'arrow' ? 'bow'
      : kind === 'smoke' ? 'smoke' : kind === 'flash' ? 'flash' : 'grenade';
    const def = WEAPONS[weapon];
    const dir = this.viewDir(p);
    const eye = this.eyePos(p);
    const speed = def.projectileSpeed ?? 20;
    const lob = kind === 'arrow' ? 0 : 3; // thrown canisters get an arc
    const vel = { x: dir.x * speed, y: dir.y * speed + lob, z: dir.z * speed };
    const defaultFuse = kind === 'smoke' ? SMOKE_FUSE : kind === 'flash' ? FLASH_FUSE : GRENADE_FUSE;
    const id = this.projSeq++;
    this.projectiles.set(id, {
      id, kind, owner: p.id,
      pos: { x: eye.x + dir.x * 0.6, y: eye.y + dir.y * 0.6, z: eye.z + dir.z * 0.6 },
      vel, bornAt: this.t, fuseAt: this.t + (fuseOverride ?? defaultFuse),
    });
  }

  private updateProjectiles(dt: number, events: GameEvent[]): void {
    for (const pr of [...this.projectiles.values()]) {
      if (pr.kind !== 'arrow' && this.t >= pr.fuseAt) {
        if (pr.kind === 'grenade') this.explode(pr, events);
        else if (pr.kind === 'smoke') this.popSmoke(pr, events);
        else this.popFlash(pr, events);
        this.projectiles.delete(pr.id);
        continue;
      }
      const gravity = pr.kind === 'arrow' ? 9.8 : 18;
      pr.vel.y -= gravity * dt;
      const stepLen = Math.hypot(pr.vel.x, pr.vel.y, pr.vel.z) * dt;
      if (stepLen > 0.0001) {
        const dir = normalize(pr.vel);
        const graceOwner = this.t - pr.bornAt < 0.25 ? [pr.owner] : [];
        const hit = this.phys.raycast(pr.pos, dir, stepLen, graceOwner);
        if (hit) {
          if (pr.kind === 'arrow') {
            const target = hit.playerId ? this.players.get(hit.playerId) : null;
            if (target?.alive) {
              const owner = this.players.get(pr.owner);
              const def = WEAPONS.bow;
              const headshot = isHeadshotHeight(target.move.pos.y, target.move.sneaking, hit.point.y);
              const dmg = headshot ? (def.headshotDamage ?? def.damage) : def.damage;
              if (owner) this.applyDamage(target, owner, dmg, 'bow', 'weapon', events, headshot);
            } else {
              // arrows stick in the world and can be collected (§4.3)
              this.addPickup('arrowBundle', hit.point.x, hit.point.z, { amount: 1 });
            }
            this.projectiles.delete(pr.id);
            continue;
          } else {
            // grenade bounce
            pr.pos = {
              x: hit.point.x - dir.x * 0.05,
              y: hit.point.y - dir.y * 0.05,
              z: hit.point.z - dir.z * 0.05,
            };
            pr.vel = { x: pr.vel.x * 0.4, y: -pr.vel.y * 0.35, z: pr.vel.z * 0.4 };
            if (Math.abs(pr.vel.y) < 1.2) pr.vel.y = 0;
            continue;
          }
        }
        pr.pos.x += pr.vel.x * dt; pr.pos.y += pr.vel.y * dt; pr.pos.z += pr.vel.z * dt;
      }
      if (pr.kind === 'arrow' && this.t - pr.bornAt > 8) {
        this.addPickup('arrowBundle', pr.pos.x, pr.pos.z, { amount: 1 });
        this.projectiles.delete(pr.id);
      }
      if (pr.pos.y < -20) this.projectiles.delete(pr.id);
    }
  }

  private explode(pr: Projectile, events: GameEvent[]): void {
    events.push({ type: 'explosion', x: pr.pos.x, y: pr.pos.y, z: pr.pos.z, radius: GRENADE_RADIUS });
    const owner = this.players.get(pr.owner) ?? null;
    for (const q of this.players.values()) {
      if (!q.alive) continue;
      const chest = { x: q.move.pos.x, y: q.move.pos.y + 0.9, z: q.move.pos.z };
      const d = Math.hypot(chest.x - pr.pos.x, chest.y - pr.pos.y, chest.z - pr.pos.z);
      if (d > GRENADE_RADIUS) continue;
      // terrain/walls block the blast (ray past all players). Smoke deliberately
      // does NOT block shrapnel — it stops sightlines, not fragments.
      // d ≈ 0 is a hand detonation (cook-out, §F3): always full damage.
      if (d > 0.05) {
        const dir = normalize({ x: chest.x - pr.pos.x, y: chest.y - pr.pos.y, z: chest.z - pr.pos.z });
        const block = this.phys.raycast(pr.pos, dir, d, [...this.players.keys()]);
        if (block && block.dist < d - 0.3) continue;
      }
      const dmg = WEAPONS.grenade.damage * (1 - d / GRENADE_RADIUS);
      this.applyDamage(q, owner, Math.max(5, dmg), 'grenade', 'grenade', events, false);
    }
  }

  // =============================== smoke & flash (§F2) ===============================

  private popSmoke(pr: Projectile, events: GameEvent[]): void {
    const id = this.smokeSeq++;
    const cloud: SmokeCloud = {
      id, x: pr.pos.x, y: pr.pos.y + 0.4, z: pr.pos.z,
      radius: SMOKE_RADIUS, bornAt: this.t, expiresAt: this.t + SMOKE_DURATION,
    };
    this.smokes.set(id, cloud);
    events.push({ type: 'smoke', state: 'pop', id, x: cloud.x, y: cloud.y, z: cloud.z, radius: cloud.radius });
  }

  private updateSmokes(): void {
    for (const [id, cloud] of this.smokes) if (this.t >= cloud.expiresAt) this.smokes.delete(id);
  }

  /**
   * True when the segment from→to passes through an active smoke cloud.
   * Host-only sight occlusion: hitscan damage, flash LOS and bot vision all
   * share this test, so smoke behaves identically against humans and bots.
   */
  smokeBlocks(from: Vec3, to: Vec3): boolean {
    for (const cloud of this.smokes.values()) {
      if (segmentThroughSphere(from, to, cloud, cloud.radius)) return true;
    }
    return false;
  }

  private popFlash(pr: Projectile, events: GameEvent[]): void {
    events.push({ type: 'flash', x: pr.pos.x, y: pr.pos.y, z: pr.pos.z });
    for (const q of this.players.values()) {
      if (!q.alive) continue;
      const eye = this.eyePos(q);
      const dx = pr.pos.x - eye.x, dy = pr.pos.y - eye.y, dz = pr.pos.z - eye.z;
      const d = Math.hypot(dx, dy, dz);
      if (d > FLASH_RADIUS) continue;
      // walls and smoke both shield the eyes
      if (d > 0.05) {
        const dir = { x: dx / d, y: dy / d, z: dz / d };
        const block = this.phys.raycast(eye, dir, d, [...this.players.keys()]);
        if (block && block.dist < d - 0.3) continue;
        if (this.smokeBlocks(eye, pr.pos)) continue;
      }
      const view = this.viewDir(q);
      const facing = d > 0.05 ? (view.x * dx + view.y * dy + view.z * dz) / d : 1;
      const intensity = flashIntensityAt(d, facing);
      if (intensity < 0.05) continue;
      const duration = FLASH_MAX_BLIND * intensity;
      q.blindUntil = Math.max(q.blindUntil, this.t + duration);
      this.sendTo(q.id, [{ type: 'flashed', target: q.id, intensity, duration }]);
    }
  }

  private applyDamage(
    target: MatchPlayer, attacker: MatchPlayer | null, amount: number,
    weapon: WeaponType, cause: 'weapon' | 'grenade', events: GameEvent[], headshot: boolean,
  ): void {
    if (!target.alive) return;
    if (target.inv.plates > 0) { // Panzerplatte: −20 % Schaden, 1 Ladung (§4.4)
      amount *= 1 - PLATE_DAMAGE_REDUCTION;
      target.inv.plates -= 1;
      this.pushInventory(target);
    }
    amount = Math.round(amount);
    const applied = Math.min(target.hp, amount);
    target.hp = Math.max(0, target.hp - amount);
    target.healRemaining = 0; // damage interrupts a running heal
    if (attacker && attacker.id !== target.id) {
      const distance = dist2d(attacker.move.pos.x, attacker.move.pos.z, target.move.pos.x, target.move.pos.z);
      target.lastDamagedBy = { id: attacker.id, at: this.t, weapon, headshot, amount: applied, distance };
      attacker.lastDamageDealtAt = this.t;
      attacker.stats.damageDealt += applied;
      const accurateWeapon = WEAPONS[weapon].kind === 'hitscan' || WEAPONS[weapon].kind === 'projectile';
      if (accurateWeapon) attacker.stats.hits += 1;
      if (headshot && accurateWeapon) attacker.stats.headshots += 1;
      this.sendTo(attacker.id, [{ type: 'hitmarker', target: target.id, headshot }]);
    }
    target.stats.damageTaken += applied;
    events.push({ type: 'damage', target: target.id, attacker: attacker?.id ?? null, amount: applied, hp: target.hp, weapon, headshot });
    if (target.hp <= 0) this.kill(target, attacker, cause, weapon);
  }

  private kill(target: MatchPlayer, attacker: MatchPlayer | null, cause: 'weapon' | 'zone' | 'grenade', weapon?: WeaponType): void {
    if (!target.alive) return;
    target.alive = false;
    target.deathTick = this.tickCounter;
    if (attacker && attacker.id !== target.id) { attacker.kills += 1; attacker.stats.kills += 1; }
    // dying with a pulled pin drops the live frag at the feet (§F3)
    if (target.cookingSince !== null) {
      const remaining = cookRemainingFuse(this.t, target.cookingSince);
      target.cookingSince = null;
      const id = this.projSeq++;
      this.projectiles.set(id, {
        id, kind: 'grenade', owner: target.id,
        pos: { x: target.move.pos.x, y: target.move.pos.y + 0.5, z: target.move.pos.z },
        vel: { x: 0, y: 1, z: 0 }, bornAt: this.t, fuseAt: this.t + remaining,
      });
    }
    this.dropInventory(target);
    const recap = target.lastDamagedBy;
    const ev: GameEvent[] = [
      {
        type: 'death', target: target.id, attacker: attacker?.id ?? null, cause, weapon,
        distance: recap?.distance, attackerHp: attacker?.hp, headshot: recap?.headshot,
        finalDamage: recap?.amount,
      },
      { type: 'kill', killer: attacker?.id ?? null, victim: target.id, weapon: cause === 'zone' ? 'zone' : (weapon ?? 'fists') },
    ];
    this.io.emit(S2C.event, ev);
  }

  /** Group deaths for shared placement / double-KO rule (§6.4). */
  private placedIds = new Set<string>();
  private flushDeaths(_events: GameEvent[]): void {
    const dead = [...this.players.values()].filter(
      (p) => !p.alive && p.deathTick >= 0 && !this.placedIds.has(p.id),
    );
    if (dead.length === 0) return;
    // earlier tick = eliminated earlier; within a tick (double-KO) whoever
    // dealt damage LAST ranks better (§6.4) → sort ascending, group equals
    dead.sort((a, b) => a.deathTick - b.deathTick || a.lastDamageDealtAt - b.lastDamageDealtAt);
    const groups: string[][] = [];
    let cur: string[] = [dead[0].id];
    for (let i = 1; i < dead.length; i++) {
      const same = dead[i].deathTick === dead[i - 1].deathTick
        && dead[i].lastDamageDealtAt === dead[i - 1].lastDamageDealtAt;
      if (same) cur.push(dead[i].id);
      else { groups.push(cur); cur = [dead[i].id]; }
    }
    groups.push(cur);
    for (const g of groups) for (const id of g) this.placedIds.add(id);
    this.eliminationGroups.push(...groups);
  }

  // =============================== zone / heal / timers ===============================

  private updateZoneDamage(dt: number, events: GameEvent[]): void {
    const zone = zoneAt(this.t, this.n);
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      const d = Math.hypot(p.move.pos.x, p.move.pos.z);
      if (d <= zone.radius) continue;
      p.zoneDamageAcc += zone.dot * dt;
      if (p.zoneDamageAcc >= 1) {
        const dmg = Math.floor(p.zoneDamageAcc);
        p.zoneDamageAcc -= dmg;
        p.hp = Math.max(0, p.hp - dmg);
        p.stats.damageTaken += dmg;
        p.healRemaining = 0;
        events.push({ type: 'damage', target: p.id, attacker: null, amount: dmg, hp: p.hp });
        if (p.hp <= 0) {
          const lastAttacker = p.lastDamagedBy && this.t - p.lastDamagedBy.at < 12
            ? this.players.get(p.lastDamagedBy.id) ?? null : null;
          this.kill(p, lastAttacker, 'zone');
        }
      }
    }
  }

  private updateHealsAndTimers(dt: number, events: GameEvent[]): void {
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      this.checkCookout(p, events); // frag held past its fuse (§F3)
      if (!p.alive) continue;       // the cook-out may have been lethal
      // bandage heal-over-time
      if (p.healRemaining > 0) {
        const heal = Math.min(p.healRemaining, (BANDAGE_HEAL / BANDAGE_DURATION) * dt);
        p.healRemaining -= heal;
        const before = p.hp;
        p.hp = Math.min(PLAYER_MAX_HP, p.hp + heal);
        if (Math.floor(p.hp) > Math.floor(before)) {
          events.push({ type: 'heal', target: p.id, amount: Math.round(heal), hp: Math.round(p.hp) });
        }
        if (p.hp >= PLAYER_MAX_HP) p.healRemaining = 0;
      }
      // reload completion
      if (p.reloadUntil > 0 && this.t >= p.reloadUntil) {
        p.reloadUntil = 0;
        const s = p.inv.active === 1 ? p.inv.primary : p.inv.secondary;
        if (s) {
          const def = WEAPONS[s.type];
          if (def.magSize && def.ammo) {
            const want = def.magSize - s.mag;
            const take = Math.min(want, p.inv.ammo[def.ammo]);
            s.mag += take;
            p.inv.ammo[def.ammo] -= take;
          }
        }
        this.pushInventory(p);
      }
      // crafting completion
      if (p.craftRecipe && this.t >= p.craftDoneAt) {
        const r = p.craftRecipe;
        p.craftRecipe = null;
        if (r === 'arrows') p.inv.ammo.arrow = Math.min(AMMO_CAP.arrow, p.inv.ammo.arrow + ARROWS_PER_CRAFT);
        if (r === 'bandage') p.inv.bandages = Math.min(MAX_BANDAGES, p.inv.bandages + 1);
        if (r === 'plate') p.inv.plates = Math.min(MAX_PLATES, p.inv.plates + 1);
        events.push({ type: 'craft', by: p.id, recipe: r, ok: true });
        this.pushInventory(p);
      }
    }
  }

  private tryReload(p: MatchPlayer): void {
    if (p.reloadUntil > 0) return;
    const s = p.inv.active === 1 ? p.inv.primary : p.inv.secondary;
    if (!s) return;
    const def = WEAPONS[s.type];
    if (!def.magSize || !def.ammo || !def.reloadTime) return;
    if (s.mag >= def.magSize || p.inv.ammo[def.ammo] <= 0) return;
    p.reloadUntil = this.t + def.reloadTime;
    this.pushInventory(p);
  }

  private cancelReload(p: MatchPlayer, push = true): void {
    if (p.reloadUntil <= 0) return;
    p.reloadUntil = 0;
    if (push) this.pushInventory(p);
  }

  private tryBandage(id: string): void {
    const p = this.players.get(id);
    if (!p || !p.alive) return;
    if (p.inv.bandages <= 0 || p.hp >= PLAYER_MAX_HP || p.healRemaining > 0) return;
    p.inv.bandages -= 1;
    p.bandageBusyUntil = this.t + BANDAGE_USE_TIME;
    p.healRemaining = BANDAGE_HEAL;
    this.pushInventory(p);
  }

  private tryCraft(id: string, recipe: Recipe): void {
    const p = this.players.get(id);
    if (!p || !p.alive) return;
    if (p.craftRecipe) return this.sendTo(id, [{ type: 'craft', by: id, recipe, ok: false, reason: 'busy' }]);
    const def = RECIPES[recipe];
    const m = p.inv.mats;
    const need = def.input;
    if ((need.wood ?? 0) > m.wood || (need.stone ?? 0) > m.stone || (need.fiber ?? 0) > m.fiber) {
      return this.sendTo(id, [{ type: 'craft', by: id, recipe, ok: false, reason: 'missing materials' }]);
    }
    m.wood -= need.wood ?? 0;
    m.stone -= need.stone ?? 0;
    m.fiber -= need.fiber ?? 0;
    p.craftRecipe = recipe;
    p.craftDoneAt = this.t + def.time;
    this.pushInventory(p);
  }

  // =============================== interact / loot ===============================

  private handleInteract(p: MatchPlayer, inp: InputMsg, events: GameEvent[]): void {
    if (!inp.interact) { p.harvestProgress = 0; p.harvestNodeId = -1; return; }
    const edge = !p.prevInteract;

    // 1) weapon swap on interact edge when standing on a weapon with full slots
    if (edge) {
      const item = this.nearestWeaponPickup(p);
      if (item && p.inv.primary && p.inv.secondary && p.inv.active !== 3) {
        const slot = p.inv.active === 1 ? 'primary' : 'secondary';
        const old = p.inv[slot]!;
        // drop old weapon where the new one was
        this.addPickup(old.type, item.x, item.z, { weaponMag: old.mag });
        const nextType = item.item as WeaponType;
        p.inv[slot] = weaponSlotState(nextType, item.weaponMag);
        if (item.weaponMag === undefined) grantStarterAmmo(p.inv, nextType);
        this.removePickup(item.id, p.id, events);
        this.pushInventory(p);
        return;
      }
    }

    // 2) resource harvest: hold ~1.5 s at tree/rock/bush (§4.2)
    // Progress follows the submitted simulation time. A fixed amount per message
    // made high-refresh-rate clients harvest faster than 30-Hz clients.
    const interactDt = Math.min(MAX_INPUT_DT, Math.max(0.001, inp.dt)) * this.timeScale;
    const node = this.nearestResourceNode(p);
    if (!node) { p.harvestProgress = 0; p.harvestNodeId = -1; return; }
    if (p.harvestNodeId !== node.id) { p.harvestNodeId = node.id; p.harvestProgress = 0; }
    p.harvestProgress += interactDt;
    if (p.harvestProgress >= INTERACT_HOLD_SECS) {
      p.harvestProgress = 0;
      const charges = (this.nodeCharges.get(node.id) ?? 0) - 1;
      this.nodeCharges.set(node.id, charges);
      const mat = node.kind === 'tree' ? 'wood' : node.kind === 'rock' ? 'stone' : 'fiber';
      p.inv.mats[mat] += RESOURCE_YIELD;
      events.push({ type: 'resource', by: p.id, kind: node.kind, nodeId: node.id, depleted: charges <= 0 });
      this.pushInventory(p);
    }
  }

  private nearestWeaponPickup(p: MatchPlayer): PickupInfo | null {
    let best: PickupInfo | null = null;
    let bestD = INTERACT_RANGE;
    for (const pk of this.pickups.values()) {
      if (pk.item === 'crate' || pk.item === 'care') continue;
      if (!(pk.item in WEAPONS) || WEAPONS[pk.item as WeaponType].kind === 'throwable') continue;
      const d = dist2d(p.move.pos.x, p.move.pos.z, pk.x, pk.z);
      if (d < bestD) { bestD = d; best = pk; }
    }
    return best;
  }

  private nearestResourceNode(p: MatchPlayer) {
    let best: { id: number; kind: 'tree' | 'rock' | 'bush' } | null = null;
    let bestD = Infinity;
    for (const v of this.gen.vegetation) {
      if ((this.nodeCharges.get(v.id) ?? 0) <= 0) continue;
      const d = dist2d(p.move.pos.x, p.move.pos.z, v.x, v.z);
      const reach = INTERACT_RANGE + (v.kind === 'tree' ? 0.6 : 0); // trunks are fat
      if (d <= reach && d < bestD) { best = { id: v.id, kind: v.kind }; bestD = d; }
    }
    return best;
  }

  private updatePickupsWalkover(events: GameEvent[]): void {
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      for (const pk of [...this.pickups.values()]) {
        const d = dist2d(p.move.pos.x, p.move.pos.z, pk.x, pk.z);
        if (d > PICKUP_RADIUS) continue;
        if (Math.abs(p.move.pos.y - pk.y) > 3) continue;
        this.tryTakePickup(p, pk, events);
      }
    }
  }

  private tryTakePickup(p: MatchPlayer, pk: PickupInfo, events: GameEvent[]): void {
    const inv = p.inv;
    switch (pk.item) {
      case 'crate': {
        this.removePickup(pk.id, p.id, events);
        this.openCrate(pk);
        return;
      }
      case 'care': {
        // legendary: fully loaded rifle + deep reserve (§7 default)
        if (!this.giveWeapon(p, 'rifle')) {
          // A care package must never disappear just because both slots are full:
          // replace the selected weapon and leave it at the package position.
          const slot = inv.active === 2 ? 'secondary' : 'primary';
          const old = inv[slot];
          if (old) this.addPickup(old.type, pk.x + 0.9, pk.z, { weaponMag: old.mag });
          inv[slot] = { type: 'rifle', mag: WEAPONS.rifle.magSize ?? 0 };
        }
        inv.ammo.rifle = Math.min(AMMO_CAP.rifle, inv.ammo.rifle + 40);
        this.removePickup(pk.id, p.id, events);
        events.push({ type: 'care', state: 'taken', x: pk.x, z: pk.z, by: p.id });
        this.care.state = 'none';
        this.pushInventory(p);
        return;
      }
      case 'grenade': {
        if (inv.throwables.frag >= MAX_GRENADES) return;
        inv.throwables.frag += 1;
        break;
      }
      case 'smokeGrenade': {
        if (inv.throwables.smoke >= MAX_SMOKE) return;
        inv.throwables.smoke += 1;
        break;
      }
      case 'flashGrenade': {
        if (inv.throwables.flash >= MAX_FLASH) return;
        inv.throwables.flash += 1;
        break;
      }
      case 'sniperAmmo': {
        if (inv.ammo.sniper >= AMMO_CAP.sniper) return;
        inv.ammo.sniper = Math.min(AMMO_CAP.sniper, inv.ammo.sniper + (pk.amount ?? AMMO_PICKUP.sniper));
        break;
      }
      case 'bandageItem': {
        if (inv.bandages >= MAX_BANDAGES) return;
        inv.bandages += 1;
        break;
      }
      case 'plateItem': {
        if (inv.plates >= MAX_PLATES) return;
        inv.plates += 1;
        break;
      }
      case 'arrowBundle': {
        if (inv.ammo.arrow >= AMMO_CAP.arrow) return;
        inv.ammo.arrow = Math.min(AMMO_CAP.arrow, inv.ammo.arrow + (pk.amount ?? AMMO_PICKUP.arrow));
        break;
      }
      case 'pistolAmmo': {
        if (inv.ammo.pistol >= AMMO_CAP.pistol) return;
        inv.ammo.pistol = Math.min(AMMO_CAP.pistol, inv.ammo.pistol + (pk.amount ?? AMMO_PICKUP.pistol));
        break;
      }
      case 'rifleAmmo': {
        if (inv.ammo.rifle >= AMMO_CAP.rifle) return;
        inv.ammo.rifle = Math.min(AMMO_CAP.rifle, inv.ammo.rifle + (pk.amount ?? AMMO_PICKUP.rifle));
        break;
      }
      case 'shellAmmo': {
        if (inv.ammo.shell >= AMMO_CAP.shell) return;
        inv.ammo.shell = Math.min(AMMO_CAP.shell, inv.ammo.shell + (pk.amount ?? AMMO_PICKUP.shell));
        break;
      }
      default: {
        // weapon on the ground → auto-equip into a free slot (walk-over §4.2)
        const w = pk.item as WeaponType;
        if (!(w in WEAPONS) || WEAPONS[w].kind === 'throwable') return;
        const dropped = pk.weaponMag !== undefined;
        if (!this.giveWeapon(p, w, pk.weaponMag, !dropped)) return; // both slots full → needs interact swap
        break;
      }
    }
    this.removePickup(pk.id, p.id, events);
    this.pushInventory(p);
  }

  private giveWeapon(p: MatchPlayer, w: WeaponType, mag?: number, grantAmmo = true): boolean {
    return equipWeapon(p.inv, w, { mag, grantStarterAmmo: grantAmmo });
  }

  private openCrate(pk: PickupInfo): void {
    const tier = (pk.tier ?? 'common') as CrateTier;
    const rng = this.lootRng;
    const drops: ItemType[] = [];
    if (tier === 'top') {
      // rare marksman roll (§F1): the sniper only ever drops from top crates
      if (rng() < SNIPER_CRATE_CHANCE) {
        drops.push('sniper');
        drops.push(rng() < 0.6 ? 'sniperAmmo' : 'bandageItem');
      } else {
        drops.push(pick(rng, ['rifle', 'shotgun'] as ItemType[]));
        drops.push(pick(rng, ['rifleAmmo', 'shellAmmo', 'grenade', 'flashGrenade', 'bandageItem'] as ItemType[]));
      }
      if (rng() < 0.5) drops.push('bandageItem');
    } else if (tier === 'good') {
      drops.push(pick(rng, ['pistol', 'bow', 'grenade'] as ItemType[]));
      drops.push(pick(rng, ['pistolAmmo', 'arrowBundle', 'bandageItem', 'smokeGrenade', 'flashGrenade'] as ItemType[]));
    } else {
      drops.push(pick(rng, ['machete', 'spear', 'pistol', 'bandageItem'] as ItemType[]));
      if (rng() < 0.6) drops.push(pick(rng, ['pistolAmmo', 'arrowBundle'] as ItemType[]));
    }
    drops.forEach((item, i) => {
      const a = rng() * Math.PI * 2 + i;
      this.addPickup(item, pk.x + Math.cos(a) * 1.2, pk.z + Math.sin(a) * 1.2);
    });
  }

  private dropInventory(p: MatchPlayer): void {
    const { x, z } = p.move.pos;
    const rng = this.lootRng;
    const drop = (item: ItemType, options: AddPickupOptions = {}) => {
      const a = rng() * Math.PI * 2;
      const r = 0.6 + rng() * 1.2;
      this.addPickup(item, x + Math.cos(a) * r, z + Math.sin(a) * r, options);
    };
    if (p.inv.primary) drop(p.inv.primary.type, { weaponMag: p.inv.primary.mag });
    if (p.inv.secondary) drop(p.inv.secondary.type, { weaponMag: p.inv.secondary.mag });
    for (let i = 0; i < p.inv.throwables.frag; i++) drop('grenade');
    for (let i = 0; i < p.inv.throwables.smoke; i++) drop('smokeGrenade');
    for (let i = 0; i < p.inv.throwables.flash; i++) drop('flashGrenade');
    for (let i = 0; i < p.inv.bandages; i++) drop('bandageItem');
    for (let i = 0; i < p.inv.plates; i++) drop('plateItem');
    if (p.inv.ammo.arrow > 0) drop('arrowBundle', { amount: p.inv.ammo.arrow });
    if (p.inv.ammo.pistol > 0) drop('pistolAmmo', { amount: p.inv.ammo.pistol });
    if (p.inv.ammo.rifle > 0) drop('rifleAmmo', { amount: p.inv.ammo.rifle });
    if (p.inv.ammo.shell > 0) drop('shellAmmo', { amount: p.inv.ammo.shell });
    if (p.inv.ammo.sniper > 0) drop('sniperAmmo', { amount: p.inv.ammo.sniper });
    p.inv = this.freshInventory();
  }

  private addPickup(item: ItemType, x: number, z: number, options: AddPickupOptions = {}): void {
    const id = options.fixedId ?? `pk-${this.pickupSeq++}`;
    const info: PickupInfo = {
      id, item, x, z, y: sampleHeight(this.gen.params, x, z),
      amount: options.amount,
      weaponMag: options.weaponMag,
    };
    this.pickups.set(id, info);
    if (this.roundActive) this.io.emit(S2C.event, [{ type: 'pickupSpawn', pickup: info } satisfies GameEvent]);
  }

  private removePickup(id: string, by: string | null, events: GameEvent[]): void {
    const pickup = this.pickups.get(id);
    if (!pickup || !this.pickups.delete(id)) return;
    if (by) {
      const player = this.players.get(by);
      if (player) player.stats.pickups += 1;
    }
    events.push({ type: 'pickupRemove', id, by, item: pickup.item });
  }

  // =============================== care package / pings ===============================

  private updateCarePackage(events: GameEvent[]): void {
    if (!this.careSpawned && this.t >= CARE_PACKAGE_AT) {
      this.careSpawned = true;
      this.care.state = 'incoming';
      this.care.landsAt = this.t + 10;
      events.push({ type: 'care', state: 'incoming', x: this.care.x, z: this.care.z });
    } else if (this.care.state === 'incoming' && this.t >= this.care.landsAt) {
      this.care.state = 'landed';
      const id = 'care-package';
      this.pickups.set(id, {
        id, item: 'care', x: this.care.x, z: this.care.z,
        y: sampleHeight(this.gen.params, this.care.x, this.care.z),
      });
      events.push({ type: 'care', state: 'landed', x: this.care.x, z: this.care.z });
    }
  }

  private updatePings(): void {
    for (const [id, ping] of this.pings) if (this.t > ping.until) this.pings.delete(id);
  }

  private announceZoneSteps(events: GameEvent[]): void {
    const zone = zoneAt(this.t, this.n);
    if (zone.tier > this.zoneTierAnnounced) {
      this.zoneTierAnnounced = zone.tier;
      events.push({ type: 'zoneStep', tier: zone.tier, targetRadius: zone.targetRadius, dot: zone.dot });
    }
  }

  // =============================== bots (§F4) ===============================

  private botRng: Rng = mulberry32(3);

  /** Feed every living bot one synthetic InputMsg through the normal pipeline. */
  private tickBots(): void {
    if (this.botMems.size === 0 || !this.roundActive) return;
    const zone = zoneAt(this.t, this.n);
    const diff = BOT_DIFFICULTIES[this.botDifficulty];
    // night + fog shrink bot vision exactly like a human's screen does
    const detectRange = Math.min(diff.detectRange, fogAt(this.t) * 0.95);
    for (const [id, mem] of this.botMems) {
      const p = this.players.get(id);
      if (!p || !p.alive) continue;
      const eye = this.eyePos(p);
      const enemies: BotEnemy[] = [];
      for (const q of this.players.values()) {
        if (q.id === id || !q.alive) continue;
        const qEye = this.eyePos(q);
        const dx = qEye.x - eye.x, dy = qEye.y - eye.y, dz = qEye.z - eye.z;
        const dist = Math.hypot(dx, dy, dz) || 0.001;
        let losClear = false;
        if (dist <= detectRange) {
          const dir = { x: dx / dist, y: dy / dist, z: dz / dist };
          const hit = this.phys.raycast(eye, dir, dist, [id]);
          losClear = (!hit || hit.playerId === q.id) && !this.smokeBlocks(eye, qEye);
        }
        enemies.push({ id: q.id, pos: q.move.pos, dist, losClear });
      }
      const ctx: BotCtx = {
        t: this.t,
        self: {
          pos: p.move.pos, hp: p.hp, slot: p.inv.active,
          primary: p.inv.primary, secondary: p.inv.secondary,
          reserveAmmo: (w) => {
            const def = WEAPONS[w];
            return def.ammo ? p.inv.ammo[def.ammo] : 0;
          },
          throwables: p.inv.throwables, activeThrow: p.inv.activeThrow,
          bandages: p.inv.bandages,
          healing: p.healRemaining > 0 || this.t < p.bandageBusyUntil,
          blind: this.t < p.blindUntil,
          recentlyHurt: p.lastDamagedBy !== null && this.t - p.lastDamagedBy.at < 2,
        },
        enemies,
        zone: { radius: zone.radius, target: zone.targetRadius, shrinking: zone.shrinking },
        loot: this.pickBotLoot(p, zone.radius),
        rng: this.botRng,
        diff,
      };
      const decision = computeBotInput(mem, ctx);
      if (p.inputs.length < 12) p.inputs.push(decision.input);
      // consumables use a direct server call — the one allowed bot shortcut,
      // since there is no socket round-trip to route it through
      if (decision.wantHeal) this.tryBandage(id);
    }
  }

  /** Best pickup for a bot to chase, scored by need over distance. */
  private pickBotLoot(p: MatchPlayer, zoneRadius: number): { id: string; x: number; z: number } | null {
    const inv = p.inv;
    const ammoItemFor: Partial<Record<ItemType, AmmoType>> = {
      arrowBundle: 'arrow', pistolAmmo: 'pistol', rifleAmmo: 'rifle',
      shellAmmo: 'shell', sniperAmmo: 'sniper',
    };
    const usesAmmo = (ammo: AmmoType): boolean =>
      [inv.primary, inv.secondary].some((s) => s && WEAPONS[s.type].ammo === ammo);
    let best: { id: string; x: number; z: number } | null = null;
    let bestScore = 0;
    for (const pk of this.pickups.values()) {
      if (Math.hypot(pk.x, pk.z) > zoneRadius - 4) continue; // never loot into the zone
      const d = dist2d(p.move.pos.x, p.move.pos.z, pk.x, pk.z);
      if (d > 90) continue;
      let value = 0;
      if (pk.item === 'crate') value = pk.tier === 'top' ? 9 : pk.tier === 'good' ? 7 : 5;
      else if (pk.item === 'care') value = 12;
      else if (pk.item === 'bandageItem') value = inv.bandages < MAX_BANDAGES ? (p.hp < 60 ? 8 : 4) : 0;
      else if (pk.item === 'plateItem') value = inv.plates < MAX_PLATES ? 4 : 0;
      else if (pk.item === 'grenade') value = inv.throwables.frag < MAX_GRENADES ? 3 : 0;
      else if (pk.item === 'smokeGrenade') value = inv.throwables.smoke < MAX_SMOKE ? 2 : 0;
      else if (pk.item === 'flashGrenade') value = inv.throwables.flash < MAX_FLASH ? 2 : 0;
      else if (pk.item in ammoItemFor) {
        const ammo = ammoItemFor[pk.item]!;
        value = usesAmmo(ammo) && inv.ammo[ammo] < AMMO_CAP[ammo] * 0.6 ? 5 : 0;
      } else if (pk.item in WEAPONS && WEAPONS[pk.item as WeaponType].kind !== 'throwable') {
        value = !inv.primary || !inv.secondary ? 8 : 0;
      }
      if (value <= 0) continue;
      const score = value / (8 + d);
      if (score > bestScore) {
        bestScore = score;
        best = { id: pk.id, x: pk.x, z: pk.z };
      }
    }
    return best;
  }

  // =============================== snapshot ===============================

  private buildSnapshot(): SnapshotMsg {
    const zone = zoneAt(this.t, this.n);
    const players: SnapPlayer[] = [...this.players.values()].map((p) => ({
      id: p.id,
      x: round3(p.move.pos.x), y: round3(p.move.pos.y), z: round3(p.move.pos.z),
      yaw: round3(p.yaw), pitch: round3(p.pitch),
      hp: Math.round(p.hp), alive: p.alive,
      weapon: this.activeWeapon(p).type, slot: p.inv.active,
      sprinting: p.move.sprinting,
      sneaking: p.move.sneaking,
      aiming: p.aiming,
      bandaging: p.healRemaining > 0,
      plates: p.inv.plates,
      stamina: round3(p.move.stamina),
      vx: round3(p.move.velX),
      vy: round3(p.move.velY),
      vz: round3(p.move.velZ),
      grounded: p.move.grounded,
      lastSeq: p.lastSeq,
      kills: p.kills,
      ...(p.inv.active === 3 ? { activeThrow: p.inv.activeThrow } : {}),
      ...(p.cookingSince !== null ? { cookingUntil: round3(p.cookingSince + GRENADE_FUSE) } : {}),
    }));
    const projectiles: SnapProjectile[] = [...this.projectiles.values()].map((pr) => ({
      id: pr.id, kind: pr.kind,
      x: round3(pr.pos.x), y: round3(pr.pos.y), z: round3(pr.pos.z),
      vx: round3(pr.vel.x), vy: round3(pr.vel.y), vz: round3(pr.vel.z),
    }));
    const smokes: SmokeSnap[] = [...this.smokes.values()].map((cloud) => ({
      id: cloud.id, x: round3(cloud.x), y: round3(cloud.y), z: round3(cloud.z),
      radius: cloud.radius, bornAt: round3(cloud.bornAt), expiresAt: round3(cloud.expiresAt),
    }));
    return {
      t: round3(this.t),
      phase: phaseAt(this.t),
      timeOfDay: round3(timeOfDayAt(this.t)),
      zone: {
        radius: round3(zone.radius), targetRadius: zone.targetRadius, dot: zone.dot,
        tier: zone.tier, shrinking: zone.shrinking, nextShrinkAt: zone.nextShrinkAt,
      },
      players,
      projectiles,
      smokes,
      pings: [...this.pings.entries()].map(([playerId, p]) => ({
        playerId, x: round3(p.x), z: round3(p.z), until: round3(p.until),
      })),
      care: this.care.state === 'none'
        ? { state: 'none', x: 0, z: 0 }
        : { state: this.care.state, x: this.care.x, z: this.care.z, landsAt: this.care.landsAt },
      aliveCount: players.filter((p) => p.alive).length,
    };
  }

  private pushInventory(p: MatchPlayer): void {
    if (p.isBot) return; // bots read their Inventory directly; no socket to push to
    const inv: InventoryState = {
      primary: p.inv.primary, secondary: p.inv.secondary, active: p.inv.active,
      throwables: { ...p.inv.throwables }, activeThrow: p.inv.activeThrow,
      bandages: p.inv.bandages, plates: p.inv.plates,
      ammo: { ...p.inv.ammo }, mats: { ...p.inv.mats },
      reloading: p.reloadUntil > 0,
    };
    this.sendTo(p.id, [{ type: 'inventory', inv }]);
  }

  private sendTo(id: string, events: GameEvent[]): void {
    this.conns.get(id)?.socket.emit(S2C.event, events);
  }

  // =============================== round / match end ===============================

  private checkRoundEnd(): void {
    if (!this.roundActive) return;
    const alive = [...this.players.values()].filter((p) => p.alive);
    if (alive.length > 1) return;
    if (alive.length === 1) this.eliminationGroups.push([alive[0].id]);
    // if 0 alive, flushDeaths already grouped the double-KO tail
    this.endRound();
  }

  private endRound(): void {
    this.roundActive = false;
    const { placements, points } = scoreRound(this.eliminationGroups, this.n);
    for (const [id, pts] of points) {
      this.totals.set(id, (this.totals.get(id) ?? 0) + pts);
    }
    const placementEntries: PlacementEntry[] = [...placements.entries()]
      .map(([id, place]) => ({
        id, name: this.players.get(id)?.name ?? '?', place, points: points.get(id) ?? 0,
      }))
      .sort((a, b) => a.place - b.place);
    const totals: Record<string, number> = {};
    for (const [id, v] of this.totals) totals[id] = v;
    for (const [id, player] of this.players) {
      const total = this.matchStats.get(id) ?? this.freshStats();
      for (const key of Object.keys(total) as (keyof CombatStats)[]) total[key] += player.stats[key];
      this.matchStats.set(id, total);
    }
    const stats = this.statsRecord(false);

    const scheduledDone = this.round >= ROUNDS_PER_MATCH;
    let matchOver = false;
    let suddenDeathNext = false;
    if (scheduledDone) {
      const decision = decideMatch(this.totals);
      if (decision.finished || this.suddenDeathRounds >= MAX_SUDDEN_DEATH_ROUNDS) {
        matchOver = true;
      } else {
        suddenDeathNext = true; // tie → sudden death round (§6.4)
      }
    }

    this.io.emit(S2C.roundEnd, {
      round: this.round,
      placements: placementEntries,
      totals,
      nextRoundIn: matchOver ? 0 : ROUND_END_SCOREBOARD_SECS,
      matchOver,
      stats,
      ...(this.practice ? { practice: true } : {}),
    });

    const delay = (ROUND_END_SCOREBOARD_SECS * 1000) / this.timeScale;
    this.roundTransitionHandle = setTimeout(() => {
      this.roundTransitionHandle = null;
      if (!this.inMatch) return;
      if (matchOver) this.endMatch();
      else this.startRound(suddenDeathNext);
    }, Math.max(500, delay));
  }

  private endMatch(): void {
    const decision = decideMatch(this.totals);
    let winnerId = decision.winners[0];
    if (decision.winners.length > 1) {
      // still tied after max sudden-death rounds → seeded random tiebreak
      const rng = mulberry32(this.seed ^ 0xdead);
      winnerId = decision.winners[Math.floor(rng() * decision.winners.length)];
    }
    const totals: Record<string, number> = {};
    for (const [id, v] of this.totals) totals[id] = v;
    const standings: PlacementEntry[] = [...this.totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, pts], i) => ({
        id, name: this.players.get(id)?.name ?? '?', place: i + 1, points: pts,
      }));
    this.io.emit(S2C.matchEnd, {
      totals, winnerId,
      winnerName: this.players.get(winnerId)?.name ?? '?',
      standings,
      suddenDeathRounds: this.suddenDeathRounds,
      stats: this.statsRecord(true),
      ...(this.practice ? { practice: true } : {}),
    });
    this.cleanupMatch();
  }

  private endMatchEarly(): void {
    if (!this.inMatch) return;
    this.roundActive = false;
    this.endMatch();
  }

  private cleanupMatch(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
    if (this.roundTransitionHandle) clearTimeout(this.roundTransitionHandle);
    this.tickHandle = null;
    this.roundTransitionHandle = null;
    this.phys?.dispose();
    this.inMatch = false;
    this.roundActive = false;
    this.practice = false;
    this.players.clear();
    this.botMems.clear();
    this.matchRoster = [];
    this.pickups.clear();
    this.projectiles.clear();
    this.smokes.clear();
    for (const timer of this.disconnectTimers.values()) clearTimeout(timer);
    this.disconnectTimers.clear();
    for (const [id, conn] of [...this.conns]) if (!conn.connected) this.conns.delete(id);
    if (this.hostId && !this.conns.has(this.hostId)) this.migrateHost(this.hostId);
    for (const c of this.conns.values()) c.ready = false;
    this.broadcastLobby(); // lobby unlocked again → rematch with new seed
  }

  /** Stop timers and release Rapier memory when the host itself shuts down. */
  dispose(): void {
    if (this.inMatch) this.cleanupMatch();
    for (const timer of this.disconnectTimers.values()) clearTimeout(timer);
    this.disconnectTimers.clear();
  }

  private statsRecord(match: boolean): Record<string, CombatStats> {
    const source = match
      ? this.matchStats
      : new Map([...this.players].map(([id, player]) => [id, player.stats]));
    const out: Record<string, CombatStats> = {};
    for (const [id, stats] of source) out[id] = { ...stats };
    return out;
  }
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
const round3 = (v: number) => Math.round(v * 1000) / 1000;

export function isHeadshotHeight(feetY: number, sneaking: boolean, hitY: number): boolean {
  return hitY >= feetY + (sneaking ? 0.92 : 1.38);
}
