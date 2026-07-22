// Message catalog (§8): join, lobbyState, matchStart(N, seed), input,
// snapshot (20 Hz), event, roundEnd, matchEnd — plus round bookkeeping.
import type { BotDifficulty, ItemType, MatchMode, Recipe, ThrowKind, WeaponType } from './constants';
import type { CrateTier, VegKind } from './worldgen';
import type { Phase } from './timeline';

export const PROTOCOL_VERSION = 5;

// ---------- lobby ----------
export interface JoinMsg { v: number; name: string; resumeToken?: string }
export interface SessionMsg {
  playerId: string;
  resumeToken: string;
  resumed: boolean;
  reconnectGraceMs: number;
}
export interface PlayerInfo { id: string; name: string; ready: boolean; isHost: boolean; connected: boolean }
export interface LobbyStateMsg {
  players: PlayerInfo[];
  maxPlayers: number;
  inMatch: boolean; // lobby locked (§0 B3)
  canStart: boolean;
}

// ---------- match / round ----------
export interface MatchStartMsg {
  n: number;
  seed: number;
  players: PlayerInfo[];
  /** Present and true for solo-practice matches against bots (§F4). */
  practice?: boolean;
  mode: MatchMode;
}
export interface RoundStartMsg {
  round: number;         // 1-based; > ROUNDS_PER_MATCH ⇒ sudden death
  suddenDeath: boolean;
  spawns: Record<string, number>; // playerId → spawn POI index
  totals: Record<string, number>;
  pickups: PickupInfo[]; // initial ground loot + crates
}
export interface PlacementEntry { id: string; name: string; place: number; points: number }
export interface CombatStats {
  kills: number;
  damageDealt: number;
  damageTaken: number;
  shotsFired: number;
  hits: number;
  headshots: number;
  pickups: number;
}
export interface RoundEndMsg {
  round: number;
  placements: PlacementEntry[];
  totals: Record<string, number>;
  nextRoundIn: number;   // s
  matchOver: boolean;
  stats: Record<string, CombatStats>;
  practice?: boolean;
}
export interface MatchEndMsg {
  totals: Record<string, number>;
  winnerId: string;
  winnerName: string;
  standings: PlacementEntry[]; // final match standings
  suddenDeathRounds: number;
  stats: Record<string, CombatStats>;
  practice?: boolean;
}

// ---------- input (client → host) ----------
export interface InputMsg {
  seq: number;
  dt: number;            // s, clamped server-side
  mx: number; mz: number; // move axes −1..1 (strafe, forward)
  yaw: number; pitch: number;
  sprint: boolean;
  sneak: boolean;
  aim: boolean;
  jump: boolean;
  fire: boolean;         // held
  interact: boolean;     // held: harvest resources / weapon swap
  slot?: 1 | 2 | 3;      // weapon slot switch (3 = throwable)
  reload?: boolean;
  /** Pressing the throwable key while slot 3 is active cycles frag → smoke → flash. */
  throwCycle?: boolean;
}

// ---------- snapshot (host → clients, 20 Hz full state §8) ----------
export interface SnapPlayer {
  id: string;
  x: number; y: number; z: number;
  yaw: number; pitch: number;
  hp: number;
  alive: boolean;
  weapon: WeaponType;
  slot: 1 | 2 | 3;
  sprinting: boolean;
  sneaking: boolean;
  aiming: boolean;
  bandaging: boolean;
  plates: number;
  stamina: number;
  vx: number;
  vy: number;
  vz: number;
  grounded: boolean;
  lastSeq: number;       // reconciliation ack for the owning client
  kills: number;
  /** Selected throwable while slot 3 is up (viewmodel + HUD). */
  activeThrow?: ThrowKind;
  /** Round time when a cooked frag detonates in hand; absent when not cooking. */
  cookingUntil?: number;
}
export interface SnapProjectile {
  id: number;
  kind: 'arrow' | 'grenade' | 'smoke' | 'flash';
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}
export interface SmokeSnap {
  id: number;
  x: number; y: number; z: number;
  radius: number;
  bornAt: number;    // round time (s)
  expiresAt: number; // round time (s)
}
export interface ZoneSnap {
  radius: number; targetRadius: number; dot: number; tier: number;
  shrinking: boolean; nextShrinkAt: number | null;
}
export interface PingSnap { playerId: string; x: number; z: number; until: number }
export interface CareSnap { state: 'none' | 'incoming' | 'landed'; x: number; z: number; landsAt?: number }
export interface SnapshotMsg {
  t: number;             // round clock (s)
  phase: Phase;
  timeOfDay: number;     // 0 day … 1 night
  zone: ZoneSnap;
  players: SnapPlayer[];
  projectiles: SnapProjectile[];
  smokes: SmokeSnap[];   // active sight-blocking smoke clouds (§F2)
  pings: PingSnap[];     // ping-on-loud (§6.2)
  care: CareSnap;
  aliveCount: number;
}

// ---------- pickups & inventory ----------
export interface PickupInfo {
  id: string;
  item: ItemType | 'crate' | 'care';
  tier?: CrateTier;
  x: number; y: number; z: number;
  amount?: number;
  /** Present only for dropped weapons; preserves the remaining magazine. */
  weaponMag?: number;
}
export interface WeaponSlotState { type: WeaponType; mag: number }
export interface InventoryState {
  primary: WeaponSlotState | null;
  secondary: WeaponSlotState | null;
  active: 1 | 2 | 3;
  throwables: { frag: number; smoke: number; flash: number };
  activeThrow: ThrowKind;
  bandages: number;
  plates: number;
  ammo: { arrow: number; pistol: number; rifle: number; shell: number; sniper: number };
  mats: { wood: number; stone: number; fiber: number };
  reloading: boolean;
}

