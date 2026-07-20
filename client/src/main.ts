// Island Duell client: menu/lobby → predicted first-person play (§8).
// Own movement: client prediction with the SAME shared sim as the host,
// snap-back reconciliation if drift > RECONCILE_SNAP_DIST.
// Remote players: interpolated ~100 ms behind the newest snapshot.
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {
  BANDAGE_USE_TIME, INTERACT_HOLD_SECS, INTERP_DELAY_MS, PLAYER_EYE_HEIGHT,
  RECONCILE_SNAP_DIST, WEAPONS, type WeaponType,
} from '@shared/constants';
import { sampleHeight } from '@shared/terrain';
import { GamePhysics } from '@shared/physics';
import { freshMoveState, stepMovement, type MoveState, MAX_INPUT_DT } from '@shared/movement';
import { generateWorld, type WorldGen } from '@shared/worldgen';
import type {
  GameEvent, InputMsg, LobbyStateMsg, MatchStartMsg, PickupInfo,
  RoundStartMsg, SnapPlayer, SnapshotMsg,
} from '@shared/protocol';
import { Net } from './net';
import { InputState } from './input';
import { World } from './world';
import { Entities } from './entities';
import { Hud, weaponName } from './hud';
import { Sfx } from './sfx';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

// ---------- three.js bootstrap ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.classList.add('game');
$('app').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.08, 400);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const input = new InputState(renderer.domElement);
const hud = new Hud();
const sfx = new Sfx();

// ---------- session state ----------
interface RemoteBufEntry { at: number; x: number; y: number; z: number; yaw: number; pitch: number }

let net: Net | null = null;
let myId = '';
let myName = '';
let isHost = false;
let inMatch = false;
let names = new Map<string, string>();
let colorIndex = new Map<string, number>();

let gen: WorldGen | null = null;
let world: World | null = null;
let phys: GamePhysics | null = null;
let entities: Entities | null = null;

let move: MoveState = freshMoveState({ x: 0, y: 10, z: 0 });
let seq = 0;
let pending: InputMsg[] = [];
let predicted = new Map<number, { x: number; y: number; z: number }>(); // seq → pos after applying it
let alive = false;
let roundRunning = false;
let suddenDeathAnnounced = false;

let lastSnap: SnapshotMsg | null = null;
let snapClock = { t: 0, at: 0 };   // round time + local receipt time
let remoteBufs = new Map<string, RemoteBufEntry[]>();
let myWeapon: WeaponType = 'fists';
let bandageStart: number | null = null;
let interactStart: number | null = null;
let showDebug = false;
let fpsAcc = 0, fpsFrames = 0, fpsShown = 0, bwShown = 0;

const specPos = new THREE.Vector3();

// ---------- menu / lobby wiring ----------
const nameInput = $('name-input') as HTMLInputElement;
const serverInput = $('server-input') as HTMLInputElement;
nameInput.value = localStorage.getItem('islandName') ?? '';

$('join-btn').addEventListener('click', joinServer);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') joinServer(); });

function joinServer(): void {
  const name = nameInput.value.trim();
  if (!name) { $('menu-error').textContent = 'Bitte einen Namen eingeben.'; return; }
  localStorage.setItem('islandName', name);
  myName = name;
  sfx.unlock();
  $('menu-error').textContent = 'Verbinde…';

  let url: string | undefined;
  const manual = serverInput.value.trim();
  if (manual) url = manual.startsWith('http') ? manual : `http://${manual}`;
  else if (location.port === '5173') url = 'http://localhost:3000'; // vite dev

  net = new Net(url, {
    onLobby: (m) => onLobby(m),
    onJoinError: (msg) => {
      $('menu-error').textContent = msg;
      $('lobby-error').textContent = msg;
    },
    onMatchStart: (m) => onMatchStart(m),
    onRoundStart: (m) => onRoundStart(m),
    onSnapshot: (m) => onSnapshot(m),
    onEvents: (evs) => { for (const e of evs) onEvent(e); },
    onRoundEnd: (m) => {
      roundRunning = false;
      hud.showRoundEnd(m.round, m.placements, m.totals, m.nextRoundIn, myId,
        m.matchOver === false && m.round >= 3);
    },
    onMatchEnd: (m) => {
      roundRunning = false;
      inMatch = false;
      hud.showMatchEnd(m.standings, m.totals, m.winnerName, myId, m.winnerId === myId);
      document.exitPointerLock?.();
    },
    onDisconnect: () => {
      $('menu-error').textContent = 'Verbindung getrennt.';
      showScreen('menu-screen');
      hud.hide();
      inMatch = false;
      roundRunning = false;
    },
  });
  net.socket.on('connect', () => {
    myId = net!.id;
    net!.join(myName);
  });
  net.socket.on('connect_error', () => {
    $('menu-error').textContent = 'Server nicht erreichbar.';
  });
}

