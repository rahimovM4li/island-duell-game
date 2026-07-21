// Tactical practice-bot AI (§F4). Host-only and intentionally NOT part of the
// deterministic shared sim: bots run only on the authority and act by emitting
// ordinary InputMsg through the exact same pipeline as human players.
//
// State machine per tick: LOOT → ROTATE (zone pressure) → ENGAGE (visible
// enemy) → HEAL (safe + hurt) → FLEE (losing a fight: smoke + retreat).
import {
  type BotDifficultyDef, MAX_BANDAGES, SERVER_TICK_HZ, type ThrowKind, WEAPONS,
  type WeaponType,
} from '@shared/constants';
import type { Vec3 } from '@shared/physics';
import type { InputMsg } from '@shared/protocol';
import type { Rng } from '@shared/rng';

export interface BotEnemy {
  id: string;
  pos: Vec3;      // feet
  dist: number;   // 3D distance
  losClear: boolean; // raycast + smoke + fog/night range already resolved by the host
}

export interface BotSelfView {
  pos: Vec3;
  hp: number;
  slot: 1 | 2 | 3;
  primary: { type: WeaponType; mag: number } | null;
  secondary: { type: WeaponType; mag: number } | null;
  reserveAmmo: (weapon: WeaponType) => number;
  throwables: { frag: number; smoke: number; flash: number };
  activeThrow: ThrowKind;
  bandages: number;
  healing: boolean;
  blind: boolean;
  recentlyHurt: boolean; // damaged within the last ~2 s
}

export interface BotLootTarget { id: string; x: number; z: number }

export interface BotCtx {
  t: number;
  self: BotSelfView;
  enemies: BotEnemy[];
  zone: { radius: number; target: number; shrinking: boolean };
  /** Best loot candidate as scored by the host (null when nothing worthwhile). */
  loot: BotLootTarget | null;
  rng: Rng;
  diff: BotDifficultyDef;
}

export interface BotDecision {
  input: InputMsg;
  wantHeal: boolean;
  state: BotState;
}

export type BotState = 'loot' | 'rotate' | 'engage' | 'heal' | 'flee';

interface ThrowPlan {
  kind: ThrowKind;
  /** frag only: release the pin after this round time (short cook) */
  releaseAt: number;
  startedAt: number;
}

export interface BotMemory {
  seq: number;
  yaw: number;
  pitch: number;
  state: BotState;
  targetId: string | null;
  acquiredAt: number;      // when the current target first became visible
  lastSeenAt: number;
  lastSeenPos: Vec3 | null;
  wander: { x: number; z: number } | null;
  wanderUntil: number;
  strafeDir: number;
  strafeUntil: number;
  burstUntil: number;
  burstPauseUntil: number;
  lastPos: Vec3;
  stuckTime: number;
  unstuckUntil: number;
  unstuckSign: number;
  throwPlan: ThrowPlan | null;
  nextThrowCheck: number;
  aimWobblePhase: number;
}

export function freshBotMemory(rng: Rng): BotMemory {
  return {
    seq: 0, yaw: rng() * Math.PI * 2, pitch: 0,
    state: 'loot', targetId: null, acquiredAt: 0, lastSeenAt: -10, lastSeenPos: null,
    wander: null, wanderUntil: 0, strafeDir: 1, strafeUntil: 0,
    burstUntil: 0, burstPauseUntil: 0,
    lastPos: { x: 0, y: 0, z: 0 }, stuckTime: 0, unstuckUntil: 0, unstuckSign: 1,
    throwPlan: null, nextThrowCheck: 0, aimWobblePhase: rng() * Math.PI * 2,
  };
}

const BOT_DT = 1 / SERVER_TICK_HZ;
const TURN_RATE = 5.2;        // rad/s toward the desired heading
const ENGAGE_TURN_RATE = 7.5; // faster when tracking a target

/** Yaw so that forward (−sin, −cos) points along (dx, dz). */
function yawToward(dx: number, dz: number): number {
  return Math.atan2(-dx, -dz);
}

function angleLerp(from: number, to: number, maxDelta: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return from + Math.sign(diff) * Math.min(Math.abs(diff), maxDelta);
}

function baseInput(mem: BotMemory): InputMsg {
  return {
    seq: ++mem.seq, dt: BOT_DT, mx: 0, mz: 0,
    yaw: mem.yaw, pitch: mem.pitch,
    sprint: false, sneak: false, aim: false, jump: false,
    fire: false, interact: false,
  };
}