// ---------- events (host → clients) ----------
export type GameEvent =
  | { type: 'damage'; target: string; attacker: string | null; amount: number; hp: number; weapon?: WeaponType; headshot?: boolean }
  | { type: 'death'; target: string; attacker: string | null; cause: 'weapon' | 'zone' | 'grenade'; weapon?: WeaponType; distance?: number; attackerHp?: number; headshot?: boolean; finalDamage?: number }
  | { type: 'kill'; killer: string | null; victim: string; weapon: WeaponType | 'zone' }
  | { type: 'shot'; by: string; weapon: WeaponType; ox: number; oy: number; oz: number; dx: number; dy: number; dz: number; primary?: boolean; hx?: number; hy?: number; hz?: number }
  | { type: 'melee'; by: string; weapon: WeaponType }
  | { type: 'explosion'; x: number; y: number; z: number; radius: number }
  | { type: 'pickupSpawn'; pickup: PickupInfo }
  | { type: 'pickupRemove'; id: string; by: string | null; item: PickupInfo['item'] }
  | { type: 'resource'; by: string; kind: VegKind; nodeId: number; depleted: boolean }
  | { type: 'inventory'; inv: InventoryState }                    // owner only
  | { type: 'craft'; by: string; recipe: Recipe; ok: boolean; reason?: string }
  | { type: 'heal'; target: string; amount: number; hp: number }
  | { type: 'hitmarker'; target: string; headshot: boolean }     // shooter only
  | { type: 'care'; state: 'incoming' | 'landed' | 'taken'; x: number; z: number; by?: string }
  | { type: 'zoneStep'; tier: number; targetRadius: number; dot: number }
  | { type: 'smoke'; state: 'pop'; id: number; x: number; y: number; z: number; radius: number }
  | { type: 'flash'; x: number; y: number; z: number }
  | { type: 'flashed'; target: string; intensity: number; duration: number } // victim only
  | { type: 'cookout'; by: string; x: number; y: number; z: number };       // frag detonated in hand

// ---------- socket.io event names ----------
export const C2S = {
  join: 'join',
  setReady: 'setReady',
  startMatch: 'startMatch',
  startPractice: 'startPractice',
  input: 'input',
  craft: 'craft',
  useBandage: 'useBandage',
  rematch: 'rematch',
  pingProbe: 'pingProbe',
} as const;

export interface StartMatchMsg { mode: MatchMode }
export interface StartPracticeMsg { bots: number; difficulty: BotDifficulty; mode: MatchMode }

export const S2C = {
  lobbyState: 'lobbyState',
  session: 'session',
  connectionNotice: 'connectionNotice',
  joinError: 'joinError',
  matchStart: 'matchStart',
  roundStart: 'roundStart',
  snapshot: 'snapshot',
  event: 'event',
  roundEnd: 'roundEnd',
  matchEnd: 'matchEnd',
} as const;

// ---------- type guards (tests + defensive server parsing) ----------
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

export function isJoinMsg(m: unknown): m is JoinMsg {
  const x = m as JoinMsg;
  return !!x && x.v === PROTOCOL_VERSION && typeof x.name === 'string' && x.name.length >= 1 && x.name.length <= 24
    && (x.resumeToken === undefined || (typeof x.resumeToken === 'string' && x.resumeToken.length <= 96));
}

export function isInputMsg(m: unknown): m is InputMsg {
  const x = m as InputMsg;
  return !!x && isNum(x.seq) && isNum(x.dt) && isNum(x.mx) && isNum(x.mz)
    && isNum(x.yaw) && isNum(x.pitch)
    && isBool(x.sprint) && isBool(x.sneak) && isBool(x.aim)
    && isBool(x.jump) && isBool(x.fire) && isBool(x.interact)
    && (x.slot === undefined || x.slot === 1 || x.slot === 2 || x.slot === 3)
    && (x.reload === undefined || isBool(x.reload))
    && (x.throwCycle === undefined || isBool(x.throwCycle));
}

export function isStartPracticeMsg(m: unknown): m is StartPracticeMsg {
  const x = m as StartPracticeMsg;
  return !!x && isNum(x.bots) && Number.isInteger(x.bots) && x.bots >= 1 && x.bots <= 4
    && (x.difficulty === 'easy' || x.difficulty === 'normal' || x.difficulty === 'hard')
    && (x.mode === 'classic' || x.mode === 'quick');
}

export function isStartMatchMsg(m: unknown): m is StartMatchMsg {
  const x = m as StartMatchMsg;
  return !!x && (x.mode === 'classic' || x.mode === 'quick');
}

export function isCraftMsg(m: unknown): m is { recipe: Recipe } {
  const x = m as { recipe: Recipe };
  return !!x && (x.recipe === 'arrows' || x.recipe === 'bandage' || x.recipe === 'plate');
}

export function isReadyMsg(m: unknown): m is { ready: boolean } {
  const x = m as { ready: boolean };
  return !!x && isBool(x.ready);
}