let myReady = false;
$('ready-btn').addEventListener('click', () => {
  myReady = !myReady;
  net?.setReady(myReady);
  sfx.play('click');
});
$('start-btn').addEventListener('click', () => { net?.startMatch(); sfx.play('click'); });
$('rematch-btn').addEventListener('click', () => {
  net?.rematch();
  hud.hideScoreboard();
  hud.hide();
  myReady = true;
  showScreen('lobby-screen');
});

function showScreen(id: string | null): void {
  for (const s of ['menu-screen', 'lobby-screen', 'scoreboard-screen']) {
    $(s).classList.toggle('hidden', s !== id);
  }
}

function onLobby(m: LobbyStateMsg): void {
  names = new Map(m.players.map((p) => [p.id, p.name]));
  m.players.forEach((p, i) => colorIndex.set(p.id, i));
  const me = m.players.find((p) => p.id === myId);
  isHost = !!me?.isHost;
  if (me) myReady = me.ready;
  if (inMatch) return; // lobby updates during a match don't change the screen

  showScreen('lobby-screen');
  const ul = $('lobby-players');
  ul.innerHTML = '';
  for (const p of m.players) {
    const li = document.createElement('li');
    const left = document.createElement('span');
    left.textContent = p.name + (p.id === myId ? ' (du)' : '');
    const right = document.createElement('span');
    right.className = 'tag' + (p.ready ? ' ready' : '');
    right.textContent = (p.isHost ? '👑 Host · ' : '') + (p.ready ? 'bereit ✓' : 'wartet…');
    li.append(left, right);
    ul.appendChild(li);
  }
  $('ready-btn').textContent = myReady ? 'Bereit ✓ (klicken zum Ändern)' : 'Bereit';
  const startBtn = $('start-btn') as HTMLButtonElement;
  startBtn.style.display = isHost ? 'block' : 'none';
  startBtn.disabled = !m.canStart;
  $('lobby-error').textContent = m.players.length < 2 ? 'Warte auf weitere Spieler (min. 2)…' : '';
}

// ---------- match / round ----------
function onMatchStart(m: MatchStartMsg): void {
  inMatch = true;
  suddenDeathAnnounced = false;
  m.players.forEach((p, i) => { names.set(p.id, p.name); colorIndex.set(p.id, i); });

  gen = generateWorld(m.seed, m.n);
  world = new World(gen);
  world.scene.add(camera);
  entities = new Entities(world.scene, camera);
  phys = new GamePhysics(RAPIER, gen);
  phys.addPlayer(myId, { x: 0, y: 20, z: 0 });
  hud.initIsland(gen.params, gen.spawns);

  for (const p of m.players) {
    if (p.id !== myId) entities.ensurePlayer(p.id, p.name, colorIndex.get(p.id) ?? 0);
  }

  showScreen(null);
  hud.show();
  input.requestLock();
}

function onRoundStart(m: RoundStartMsg): void {
  if (!gen || !phys || !entities) return;
  hud.hideScoreboard();
  hud.show();
  roundRunning = true;
  alive = true;
  myWeapon = 'fists';
  pending = [];
  predicted.clear();
  remoteBufs.clear();
  bandageStart = null;
  interactStart = null;
  lastSnap = null;

  const spawnIdx = m.spawns[myId] ?? 0;
  const sp = gen.spawns[spawnIdx];
  const y = sampleHeight(gen.params, sp.x, sp.z);
  move = freshMoveState({ x: sp.x, y: y + 0.1, z: sp.z });
  phys.setPlayerPos(myId, move.pos);
  input.yaw = Math.atan2(-(-sp.x), -(-sp.z)); // face island center
  input.pitch = 0;

  entities.clearPickups();
  for (const p of m.pickups) entities.addPickup(p);
  entities.setViewWeapon('fists');
  entities.setViewVisible(true);
  hud.setSpectating(false);

  if (m.suddenDeath && !suddenDeathAnnounced) {
    suddenDeathAnnounced = true;
    hud.announce('⚔ SUDDEN DEATH — eine Runde entscheidet!', 4000);
  } else {
    hud.announce(`Runde ${Math.min(m.round, 3)}${m.suddenDeath ? ' (Sudden Death)' : ''}`, 2200);
  }
  input.requestLock();
}

