// Island Duell client: menu/lobby → predicted first-person play (§8).
// Own movement: client prediction with the SAME shared sim as the host,
// snap-back reconciliation if drift > RECONCILE_SNAP_DIST.
// Remote players: adaptively interpolated behind the newest snapshot.
import * as THREE from 'three';
import {
  BANDAGE_USE_TIME, GRENADE_FUSE, INTERACT_HOLD_SECS, INTERP_DELAY_MS, MATCH_MODE_PACE,
  PLAYER_EYE_HEIGHT, PLAYER_PRONE_EYE_HEIGHT, PLAYER_SNEAK_EYE_HEIGHT, RECONCILE_SNAP_DIST,
  SCOPE_BREATH_MAX, SCOPE_BREATH_REGEN, SERVER_TICK_HZ, WEAPONS,
  type BotDifficulty, type MatchMode, type WeaponType,
} from '@shared/constants';
import { sampleHeight } from '@shared/terrain';
import { GamePhysics, type RapierModule } from '@shared/physics';
import { freshMoveState, stanceForWeapon, stepMovement, type MoveState } from '@shared/movement';
import { bushAt, generateWorld, type WorldGen } from '@shared/worldgen';
import type {
  GameEvent, InputMsg, InventoryState, LobbyStateMsg, MatchStartMsg, PickupInfo,
  MatchEndMsg, PartySelection, PartyStateMsg, RoundEndMsg, RoundStartMsg, SessionMsg,
  SnapPlayer, SnapshotMsg,
} from '@shared/protocol';
import { PLAYER_SKINS, type PlayerSkinId } from '@shared/multiplayer';
import { recordProfileMatch, renderProfile } from './profile-ui';
import { renameStoredProfile } from './profile';
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
import { adjustSniperScopeFov, DEFAULT_SNIPER_SCOPE_FOV } from './sniper';
import { nextWeaponSlot } from './weapon-navigation';
import { shouldAnimateWeaponSwitch, viewWeaponForInventory } from './weapon-switch';
import { classifyHitFeedback } from './combat-feedback';
import {
  footstepCue, footstepIntensity, footstepSurfaceAt, type FootstepStance,
} from './surface-audio';
import {
  advanceFlashVisual, createFlashVisual, type FlashVisualState,
} from './flash-effect';
import {
  computeVictoryCameraPose, REDUCED_MOTION_VICTORY_SECONDS, VICTORY_CINEMATIC_SECONDS,
  type VictoryCameraPose, type VictorySubject,
} from './victory-cinematic';
import {
  DEFAULT_SETTINGS, keyLabel, loadSettings, saveSettings,
  type BindAction, type PlayerSettings,
} from './settings';
import {
  classifyConnectionQuality, recommendedShotRewindMs, sampleRemoteTransform,
  smoothInterpolationDelay, targetInterpolationDelayMs,
  type RemoteTransformSample,
} from './network-smoothing';
import { loadLobbyProfile, saveLobbyProfile, type LobbyProfile } from './lobby-profile';
import { LobbyScene } from './lobby-scene';
import { currentMultiplayerUrl } from './multiplayer-url';
import { safeStorage } from './safe-storage';

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
let lobbyProfile: LobbyProfile = loadLobbyProfile();
const lobbyScene = new LobbyScene(lobbyProfile.skin);
lobbyScene.resize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  lobbyScene.resize(window.innerWidth, window.innerHeight);
});
void gameAssets.preload(renderer).then(() => lobbyScene.loadCharacter());

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
type RemoteBufEntry = RemoteTransformSample;
interface FootstepState { x: number; z: number; distance: number; bushId: number | null; bushDistance: number }

let net: Net | null = null;
let rapier: RapierModule | null = null;
let rapierPromise: Promise<RapierModule> | null = null;
let myId = '';
let myName = '';
let isHost = false;
let currentPartyState: PartyStateMsg | null = null;
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
let rememberedPartyCode = '';
let networkConnected = false;
let forceAuthority = false;
let crosshairBloom = 0;
let shotPattern = 0;
let dropRequestsSent = 0;
let localBushId: number | null = null;
let localBushDistance = 0;
let joinedTransportId = '';
let lastInv: InventoryState | null = null;
let leavingGame = false;
// sniper scope (§F1): sway is added to the SENT view direction so it counts
let swayT = 0;
let swayYaw = 0;
let swayPitch = 0;
let breath = SCOPE_BREATH_MAX;
let sniperScopeFov = DEFAULT_SNIPER_SCOPE_FOV;
// flashbang whiteout (§F2)
let flashVisual: FlashVisualState | null = null;
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
let interpolationDelayMs = INTERP_DELAY_MS;
let maxRemoteExtrapolationMs = 0;
let networkHudAccumulator = 0;

interface LastElimination {
  victimId: string;
  position: THREE.Vector3;
}

interface VictoryCinematicState {
  elapsed: number;
  duration: number;
  subject: VictorySubject;
  roundEnd: RoundEndMsg;
  matchEnd: MatchEndMsg | null;
  winnerId: string;
  winnerName: string;
  resultShown: boolean;
}

let lastElimination: LastElimination | null = null;
let victoryCinematic: VictoryCinematicState | null = null;
const victoryCameraPose: VictoryCameraPose = {
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  danceWeight: 0,
};

function resetRenderMovePosition(): void {
  previousMovePos.set(move.pos.x, move.pos.y, move.pos.z);
  renderMovePos.copy(previousMovePos);
  renderCorrection.set(0, 0, 0);
}

const specPos = new THREE.Vector3();
let spectateYaw = 0;

