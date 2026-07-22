// Island Duell client: menu/lobby → predicted first-person play (§8).
// Own movement: client prediction with the SAME shared sim as the host,
// snap-back reconciliation if drift > RECONCILE_SNAP_DIST.
// Remote players: interpolated ~100 ms behind the newest snapshot.
import * as THREE from 'three';
import {
  BANDAGE_USE_TIME, GRENADE_FUSE, INTERACT_HOLD_SECS, INTERP_DELAY_MS, MATCH_MODE_PACE,
  PLAYER_EYE_HEIGHT, PLAYER_SNEAK_EYE_HEIGHT, RECONCILE_SNAP_DIST,
  SCOPE_BREATH_MAX, SCOPE_BREATH_REGEN, SERVER_TICK_HZ, THROW_WEAPON, WEAPONS,
  type BotDifficulty, type MatchMode, type WeaponType,
} from '@shared/constants';
import { sampleHeight } from '@shared/terrain';
import { GamePhysics, type RapierModule } from '@shared/physics';
import { freshMoveState, stepMovement, type MoveState } from '@shared/movement';
import { bushAt, generateWorld, type WorldGen } from '@shared/worldgen';
import type {
  GameEvent, InputMsg, InventoryState, LobbyStateMsg, MatchStartMsg, PickupInfo,
  RoundStartMsg, SessionMsg, SnapPlayer, SnapshotMsg,
} from '@shared/protocol';
import { recordProfileMatch, renderProfile } from './profile-ui';
import { Net } from './net';
import { InputState } from './input';
import { World } from './world';
import { Entities } from './entities';
import { Hud, weaponName } from './hud';
import { Sfx, type SfxName } from './sfx';
import { OnboardingGuide } from './onboarding';
import { FREECAM_FAST_SPEED, FREECAM_SPEED, updateFreecam } from './spectator';
import { AdaptiveResolution } from './performance';
import { gameAssets } from './game-assets';
import {
  DEFAULT_SETTINGS, keyLabel, loadSettings, saveSettings,
  type BindAction, type PlayerSettings,
} from './settings';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

// ---------- three.js bootstrap ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.classList.add('game');
$('app').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.08, 400);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let settings: PlayerSettings = loadSettings();
const input = new InputState(renderer.domElement, settings);
const hud = new Hud();
const sfx = new Sfx();
const onboarding = new OnboardingGuide(
  $('onboarding-tip'), $('onboarding-step'), $('onboarding-title'), $('onboarding-body'),
);
$('onboarding-skip').addEventListener('click', (event) => {
  event.stopPropagation();
  onboarding.dismiss();
});
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const adaptiveResolution = new AdaptiveResolution();
let renderScale = 1;
let matchMode: MatchMode = 'classic';
let matchPace = MATCH_MODE_PACE.classic;

// ---------- session state ----------
interface RemoteBufEntry { at: number; x: number; y: number; z: number; yaw: number; pitch: number }
interface FootstepState { x: number; z: number; distance: number; bushId: number | null; bushDistance: number }

let net: Net | null = null;
let rapier: RapierModule | null = null;
let rapierPromise: Promise<RapierModule> | null = null;
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
const previousMovePos = new THREE.Vector3(move.pos.x, move.pos.y, move.pos.z);
const renderMovePos = previousMovePos.clone();
const renderCorrection = new THREE.Vector3();
let seq = 0;
let pending: InputMsg[] = [];
let alive = false;
let roundRunning = false;
let suddenDeathAnnounced = false;

let lastSnap: SnapshotMsg | null = null;
let snapClock = { t: 0, at: 0 };   // round time + local receipt time
let remoteBufs = new Map<string, RemoteBufEntry[]>();
let remoteFootsteps = new Map<string, FootstepState>();
let localFootstepDistance = 0;
let myWeapon: WeaponType = 'fists';
let bandageStart: number | null = null;
let interactStart: number | null = null;
let depletedNodes = new Set<number>();
let wasReloading = false;
let damageKick = 0;
let fireFovKick = 0;
let cameraEyeHeight = PLAYER_EYE_HEIGHT;
let showDebug = false;
let fpsAcc = 0, fpsFrames = 0, fpsShown = 0, bwShown = 0;
let visualElapsed = 0;
let matchSeed: number | null = null;
let resumeToken = '';
let networkConnected = false;
let forceAuthority = false;
let crosshairBloom = 0;
let shotPattern = 0;
let localBushId: number | null = null;
let localBushDistance = 0;
let joinedTransportId = '';
let lastInv: InventoryState | null = null;
// sniper scope (§F1): sway is added to the SENT view direction so it counts
let swayT = 0;
let swayYaw = 0;
let swayPitch = 0;
let breath = SCOPE_BREATH_MAX;
// flashbang whiteout (§F2)
let flashLevel = 0;
let flashDecay = 0;
// frag cooking beeps (§F3)
let nextCookBeepAt = 0;
// profile bookkeeping (§F5)
let practiceMatch = false;
let myDeathsThisMatch = 0;
let roundsThisMatch = 0;
let onboardingOrigin: { x: number; z: number } | null = null;
let inputAccumulator = 0;
let reconciliationHardSnaps = 0;
let reconciliationSmoothCorrections = 0;
let lastReconciliationError = 0;
let maxReconciliationError = 0;
let maxPredictionStepsPerFrame = 0;

function resetRenderMovePosition(): void {
  previousMovePos.set(move.pos.x, move.pos.y, move.pos.z);
  renderMovePos.copy(previousMovePos);
  renderCorrection.set(0, 0, 0);
}

const specPos = new THREE.Vector3();
let spectateYaw = 0;

function disposeMatchScene(): void {
  if (world) world.scene.remove(camera);
  entities?.dispose();
  phys?.dispose();
  world?.dispose();
  entities = null;
  phys = null;
  world = null;
  gen = null;
  lastSnap = null;
  remoteBufs.clear();
  remoteFootsteps.clear();
  renderer.renderLists.dispose();
}

function rumble(duration: number, strong = 0.5, weak = 0.25): void {
  type RumblePad = Gamepad & {
    vibrationActuator?: {
      playEffect?: (type: string, params: { duration: number; strongMagnitude: number; weakMagnitude: number }) => Promise<unknown>;
      pulse?: (value: number, duration: number) => Promise<boolean>;
    };
  };
  const pad = navigator.getGamepads?.().find((entry) => entry?.connected) as RumblePad | undefined;
  const actuator = pad?.vibrationActuator;
  if (actuator?.playEffect) {
    void actuator.playEffect('dual-rumble', { duration, strongMagnitude: strong, weakMagnitude: weak });
  } else if (actuator?.pulse) {
    void actuator.pulse(Math.max(strong, weak), duration);
  }
}