function bestRangedSlot(self: BotSelfView): 1 | 2 | null {
  const score = (s: { type: WeaponType; mag: number } | null): number => {
    if (!s) return -1;
    const def = WEAPONS[s.type];
    if (def.kind === 'melee') return -1;
    const supply = s.mag + self.reserveAmmo(s.type);
    if (supply <= 0) return -1;
    // prefer higher sustained damage; sniper valued but not while blind-close
    return def.damage * (def.pellets ?? 1) / Math.max(0.2, def.cooldown) + supply * 0.1;
  };
  const p = score(self.primary), s = score(self.secondary);
  if (p < 0 && s < 0) return null;
  return p >= s ? 1 : 2;
}

function meleeSlot(self: BotSelfView): 1 | 2 | null {
  if (self.primary && WEAPONS[self.primary.type].kind === 'melee') return 1;
  if (self.secondary && WEAPONS[self.secondary.type].kind === 'melee') return 2;
  return null;
}

function weaponInSlot(self: BotSelfView, slot: 1 | 2): WeaponType | null {
  const s = slot === 1 ? self.primary : self.secondary;
  return s ? s.type : null;
}

/** Steer toward a world point; handles heading, sprint and stuck recovery. */
function steerTo(
  mem: BotMemory, ctx: BotCtx, inp: InputMsg, x: number, z: number, sprint: boolean,
): number {
  const dx = x - ctx.self.pos.x;
  const dz = z - ctx.self.pos.z;
  const dist = Math.hypot(dx, dz);
  if (dist > 0.4) {
    let desired = yawToward(dx, dz);
    if (ctx.t < mem.unstuckUntil) desired += mem.unstuckSign * 1.25;
    mem.yaw = angleLerp(mem.yaw, desired, TURN_RATE * BOT_DT);
    mem.pitch = angleLerp(mem.pitch, 0, 2.5 * BOT_DT);
    inp.mz = 1;
    inp.sprint = sprint && dist > 6;
    if (ctx.t < mem.unstuckUntil) inp.jump = true;
  }
  inp.yaw = mem.yaw;
  inp.pitch = mem.pitch;
  return dist;
}

function updateStuck(mem: BotMemory, ctx: BotCtx, wantsToMove: boolean): void {
  const moved = Math.hypot(ctx.self.pos.x - mem.lastPos.x, ctx.self.pos.z - mem.lastPos.z);
  mem.lastPos = { ...ctx.self.pos };
  if (!wantsToMove) { mem.stuckTime = 0; return; }
  if (moved < 0.045) {
    mem.stuckTime += BOT_DT;
    if (mem.stuckTime > 1.1 && ctx.t >= mem.unstuckUntil) {
      mem.unstuckUntil = ctx.t + 0.9;
      mem.unstuckSign = ctx.rng() < 0.5 ? -1 : 1;
      mem.stuckTime = 0;
    }
  } else {
    mem.stuckTime = Math.max(0, mem.stuckTime - BOT_DT * 2);
  }
}

/** Pick / keep an enemy target. Detection respects the FOV cone unless the bot was just hurt. */
function acquireTarget(mem: BotMemory, ctx: BotCtx): BotEnemy | null {
  if (ctx.self.blind) return null;
  const fwdX = -Math.sin(mem.yaw), fwdZ = -Math.cos(mem.yaw);
  let best: BotEnemy | null = null;
  for (const e of ctx.enemies) {
    if (!e.losClear) continue;
    const dx = e.pos.x - ctx.self.pos.x, dz = e.pos.z - ctx.self.pos.z;
    const d2 = Math.hypot(dx, dz) || 1;
    const facing = (dx * fwdX + dz * fwdZ) / d2;
    const noticed = facing >= ctx.diff.detectFovCos
      || ctx.self.recentlyHurt
      || e.id === mem.targetId; // once seen, keep tracking without the cone
    if (!noticed) continue;
    if (!best || e.dist < best.dist) best = e;
  }
  if (best) {
    if (mem.targetId !== best.id) {
      mem.targetId = best.id;
      mem.acquiredAt = ctx.t;
    }
    mem.lastSeenAt = ctx.t;
    mem.lastSeenPos = { ...best.pos };
  } else if (ctx.t - mem.lastSeenAt > 3.5) {
    mem.targetId = null;
  }
  return best;
}

/** Aim at the enemy chest with difficulty-scaled wobble; returns aim error angle. */
function aimAt(mem: BotMemory, ctx: BotCtx, enemy: BotEnemy): void {
  const eyeY = ctx.self.pos.y + 1.55;
  const dx = enemy.pos.x - ctx.self.pos.x;
  const dy = enemy.pos.y + 0.95 - eyeY;
  const dz = enemy.pos.z - ctx.self.pos.z;
  const flat = Math.hypot(dx, dz) || 0.001;
  mem.aimWobblePhase += BOT_DT * 5.1;
  const blindMul = ctx.self.blind ? 5 : 1;
  const err = ctx.diff.aimError * blindMul;
  const wobbleYaw = (Math.sin(mem.aimWobblePhase) + (ctx.rng() - 0.5)) * err;
  const wobblePitch = (Math.cos(mem.aimWobblePhase * 1.31) + (ctx.rng() - 0.5)) * err * 0.7;
  const wantYaw = yawToward(dx, dz) + wobbleYaw;
  const wantPitch = Math.atan2(dy, flat) + wobblePitch;
  mem.yaw = angleLerp(mem.yaw, wantYaw, ENGAGE_TURN_RATE * BOT_DT);
  mem.pitch = angleLerp(mem.pitch, wantPitch, ENGAGE_TURN_RATE * BOT_DT);
}