function disposeMatchScene(): void {
  cancelVictoryCinematic();
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

function cancelVictoryCinematic(): void {
  victoryCinematic = null;
  entities?.endVictoryCelebration();
  $('hud').classList.remove('victory-cinematic');
}

function finishMatchEnd(m: MatchEndMsg): void {
  roundRunning = false;
  inMatch = false;
  hud.showMatchEnd(m.standings, m.totals, m.winnerName, myId, m.winnerId === myId, m.stats);
  if (currentPartyState) $('rematch-btn').textContent = 'Zurück zur Party';
  document.exitPointerLock?.();
  recordProfileMatch({
    name: myName, playerId: myId, seed: matchSeed ?? 0,
    rounds: roundsThisMatch, deaths: myDeathsThisMatch,
    practice: practiceMatch || !!m.practice, standings: m.standings, stats: m.stats,
  });
  disposeMatchScene();
}

function showVictoryResult(state: VictoryCinematicState): void {
  if (state.resultShown) return;
  state.resultShown = true;
  hud.showDuelResult(state.winnerId === myId, state.winnerName, state.roundEnd.round);
}

function finishVictoryCinematic(): void {
  const state = victoryCinematic;
  if (!state) return;
  victoryCinematic = null;
  $('hud').classList.remove('victory-cinematic');
  showVictoryResult(state);
  entities?.endVictoryCelebration();
  camera.fov = 75;
  camera.updateProjectionMatrix();
  if (state.matchEnd) {
    finishMatchEnd(state.matchEnd);
    return;
  }
  const m = state.roundEnd;
  hud.showRoundEnd(
    m.round, m.placements, m.totals,
    Math.max(0, m.nextRoundIn - state.duration), myId,
    m.matchOver === false && m.round >= 3, m.stats,
  );
  document.exitPointerLock?.();
}

function startVictoryCinematic(m: RoundEndMsg): void {
  const winner = m.placements.find((entry) => entry.place === 1) ?? m.placements[0];
  if (!winner || !entities) {
    document.exitPointerLock?.();
    hud.showRoundEnd(m.round, m.placements, m.totals, m.nextRoundIn, myId,
      m.matchOver === false && m.round >= 3, m.stats);
    return;
  }
  const winnerSnap = lastSnap?.players.find((player) => player.id === winner.id);
  const localWinner = winner.id === myId;
  const winnerPosition = localWinner
    ? renderMovePos.clone()
    : new THREE.Vector3(winnerSnap?.x ?? 0, winnerSnap?.y ?? 0, winnerSnap?.z ?? 0);
  const winnerYaw = localWinner ? input.yaw : winnerSnap?.yaw ?? 0;
  const winnerWeapon = localWinner ? myWeapon : winnerSnap?.weapon ?? 'fists';
  const victimPosition = lastElimination && lastElimination.victimId !== winner.id
    ? lastElimination.position.clone()
    : null;

  entities.startVictoryCelebration(
    winner.id, localWinner,
    winnerPosition.x, winnerPosition.y, winnerPosition.z,
    winnerYaw, colorIndex.get(winner.id) ?? 0, winnerWeapon, reduceMotion,
  );
  entities.setViewVisible(false);
  entities.setSpectatorLabels(false);
  $('hud').classList.add('victory-cinematic');
  hud.hideScoreboard();
  hud.hideDeathRecap();
  hud.setSpectating(false);
  world?.updateLocalCover(9999, 9999);
  victoryCinematic = {
    elapsed: 0,
    duration: reduceMotion ? REDUCED_MOTION_VICTORY_SECONDS : VICTORY_CINEMATIC_SECONDS,
    subject: { winner: winnerPosition, winnerYaw, victim: victimPosition },
    roundEnd: m,
    matchEnd: null,
    winnerId: winner.id,
    winnerName: winner.name,
    resultShown: false,
  };
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

function footstepSound(x: number, y: number, z: number, stance: FootstepStance): SfxName {
  const surface = gen ? footstepSurfaceAt(gen, x, y, z) : 'grass';
  return footstepCue(surface, stance);
}

function spatialPan(x: number, z: number): number {
  const dx = x - move.pos.x, dz = z - move.pos.z;
  const d = Math.hypot(dx, dz) || 1;
  return Math.max(-1, Math.min(1, (dx * Math.cos(input.yaw) - dz * Math.sin(input.yaw)) / d));
}

function spatialOccluded(x: number, y: number, z: number): boolean {
  if (!phys) return false;
  const listener = new THREE.Vector3();
  camera.getWorldPosition(listener);
  const dx = x - listener.x, dy = y - listener.y, dz = z - listener.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance < 3.5) return false;
  const maxDist = distance - 0.35;
  const hit = phys.raycast(
    { x: listener.x, y: listener.y, z: listener.z },
    { x: dx / distance, y: dy / distance, z: dz / distance },
    maxDist,
    lastSnap?.players.map((player) => player.id),
  );
  return hit !== null && hit.dist < maxDist;
}

function playSpatial(
  name: SfxName,
  x: number,
  y: number,
  z: number,
  intensity = 1,
  soft = false,
): void {
  sfx.play(
    name,
    distToMe(x, y, z),
    intensity,
    spatialPan(x, z),
    { occluded: spatialOccluded(x, y, z), soft },
  );
}

function updateLocalFootsteps(dt: number): void {
  if (!alive || !move.grounded) return;
  const speed = Math.hypot(move.velX, move.velZ);
  if (speed < 0.45) return;
  localFootstepDistance += speed * dt;
  const stride = move.prone ? 1.4 : move.sprinting ? 2.05 : move.sneaking ? 1.65 : 1.8;
  if (localFootstepDistance < stride) return;
  localFootstepDistance %= stride;
  const stance: FootstepStance = move.prone ? 'prone' : move.sneaking ? 'sneak' : 'normal';
  sfx.play(
    footstepSound(move.pos.x, move.pos.y, move.pos.z, stance),
    0,
    footstepIntensity(stance, move.sprinting, false),
    0,
    { soft: move.sneaking },
  );
  const bush = gen ? bushAt(gen, move.pos.x, move.pos.z) : null;
  if (bush?.id !== localBushId) { localBushId = bush?.id ?? null; localBushDistance = 0; }
  if (bush) {
    localBushDistance += stride;
    if (localBushDistance >= 1.15) {
      localBushDistance = 0;
      sfx.play(
        'bushRustle', 0,
        move.prone ? 0.07 : move.sneaking ? 0.12 : move.sprinting ? 0.9 : 0.5,
        0,
        { soft: move.sneaking },
      );
    }
  }
}

function updateRemoteFootsteps(
  id: string, x: number, y: number, z: number,
  state: { alive: boolean; grounded: boolean; sneaking: boolean; prone: boolean; sprinting: boolean },
): void {
  const previous = remoteFootsteps.get(id);
  if (!previous) { remoteFootsteps.set(id, { x, z, distance: 0, bushId: null, bushDistance: 0 }); return; }
  const delta = Math.hypot(x - previous.x, z - previous.z);
  previous.x = x;
  previous.z = z;
  if (!state.alive || !state.grounded || delta > 2) { previous.distance = 0; return; }
  previous.distance += delta;
  const stride = state.prone ? 1.4 : state.sprinting ? 2.05 : state.sneaking ? 1.65 : 1.8;
  if (previous.distance < stride) return;
  previous.distance %= stride;
  const stance: FootstepStance = state.prone ? 'prone' : state.sneaking ? 'sneak' : 'normal';
  playSpatial(
    footstepSound(x, y, z, stance),
    x, y, z,
    footstepIntensity(stance, state.sprinting, true),
    state.sneaking,
  );
  const bush = gen ? bushAt(gen, x, z) : null;
  if (bush?.id !== previous.bushId) { previous.bushId = bush?.id ?? null; previous.bushDistance = 0; }
  if (bush) {
    previous.bushDistance += stride;
    if (previous.bushDistance >= 1.15) {
      previous.bushDistance = 0;
      playSpatial(
        'bushRustle', x, y, z,
        state.prone ? 0.06 : state.sneaking ? 0.1 : state.sprinting ? 0.82 : 0.44,
        state.sneaking,
      );
    }
  }
}

const diagnostics = {
  snapshot: () => ({
    seed: matchSeed,
    state: {
      inMatch, roundRunning, alive, pointerLocked: input.pointerLocked,
      victoryCinematic: victoryCinematic ? {
        elapsed: victoryCinematic.elapsed,
        duration: victoryCinematic.duration,
        winnerId: victoryCinematic.winnerId,
      } : null,
    },
    player: {
      position: { ...move.pos },
      renderPosition: { x: renderMovePos.x, y: renderMovePos.y, z: renderMovePos.z },
      velocity: { x: move.velX, y: move.velY, z: move.velZ },
      grounded: move.grounded, sprinting: move.sprinting, sneaking: move.sneaking,
    },
    input: {
      moveX: input.moveX, moveZ: input.moveZ, fire: input.fire, aim: input.aim,
      sprint: input.sprint, sneak: input.sneak, interact: input.interact,
      dropRequestsSent,
    },
    renderer: {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: renderer.info.render.points,
      lines: renderer.info.render.lines,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    },
    lobby: {
      partyCode: currentPartyState?.code ?? null,
      partyMembers: currentPartyState?.members.length ?? 0,
      renderedCharacters: lobbyScene.memberCount,
      renderedPedestals: lobbyScene.pedestalCount,
      memberLayout: lobbyScene.memberLayout(),
      labelAnchors: lobbyScene.projectMemberLabels(window.innerWidth, window.innerHeight),
    },
    entities: entities ? {
      ...entities.stats(),
      viewmodel: entities.viewmodelStats(),
      spectatorLabels: entities.spectatorLabelStats(),
    } : null,
    environment: world?.stats() ?? null,
    physics: phys?.stats() ?? null,
    network: {
      pendingInputs: pending.length, inboundKbPerSec: bwShown,
      rttMs: net?.rttMs ?? 0, jitterMs: net?.jitterMs ?? 0, lossPct: net?.lossPct ?? 0,
      interpolationDelayMs, maxRemoteExtrapolationMs,
      reconciliationHardSnaps, lastReconciliationError, maxReconciliationError,
      reconciliationSmoothCorrections, maxPredictionStepsPerFrame,
    },
  }),
};
(window as Window & { __ISLAND_DUELL_DIAGNOSTICS__?: typeof diagnostics }).__ISLAND_DUELL_DIAGNOSTICS__ = diagnostics;

// ---------- persistent player settings ----------
const settingsDialog = $('settings-dialog') as HTMLDialogElement;
const range = (id: string) => $(id) as HTMLInputElement;

let appliedGraphics: PlayerSettings['graphics'] | null = null;
let appliedGraphicsWorld: World | null = null;

function applyRuntimeSettings(): void {
  input.setSettings(settings);
  sfx.setVolumes(settings.masterVolume, settings.effectsVolume, settings.footstepsVolume);
  if (!settings.cameraShake) { damageKick = 0; fireFovKick = 0; }
  // the graphics path below traverses the whole scene and resets render
  // targets — volume/sensitivity slider ticks must not re-run it
  if (appliedGraphics === settings.graphics && appliedGraphicsWorld === world) return;
  appliedGraphics = settings.graphics;
  appliedGraphicsWorld = world;
  const ratioCap = settings.graphics === 'low' ? 1 : settings.graphics === 'medium' ? 1.5 : 2;
  adaptiveResolution.reset();
  renderScale = 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratioCap) * renderScale);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const shadowsEnabled = settings.graphics !== 'low';
  if (renderer.shadowMap.enabled !== shadowsEnabled) {
    renderer.shadowMap.enabled = shadowsEnabled;
    world?.refreshShadowMaterials();
  }
  world?.setGraphicsQuality(settings.graphics);
}