function footstepSound(x: number, z: number): SfxName {
  if (Math.hypot(x, z) < 19) return 'stepStone';
  if (gen && sampleHeight(gen.params, x, z) < 2.15) return 'stepSand';
  return 'stepGrass';
}

function spatialPan(x: number, z: number): number {
  const dx = x - move.pos.x, dz = z - move.pos.z;
  const d = Math.hypot(dx, dz) || 1;
  return Math.max(-1, Math.min(1, (dx * Math.cos(input.yaw) - dz * Math.sin(input.yaw)) / d));
}

function playSpatial(name: SfxName, x: number, y: number, z: number, intensity = 1): void {
  sfx.play(name, distToMe(x, y, z), intensity, spatialPan(x, z));
}

function updateLocalFootsteps(dt: number): void {
  if (!alive || !move.grounded) return;
  const speed = Math.hypot(move.velX, move.velZ);
  if (speed < 0.45) return;
  localFootstepDistance += speed * dt;
  const stride = move.sprinting ? 2.05 : move.sneaking ? 1.65 : 1.8;
  if (localFootstepDistance < stride) return;
  localFootstepDistance %= stride;
  sfx.play(footstepSound(move.pos.x, move.pos.z), 0, move.sneaking ? 0.16 : move.sprinting ? 0.9 : 0.55);
  const bush = gen ? bushAt(gen, move.pos.x, move.pos.z) : null;
  if (bush?.id !== localBushId) { localBushId = bush?.id ?? null; localBushDistance = 0; }
  if (bush) {
    localBushDistance += stride;
    if (localBushDistance >= 1.15) {
      localBushDistance = 0;
      sfx.play('bushRustle', 0, move.sneaking ? 0.12 : move.sprinting ? 0.9 : 0.5);
    }
  }
}

function updateRemoteFootsteps(
  id: string, x: number, z: number,
  state: { alive: boolean; grounded: boolean; sneaking: boolean; sprinting: boolean },
): void {
  const previous = remoteFootsteps.get(id);
  if (!previous) { remoteFootsteps.set(id, { x, z, distance: 0, bushId: null, bushDistance: 0 }); return; }
  const delta = Math.hypot(x - previous.x, z - previous.z);
  previous.x = x;
  previous.z = z;
  if (!state.alive || !state.grounded || delta > 2) { previous.distance = 0; return; }
  previous.distance += delta;
  const stride = state.sprinting ? 2.05 : state.sneaking ? 1.65 : 1.8;
  if (previous.distance < stride) return;
  previous.distance %= stride;
  playSpatial(footstepSound(x, z), x, move.pos.y, z, state.sneaking ? 0.13 : state.sprinting ? 0.82 : 0.48);
  const bush = gen ? bushAt(gen, x, z) : null;
  if (bush?.id !== previous.bushId) { previous.bushId = bush?.id ?? null; previous.bushDistance = 0; }
  if (bush) {
    previous.bushDistance += stride;
    if (previous.bushDistance >= 1.15) {
      previous.bushDistance = 0;
      playSpatial('bushRustle', x, move.pos.y, z, state.sneaking ? 0.1 : state.sprinting ? 0.82 : 0.44);
    }
  }
}

const diagnostics = {
  snapshot: () => ({
    seed: matchSeed,
    state: { inMatch, roundRunning, alive, pointerLocked: input.pointerLocked },
    player: {
      position: { ...move.pos },
      renderPosition: { x: renderMovePos.x, y: renderMovePos.y, z: renderMovePos.z },
      velocity: { x: move.velX, y: move.velY, z: move.velZ },
      grounded: move.grounded, sprinting: move.sprinting, sneaking: move.sneaking,
    },
    input: {
      moveX: input.moveX, moveZ: input.moveZ, fire: input.fire, aim: input.aim,
      sprint: input.sprint, sneak: input.sneak, interact: input.interact,
    },
    renderer: {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: renderer.info.render.points,
      lines: renderer.info.render.lines,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    },
    entities: entities?.stats() ?? null,
    physics: phys?.stats() ?? null,
    network: {
      pendingInputs: pending.length, inboundKbPerSec: bwShown,
      rttMs: net?.rttMs ?? 0, jitterMs: net?.jitterMs ?? 0, lossPct: net?.lossPct ?? 0,
      reconciliationHardSnaps, lastReconciliationError, maxReconciliationError,
      reconciliationSmoothCorrections, maxPredictionStepsPerFrame,
    },
  }),
};
(window as Window & { __ISLAND_DUELL_DIAGNOSTICS__?: typeof diagnostics }).__ISLAND_DUELL_DIAGNOSTICS__ = diagnostics;

// ---------- persistent player settings ----------
const settingsDialog = $('settings-dialog') as HTMLDialogElement;
const range = (id: string) => $(id) as HTMLInputElement;

function applyRuntimeSettings(): void {
  input.setSettings(settings);
  sfx.setVolumes(settings.masterVolume, settings.effectsVolume, settings.footstepsVolume);
  const ratioCap = settings.graphics === 'low' ? 1 : settings.graphics === 'medium' ? 1.5 : 2;
  adaptiveResolution.reset();
  renderScale = 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratioCap) * renderScale);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = settings.graphics !== 'low';
  world?.setGraphicsQuality(settings.graphics);
  if (!settings.cameraShake) { damageKick = 0; fireFovKick = 0; }
  $('controls-hint').textContent = `${keyLabel(settings.keybinds.forward)}/${keyLabel(settings.keybinds.left)}/${keyLabel(settings.keybinds.back)}/${keyLabel(settings.keybinds.right)} Bewegen · ${keyLabel(settings.keybinds.sneak)} Schleichen · ${keyLabel(settings.keybinds.sprint)} Sprint/Atem · RMB Zielen · ${keyLabel(settings.keybinds.reload)} Nachladen · ${keyLabel(settings.keybinds.interact)} Sammeln · ${keyLabel(settings.keybinds.heal)} Heilen · 3×2 Wurf wechseln`;
}

function populateSettings(): void {
  range('mouse-sensitivity').value = String(settings.mouseSensitivity);
  $('mouse-sensitivity-value').textContent = `${settings.mouseSensitivity.toFixed(2)}×`;
  range('master-volume').value = String(settings.masterVolume);
  range('effects-volume').value = String(settings.effectsVolume);
  range('footsteps-volume').value = String(settings.footstepsVolume);
  ($('graphics-quality') as HTMLSelectElement).value = settings.graphics;
  ($('camera-shake') as HTMLInputElement).checked = settings.cameraShake;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-bind]')) {
    button.textContent = keyLabel(settings.keybinds[button.dataset.bind as BindAction]);
    button.classList.remove('listening');
  }
}