// ---------- snapshots ----------
function onSnapshot(m: SnapshotMsg): void {
  lastSnap = m;
  snapClock = { t: m.t, at: performance.now() };
  const now = performance.now();

  for (const p of m.players) {
    if (p.id === myId) { reconcile(p); continue; }
    if (!remoteBufs.has(p.id)) {
      remoteBufs.set(p.id, []);
      entities?.ensurePlayer(p.id, names.get(p.id) ?? '???', colorIndex.get(p.id) ?? 0);
    }
    const buf = remoteBufs.get(p.id)!;
    buf.push({ at: now, x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    while (buf.length > 30) buf.shift();
    entities?.updatePlayer(p.id, p.x, p.y, p.z, p.yaw, p.pitch, p.alive, p.weapon);
  }

  entities?.syncProjectiles(m.projectiles);
  entities?.setCareIncoming(m.care.x, m.care.z, m.care.state === 'incoming');
}

function reconcile(self: SnapPlayer): void {
  if (!phys) return;
  const wasAlive = alive;
  alive = self.alive;
  if (wasAlive && !alive) enterSpectator();

  hud.setHp(self.hp);
  myWeapon = self.weapon;

  // drop acknowledged inputs
  pending = pending.filter((i) => i.seq > self.lastSeq);
  for (const s of [...predicted.keys()]) if (s < self.lastSeq) predicted.delete(s);

  const pred = predicted.get(self.lastSeq);
  if (!pred) return;
  const err = Math.hypot(pred.x - self.x, pred.y - self.y, pred.z - self.z);
  if (err > RECONCILE_SNAP_DIST) {
    // snap-back: adopt authority, replay unacknowledged inputs (§8)
    move.pos = { x: self.x, y: self.y, z: self.z };
    phys.setPlayerPos(myId, move.pos);
    for (const inp of pending) stepMovement(phys, myId, move, inp);
  }
  predicted.delete(self.lastSeq);
}

function enterSpectator(): void {
  hud.setSpectating(true);
  entities?.setViewVisible(false);
  specPos.set(move.pos.x, move.pos.y + 14, move.pos.z + 10);
}

// ---------- events ----------
function distToMe(x: number, y: number, z: number): number {
  return Math.hypot(x - move.pos.x, y - move.pos.y, z - move.pos.z);
}

function onEvent(e: GameEvent): void {
  switch (e.type) {
    case 'shot': {
      const d = e.by === myId ? 0 : distToMe(e.ox, e.oy, e.oz);
      const w = e.weapon;
      sfx.play(w === 'bow' ? 'bow' : w === 'shotgun' ? 'shotgun' : w === 'rifle' ? 'rifle' : 'pistol', d);
      if (WEAPONS[w].kind === 'hitscan' && e.hx !== undefined) {
        entities?.addTracer(new THREE.Vector3(e.ox, e.oy, e.oz), new THREE.Vector3(e.hx, e.hy, e.hz));
      }
      if (e.by === myId) entities?.addMuzzleFlash(camera);
      break;
    }
    case 'melee':
      sfx.play('melee', e.by === myId ? 0 : 20);
      if (e.by === myId) entities?.meleeSwing();
      break;
    case 'explosion':
      entities?.addExplosion(e.x, e.y, e.z, e.radius);
      sfx.play('explosion', distToMe(e.x, e.y, e.z));
      break;
    case 'damage':
      if (e.target === myId) { hud.damageFlash(); sfx.play('hurt'); hud.setHp(e.hp); }
      break;
    case 'hitmarker':
      hud.hitmarker(e.headshot);
      sfx.play('hit');
      break;
    case 'death': {
      if (e.target === myId) hud.announce('☠ Du bist raus — Zuschauermodus', 3000);
      break;
    }
    case 'kill': {
      const killer = e.killer ? names.get(e.killer) ?? '???' : null;
      const victim = names.get(e.victim) ?? '???';
      const text = e.weapon === 'zone'
        ? (killer ? `${victim} von der Zone erledigt (letzter Treffer: ${killer})` : `☣ ${victim} stirbt in der Zone`)
        : `${killer} ⚔ ${victim} (${weaponName(e.weapon as WeaponType)})`;
      hud.killfeed(text, e.killer === myId || e.victim === myId);
      break;
    }
    case 'pickupSpawn': entities?.addPickup(e.pickup); break;
    case 'pickupRemove':
      entities?.removePickup(e.id);
      if (e.by === myId) sfx.play('pickup');
      break;
    case 'resource':
      if (e.by === myId) { sfx.play('craft'); interactStart = null; }
      break;
    case 'inventory':
      hud.setInventory(e.inv);
      updateViewmodel(e.inv.active, e.inv);
      break;
    case 'craft':
      if (e.by === myId) {
        if (e.ok) { sfx.play('craft'); hud.announce(`Hergestellt: ${e.recipe === 'arrows' ? 'Pfeile' : e.recipe === 'bandage' ? 'Verband' : 'Panzerplatte'}`, 1400); }
        else hud.announce(e.reason ?? 'Nicht genug Material', 1400);
      }
      break;
    case 'heal':
      if (e.target === myId) { hud.setHp(e.hp); sfx.play('heal'); }
      break;
    case 'care':
      if (e.state === 'incoming') { hud.announce('📦 Versorgungspaket im Anflug (Inselmitte)!', 3500); sfx.play('care'); }
      else if (e.state === 'landed') { hud.announce('📦 Versorgungspaket gelandet!', 2500); sfx.play('care'); }
      break;
    case 'zoneStep':
      hud.announce(`☣ Zone schrumpft! (Schaden ${e.dot} HP/s)`, 3000);
      sfx.play('zone');
      break;
  }
}

function updateViewmodel(active: 1 | 2 | 3, inv: { primary: { type: WeaponType } | null; secondary: { type: WeaponType } | null }): void {
  let w: WeaponType | 'none' = 'none';
  if (active === 3) w = 'grenade';
  else {
    const slot = active === 1 ? inv.primary : inv.secondary;
    w = slot ? slot.type : 'none';
  }
  entities?.setViewWeapon(w);
}

// ---------- interact hint (client-side mirror of server ranges) ----------
function updateInteractHint(dt: number): void {
  if (!gen || !alive) { hud.setInteract(null, 0); return; }
  // nearest vegetation resource node in range
  let best: { kind: string; d: number } | null = null;
  for (const v of gen.vegetation) {
    const reach = INTERACT_HOLD_SECS && v.kind === 'tree' ? 3.4 : 2.8;
    const d = Math.hypot(v.x - move.pos.x, v.z - move.pos.z);
    if (d < reach && (!best || d < best.d)) best = { kind: v.kind, d };
  }
  if (best) {
    if (input.interact) {
      interactStart = interactStart ?? performance.now();
      const p = Math.min(1, (performance.now() - interactStart) / (INTERACT_HOLD_SECS * 1000));
      const label = best.kind === 'tree' ? 'Holz hacken' : best.kind === 'rock' ? 'Stein abbauen' : 'Fasern sammeln';
      hud.setInteract(`${label}…`, p);
    } else {
      interactStart = null;
      const label = best.kind === 'tree' ? '🪵 Holz' : best.kind === 'rock' ? '🪨 Stein' : '🌿 Fasern';
      hud.setInteract(`[E halten] ${label} sammeln`, 0);
    }
  } else {
    interactStart = null;
    hud.setInteract(null, 0);
  }
  void dt;
}

// ---------- main loop ----------
let lastFrame = performance.now();

function frame(): void {
  requestAnimationFrame(frame);
  const now = performance.now();
  let dt = (now - lastFrame) / 1000;
  lastFrame = now;
  dt = Math.min(dt, 0.1);

  if (!world || !entities || !phys || !net) { renderer.clear(); return; }

  const t = lastSnap ? snapClock.t + (now - snapClock.at) / 1000 : 0;

  // --- input → predict → send ---
  if (roundRunning && alive && inMatch) {
    const inp: InputMsg = {
      seq: ++seq,
      dt: Math.min(dt, MAX_INPUT_DT),
      mx: input.pointerLocked ? input.moveX : 0,
      mz: input.pointerLocked ? input.moveZ : 0,
      yaw: input.yaw,
      pitch: input.pitch,
      sprint: input.sprint,
      jump: input.pointerLocked && input.jumpHeld,
      fire: input.fire,
      interact: input.interact,
    };
    if (input.slotPressed) inp.slot = input.slotPressed;
    if (input.reloadPressed) inp.reload = true;
    stepMovement(phys, myId, move, inp);
    predicted.set(inp.seq, { ...move.pos });
    pending.push(inp);
    net.sendInput(inp);
    phys.step();

    if (input.craftPressed) net.craft(input.craftPressed);
    if (input.bandagePressed) { net.useBandage(); bandageStart = now; }

    camera.position.set(move.pos.x, move.pos.y + PLAYER_EYE_HEIGHT, move.pos.z);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(input.yaw);
    camera.rotateX(input.pitch);
  } else if (roundRunning && !alive) {
    // spectator free camera (§0 B3)
    const speed = 22 * dt;
    const sin = Math.sin(input.yaw), cos = Math.cos(input.yaw);
    const fwd = new THREE.Vector3(-sin * Math.cos(input.pitch), Math.sin(input.pitch), -cos * Math.cos(input.pitch));
    const right = new THREE.Vector3(cos, 0, -sin);
    specPos.addScaledVector(fwd, input.moveZ * speed);
    specPos.addScaledVector(right, input.moveX * speed);
    if (input.jumpHeld) specPos.y += speed;
    specPos.y = Math.max(2, Math.min(120, specPos.y));
    camera.position.copy(specPos);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(input.yaw);
    camera.rotateX(input.pitch);
  }

  // --- remote interpolation (~100 ms behind, §8) ---
  const renderAt = now - INTERP_DELAY_MS;
  for (const [id, buf] of remoteBufs) {
    if (id === myId || buf.length === 0) continue;
    let a = buf[0], b = buf[buf.length - 1];
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i].at <= renderAt && buf[i + 1].at >= renderAt) { a = buf[i]; b = buf[i + 1]; break; }
    }
    const span = b.at - a.at;
    const k = span > 0 ? Math.max(0, Math.min(1, (renderAt - a.at) / span)) : 1;
    const lerp = (p: number, q: number) => p + (q - p) * k;
    let yawDiff = b.yaw - a.yaw;
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
    const snapP = lastSnap?.players.find((p) => p.id === id);
    entities.updatePlayer(
      id, lerp(a.x, b.x), lerp(a.y, b.y), lerp(a.z, b.z),
      a.yaw + yawDiff * k, lerp(a.pitch, b.pitch),
      snapP?.alive ?? true, snapP?.weapon ?? 'fists',
    );
  }

  // --- environment / HUD ---
  if (lastSnap) {
    world.update(t, lastSnap.zone.radius, lastSnap.zone.targetRadius);
    hud.setTimer(t, lastSnap.phase);
    hud.setZoneInfo(lastSnap.zone, t);
    hud.setAlive(lastSnap.aliveCount);
    const selfSnap = lastSnap.players.find((p) => p.id === myId);
    if (selfSnap) {
      hud.setStamina(alive ? move.stamina : 0);
      const outside = Math.hypot(move.pos.x, move.pos.z) > lastSnap.zone.radius;
      hud.setInZone(alive && outside);
      if (selfSnap.bandaging) {
        bandageStart = bandageStart ?? now;
        hud.setHealProgress(Math.min(1, (now - bandageStart) / (BANDAGE_USE_TIME * 1000)));
      } else {
        bandageStart = null;
        hud.setHealProgress(null);
      }
    }
    hud.drawMinimap(
      alive ? move.pos.x : specPos.x, alive ? move.pos.z : specPos.z, input.yaw,
      lastSnap.zone, lastSnap.pings, lastSnap.care, t,
    );
  }
  updateInteractHint(dt);
  entities.update(dt, now / 1000);

  // --- F3 debug ---
  if (input.debugToggled) showDebug = !showDebug;
  fpsAcc += dt; fpsFrames++;
  if (fpsAcc >= 0.5) {
    fpsShown = Math.round(fpsFrames / fpsAcc);
    bwShown = Math.round((net.bytesIn / fpsAcc) / 1024 * 10) / 10;
    net.bytesIn = 0;
    fpsAcc = 0; fpsFrames = 0;
  }
  hud.setDebug(showDebug
    ? `FPS ${fpsShown}\npos ${move.pos.x.toFixed(1)} ${move.pos.y.toFixed(1)} ${move.pos.z.toFixed(1)}\nnet ↓ ${bwShown} kB/s\npending ${pending.length}`
    : null);

  input.clearEdges();
  renderer.render(world.scene, camera);
}

// pointer-lock pause hint
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  $('pause-hint').style.display = !locked && inMatch && roundRunning ? 'block' : 'none';
});
renderer.domElement.addEventListener('click', () => {
  if (inMatch && !input.pointerLocked) input.requestLock();
});

// ---------- boot ----------
RAPIER.init().then(() => {
  requestAnimationFrame(frame);
});