function populateSettings(): void {
  range('mouse-sensitivity').value = String(settings.mouseSensitivity);
  range('sniper-aim-sensitivity').value = String(settings.sniperAimSensitivity);
  $('sniper-aim-sensitivity-value').textContent = `${settings.sniperAimSensitivity.toFixed(2)}×`;
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
  settings.sniperAimSensitivity = Number(range('sniper-aim-sensitivity').value);
  settings.masterVolume = Number(range('master-volume').value);
  settings.effectsVolume = Number(range('effects-volume').value);
  settings.footstepsVolume = Number(range('footsteps-volume').value);
  settings.graphics = ($('graphics-quality') as HTMLSelectElement).value as PlayerSettings['graphics'];
  settings.cameraShake = ($('camera-shake') as HTMLInputElement).checked;
  $('mouse-sensitivity-value').textContent = `${settings.mouseSensitivity.toFixed(2)}×`;
  $('sniper-aim-sensitivity-value').textContent = `${settings.sniperAimSensitivity.toFixed(2)}×`;
  saveSettings(settings);
  applyRuntimeSettings();
}

function openSettings(): void {
  document.exitPointerLock?.();
  populateSettings();
  if (!settingsDialog.open) settingsDialog.showModal();
}

for (const id of ['mouse-sensitivity', 'sniper-aim-sensitivity', 'master-volume', 'effects-volume', 'footsteps-volume', 'graphics-quality', 'camera-shake']) {
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
// at most one armed key capture: clicking several bind buttons must not stack
// listeners, and closing the dialog must not leave one swallowing gameplay keys
let activeBindCapture: ((event: KeyboardEvent) => void) | null = null;
function cancelBindCapture(): void {
  if (activeBindCapture) window.removeEventListener('keydown', activeBindCapture, true);
  activeBindCapture = null;
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-bind]')) {
  button.addEventListener('click', () => {
    cancelBindCapture();
    populateSettings();
    const action = button.dataset.bind as BindAction;
    button.textContent = 'Taste drücken …';
    button.classList.add('listening');
    const capture = (event: KeyboardEvent) => {
      cancelBindCapture();
      event.preventDefault(); event.stopPropagation();
      if (event.code === 'Escape') { populateSettings(); return; }
      const previous = settings.keybinds[action];
      const conflict = (Object.keys(settings.keybinds) as BindAction[])
        .find((key) => key !== action && settings.keybinds[key] === event.code);
      if (conflict) settings.keybinds[conflict] = previous;
      settings.keybinds[action] = event.code;
      saveSettings(settings); applyRuntimeSettings(); populateSettings();
    };
    activeBindCapture = capture;
    window.addEventListener('keydown', capture, { capture: true, once: true });
  });
}
settingsDialog.addEventListener('close', () => {
  cancelBindCapture();
  if (inMatch && roundRunning && networkConnected) input.requestLock();
});
applyRuntimeSettings();

// ---------- menu / lobby wiring ----------
const nameInput = $('name-input') as HTMLInputElement;
const joinButton = $('join-btn') as HTMLButtonElement;
const customizeDialog = $('customize-dialog') as HTMLDialogElement;
type LobbyMode = 'quick' | 'multiplayer' | 'training';
type ConnectionIntent = 'play' | 'createParty' | 'joinParty' | 'resumeParty';
let lobbyMode: LobbyMode = 'quick';
let matchmakingBusy = false;
let currentLobbyState: LobbyStateMsg | null = null;
let coldStartTimer: ReturnType<typeof setTimeout> | null = null;
function clearColdStartTimer(): void {
  if (coldStartTimer) clearTimeout(coldStartTimer);
  coldStartTimer = null;
}

// one tracked auto-hide timer for transient "network ok" toasts — a stale timer
// must never wipe a newer persistent banner (e.g. an active reconnect notice)
let networkToastTimer: ReturnType<typeof setTimeout> | null = null;
function flashNetworkStatus(message: string, holdMs: number): void {
  if (networkToastTimer) clearTimeout(networkToastTimer);
  hud.setNetworkStatus(message, false);
  networkToastTimer = setTimeout(() => {
    networkToastTimer = null;
    hud.setNetworkStatus(null);
  }, holdMs);
}
function holdNetworkStatus(message: string | null): void {
  if (networkToastTimer) clearTimeout(networkToastTimer);
  networkToastTimer = null;
  hud.setNetworkStatus(message);
}
nameInput.value = lobbyProfile.name;
$('lobby-player-name').textContent = lobbyProfile.name;

$('join-btn').addEventListener('click', () => { void handlePrimaryLobbyAction(); });

function skinIndex(skin: PlayerSkinId): number {
  const index = PLAYER_SKINS.findIndex((entry) => entry.id === skin);
  return index >= 0 ? index : 0;
}

function renderSkinSwatches(): void {
  const root = $('skin-swatches');
  root.replaceChildren(...PLAYER_SKINS.map((skin) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `skin-swatch${skin.id === lobbyProfile.skin ? ' active' : ''}`;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(skin.id === lobbyProfile.skin));
    const sample = document.createElement('i');
    sample.style.background = `#${skin.color.toString(16).padStart(6, '0')}`;
    const label = document.createElement('span');
    label.textContent = skin.label;
    button.append(sample, label);
    button.addEventListener('click', () => {
      lobbyProfile = { ...lobbyProfile, skin: skin.id };
      saveLobbyProfile(lobbyProfile);
      lobbyScene.setSkin(skin.id);
      renderSkinSwatches();
      sfx.play('click');
    });
    return button;
  }));
}
renderSkinSwatches();

$('customize-btn').addEventListener('click', () => {
  if (!customizeDialog.open) customizeDialog.showModal();
  sfx.play('click');
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-lobby-mode]')) {
  button.addEventListener('click', () => {
    const requested = button.dataset.lobbyMode;
    lobbyMode = requested === 'training' ? 'training' : requested === 'multiplayer' ? 'multiplayer' : 'quick';
    if (currentPartyState && isHost && lobbyMode !== 'training') {
      net?.updatePartySettings(lobbyMode as PartySelection, currentPartyState.fillBots);
    }
    for (const candidate of document.querySelectorAll<HTMLButtonElement>('[data-lobby-mode]')) {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-checked', String(active));
    }
    $('training-options').hidden = lobbyMode !== 'training';
    renderLobbyControls();
    sfx.play('click');
  });
}

$('party-create-btn').addEventListener('click', () => {
  sfx.play('click');
  void joinServer('createParty');
});
$('party-join-toggle').addEventListener('click', () => {
  const form = $('party-join-form');
  form.hidden = !form.hidden;
  if (!form.hidden) ($('party-code-input') as HTMLInputElement).focus();
  sfx.play('click');
});
const submitPartyCode = () => {
  const input = $('party-code-input') as HTMLInputElement;
  const code = input.value.trim().toUpperCase().replace(/[^A-Z2-9]/g, '');
  input.value = code;
  if (code.length < 4) {
    $('party-error').textContent = 'Gib einen vollständigen Teamcode ein.';
    return;
  }
  void joinServer('joinParty', code);
};
$('party-join-btn').addEventListener('click', submitPartyCode);
$('party-code-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitPartyCode();
  }
});
$('party-copy-btn').addEventListener('click', () => {
  const code = currentPartyState?.code;
  if (!code) return;
  const button = $('party-copy-btn') as HTMLButtonElement;
  void navigator.clipboard?.writeText(code).then(() => {
    button.dataset.copied = 'true';
    $('party-status').textContent = 'Teamcode kopiert.';
    setTimeout(() => { delete button.dataset.copied; }, 900);
  }).catch(() => {
    $('party-error').textContent = `Teamcode: ${code}`;
  });
  sfx.play('click');
});
$('party-leave-btn').addEventListener('click', () => {
  sfx.play('click');
  void net?.leaveParty();
});
$('party-fill-bots').addEventListener('change', () => {
  if (!currentPartyState || !isHost) return;
  net?.updatePartySettings('quick', ($('party-fill-bots') as HTMLInputElement).checked);
});

function renderLobbyKickControls(
  party: PartyStateMsg | null,
  host: boolean,
  locked: boolean,
): void {
  const root = $('lobby-kick-controls');
  if (!party || !host || locked) {
    root.replaceChildren();
    return;
  }
  root.replaceChildren(...party.members
    .filter((member) => member.id !== myId)
    .map((member) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lobby-kick-button';
      button.dataset.memberId = member.id;
      button.textContent = '×';
      button.hidden = true;
      button.title = `${member.name} aus der Party entfernen`;
      button.setAttribute('aria-label', `${member.name} aus der Party entfernen`);
      button.addEventListener('click', () => {
        net?.kickPartyMember(member.id);
        $('party-status').textContent = `${member.name} wird aus der Party entfernt.`;
        sfx.play('click');
      });
      return button;
    }));
  updateLobbyKickControlPositions();
}