/** Drive slot-3 selection + release for a planned throwable. Returns true while busy. */
function runThrowPlan(mem: BotMemory, ctx: BotCtx, inp: InputMsg): boolean {
  const plan = mem.throwPlan;
  if (!plan) return false;
  const count = ctx.self.throwables[plan.kind];
  if (count <= 0 && !(plan.kind === 'frag' && ctx.self.slot === 3)) { mem.throwPlan = null; return false; }
  if (ctx.t - plan.startedAt > 4) { mem.throwPlan = null; return false; } // safety
  if (ctx.self.slot !== 3) { inp.slot = 3; return true; }
  if (ctx.self.activeThrow !== plan.kind) { inp.throwCycle = true; return true; }
  if (plan.kind === 'frag') {
    // hold to cook until releaseAt, then let go (server throws on the falling edge)
    if (ctx.t < plan.releaseAt) { inp.fire = true; return true; }
    inp.fire = false;
    mem.throwPlan = null;
    inp.slot = bestRangedSlot(ctx.self) ?? meleeSlot(ctx.self) ?? 1;
    return true;
  }
  // smoke/flash throw on the rising edge: one fire press is enough
  inp.fire = true;
  mem.throwPlan = null;
  return true;
}

export function computeBotInput(mem: BotMemory, ctx: BotCtx): BotDecision {
  const inp = baseInput(mem);
  let wantHeal = false;
  const self = ctx.self;
  const enemy = acquireTarget(mem, ctx);
  const distFromCenter = Math.hypot(self.pos.x, self.pos.z);
  const zonePressure = distFromCenter > ctx.zone.target * 0.85
    || distFromCenter > ctx.zone.radius - 8;

  // ---- priority: finish an in-flight throwable plan
  if (runThrowPlan(mem, ctx, inp)) {
    updateStuck(mem, ctx, false);
    return { input: inp, wantHeal, state: mem.state };
  }

  if (enemy) {
    // =================== ENGAGE / FLEE ===================
    const losing = self.hp < 35 && enemy.dist < 30;
    mem.state = losing ? 'flee' : 'engage';

    // choose a weapon for the range
    const ranged = bestRangedSlot(self);
    const melee = meleeSlot(self);
    let desiredSlot: 1 | 2 | null = null;
    if (ranged) {
      const w = weaponInSlot(self, ranged);
      // shotgun wants to be close; sniper wants distance — otherwise just use it
      desiredSlot = ranged;
      if (w === 'sniper' && enemy.dist < 10 && melee) desiredSlot = melee;
    } else if (melee) desiredSlot = melee;
    if (desiredSlot && self.slot !== desiredSlot) inp.slot = desiredSlot;

    aimAt(mem, ctx, enemy);
    inp.yaw = mem.yaw;
    inp.pitch = mem.pitch;

    // movement: strafe in bursts, close in for melee / aggression, back off when losing
    if (ctx.t >= mem.strafeUntil) {
      mem.strafeUntil = ctx.t + 0.5 + ctx.rng() * 0.9;
      mem.strafeDir = ctx.rng() < 0.5 ? -1 : 1;
    }
    inp.mx = mem.strafeDir;
    const meleeType = desiredSlot !== null ? weaponInSlot(self, desiredSlot) : null;
    const usingMelee = meleeType !== null && WEAPONS[meleeType].kind === 'melee';
    if (losing) inp.mz = -1;
    else if (usingMelee || enemy.dist > 34) inp.mz = 1;
    else if (enemy.dist < 7 && !usingMelee) inp.mz = -0.6;
    else inp.mz = ctx.rng() < ctx.diff.aggression ? 0.6 : 0;
    inp.sprint = usingMelee && enemy.dist > 4;

    // fire control: reaction delay, then bursts with pauses
    const reacted = ctx.t - mem.acquiredAt >= ctx.diff.reaction;
    const activeType: WeaponType | null = self.slot === 3
      ? null
      : weaponInSlot(self, (desiredSlot === 1 || desiredSlot === 2 ? desiredSlot : self.slot === 2 ? 2 : 1));
    if (reacted && !self.blind && activeType) {
      const def = WEAPONS[activeType];
      const inRange = def.kind === 'melee' ? enemy.dist <= def.range + 0.3 : enemy.dist <= def.range;
      if (inRange && ctx.t >= mem.burstPauseUntil) {
        if (ctx.t >= mem.burstUntil) {
          mem.burstUntil = ctx.t + 0.4 + ctx.rng() * 0.7;
          mem.burstPauseUntil = mem.burstUntil + 0.25 + ctx.rng() * (1 - ctx.diff.aggression) * 0.9;
        }
        inp.fire = ctx.t < mem.burstUntil;
        inp.aim = def.kind === 'hitscan' || def.kind === 'projectile';
      }
      const magEmpty = self.slot !== 3
        && (self.slot === 1 ? self.primary : self.secondary)?.mag === 0;
      if (magEmpty) inp.reload = true;
    }

    // utility: cook a frag at mid range, smoke to break a losing fight
    if (ctx.t >= mem.nextThrowCheck) {
      mem.nextThrowCheck = ctx.t + 1.2;
      if (losing && self.throwables.smoke > 0 && ctx.rng() < ctx.diff.throwSkill) {
        mem.throwPlan = { kind: 'smoke', releaseAt: 0, startedAt: ctx.t };
      } else if (!losing && self.throwables.frag > 0 && enemy.dist > 8 && enemy.dist < 22
        && ctx.rng() < ctx.diff.throwSkill * 0.6) {
        mem.throwPlan = { kind: 'frag', releaseAt: ctx.t + 0.8 + ctx.rng() * 0.6, startedAt: ctx.t };
      } else if (!losing && self.throwables.flash > 0 && enemy.dist < 16
        && ctx.rng() < ctx.diff.throwSkill * 0.4) {
        mem.throwPlan = { kind: 'flash', releaseAt: 0, startedAt: ctx.t };
      }
    }
    updateStuck(mem, ctx, Math.abs(inp.mz) > 0.1);
    return { input: inp, wantHeal, state: mem.state };
  }

  // =================== no enemy in sight ===================
  const hurt = self.hp < 45;
  const safeToHeal = ctx.t - mem.lastSeenAt > 1.5 && !self.recentlyHurt;
  if (hurt && self.bandages > 0 && safeToHeal && !self.healing && !zonePressure) {
    mem.state = 'heal';
    wantHeal = true;
    // crouch behind whatever is nearby while the bandage runs
    inp.sneak = true;
    updateStuck(mem, ctx, false);
    return { input: inp, wantHeal, state: mem.state };
  }

  if (zonePressure) {
    // =================== ROTATE ===================
    mem.state = 'rotate';
    const angle = Math.atan2(self.pos.z, self.pos.x);
    const safeR = Math.max(4, ctx.zone.target * 0.55);
    const tx = Math.cos(angle) * safeR;
    const tz = Math.sin(angle) * safeR;
    steerTo(mem, ctx, inp, tx, tz, true);
    updateStuck(mem, ctx, true);
    return { input: inp, wantHeal, state: mem.state };
  }

  // =================== LOOT / WANDER ===================
  mem.state = 'loot';
  // investigate the last seen enemy position when aggressive
  if (mem.lastSeenPos && ctx.t - mem.lastSeenAt < 6 && ctx.rng() < ctx.diff.aggression) {
    const d = steerTo(mem, ctx, inp, mem.lastSeenPos.x, mem.lastSeenPos.z, true);
    if (d < 3) mem.lastSeenPos = null;
    updateStuck(mem, ctx, true);
    return { input: inp, wantHeal, state: mem.state };
  }
  if (ctx.loot) {
    const d = steerTo(mem, ctx, inp, ctx.loot.x, ctx.loot.z, true);
    // stand on weapons/crates: walk-over pickup handles the rest; hold interact
    // near the target so full-slot weapon swaps also work
    if (d < 2.2) inp.interact = true;
    updateStuck(mem, ctx, true);
    return { input: inp, wantHeal, state: mem.state };
  }
  // wander a random point inside the zone
  if (!mem.wander || ctx.t >= mem.wanderUntil
    || Math.hypot(mem.wander.x - self.pos.x, mem.wander.z - self.pos.z) < 3) {
    const a = ctx.rng() * Math.PI * 2;
    const r = Math.sqrt(ctx.rng()) * Math.max(10, ctx.zone.radius * 0.8);
    mem.wander = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    mem.wanderUntil = ctx.t + 9;
  }
  steerTo(mem, ctx, inp, mem.wander.x, mem.wander.z, ctx.rng() < 0.4);
  // heal opportunistically while wandering at low HP even if bandage is scarce
  if (self.hp < 70 && self.bandages >= Math.min(2, MAX_BANDAGES) && safeToHeal && !self.healing) {
    wantHeal = true;
  }
  updateStuck(mem, ctx, true);
  return { input: inp, wantHeal, state: mem.state };
}