function commitSettings(): void {
  settings.mouseSensitivity = Number(range('mouse-sensitivity').value);
  settings.masterVolume = Number(range('master-volume').value);
  settings.effectsVolume = Number(range('effects-volume').value);
  settings.footstepsVolume = Number(range('footsteps-volume').value);
  settings.graphics = ($('graphics-quality') as HTMLSelectElement).value as PlayerSettings['graphics'];
  settings.cameraShake = ($('camera-shake') as HTMLInputElement).checked;
  $('mouse-sensitivity-value').textContent = `${settings.mouseSensitivity.toFixed(2)}×`;
  saveSettings(settings);
  applyRuntimeSettings();
}

function openSettings(): void {
  document.exitPointerLock?.();
  populateSettings();
  if (!settingsDialog.open) settingsDialog.showModal();
}

for (const id of ['mouse-sensitivity', 'master-volume', 'effects-volume', 'footsteps-volume', 'graphics-quality', 'camera-shake']) {
  $(id).addEventListener('input', commitSettings);
}
for (const id of ['menu-settings-btn', 'pause-settings-btn']) $(id).addEventListener('click', (event) => {
  event.stopPropagation(); openSettings();
});
$('reset-settings-btn').addEventListener('click', () => {
  settings = structuredClone(DEFAULT_SETTINGS);
  populateSettings();
  commitSettings();
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-bind]')) {
  button.addEventListener('click', () => {
    const action = button.dataset.bind as BindAction;
    button.textContent = 'Taste drücken …';
    button.classList.add('listening');
    const capture = (event: KeyboardEvent) => {
      event.preventDefault(); event.stopPropagation();
      if (event.code === 'Escape') { populateSettings(); return; }
      const previous = settings.keybinds[action];
      const conflict = (Object.keys(settings.keybinds) as BindAction[])
        .find((key) => key !== action && settings.keybinds[key] === event.code);
      if (conflict) settings.keybinds[conflict] = previous;
      settings.keybinds[action] = event.code;
      saveSettings(settings); applyRuntimeSettings(); populateSettings();
    };
    window.addEventListener('keydown', capture, { capture: true, once: true });
  });
}
settingsDialog.addEventListener('close', () => {
  if (inMatch && roundRunning && networkConnected) input.requestLock();
});
applyRuntimeSettings();

// ---------- menu / lobby wiring ----------
const nameInput = $('name-input') as HTMLInputElement;
const serverInput = $('server-input') as HTMLInputElement;
const joinButton = $('join-btn') as HTMLButtonElement;
nameInput.value = localStorage.getItem('islandName') ?? '';

$('join-btn').addEventListener('click', () => { void joinServer(); });
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') void joinServer(); });

function ensureRapier(): Promise<RapierModule> {
  if (rapier) return Promise.resolve(rapier);
  if (!rapierPromise) {
    rapierPromise = import('@dimforge/rapier3d-compat').then(async ({ default: module }) => {
      await module.init();
      rapier = module;
      return module;
    });
  }
  return rapierPromise;
}

function setJoinBusy(busy: boolean): void {
  joinButton.disabled = busy;
  joinButton.setAttribute('aria-busy', String(busy));
  joinButton.textContent = busy ? 'Spiel wird geladen…' : 'Beitreten';
}

async function joinServer(): Promise<void> {
  const name = nameInput.value.trim();
  if (!name) { $('menu-error').textContent = 'Bitte einen Namen eingeben.'; return; }
  localStorage.setItem('islandName', name);
  myName = name;
  resumeToken = localStorage.getItem(`islandResumeToken:${name.toLocaleLowerCase()}`) ?? '';
  sfx.unlock();
  $('menu-error').textContent = 'Lade Physik und kompakte Spielmodelle…';
  setJoinBusy(true);

  try {
    await Promise.all([ensureRapier(), gameAssets.preload(renderer)]);
  } catch {
    $('menu-error').textContent = 'Die Spielphysik konnte nicht geladen werden. Bitte Seite neu laden.';
    setJoinBusy(false);
    return;
  }

  let url: string | undefined;
  const manual = serverInput.value.trim();
  if (manual) url = manual.startsWith('http') ? manual : `http://${manual}`;
  else if (location.port === '5173') url = 'http://localhost:3000'; // vite dev

  net?.dispose();
  net = null;
  networkConnected = false;
  joinedTransportId = '';

  let nextNet!: Net;
  nextNet = new Net(url, {
    onLobby: (m) => onLobby(m),
    onJoinError: (msg) => {
      $('menu-error').textContent = msg;
      $('lobby-error').textContent = msg;
      setJoinBusy(false);
    },
    onMatchStart: (m) => onMatchStart(m),
    onRoundStart: (m) => onRoundStart(m),
    onSnapshot: (m) => onSnapshot(m),
    onEvents: (evs) => { for (const e of evs) onEvent(e); },
    onRoundEnd: (m) => {
      roundRunning = false;
      roundsThisMatch = m.round;
      const myPlacement = m.placements.find((entry) => entry.id === myId);
      sfx.play(myPlacement?.place === 1 ? 'roundWin' : 'roundLose');
      if (myPlacement?.place === 1) rumble(180, 0.35, 0.55);
      hud.showRoundEnd(m.round, m.placements, m.totals, m.nextRoundIn, myId,
        m.matchOver === false && m.round >= 3, m.stats);
    },
    onMatchEnd: (m) => {
      roundRunning = false;
      inMatch = false;
      hud.showMatchEnd(m.standings, m.totals, m.winnerName, myId, m.winnerId === myId, m.stats);
      document.exitPointerLock?.();
      recordProfileMatch({
        name: myName, playerId: myId, seed: matchSeed ?? 0,
        rounds: roundsThisMatch, deaths: myDeathsThisMatch,
        practice: practiceMatch || !!m.practice, standings: m.standings, stats: m.stats,
      });
      disposeMatchScene();
    },
    onSession: (session: SessionMsg) => {
      myId = session.playerId;
      resumeToken = session.resumeToken;
      localStorage.setItem(`islandResumeToken:${myName.toLocaleLowerCase()}`, resumeToken);
      forceAuthority = session.resumed;
      if (session.resumed) {
        hud.setNetworkStatus('Verbindung wiederhergestellt', false);
        setTimeout(() => hud.setNetworkStatus(null), 1800);
      }
    },
    onConnectionState: (state, detail) => {
      if (state === 'connected') {
        networkConnected = true;
        const transportId = nextNet.socket.id ?? '';
        if (transportId && transportId !== joinedTransportId) {
          joinedTransportId = transportId;
          nextNet.join(myName, resumeToken || undefined);
        }
      } else if (state === 'disconnected') {
        networkConnected = false;
        document.exitPointerLock?.();
        hud.setNetworkStatus(inMatch
          ? 'Verbindung unterbrochen — Wiederverbindung läuft …'
          : 'Serververbindung getrennt — neuer Versuch läuft …');
      } else {
        if (!inMatch) $('menu-error').textContent = `Server nicht erreichbar${detail ? ` (${detail})` : ''}.`;
        hud.setNetworkStatus('Host/Server nicht erreichbar — neuer Versuch läuft …');
        setJoinBusy(false);
      }
    },
    onConnectionNotice: (notice) => {
      if (notice.type === 'lost' && notice.playerId !== myId) {
        hud.setNetworkStatus('Ein Spieler hat die Verbindung verloren — Reconnect-Fenster aktiv');
      } else if (notice.type === 'reconnected' && notice.playerId !== myId) {
        hud.setNetworkStatus('Spieler wieder verbunden', false);
        setTimeout(() => hud.setNetworkStatus(null), 1800);
      } else if (notice.type === 'hostChanged') {
        hud.setNetworkStatus(notice.playerId === myId ? 'Du bist jetzt Host' : 'Host wurde automatisch übertragen', false);
        setTimeout(() => hud.setNetworkStatus(null), 2400);
      }
    },
  });
  net = nextNet;
  if (nextNet.socket.connected) {
    networkConnected = true;
    joinedTransportId = nextNet.socket.id ?? '';
    nextNet.join(myName, resumeToken || undefined);
  }
}