function updateLobbyKickControlPositions(): void {
  const anchors = new Map(
    lobbyScene.projectMemberLabels(window.innerWidth, window.innerHeight)
      .map((anchor) => [anchor.id, anchor]),
  );
  for (const button of document.querySelectorAll<HTMLButtonElement>('.lobby-kick-button')) {
    const anchor = anchors.get(button.dataset.memberId ?? '');
    button.hidden = !anchor?.visible;
    if (!anchor?.visible) continue;
    button.style.left = `${anchor.right - 15}px`;
    button.style.top = `${anchor.y}px`;
  }
}

async function handlePrimaryLobbyAction(): Promise<void> {
  if (matchmakingBusy) return;
  if (currentPartyState) {
    if (!isHost) return;
    setJoinBusy(true);
    if (currentPartyState.queueStatus === 'queued' || currentPartyState.queueStatus === 'countdown') {
      net?.cancelPartyQueue();
    } else if (lobbyMode === 'quick') {
      net?.startPartyQuickMatch();
    } else if (lobbyMode === 'multiplayer') {
      net?.startPartyQueue();
    }
    return;
  }
  if (lobbyMode === 'quick') await joinServer('createParty');
  else await joinServer('play');
}

function renderLobbyControls(): void {
  const party = currentPartyState;
  const memberCount = party?.members.length ?? 0;
  const host = !!party && party.hostId === myId;
  isHost = party ? host : isHost;
  const locked = !!party && party.queueStatus !== 'idle';

  $('party-empty').hidden = !!party;
  $('party-active').hidden = !party;
  ($('customize-btn') as HTMLButtonElement).disabled = !!party;
  ($('party-create-btn') as HTMLButtonElement).disabled = matchmakingBusy || !!party;
  ($('party-join-btn') as HTMLButtonElement).disabled = matchmakingBusy || !!party;
  ($('party-join-toggle') as HTMLButtonElement).disabled = matchmakingBusy || !!party;
  ($('party-leave-btn') as HTMLButtonElement).disabled = party?.queueStatus === 'match';

  if (party) {
    $('party-code').textContent = party.code;
    const copyButton = $('party-copy-btn') as HTMLButtonElement;
    copyButton.setAttribute('aria-label', `Teamcode ${party.code} kopieren`);
    $('party-status').textContent = locked
      ? party.queueStatus === 'match' ? 'Party ist im Match.' : 'Die Party sucht gemeinsam eine öffentliche Insel.'
      : host ? 'Du steuerst Modus und Start.' : 'Nur der Host kann Modus und Start ändern.';
    lobbyScene.setPartyMembers(party.members, myId);
  } else {
    $('party-status').textContent = '';
    lobbyScene.setPartyMembers([{
      id: 'local-preview',
      name: lobbyProfile.name,
      skin: lobbyProfile.skin,
      isHost: false,
      connected: true,
    }], 'local-preview');
  }
  renderLobbyKickControls(party, host, locked);

  if (party && lobbyMode === 'training') lobbyMode = party.selection;
  if (party && !locked) lobbyMode = party.selection;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-lobby-mode]')) {
    const mode = button.dataset.lobbyMode as LobbyMode;
    const active = mode === lobbyMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-checked', String(active));
    button.disabled = !!party && (mode === 'training' || !host || locked);
  }
  $('training-options').hidden = lobbyMode !== 'training';

  const fillVisible = !!party
    && lobbyMode === 'quick'
    && memberCount >= 2
    && memberCount <= 4;
  $('party-fill-row').hidden = !fillVisible;
  const fill = $('party-fill-bots') as HTMLInputElement;
  fill.checked = party?.fillBots ?? false;
  fill.disabled = !host || locked;

  let label = 'Spielen';
  let help = '';
  let disabled = matchmakingBusy;
  if (!party) {
    if (lobbyMode === 'quick') {
      label = 'Code-Party erstellen';
      help = 'Schnellspiel ist privat und startet ab zwei Party-Mitgliedern.';
    } else if (lobbyMode === 'multiplayer') {
      label = 'Multiplayer suchen';
      help = 'Öffentliches Matchmaking mit echten Spielern.';
    } else {
      label = 'Training starten';
    }
  } else if (!host) {
    label = 'Warte auf den Host';
    help = 'Der Host wählt den Modus und startet für die gesamte Party.';
    disabled = true;
  } else if (locked) {
    label = party.queueStatus === 'match' ? 'Match läuft' : 'Suche abbrechen';
    help = party.queueStatus === 'countdown'
      ? 'Der 15-Sekunden-Countdown läuft; weitere Spieler können noch beitreten.'
      : 'Die Party bleibt dabei garantiert zusammen.';
    disabled = party.queueStatus === 'match';
  } else if (lobbyMode === 'quick') {
    label = 'Privates Schnellspiel starten';
    help = memberCount < 2
      ? 'Mindestens zwei echte Party-Mitglieder werden benötigt.'
      : 'Nur eure Party spielt; Bots sind optional und normale Gegner.';
    disabled ||= memberCount < 2;
  } else {
    label = 'Party-Multiplayer suchen';
    help = 'Die gesamte Party wechselt atomar in die öffentliche Queue.';
  }
  joinButton.disabled = disabled;
  const labelNode = joinButton.querySelector('span');
  if (labelNode) labelNode.textContent = label;
  $('mode-help').textContent = help;
}

renderLobbyControls();

function ensureRapier(): Promise<RapierModule> {
  if (rapier) return Promise.resolve(rapier);
  if (!rapierPromise) {
    rapierPromise = import('@dimforge/rapier3d-compat').then(async ({ default: module }) => {
      await module.init();
      rapier = module;
      return module;
    }).catch((error: unknown) => {
      rapierPromise = null; // transient load failure — allow the next click to retry
      throw error;
    });
  }
  return rapierPromise;
}

function setJoinBusy(busy: boolean): void {
  matchmakingBusy = busy;
  joinButton.setAttribute('aria-busy', String(busy));
  renderLobbyControls();
  if (busy) {
    const label = joinButton.querySelector('span');
    if (label) label.textContent = 'Verbindung wird aufgebaut …';
  }
}

function setMenuStatus(message: string, error = false): void {
  $('menu-error').textContent = message;
  $('menu-error').classList.toggle('error', error);
}

async function joinServer(intent: ConnectionIntent = 'play', requestedPartyCode = ''): Promise<void> {
  if (matchmakingBusy) return;
  if (net) {
    setJoinBusy(true);
    if (intent === 'createParty') net.createParty(lobbyProfile.name, lobbyProfile.skin);
    else if (intent === 'joinParty' || intent === 'resumeParty') {
      net.joinPartyByCode(
        lobbyProfile.name,
        lobbyProfile.skin,
        requestedPartyCode,
        intent === 'resumeParty' ? resumeToken || undefined : undefined,
      );
    } else if (lobbyMode === 'training') {
      const bots = Number(($('practice-bots') as HTMLSelectElement).value);
      const difficulty = ($('practice-difficulty') as HTMLSelectElement).value as BotDifficulty;
      net.startTrainingRoom(myName || lobbyProfile.name, lobbyProfile.skin, bots, difficulty, 'quick');
    } else {
      net.quickPlay(myName || lobbyProfile.name, lobbyProfile.skin);
    }
    return;
  }
  myName = lobbyProfile.name;
  resumeToken ||= safeStorage.getItem('islandResumeToken')
    ?? safeStorage.getItem(`islandResumeToken:${myName.toLocaleLowerCase()}`)
    ?? '';
  rememberedPartyCode ||= safeStorage.getItem('islandPartyCode') ?? '';
  sfx.unlock();
  setMenuStatus('Spiel wird vorbereitet …');
  setJoinBusy(true);
  leavingGame = false;

  try {
    await Promise.all([ensureRapier(), gameAssets.preload(renderer)]);
  } catch {
    setMenuStatus('Die Spielinhalte konnten nicht geladen werden. Bitte lade die Seite neu.', true);
    setJoinBusy(false);
    return;
  }

  let url: string | undefined;
  try {
    url = currentMultiplayerUrl();
  } catch (error) {
    setMenuStatus(error instanceof Error ? error.message : 'Die Multiplayer-Konfiguration ist ungültig.', true);
    setJoinBusy(false);
    return;
  }
  networkConnected = false;
  joinedTransportId = '';
  const connectionStartedAt = performance.now();
  coldStartTimer = setTimeout(() => {
    if (!networkConnected) setMenuStatus('Server wird gestartet … Das kann beim ersten Mal kurz dauern.');
  }, 1_400);

  let nextNet!: Net;
  let assignmentCount = 0;
  const sendAssignment = () => {
    const rememberedCode = currentPartyState?.code
      ?? rememberedPartyCode
      ?? safeStorage.getItem('islandPartyCode')
      ?? '';
    if (rememberedCode) rememberedPartyCode = rememberedCode;
    const reconnectingParty = assignmentCount > 0 && rememberedCode && resumeToken;
    assignmentCount += 1;
    if (reconnectingParty || intent === 'resumeParty') {
      nextNet.joinPartyByCode(myName, lobbyProfile.skin, rememberedCode || requestedPartyCode, resumeToken || undefined);
    } else if (intent === 'createParty') {
      nextNet.createParty(myName, lobbyProfile.skin);
    } else if (intent === 'joinParty') {
      const canResume = rememberedCode.toUpperCase() === requestedPartyCode.toUpperCase();
      nextNet.joinPartyByCode(
        myName,
        lobbyProfile.skin,
        requestedPartyCode,
        canResume ? resumeToken || undefined : undefined,
      );
    } else if (rememberedCode && resumeToken) {
      nextNet.joinPartyByCode(myName, lobbyProfile.skin, rememberedCode, resumeToken);
    } else if (lobbyMode === 'training') {
      const bots = Number(($('practice-bots') as HTMLSelectElement).value);
      const difficulty = ($('practice-difficulty') as HTMLSelectElement).value as BotDifficulty;
      nextNet.startTrainingRoom(myName, lobbyProfile.skin, bots, difficulty, 'quick', resumeToken || undefined);
    } else {
      nextNet.quickPlay(myName, lobbyProfile.skin, resumeToken || undefined);
    }
  };
  nextNet = new Net(url, {
    onLobby: (m) => onLobby(m),
    onParty: (party) => {
      currentPartyState = party;
      $('party-error').textContent = '';
      setJoinBusy(false);
      if (party) {
        rememberedPartyCode = party.code;
        safeStorage.setItem('islandPartyCode', party.code);
        lobbyMode = party.selection;
        if (!inMatch && party.queueStatus === 'idle' && $('scoreboard-screen').classList.contains('hidden')) {
          showScreen('menu-screen');
        }
      } else {
        rememberedPartyCode = '';
        safeStorage.removeItem('islandPartyCode');
        // mid-match a party disband must not sever the running session:
        // clearing myId would break reconciliation and duplicate the local rig
        if (!inMatch) {
          safeStorage.removeItem('islandResumeToken');
          resumeToken = '';
          myId = '';
          isHost = false;
          showScreen('menu-screen');
        }
      }
      renderLobbyControls();
    },
    onPartyError: (error) => {
      $('party-error').textContent = error.reason;
      setMenuStatus(error.reason, true);
      setJoinBusy(false);
      if (error.operation === 'join' && !currentPartyState) {
        rememberedPartyCode = '';
        safeStorage.removeItem('islandPartyCode');
      }
    },
    onRoomAssigned: () => {
      setJoinBusy(false);
      showScreen('lobby-screen');
    },
    onMatchmakingState: (state) => {
      if (!inMatch) setMenuStatus(state.message);
    },
    onJoinError: (msg) => {
      clearColdStartTimer();
      setMenuStatus(msg, true);
      $('lobby-error').textContent = msg;
      setJoinBusy(false);
      nextNet.dispose();
      if (net === nextNet) net = null;
      showScreen('menu-screen');
    },
    onKicked: (msg) => { void leaveToMenu(msg.reason, false, nextNet); },
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
      startVictoryCinematic(m);
    },
    onMatchEnd: (m) => {
      if (leavingGame) return;
      roundRunning = false;
      if (victoryCinematic) victoryCinematic.matchEnd = m;
      else finishMatchEnd(m);
    },
    onSession: (session: SessionMsg) => {
      myId = session.playerId;
      resumeToken = session.resumeToken;
      safeStorage.setItem('islandResumeToken', resumeToken);
      if (session.partyCode) {
        rememberedPartyCode = session.partyCode;
        safeStorage.setItem('islandPartyCode', session.partyCode);
      }
      forceAuthority = session.resumed;
      if (session.resumed) flashNetworkStatus('Verbindung wiederhergestellt', 1800);
    },
    onConnectionState: (state, detail) => {
      if (state === 'connected') {
        clearColdStartTimer();
        networkConnected = true;
        const transportId = nextNet.socket.id ?? '';
        if (transportId && transportId !== joinedTransportId) {
          joinedTransportId = transportId;
          sendAssignment();
        }
      } else if (state === 'disconnected') {
        networkConnected = false;
        document.exitPointerLock?.();
        holdNetworkStatus(inMatch
          ? 'Verbindung unterbrochen — Wiederverbindung läuft …'
          : 'Serververbindung getrennt — neuer Versuch läuft …');
      } else {
        const warming = performance.now() - connectionStartedAt < 30_000;
        if (!inMatch) setMenuStatus(
          warming
            ? 'Server wird gestartet … Wir verbinden dich automatisch.'
            : 'Verbindung dauert länger als erwartet. Neuer Versuch läuft automatisch.',
        );
        holdNetworkStatus('Verbindung unterbrochen — neuer Versuch läuft …');
        if (detail && !warming) console.warn('Multiplayer connection:', detail);
      }
    },
    onConnectionNotice: (notice) => {
      if (notice.type === 'lost' && notice.playerId !== myId) {
        holdNetworkStatus('Ein Spieler hat die Verbindung verloren — Reconnect-Fenster aktiv');
      } else if (notice.type === 'reconnected' && notice.playerId !== myId) {
        flashNetworkStatus('Spieler wieder verbunden', 1800);
      } else if (notice.type === 'hostChanged') {
        flashNetworkStatus(notice.playerId === myId ? 'Du bist jetzt Host' : 'Host wurde automatisch übertragen', 2400);
      }
    },
  });
  net = nextNet;
  if (nextNet.socket.connected) {
    networkConnected = true;
    joinedTransportId = nextNet.socket.id ?? '';
    sendAssignment();
  }
}

$('profile-btn').addEventListener('click', () => {
  nameInput.value = lobbyProfile.name;
  $('profile-error').textContent = '';
  renderProfile(lobbyProfile.name);
  showScreen('profile-screen');
  sfx.play('click');
});
$('profile-save-btn').addEventListener('click', () => {
  const previousName = lobbyProfile.name;
  const saved = saveLobbyProfile({ name: nameInput.value, skin: lobbyProfile.skin });
  if (!saved) {
    $('profile-error').textContent = 'Verwende 2–16 Buchstaben, Zahlen, Leerzeichen, _ oder -.';
    return;
  }
  renameStoredProfile(previousName, saved.name);
  lobbyProfile = saved;
  myName = saved.name;
  $('lobby-player-name').textContent = saved.name;
  $('profile-error').textContent = 'Name gespeichert.';
  renderProfile(saved.name);
  sfx.play('click');
});
$('profile-back-btn').addEventListener('click', () => {
  showScreen('menu-screen');
  sfx.play('click');
});

let myReady = false;
$('rematch-btn').addEventListener('click', () => {
  hud.hideScoreboard();
  hud.hide();
  if (currentPartyState) {
    $('rematch-btn').textContent = 'Rematch (neue Insel)';
    showScreen('menu-screen');
    renderLobbyControls();
  } else {
    net?.rematch();
    myReady = true;
    showScreen('lobby-screen');
  }
});
$('lobby-leave-btn').addEventListener('click', (event) => {
  event.stopPropagation();
  sfx.play('click');
  if (currentPartyState) {
    if (isHost && (currentPartyState.queueStatus === 'queued' || currentPartyState.queueStatus === 'countdown')) {
      net?.cancelPartyQueue();
    }
    showScreen('menu-screen');
    return;
  }
  void leaveToMenu('Du hast die Wartelobby verlassen.', true);
});
for (const id of ['pause-leave-btn', 'scoreboard-leave-btn']) {
  $(id).addEventListener('click', (event) => {
    event.stopPropagation();
    sfx.play('click');
    if (currentPartyState) void leaveCurrentMatchToParty();
    else void leaveToMenu('Du hast das Spiel verlassen.', true);
  });
}

function showScreen(id: string | null): void {
  for (const s of ['menu-screen', 'lobby-screen', 'scoreboard-screen', 'profile-screen']) {
    $(s).classList.toggle('hidden', s !== id);
  }
}