$('profile-btn').addEventListener('click', () => {
  renderProfile(nameInput.value.trim() || myName);
  showScreen('profile-screen');
  sfx.play('click');
});
$('profile-back-btn').addEventListener('click', () => {
  showScreen(net ? 'lobby-screen' : 'menu-screen');
  sfx.play('click');
});

// ---------- solo practice (§F4) ----------
$('practice-btn').addEventListener('click', () => {
  const bots = Number(($('practice-bots') as HTMLSelectElement).value);
  const difficulty = ($('practice-difficulty') as HTMLSelectElement).value as BotDifficulty;
  const mode = ($('match-mode') as HTMLSelectElement).value as MatchMode;
  net?.startPractice(bots, difficulty, mode);
  sfx.play('click');
});

let myReady = false;
$('ready-btn').addEventListener('click', () => {
  myReady = !myReady;
  net?.setReady(myReady);
  sfx.play('click');
});
$('start-btn').addEventListener('click', () => {
  net?.startMatch(($('match-mode') as HTMLSelectElement).value as MatchMode);
  sfx.play('click');
});
$('rematch-btn').addEventListener('click', () => {
  net?.rematch();
  hud.hideScoreboard();
  hud.hide();
  myReady = true;
  showScreen('lobby-screen');
});

function showScreen(id: string | null): void {
  for (const s of ['menu-screen', 'lobby-screen', 'scoreboard-screen', 'profile-screen']) {
    $(s).classList.toggle('hidden', s !== id);
  }
}

function onLobby(m: LobbyStateMsg): void {
  setJoinBusy(false);
  if (!inMatch) hud.setNetworkStatus(null);
  names = new Map(m.players.map((p) => [p.id, p.name]));
  m.players.forEach((p, i) => colorIndex.set(p.id, i));
  const me = m.players.find((p) => p.id === myId);
  if (!me) return; // unjoined sockets must never be promoted into the lobby UI
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
  $('mode-block').style.display = isHost ? 'flex' : 'none';
  $('practice-block').style.display = isHost ? 'block' : 'none';
  const maxBots = Math.max(1, 5 - m.players.length);
  for (const opt of ($('practice-bots') as HTMLSelectElement).options) {
    opt.disabled = Number(opt.value) > maxBots;
  }
  $('lobby-error').textContent = m.players.length < 2 ? 'Warte auf weitere Spieler (min. 2) — oder starte Solo-Training…' : '';
}

// ---------- match / round ----------
function onMatchStart(m: MatchStartMsg): void {
  if (!rapier) {
    $('lobby-error').textContent = 'Spielphysik lädt noch — bitte erneut starten.';
    return;
  }
  disposeMatchScene();
  inMatch = true;
  matchMode = m.mode;
  matchPace = MATCH_MODE_PACE[matchMode];
  onboarding.start(!!m.practice);
  matchSeed = m.seed;
  visualElapsed = 0;
  sfx.setSeed(m.seed);
  suddenDeathAnnounced = false;
  practiceMatch = !!m.practice;
  myDeathsThisMatch = 0;
  roundsThisMatch = 0;
  lastInv = null;
  m.players.forEach((p, i) => { names.set(p.id, p.name); colorIndex.set(p.id, i); });

  gen = generateWorld(m.seed, m.n);
  world = new World(gen);
  world.setGraphicsQuality(settings.graphics);
  world.scene.add(camera);
  entities = new Entities(world.scene, camera, m.seed);
  phys = new GamePhysics(rapier, gen);
  phys.addPlayer(myId, { x: 0, y: 20, z: 0 });
  hud.initIsland(gen.params, gen.spawns, gen.pois);

  for (const p of m.players) {
    if (p.id !== myId) entities.ensurePlayer(p.id, colorIndex.get(p.id) ?? 0);
  }

  showScreen(null);
  hud.show();
  input.requestLock();
}

function onRoundStart(m: RoundStartMsg): void {
  if (!gen || !world || !phys || !entities) return;
  hud.hideScoreboard();
  hud.show();
  roundRunning = true;
  alive = true;
  myWeapon = 'fists';
  pending = [];
  remoteBufs.clear();
  remoteFootsteps.clear();
  localFootstepDistance = 0;
  localBushId = null;
  localBushDistance = 0;
  depletedNodes.clear();
  world.resetResourceNodes();
  bandageStart = null;
  interactStart = null;
  wasReloading = false;
  damageKick = 0;
  fireFovKick = 0;
  crosshairBloom = 0;
  shotPattern = 0;
  cameraEyeHeight = PLAYER_EYE_HEIGHT;
  lastSnap = null;
  lastInv = null;
  swayT = 0; swayYaw = 0; swayPitch = 0;
  breath = SCOPE_BREATH_MAX;
  flashLevel = 0; flashDecay = 0;
  nextCookBeepAt = 0;
  inputAccumulator = 0;
  reconciliationHardSnaps = 0;
  reconciliationSmoothCorrections = 0;
  lastReconciliationError = 0;
  maxReconciliationError = 0;
  maxPredictionStepsPerFrame = 0;
  hud.setFlashWhiteout(0);
  hud.setCooking(null, GRENADE_FUSE);
  hud.setScoped(false);
  hud.setBreath(null, false);
  entities.clearSmokes();

  const spawnIdx = m.spawns[myId] ?? 0;
  const sp = gen.spawns[spawnIdx];
  const y = sampleHeight(gen.params, sp.x, sp.z);
  move = freshMoveState({ x: sp.x, y: y + 0.1, z: sp.z });
  resetRenderMovePosition();
  onboardingOrigin = { x: sp.x, z: sp.z };
  phys.setPlayerSneaking(myId, false, move.pos);
  phys.setPlayerPos(myId, move.pos);
  input.yaw = Math.atan2(-(-sp.x), -(-sp.z)); // face island center
  input.pitch = 0;

  entities.clearPickups();
  entities.clearProjectiles();
  for (const p of m.pickups) entities.addPickup(p);
  entities.setViewWeapon('fists');
  entities.setAiming(false);
  entities.setReloading(false);
  entities.setViewVisible(true);
  camera.fov = 75;
  camera.updateProjectionMatrix();
  hud.setSpectating(false);
  hud.hideDeathRecap();

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
      entities?.ensurePlayer(p.id, colorIndex.get(p.id) ?? 0);
    }
    const buf = remoteBufs.get(p.id)!;
    buf.push({ at: now, x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    while (buf.length > 30) buf.shift();
    entities?.updatePlayer(
      p.id, p.x, p.y, p.z, p.yaw, p.pitch, p.alive, p.weapon, p.sneaking, p.aiming,
    );
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
  hud.setWeapon(self.weapon);
  myWeapon = self.weapon;

  // drop acknowledged inputs
  pending = pending.filter((i) => i.seq > self.lastSeq);
  if (forceAuthority) {
    move.pos = { x: self.x, y: self.y, z: self.z };
    move.velX = self.vx; move.velY = self.vy; move.velZ = self.vz;
    move.grounded = self.grounded; move.stamina = self.stamina;
    move.sprinting = self.sprinting; move.sneaking = self.sneaking;
    phys.setPlayerSneaking(myId, move.sneaking, move.pos);
    phys.setPlayerPos(myId, move.pos);
    pending = [];
    resetRenderMovePosition();
    forceAuthority = false;
    return;
  }

  const beforeX = move.pos.x;
  const beforeY = move.pos.y;
  const beforeZ = move.pos.z;
  const visibleX = renderMovePos.x;
  const visibleY = renderMovePos.y;
  const visibleZ = renderMovePos.z;

  // Rebuild the predicted present from the authoritative snapshot and only
  // the inputs that the server has not acknowledged yet. A snapshot can reuse
  // one input sequence for several server ticks, so comparing its current
  // position with the historical position stored for that sequence is invalid.
  move.pos = { x: self.x, y: self.y, z: self.z };
  move.velX = self.vx;
  move.velY = self.vy;
  move.velZ = self.vz;
  move.grounded = self.grounded;
  move.stamina = self.stamina;
  move.sprinting = self.sprinting;
  move.sneaking = self.sneaking;
  phys.setPlayerSneaking(myId, move.sneaking, move.pos);
  phys.setPlayerPos(myId, move.pos);

  let replayPreviousX = move.pos.x;
  let replayPreviousY = move.pos.y;
  let replayPreviousZ = move.pos.z;
  for (const inp of pending) {
    replayPreviousX = move.pos.x;
    replayPreviousY = move.pos.y;
    replayPreviousZ = move.pos.z;
    stepMovement(phys, myId, move, inp);
  }

  const err = Math.hypot(beforeX - move.pos.x, beforeY - move.pos.y, beforeZ - move.pos.z);
  lastReconciliationError = err;
  maxReconciliationError = Math.max(maxReconciliationError, err);
  if (err > RECONCILE_SNAP_DIST) {
    reconciliationSmoothCorrections += 1;
  }

  previousMovePos.set(replayPreviousX, replayPreviousY, replayPreviousZ);
  const inputStep = 1 / SERVER_TICK_HZ;
  const alpha = Math.min(1, inputAccumulator / inputStep);
  const correctedRenderX = THREE.MathUtils.lerp(previousMovePos.x, move.pos.x, alpha);
  const correctedRenderY = THREE.MathUtils.lerp(previousMovePos.y, move.pos.y, alpha);
  const correctedRenderZ = THREE.MathUtils.lerp(previousMovePos.z, move.pos.z, alpha);
  renderCorrection.set(
    visibleX - correctedRenderX,
    visibleY - correctedRenderY,
    visibleZ - correctedRenderZ,
  );
}

function enterSpectator(): void {
  entities?.setViewVisible(false);
  specPos.set(renderMovePos.x, Math.max(2, renderMovePos.y + 4), renderMovePos.z);
  spectateYaw = input.yaw;
  hud.setSpectating(true);
}

// ---------- events ----------
function distToMe(x: number, y: number, z: number): number {
  return Math.hypot(x - move.pos.x, y - move.pos.y, z - move.pos.z);
}

function incomingDamageAngle(attackerId: string | null): number | null {
  if (!attackerId || attackerId === myId) return null;
  const attacker = lastSnap?.players.find((p) => p.id === attackerId);
  if (!attacker) return null;
  const dx = attacker.x - move.pos.x;
  const dz = attacker.z - move.pos.z;
  const targetYaw = Math.atan2(-dx, -dz);
  let relative = input.yaw - targetYaw;
  while (relative > Math.PI) relative -= Math.PI * 2;
  while (relative < -Math.PI) relative += Math.PI * 2;
  return relative;
}

function playPickupSound(item: GameEvent & { type: 'pickupRemove' }): void {
  if (item.item === 'bandageItem') sfx.play('pickupHeal');
  else if (item.item === 'plateItem') sfx.play('pickupArmor');
  else if (item.item === 'arrowBundle' || item.item === 'pistolAmmo'
    || item.item === 'rifleAmmo' || item.item === 'shellAmmo' || item.item === 'grenade') sfx.play('pickupAmmo');
  else if (item.item in WEAPONS) sfx.play('pickupWeapon');
  else sfx.play('pickup');
}

function onEvent(e: GameEvent): void {
  switch (e.type) {
    case 'shot': {
      const d = e.by === myId ? 0 : distToMe(e.ox, e.oy, e.oz);
      const w = e.weapon;
      const sound = w === 'bow' ? 'bow' : w === 'shotgun' ? 'shotgun' : w === 'rifle' ? 'rifle' : 'pistol';
      if (e.by === myId) sfx.play(sound, d);
      else playSpatial(sound, e.ox, e.oy, e.oz);
      if (WEAPONS[w].kind === 'hitscan' && e.hx !== undefined && e.hy !== undefined && e.hz !== undefined) {
        entities?.addTracer(new THREE.Vector3(e.ox, e.oy, e.oz), new THREE.Vector3(e.hx, e.hy, e.hz));
        entities?.addImpact(e.hx, e.hy, e.hz, w);
      }
      if (e.by === myId && e.primary !== false) entities?.addMuzzleFlash(camera);
      if (e.by === myId && e.primary !== false) {
        const def = WEAPONS[w];
        const pattern = ((shotPattern++ % 5) - 2) / 2;
        input.applyRecoil((def.recoilPitch ?? 0) * (input.aim ? 0.72 : 1), (def.recoilYaw ?? 0) * pattern);
        crosshairBloom = Math.min(14, crosshairBloom + (w === 'shotgun' ? 8 : w === 'rifle' ? 3.2 : 2.4));
      }
      if (e.by === myId && e.primary !== false && !reduceMotion && settings.cameraShake) {
        fireFovKick = Math.min(2.4, fireFovKick + (w === 'shotgun' ? 1.8 : w === 'rifle' ? 1.05 : w === 'pistol' ? 0.7 : 0.35));
      }
      break;
    }
    case 'melee':
      if (e.by === myId) sfx.play('melee');
      else {
        const source = lastSnap?.players.find((player) => player.id === e.by);
        if (source) playSpatial('melee', source.x, source.y, source.z);
      }
      if (e.by === myId) entities?.meleeSwing();
      break;
    case 'explosion':
      entities?.addExplosion(e.x, e.y, e.z, e.radius);
      {
        const distance = distToMe(e.x, e.y, e.z);
        playSpatial('explosion', e.x, e.y, e.z);
        if (distance < e.radius * 3) {
          if (!reduceMotion && settings.cameraShake) damageKick = Math.min(1, damageKick + Math.max(0, 1 - distance / (e.radius * 3)) * 0.8);
          rumble(160, Math.max(0.15, 1 - distance / (e.radius * 3)), 0.3);
        }
      }
      break;
    case 'damage':
      if (e.target === myId) {
        hud.damageFlash();
        hud.damageDirection(incomingDamageAngle(e.attacker));
        sfx.play('hurt');
        hud.setHp(e.hp);
        if (!reduceMotion && settings.cameraShake) damageKick = Math.min(1, damageKick + 0.72);
        rumble(95, 0.35, 0.22);
      }
      break;
    case 'hitmarker':
      hud.hitmarker(e.headshot);
      sfx.play(e.headshot ? 'headshot' : 'hit');
      entities?.flashPlayer(e.target, e.headshot);
      break;
    case 'death': {
      if (e.target === myId) {
        myDeathsThisMatch += 1;
        hud.announce('☠ Du bist raus — Zuschauermodus', 3000);
        const attacker = e.attacker ? names.get(e.attacker) ?? 'Unbekannt' : null;
        const reason = e.cause === 'zone' ? 'die Zone' : e.weapon ? weaponName(e.weapon) : 'einen Treffer';
        const details = [
          attacker ? `${attacker} · ${reason}` : reason,
          e.finalDamage ? `${e.finalDamage} letzter Schaden` : '',
          e.distance !== undefined ? `${Math.round(e.distance)} m` : '',
          e.headshot ? 'Kopftreffer' : '',
          e.attackerHp !== undefined ? `Gegner: ${Math.ceil(e.attackerHp)} HP` : '',
        ].filter(Boolean).join(' · ');
        hud.showDeathRecap(`Eliminiert durch ${details}`);
        sfx.play('death');
        rumble(280, 0.85, 0.5);
      } else if (e.attacker === myId) {
        sfx.play('elimination');
        rumble(120, 0.2, 0.45);
      }
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
      entities?.removePickup(e.id, true);
      if (e.by === myId) {
        playPickupSound(e);
        hud.punchPickup();
        onboarding.signal('loot');
      }
      break;
    case 'resource':
      if (e.depleted) {
        depletedNodes.add(e.nodeId);
        world?.depleteResourceNode(e.nodeId);
      }
      if (e.by === myId) { sfx.play('craft'); interactStart = null; }
      break;
    case 'inventory':
      {
        lastInv = e.inv;
        const viewWeapon = updateViewmodel(e.inv.active, e.inv);
        if (e.inv.reloading && !wasReloading) sfx.play('reload');
        const reloadDuration = viewWeapon === 'none' ? 1 : WEAPONS[viewWeapon].reloadTime ?? 1;
        entities?.setReloading(e.inv.reloading, reloadDuration);
      }
      wasReloading = e.inv.reloading;
      hud.setInventory(e.inv);
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
    case 'smoke':
      playSpatial('smokePop', e.x, e.y, e.z);
      break;
    case 'flash':
      playSpatial('flashBang', e.x, e.y, e.z);
      break;
    case 'flashed':
      if (e.target === myId) {
        flashLevel = Math.max(flashLevel, reduceMotion ? e.intensity * 0.6 : e.intensity);
        flashDecay = flashLevel / Math.max(0.25, e.duration);
        rumble(140, 0.4, 0.3);
      }
      break;
    case 'cookout':
      if (e.by === myId) hud.announce('💥 Zu lange gehalten — Granate in der Hand explodiert!', 2600);
      break;
  }
}

function updateViewmodel(
  active: 1 | 2 | 3,
  inv: {
    primary: { type: WeaponType } | null;
    secondary: { type: WeaponType } | null;
    activeThrow: InventoryState['activeThrow'];
  },
): WeaponType | 'none' {
  let w: WeaponType | 'none' = 'none';
  if (active === 3) w = THROW_WEAPON[inv.activeThrow];
  else {
    const slot = active === 1 ? inv.primary : inv.secondary;
    w = slot ? slot.type : 'none';
  }
  entities?.setViewWeapon(w);
  return w;
}

// ---------- interact hint (client-side mirror of server ranges) ----------
function updateInteractHint(dt: number): void {
  if (!gen || !alive) { hud.setInteract(null, 0); return; }
  // nearest vegetation resource node in range
  let best: { kind: string; d: number } | null = null;
  for (const v of gen.vegetation) {
    if (depletedNodes.has(v.id)) continue;
    const reach = v.kind === 'tree' ? 3.4 : 2.8;
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
  visualElapsed += dt;

  if (input.debugToggled) {
    showDebug = !showDebug;
    input.debugToggled = false;
  }

  if (!world || !entities || !phys || !net) { input.clearEdges(); renderer.clear(); return; }

  const t = lastSnap ? snapClock.t + (now - snapClock.at) / 1000 : 0;

  const aimable = myWeapon === 'bow' || myWeapon === 'pistol'
    || myWeapon === 'rifle' || myWeapon === 'shotgun' || myWeapon === 'sniper';
  const aiming = roundRunning && alive && input.aim && aimable && !wasReloading;
  if (aiming) onboarding.signal('aim');
  entities.setAiming(aiming);
  $('hud').classList.toggle('aiming', aiming);

  // ---- sniper scope: hard zoom + overlay + breathing sway (§F1) ----
  const scoped = aiming && myWeapon === 'sniper';
  const holdingBreath = scoped && input.sprint && breath > 0;
  if (scoped) {
    swayT += dt;
    breath = holdingBreath
      ? Math.max(0, breath - dt)
      : Math.min(SCOPE_BREATH_MAX, breath + SCOPE_BREATH_REGEN * dt * 0.35);
    const moveAmp = Math.hypot(move.velX, move.velZ) * 0.0016;
    const amp = (holdingBreath ? 0.0006 : 0.0034 + moveAmp) * (move.sneaking ? 0.6 : 1);
    swayYaw = Math.sin(swayT * 1.9) * amp + Math.sin(swayT * 3.1 + 1.3) * amp * 0.5;
    swayPitch = Math.cos(swayT * 1.55) * amp * 0.8 + Math.sin(swayT * 2.6) * amp * 0.35;
    hud.setBreath(breath / SCOPE_BREATH_MAX, holdingBreath);
  } else {
    breath = Math.min(SCOPE_BREATH_MAX, breath + SCOPE_BREATH_REGEN * dt);
    swayYaw = 0;
    swayPitch = 0;
    hud.setBreath(null, false);
  }
  hud.setScoped(scoped);

  const targetFov = (aiming ? (WEAPONS[myWeapon].aimFov ?? 55) : 75) + fireFovKick;
  const fovEase = reduceMotion ? 1 : 1 - Math.exp(-dt * 14);
  const nextFov = camera.fov + (targetFov - camera.fov) * fovEase;
  if (Math.abs(nextFov - camera.fov) > 0.01) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
  fireFovKick = Math.max(0, fireFovKick - dt * 8.5);
  crosshairBloom = Math.max(0, crosshairBloom - dt * 9.5);
  const crosshairBase = aiming ? 2.4 : myWeapon === 'shotgun' ? 9 : myWeapon === 'bow' ? 4 : 5;
  hud.setCrosshairSpread(crosshairBase + Math.hypot(move.velX, move.velZ) * (aiming ? 0.18 : 0.55) + crosshairBloom);

  // --- input → predict → send ---
  if (roundRunning && alive && inMatch && networkConnected) {
    const inputStep = 1 / SERVER_TICK_HZ;
    // Fixed simulation remains in lockstep with the authoritative server. Keep
    // up to three catch-up ticks after a slow frame instead of dropping time.
    inputAccumulator = Math.min(inputAccumulator + dt, inputStep * 3);
    let predictionStepsThisFrame = 0;
    while (inputAccumulator >= inputStep) {
      inputAccumulator -= inputStep;
      predictionStepsThisFrame += 1;
      const inp: InputMsg = {
        seq: ++seq,
        dt: inputStep,
        mx: input.pointerLocked ? input.moveX : 0,
        mz: input.pointerLocked ? input.moveZ : 0,
        // scope sway is baked into the transmitted view so the host raycast sees it (§F1)
        yaw: input.yaw + swayYaw,
        pitch: input.pitch + swayPitch,
        sprint: input.sprint && !aiming,
        sneak: input.pointerLocked && input.sneak,
        aim: aiming,
        jump: input.pointerLocked && input.jumpHeld,
        fire: input.fire,
        interact: input.interact,
      };
      // Preserve a complete press/release that happened between two 30-Hz
      // samples (important for quick clicks and cooked-grenade release).
      if (input.firePressed && input.fireReleased && !input.fire) {
        net.sendInput({ ...inp, fire: true });
        inp.seq = ++seq;
      }
      if (input.slotPressed) {
        // pressing 3 while the throwable is already up cycles frag → smoke → flash (§F2)
        if (input.slotPressed === 3 && lastInv?.active === 3) inp.throwCycle = true;
        else inp.slot = input.slotPressed;
      }
      if (input.reloadPressed) inp.reload = true;
      previousMovePos.set(move.pos.x, move.pos.y, move.pos.z);
      stepMovement(phys, myId, move, inp);
      pending.push(inp);
      net.sendInput(inp);
      phys.step(inputStep);
      updateLocalFootsteps(inputStep);

      if (input.craftPressed) net.craft(input.craftPressed);
      if (input.bandagePressed) { net.useBandage(); bandageStart = now; }
      input.clearEdges();
    }
    maxPredictionStepsPerFrame = Math.max(maxPredictionStepsPerFrame, predictionStepsThisFrame);

    // Render one simulation tick behind and interpolate at display refresh
    // rate. This removes the visible 30-Hz stair-step without changing physics.
    const renderAlpha = Math.min(1, inputAccumulator / inputStep);
    renderMovePos.set(
      THREE.MathUtils.lerp(previousMovePos.x, move.pos.x, renderAlpha),
      THREE.MathUtils.lerp(previousMovePos.y, move.pos.y, renderAlpha),
      THREE.MathUtils.lerp(previousMovePos.z, move.pos.z, renderAlpha),
    );
    renderMovePos.add(renderCorrection);
    const correctionLength = renderCorrection.length();
    if (correctionLength > 0) {
      const remaining = Math.max(0, correctionLength - 4 * dt);
      renderCorrection.multiplyScalar(remaining / correctionLength);
    }

    const targetEyeHeight = move.sneaking ? PLAYER_SNEAK_EYE_HEIGHT : PLAYER_EYE_HEIGHT;
    const eyeEase = reduceMotion ? 1 : 1 - Math.exp(-dt * 13);
    cameraEyeHeight += (targetEyeHeight - cameraEyeHeight) * eyeEase;
    camera.position.set(renderMovePos.x, renderMovePos.y + cameraEyeHeight, renderMovePos.z);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(input.yaw + swayYaw);
    camera.rotateX(input.pitch + swayPitch);
    world.updateLocalCover(renderMovePos.x, renderMovePos.z);
    if (onboardingOrigin && Math.hypot(move.pos.x - onboardingOrigin.x, move.pos.z - onboardingOrigin.z) > 2) {
      onboarding.signal('move');
      onboardingOrigin = null;
    }
    if (localBushId !== null) onboarding.signal('cover');
  } else if (roundRunning && !alive) {
    // Local freecam movement runs on every render frame and therefore remains
    // smooth regardless of the server's 20 Hz snapshot cadence.
    const controlsActive = input.pointerLocked;
    updateFreecam(specPos, {
      moveX: controlsActive ? input.moveX : 0,
      moveZ: controlsActive ? input.moveZ : 0,
      rise: controlsActive && input.jumpHeld,
      descend: controlsActive && input.sneak,
      yaw: input.yaw,
      pitch: input.pitch,
      speed: input.sprint ? FREECAM_FAST_SPEED : FREECAM_SPEED,
      dt,
    });
    spectateYaw = input.yaw;
    camera.position.copy(specPos);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(input.yaw);
    camera.rotateX(input.pitch);
    world.updateLocalCover(9999, 9999);
  }

  if (damageKick > 0 && alive) {
    const trauma = damageKick * damageKick;
    camera.position.x += Math.sin(visualElapsed * 61) * trauma * 0.025;
    camera.position.y += Math.cos(visualElapsed * 73) * trauma * 0.018;
    camera.rotateZ(Math.sin(visualElapsed * 47) * trauma * 0.012);
    damageKick = Math.max(0, damageKick - dt * 3.4);
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
    const renderX = lerp(a.x, b.x);
    const renderY = lerp(a.y, b.y);
    const renderZ = lerp(a.z, b.z);
    entities.updatePlayer(
      id, renderX, renderY, renderZ,
      a.yaw + yawDiff * k, lerp(a.pitch, b.pitch),
      snapP?.alive ?? true, snapP?.weapon ?? 'fists',
      snapP?.sneaking ?? false, snapP?.aiming ?? false,
    );
    updateRemoteFootsteps(id, renderX, renderZ, {
      alive: snapP?.alive ?? true,
      grounded: snapP?.grounded ?? false,
      sneaking: snapP?.sneaking ?? false,
      sprinting: snapP?.sprinting ?? false,
    });
  }

  // --- environment / HUD ---
  hud.setCompass(input.yaw);
  // flashbang whiteout eases off over its duration (§F2)
  if (flashLevel > 0) {
    flashLevel = Math.max(0, flashLevel - flashDecay * dt);
    hud.setFlashWhiteout(flashLevel);
  }
  if (lastSnap) {
    world.update(t * matchPace, lastSnap.zone.radius, lastSnap.zone.targetRadius);
    entities.syncSmokes(lastSnap.smokes, t);
    hud.setTimer(t, lastSnap.phase);
    hud.setZoneInfo(lastSnap.zone, t);
    hud.setAlive(lastSnap.aliveCount);
    const selfSnap = lastSnap.players.find((p) => p.id === myId);
    // frag cooking countdown + accelerating beep (§F3)
    if (alive && selfSnap?.cookingUntil !== undefined) {
      const remaining = Math.max(0, selfSnap.cookingUntil - t);
      hud.setCooking(remaining, GRENADE_FUSE);
      if (now >= nextCookBeepAt) {
        sfx.play('grenadeBeep', 0, remaining < 1 ? 1 : 0.65);
        nextCookBeepAt = now + Math.max(95, remaining * 260);
      }
    } else {
      hud.setCooking(null, GRENADE_FUSE);
      nextCookBeepAt = 0;
    }
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
      alive ? renderMovePos.x : specPos.x, alive ? renderMovePos.z : specPos.z,
      alive ? input.yaw : spectateYaw,
      lastSnap.zone, lastSnap.pings, lastSnap.care, t,
    );
  }
  updateInteractHint(dt);
  entities.update(dt, visualElapsed);

  // --- F3 debug ---
  fpsAcc += dt; fpsFrames++;
  if (fpsAcc >= 0.5) {
    fpsShown = Math.round(fpsFrames / fpsAcc);
    bwShown = Math.round((net.bytesIn / fpsAcc) / 1024 * 10) / 10;
    net.bytesIn = 0;
    fpsAcc = 0; fpsFrames = 0;
  }
  if (roundRunning && !document.hidden) {
    const sample = adaptiveResolution.sample(dt);
    if (sample?.changed) {
      renderScale = sample.scale;
      const ratioCap = settings.graphics === 'low' ? 1 : settings.graphics === 'medium' ? 1.5 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratioCap) * renderScale);
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  const entityStats = entities.stats();
  const physicsStats = phys.stats();
  hud.setDebug(showDebug
    ? `FPS ${fpsShown} · render ${Math.round(renderScale * 100)}% · calls ${renderer.info.render.calls} · tris ${renderer.info.render.triangles}\n`
      + `pos ${move.pos.x.toFixed(1)} ${move.pos.y.toFixed(1)} ${move.pos.z.toFixed(1)} · vel ${Math.hypot(move.velX, move.velZ).toFixed(1)}\n`
      + `entities P${entityStats.players} L${entityStats.pickups} J${entityStats.projectiles} FX${entityStats.effects}\n`
      + `Rapier bodies ${physicsStats.rigidBodies} · colliders ${physicsStats.colliders} · capsules ${physicsStats.playerCapsules}\n`
      + `net ↓ ${bwShown} kB/s · ${net.rttMs.toFixed(0)} ms ±${net.jitterMs.toFixed(0)} · loss ${net.lossPct.toFixed(1)}% · pending ${pending.length}`
    : null);

  if (!roundRunning || !alive || !inMatch || !networkConnected) input.clearEdges();
  renderer.render(world.scene, camera);
}

// pointer-lock pause hint
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  $('pause-hint').style.display = !locked && inMatch && roundRunning ? 'block' : 'none';
});
$('pause-hint').addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('button')) return;
  if (inMatch && roundRunning && !settingsDialog.open) input.requestLock();
});
renderer.domElement.addEventListener('click', () => {
  if (inMatch && !input.pointerLocked) input.requestLock();
});

// ---------- boot ----------
window.addEventListener('beforeunload', () => net?.dispose(), { once: true });
requestAnimationFrame(frame);