async function leaveToMenu(message: string, notifyServer: boolean, targetNet: Net | null = net): Promise<void> {
  if (leavingGame) return;
  leavingGame = true;
  document.exitPointerLock?.();
  $('pause-hint').style.display = 'none';

  if (notifyServer) await targetNet?.leaveGame();
  targetNet?.dispose();
  if (net === targetNet) net = null;

  safeStorage.removeItem('islandResumeToken');
  safeStorage.removeItem('islandPartyCode');
  safeStorage.removeItem(`islandResumeToken:${myName.toLocaleLowerCase()}`);
  resumeToken = '';
  rememberedPartyCode = '';
  joinedTransportId = '';
  networkConnected = false;
  inMatch = false;
  roundRunning = false;
  alive = false;
  isHost = false;
  myReady = false;
  myId = '';
  names.clear();
  colorIndex.clear();
  currentLobbyState = null;
  currentPartyState = null;
  disposeMatchScene();
  hud.hideScoreboard();
  hud.hide();
  hud.setScoped(false);
  hud.setScopeZoom(null);
  holdNetworkStatus(null);
  clearColdStartTimer();
  showScreen('menu-screen');
  setMenuStatus(message);
  setJoinBusy(false);
  leavingGame = false;
  renderLobbyControls();
}

async function leaveCurrentMatchToParty(): Promise<void> {
  if (leavingGame) return;
  leavingGame = true;
  document.exitPointerLock?.();
  await net?.leaveGame();
  inMatch = false;
  roundRunning = false;
  alive = false;
  disposeMatchScene();
  hud.hideScoreboard();
  hud.hide();
  showScreen('menu-screen');
  setMenuStatus('Du hast das Match verlassen. Deine Party bleibt bestehen.');
  leavingGame = false;
  renderLobbyControls();
}

function onLobby(m: LobbyStateMsg): void {
  currentLobbyState = m;
  setJoinBusy(false);
  if (!inMatch) hud.setNetworkStatus(null);
  names = new Map(m.players.map((p) => [p.id, p.name]));
  m.players.forEach((p) => colorIndex.set(p.id, skinIndex(p.skin)));
  const me = m.players.find((p) => p.id === myId);
  if (!me) return; // unjoined sockets must never be promoted into the lobby UI
  renameStoredProfile(lobbyProfile.name, me.name);
  myName = me.name;
  lobbyProfile = { name: me.name, skin: me.skin };
  saveLobbyProfile(lobbyProfile);
  $('lobby-player-name').textContent = me.name;
  isHost = currentPartyState ? currentPartyState.hostId === myId : !!me?.isHost;
  if (me) myReady = me.ready;
  if (inMatch || !$('scoreboard-screen').classList.contains('hidden')) return;

  showScreen('lobby-screen');
  const ul = $('lobby-players');
  ul.innerHTML = '';
  for (const p of m.players) {
    const li = document.createElement('li');
    const left = document.createElement('span');
    left.className = 'waiting-player';
    const swatch = document.createElement('i');
    swatch.className = 'waiting-player-skin';
    swatch.style.background = `#${PLAYER_SKINS[skinIndex(p.skin)].color.toString(16).padStart(6, '0')}`;
    const label = document.createElement('span');
    label.className = 'waiting-player-name';
    label.textContent = p.name + (p.id === myId ? ' (du)' : '');
    left.append(swatch, label);
    const state = document.createElement('span');
    state.className = 'waiting-player-state';
    state.textContent = p.connected ? 'verbunden ✓' : 'verbindet neu …';
    li.append(left, state);
    ul.appendChild(li);
  }
  $('waiting-kicker').textContent = m.kind === 'training'
    ? 'TRAINING'
    : m.kind === 'party-quick' ? 'PRIVATES SCHNELLSPIEL' : 'MULTIPLAYER';
  $('waiting-title').textContent = m.status === 'countdown' ? 'Match startet gleich' : 'Warte auf Mitspieler';
  $('waiting-progress-bar').style.width = `${Math.min(100, m.players.length / m.maxPlayers * 100)}%`;
  $('lobby-error').textContent = m.status === 'countdown'
    ? 'Alle bereit. Der Countdown wird vom Server gesteuert.'
    : `${m.players.length}/${m.maxPlayers} Spieler · mindestens 2 werden benötigt.`;
  $('lobby-leave-btn').textContent = currentPartyState
    ? (isHost ? 'Suche abbrechen und zur Party' : 'Zur Party-Ansicht')
    : 'Wartelobby verlassen';
  updateWaitingCountdown();
}

function updateWaitingCountdown(): void {
  const state = currentLobbyState;
  if (!state?.countdownEndsAt) {
    $('waiting-countdown').textContent = '–';
    return;
  }
  const remaining = Math.max(0, state.countdownEndsAt - Date.now());
  $('waiting-countdown').textContent = `${Math.ceil(remaining / 1000)}`;
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
  lastElimination = null;
  lastInv = null;
  m.players.forEach((p) => {
    names.set(p.id, p.name);
    colorIndex.set(p.id, skinIndex(p.skin));
  });

  gen = generateWorld(m.seed, m.n);
  world = new World(gen);
  world.setGraphicsQuality(settings.graphics);
  world.setColliderDebugVisible(showDebug);
  world.scene.add(camera);
  entities = new Entities(world.scene, camera, m.seed, reduceMotion);
  entities.setViewSkin(colorIndex.get(myId) ?? skinIndex(lobbyProfile.skin));
  phys = new GamePhysics(rapier, gen);
  phys.addPlayer(myId, { x: 0, y: 20, z: 0 });
  hud.initIsland(gen.params, gen.spawns, gen.pois);

  for (const p of m.players) {
    if (p.id !== myId) entities.ensurePlayer(p.id, colorIndex.get(p.id) ?? 0, p.name);
  }

  showScreen(null);
  hud.show();
  input.requestLock();
}

function onRoundStart(m: RoundStartMsg): void {
  if (!gen || !world || !phys || !entities) return;
  world.setLightingPreset(m.lightingPreset);
  cancelVictoryCinematic();
  lastElimination = null;
  hud.hideScoreboard();
  hud.setRoundRoster([], myId, false);
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
  sniperScopeFov = DEFAULT_SNIPER_SCOPE_FOV;
  flashVisual = null;
  nextCookBeepAt = 0;
  inputAccumulator = 0;
  reconciliationHardSnaps = 0;
  reconciliationSmoothCorrections = 0;
  lastReconciliationError = 0;
  maxReconciliationError = 0;
  maxPredictionStepsPerFrame = 0;
  interpolationDelayMs = INTERP_DELAY_MS;
  maxRemoteExtrapolationMs = 0;
  networkHudAccumulator = 0;
  hud.setFlashWhiteout(0);
  hud.setCooking(null, GRENADE_FUSE);
  hud.setScoped(false);
  hud.setScopeZoom(null);
  hud.setBreath(null, false);
  entities.clearSmokes();

  const spawnIdx = m.spawns[myId] ?? 0;
  const sp = gen.spawns[spawnIdx];
  const y = sampleHeight(gen.params, sp.x, sp.z);
  move = freshMoveState({ x: sp.x, y: y + 0.1, z: sp.z });
  resetRenderMovePosition();
  onboardingOrigin = { x: sp.x, z: sp.z };
  phys.setPlayerStance(myId, false, false, move.pos);
  phys.setPlayerPos(myId, move.pos);
  input.yaw = Math.atan2(-(-sp.x), -(-sp.z)); // face island center
  input.pitch = 0;

  entities.clearPickups();
  entities.clearProjectiles();
  for (const p of m.pickups) entities.addPickup(p);
  entities.resetPlayerAnimations();
  entities.setViewWeapon('fists');
  entities.setSpectatorLabels(false);
  entities.setAiming(false);
  entities.setReloading(false);
  entities.setViewVisible(true);
  camera.fov = 75;
  camera.updateProjectionMatrix();
  hud.setSpectating(false);
  hud.hideDeathRecap();

  const lightingLabel = {
    day: 'Tag', dawn: 'Morgendämmerung', sunset: 'Sonnenuntergang', night: 'Nacht',
  }[m.lightingPreset];
  if (m.suddenDeath && !suddenDeathAnnounced) {
    suddenDeathAnnounced = true;
    hud.announce(`⚔ SUDDEN DEATH — ${lightingLabel} · eine Runde entscheidet!`, 4000);
  } else {
    hud.announce(`Runde ${Math.min(m.round, 3)}${m.suddenDeath ? ' (Sudden Death)' : ''} · ${lightingLabel}`, 2600);
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
    names.set(p.id, p.name);
    if (!remoteBufs.has(p.id)) {
      remoteBufs.set(p.id, []);
      entities?.ensurePlayer(p.id, colorIndex.get(p.id) ?? 0, p.name);
    }
    const buf = remoteBufs.get(p.id)!;
    buf.push({
      at: now,
      x: p.x, y: p.y, z: p.z,
      yaw: p.yaw, pitch: p.pitch,
      vx: p.vx, vy: p.vy, vz: p.vz,
    });
    while (buf.length > 30) buf.shift();
    entities?.updatePlayer(
      p.id, p.x, p.y, p.z, p.yaw, p.pitch, p.alive, p.weapon,
      p.sneaking, p.prone, p.aiming, p.helmet,
      {
        speed: Math.hypot(p.vx, p.vz),
        grounded: p.grounded,
        sprinting: p.sprinting,
        reloading: p.reloading,
        flashIntensity: p.flashIntensity,
      },
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
    move.sprinting = self.sprinting; move.sneaking = self.sneaking; move.prone = self.prone;
    phys.setPlayerStance(myId, move.sneaking, move.prone, move.pos, self.yaw);
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
  move.prone = self.prone;
  phys.setPlayerStance(myId, move.sneaking, move.prone, move.pos, self.yaw);
  phys.setPlayerPos(myId, move.pos);

  let replayPreviousX = move.pos.x;
  let replayPreviousY = move.pos.y;
  let replayPreviousZ = move.pos.z;
  for (const inp of pending) {
    replayPreviousX = move.pos.x;
    replayPreviousY = move.pos.y;
    replayPreviousZ = move.pos.z;
    stepMovement(phys, myId, move, inp, myWeapon);
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
  entities?.setSpectatorLabels(true);
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
  else if (item.item === 'plateItem' || item.item === 'helmetItem') sfx.play('pickupArmor');
  else if (item.item === 'pistolAmmo'
    || item.item === 'rifleAmmo' || item.item === 'shellAmmo' || item.item === 'grenade') sfx.play('pickupAmmo');
  else if (item.item in WEAPONS) sfx.play('pickupWeapon');
  else sfx.play('pickup');
}

function onEvent(e: GameEvent): void {
  switch (e.type) {
    case 'shot': {
      const d = e.by === myId ? 0 : distToMe(e.ox, e.oy, e.oz);
      const w = e.weapon;
      const sound = w === 'shotgun' ? 'shotgun' : w === 'rifle' ? 'rifle' : w === 'sniper' ? 'sniper' : 'pistol';
      if (e.by === myId) sfx.play(sound, d);
      else playSpatial(sound, e.ox, e.oy, e.oz);
      if (WEAPONS[w].kind === 'hitscan' && e.hx !== undefined && e.hy !== undefined && e.hz !== undefined) {
        entities?.addTracer(new THREE.Vector3(e.ox, e.oy, e.oz), new THREE.Vector3(e.hx, e.hy, e.hz));
        entities?.addImpact(e.hx, e.hy, e.hz, w);
      }
      if (e.by === myId && e.primary !== false) entities?.addMuzzleFlash(camera);
      if (e.primary !== false) entities?.triggerPlayerFire(e.by);
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
      entities?.triggerPlayerMelee(e.by);
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
        hud.damageFlash(e.amount, e.headshot ?? false);
        hud.damageDirection(incomingDamageAngle(e.attacker));
        sfx.play('hurt');
        hud.setHp(e.hp);
        if (!reduceMotion && settings.cameraShake) damageKick = Math.min(1, damageKick + 0.72);
        rumble(95, 0.35, 0.22);
      }
      break;
    case 'armorHit':
      if (e.shield === 0) entities?.breakShield(e.target);
      if (e.target === myId) {
        hud.armorImpact();
        hud.damageDirection(incomingDamageAngle(e.attacker), true);
        sfx.play(e.shield === 0 ? 'shieldBreak' : 'shieldHit');
        if (e.shield === 0) hud.equipmentNotice('Panzerung zerstört', true);
      }
      break;
    case 'helmetBreak':
      entities?.breakHelmet(e.target);
      if (e.target === myId) {
        hud.equipmentNotice('Helm hat den Kopftreffer blockiert – jetzt zerstört', true);
        sfx.play('helmetBreak');
      } else if (e.attacker === myId) {
        hud.equipmentNotice('Gegnerischen Helm zerstört');
      }
      break;
    case 'hitmarker': {
      const feedback = classifyHitFeedback(e);
      hud.hitmarker(feedback);
      sfx.play(feedback.sound);
      if (feedback.flashTarget) entities?.flashPlayer(e.target, e.headshot);
      break;
    }
    case 'death': {
      const victimSnap = lastSnap?.players.find((player) => player.id === e.target);
      lastElimination = {
        victimId: e.target,
        position: e.target === myId
          ? renderMovePos.clone()
          : new THREE.Vector3(victimSnap?.x ?? 0, victimSnap?.y ?? 0, victimSnap?.z ?? 0),
      };
      entities?.playElimination(e.target, e.attacker === myId);
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
        const victim = names.get(e.target) ?? 'Gegner';
        const detail = e.weapon ? weaponName(e.weapon) : e.cause === 'zone' ? 'Zone' : 'Eliminiert';
        hud.showElimination(victim, `${detail}${e.headshot ? ' · Kopftreffer' : ''}`);
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
    case 'pickupSpawn':
      entities?.addPickup(e.pickup);
      if (e.pickup.droppedBy === myId && e.pickup.item in WEAPONS) {
        hud.equipmentNotice(`${weaponName(e.pickup.item as WeaponType)} abgelegt`);
      }
      break;
    case 'pickupRemove':
      entities?.removePickup(e.id, true);
      if (e.by === myId) {
        playPickupSound(e);
        hud.punchPickup();
        if (e.item === 'helmetItem') {
          hud.equipmentNotice('Schutzhelm automatisch ausgerüstet');
        }
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
        const animateSwitch = shouldAnimateWeaponSwitch(lastInv, e.inv);
        lastInv = e.inv;
        const viewWeapon = updateViewmodel(e.inv, animateSwitch);
        if (e.inv.reloading && !wasReloading) sfx.play('reload');
        const reloadDuration = WEAPONS[viewWeapon].reloadTime ?? 1;
        entities?.setReloading(e.inv.reloading, reloadDuration);
      }
      wasReloading = e.inv.reloading;
      hud.setInventory(e.inv);
      break;
    case 'craft':
      if (e.by === myId) {
        if (e.ok) { sfx.play('craft'); hud.announce(`Hergestellt: ${e.recipe === 'bandage' ? 'Verband' : 'Panzerplatte'}`, 1400); }
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
        flashVisual = createFlashVisual(e.intensity, e.duration, flashVisual);
        hud.setFlashWhiteout(flashVisual.opacity);
        sfx.play('flashTinnitus', 0, Math.max(0.18, e.intensity));
        rumble(140, 0.4, 0.3);
      }
      break;
    case 'cookout':
      if (e.by === myId) hud.announce('💥 Zu lange gehalten — Granate in der Hand explodiert!', 2600);
      break;
  }
}

function updateViewmodel(
  inv: InventoryState,
  animateSwitch: boolean,
): WeaponType {
  const w = viewWeaponForInventory(inv);
  entities?.setViewWeapon(w, animateSwitch);
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
  let finishVictoryAfterRender = false;

  if (input.debugToggled) {
    showDebug = !showDebug;
    world?.setColliderDebugVisible(showDebug);
    input.debugToggled = false;
  }

  if (!world || !entities || !phys || !net) {
    input.clearEdges();
    updateWaitingCountdown();
    lobbyScene.update(visualElapsed);
    updateLobbyKickControlPositions();
    renderer.render(lobbyScene.scene, lobbyScene.camera);
    return;
  }

  const t = lastSnap ? snapClock.t + (now - snapClock.at) / 1000 : 0;

  const aimable = myWeapon === 'pistol'
    || myWeapon === 'rifle' || myWeapon === 'shotgun' || myWeapon === 'sniper';
  const aiming = roundRunning && alive && input.aim && aimable && !wasReloading;
  if (aiming) onboarding.signal('aim');
  entities.setAiming(aiming);
  $('hud').classList.toggle('aiming', aiming);

  // ---- sniper scope: hard zoom + overlay + breathing sway (§F1) ----
  const scoped = aiming && myWeapon === 'sniper';
  input.setSniperScoped(scoped);
  const wheelDelta = input.consumeWheelDelta();
  if (scoped && wheelDelta !== 0) {
    sniperScopeFov = adjustSniperScopeFov(sniperScopeFov, wheelDelta);
  } else if (wheelDelta !== 0 && lastInv) {
    input.slotPressed = nextWeaponSlot(lastInv, wheelDelta);
  }
  entities.setViewVisible(alive && !scoped && !victoryCinematic);
  const holdingBreath = scoped && input.sprint && breath > 0;
  if (scoped) {
    swayT += dt;
    breath = holdingBreath
      ? Math.max(0, breath - dt)
      : Math.min(SCOPE_BREATH_MAX, breath + SCOPE_BREATH_REGEN * dt * 0.35);
    const moveAmp = Math.hypot(move.velX, move.velZ) * 0.0016;
    const amp = (holdingBreath ? 0.0006 : 0.0034 + moveAmp)
      * (move.prone ? 0.32 : move.sneaking ? 0.6 : 1);
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
  hud.setScopeZoom(scoped ? sniperScopeFov : null);

  const targetFov = (scoped ? sniperScopeFov : aiming ? (WEAPONS[myWeapon].aimFov ?? 55) : 75) + fireFovKick;
  const fovEase = reduceMotion ? 1 : 1 - Math.exp(-dt * 14);
  const nextFov = camera.fov + (targetFov - camera.fov) * fovEase;
  if (Math.abs(nextFov - camera.fov) > 0.01) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
  fireFovKick = Math.max(0, fireFovKick - dt * 8.5);
  crosshairBloom = Math.max(0, crosshairBloom - dt * 9.5);
  const crosshairBase = aiming ? 2.4 : myWeapon === 'shotgun' ? 9 : 5;
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
      const stance = stanceForWeapon(myWeapon, input.pointerLocked && input.sneak);
      const inp: InputMsg = {
        seq: ++seq,
        dt: inputStep,
        mx: input.pointerLocked ? input.moveX : 0,
        mz: input.pointerLocked ? input.moveZ : 0,
        // scope sway is baked into the transmitted view so the host raycast sees it (§F1)
        yaw: input.yaw + swayYaw,
        pitch: input.pitch + swayPitch,
        sprint: input.sprint && !aiming,
        ...stance,
        aim: aiming,
        jump: input.pointerLocked && input.jumpHeld,
        fire: input.pointerLocked && input.fire,
        interact: input.pointerLocked && input.interact,
        shotAgeMs: input.fire || input.firePressed
          ? recommendedShotRewindMs(interpolationDelayMs, net.rttMs)
          : undefined,
      };
      // Preserve a complete press/release that happened between two 30-Hz
      // samples (important for quick clicks and cooked-grenade release).
      if (input.pointerLocked && input.firePressed && input.fireReleased && !input.fire) {
        net.sendInput({ ...inp, fire: true });
        inp.seq = ++seq;
      }
      // action keys while unlocked belong to menus/dialogs, not the match —
      // e.g. typing with the pause hint open must not switch weapons or heal
      if (input.pointerLocked) {
        if (input.slotPressed) {
          // pressing 3 while the throwable is already up cycles frag → smoke → flash (§F2)
          if (input.slotPressed === 3 && lastInv?.active === 3) inp.throwCycle = true;
          else inp.slot = input.slotPressed;
        }
        if (input.reloadPressed) inp.reload = true;
        if (input.dropPressed) {
          inp.drop = true;
          dropRequestsSent += 1;
        }
      }
      previousMovePos.set(move.pos.x, move.pos.y, move.pos.z);
      stepMovement(phys, myId, move, inp, myWeapon);
      pending.push(inp);
      net.sendInput(inp);
      phys.step(inputStep);
      updateLocalFootsteps(inputStep);

      if (input.pointerLocked && input.craftPressed) net.craft(input.craftPressed);
      if (input.pointerLocked && input.bandagePressed) { net.useBandage(); bandageStart = now; }
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

    const targetEyeHeight = move.prone
      ? PLAYER_PRONE_EYE_HEIGHT
      : move.sneaking ? PLAYER_SNEAK_EYE_HEIGHT : PLAYER_EYE_HEIGHT;
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

  // --- adaptive remote interpolation + one bounded loss-gap extrapolation (§8) ---
  const interpolationTarget = targetInterpolationDelayMs(
    net?.jitterMs ?? 0,
    net?.lossPct ?? 0,
  );
  interpolationDelayMs = smoothInterpolationDelay(interpolationDelayMs, interpolationTarget, dt);
  const renderAt = now - interpolationDelayMs;
  for (const [id, buf] of remoteBufs) {
    if (id === myId || buf.length === 0) continue;
    const sampled = sampleRemoteTransform(buf, renderAt);
    if (!sampled) continue;
    maxRemoteExtrapolationMs = Math.max(maxRemoteExtrapolationMs, sampled.extrapolatedMs);
    const snapP = lastSnap?.players.find((p) => p.id === id);
    const renderX = sampled.x;
    const renderY = sampled.y;
    const renderZ = sampled.z;
    entities.updatePlayer(
      id, renderX, renderY, renderZ,
      sampled.yaw, sampled.pitch,
      snapP?.alive ?? true, snapP?.weapon ?? 'fists',
      snapP?.sneaking ?? false, snapP?.prone ?? false, snapP?.aiming ?? false,
      snapP?.helmet ?? false,
      {
        speed: Math.hypot(snapP?.vx ?? 0, snapP?.vz ?? 0),
        grounded: snapP?.grounded ?? true,
        sprinting: snapP?.sprinting ?? false,
        reloading: snapP?.reloading ?? false,
        flashIntensity: snapP?.flashIntensity ?? 0,
      },
    );
    updateRemoteFootsteps(id, renderX, renderY, renderZ, {
      alive: snapP?.alive ?? true,
      grounded: snapP?.grounded ?? false,
      sneaking: snapP?.sneaking ?? false,
      prone: snapP?.prone ?? false,
      sprinting: snapP?.sprinting ?? false,
    });
  }

  if (victoryCinematic) {
    victoryCinematic.elapsed = Math.min(victoryCinematic.duration, victoryCinematic.elapsed + dt);
    computeVictoryCameraPose(
      victoryCinematic.elapsed,
      victoryCinematic.subject,
      reduceMotion,
      victoryCameraPose,
    );
    camera.position.copy(victoryCameraPose.position);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(victoryCameraPose.target);
    const cinematicFov = reduceMotion ? 64 : 58;
    if (Math.abs(camera.fov - cinematicFov) > 0.01) {
      camera.fov = cinematicFov;
      camera.updateProjectionMatrix();
    }
    entities.setVictoryDanceWeight(victoryCameraPose.danceWeight);
    world.updateLocalCover(9999, 9999);
    const resultAt = reduceMotion ? 0.6 : 2.45;
    if (victoryCinematic.elapsed >= resultAt) showVictoryResult(victoryCinematic);
    finishVictoryAfterRender = victoryCinematic.elapsed >= victoryCinematic.duration;
  }

  // --- environment / HUD ---
  hud.setCompass(input.yaw);
  // flashbang whiteout eases off over its duration (§F2)
  if (flashVisual) {
    flashVisual = advanceFlashVisual(flashVisual, dt);
    hud.setFlashWhiteout(flashVisual.opacity);
    if (flashVisual.opacity <= 0.005) flashVisual = null;
  }
  const roundRosterVisible = inMatch
    && roundRunning
    && input.pointerLocked
    && input.roundRosterHeld
    && !victoryCinematic;
  hud.setRoundRoster(
    lastSnap?.players.map((player) => ({
      id: player.id,
      name: player.name,
      alive: player.alive,
      kills: player.kills,
    })) ?? [],
    myId,
    roundRosterVisible,
  );
  if (lastSnap) {
    world.update(t * matchPace, lastSnap.zone.radius, lastSnap.zone.targetRadius, lastSnap.timeOfDay);
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
  networkHudAccumulator += dt;
  if (networkHudAccumulator >= 0.25 && net) {
    networkHudAccumulator = 0;
    hud.setConnectionQuality(
      classifyConnectionQuality(net.rttMs, net.jitterMs, net.lossPct),
      net.rttMs,
      net.jitterMs,
      net.lossPct,
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
  const worldStats = world.stats();
  hud.setDebug(showDebug
    ? `World-Audit ${worldStats.audit.errors} Fehler · ${worldStats.audit.warnings} Hinweise · ${worldStats.audit.walkSurfaces} Rampen · Collider orange/cyan/grün\n`
      + `FPS ${fpsShown} · render ${Math.round(renderScale * 100)}% · calls ${renderer.info.render.calls} · tris ${renderer.info.render.triangles}\n`
      + `pos ${move.pos.x.toFixed(1)} ${move.pos.y.toFixed(1)} ${move.pos.z.toFixed(1)} · vel ${Math.hypot(move.velX, move.velZ).toFixed(1)}\n`
      + `entities P${entityStats.players} L${entityStats.pickups} J${entityStats.projectiles} FX${entityStats.effects}\n`
      + `Rapier bodies ${physicsStats.rigidBodies} · colliders ${physicsStats.colliders} · capsules ${physicsStats.playerCapsules} · prone volumes ${physicsStats.proneHitVolumes}\n`
      + `net ↓ ${bwShown} kB/s · ${net.rttMs.toFixed(0)} ms ±${net.jitterMs.toFixed(0)} · loss ${net.lossPct.toFixed(1)}% · interp ${interpolationDelayMs.toFixed(0)} ms · extra max ${maxRemoteExtrapolationMs.toFixed(0)} ms · pending ${pending.length}`
    : null);

  if (!roundRunning || !alive || !inMatch || !networkConnected) input.clearEdges();
  renderer.render(world.scene, camera);
  if (finishVictoryAfterRender) finishVictoryCinematic();
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
