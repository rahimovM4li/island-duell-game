# Island Duell — Feature-Pack Implementation Prompt (for Fable 5)

> **This document is a self-contained implementation prompt.** Hand it to an implementing agent (Fable 5) with the repository. It describes the game, the architecture, the conventions to obey, and five features to build, with concrete values, file/function touchpoints, and acceptance criteria. Read Sections 1–3 before writing any code.

---

## 0. Your task & how to work

You are implementing five gameplay features in an existing, working TypeScript multiplayer game. The codebase is clean, deterministic, and already exceeds its v0.1 PRD. **Do not rewrite systems. Extend them, following existing patterns.**

Work in this order (each feature builds testability for the next):
1. **Sniper + Scope** (F1) — smallest, exercises the weapon/hitscan path.
2. **Smoke + Flash throwables** (F2) — introduces the throwable-cycle + server-side smoke occlusion both bots and the sniper rely on.
3. **Grenade cooking** (F3) — small, builds on F2's throwable path.
4. **Tactical bots + Solo-Practice** (F4) — the biggest; reuses everything above.
5. **Local profile + match history** (F5) — pure client, independent.

For every feature: put balancing numbers in `shared/src/constants.ts`, add/extend unit tests, and keep `npm run typecheck && npm test` green. **A feature is not done until its acceptance criteria (Section 4) and its tests pass.**

---

## 1. Project overview

**Island Duell** is a browser-based 3D first-person multiplayer PvP survival game for **2–5 players on the same LAN**, free-for-all. Each player spawns on a small procedurally-generated island, loots weapons/resources during the day, and is pushed into a final fight by a **shrinking zone** and a **day/night cycle**. A round is ~8–11 min; a match is **3 rounds** scored by placement (3/2/1/0/0). Host-authoritative networking (Node + Socket.io), one player hosts and also plays. No rollback/lag-comp (LAN <5 ms).

Rendering is **Three.js** (all art is procedurally generated low-poly — zero downloaded assets). Physics is **Rapier** (Kinematic capsule character controller + heightfield collider). Core design principle: **no strictly-best item** — every weapon has a clear downside; loot is coupled to risk.

**Run / verify:**
- `npm start` — builds nothing; serves `client/dist` on port 3000 and prints LAN URLs. Dev: `npm run dev` (Vite client on 5173 + server).
- `npm run build` — builds the client (`npm run build -w client`).
- `npm run typecheck` — `tsc --noEmit` across shared/server/client.
- `npm test` — `vitest run` (unit + one real-socket E2E match in `tests/match.e2e.test.ts`).
- **Test-only clock trick:** `GameRoomOptions.timeScale` (env `TIME_SCALE`) scales the *round clock* (not physics) so the E2E test can play a full match fast.

---

## 2. Architecture & repo layout

Monorepo (npm workspaces): `shared/`, `server/`, `client/`.

### `shared/src/` — deterministic simulation, imported by BOTH server and client
| File | Role |
|---|---|
| `constants.ts` | **Every balancing number.** Weapon defs (`WEAPONS`), types (`WeaponType`, `AmmoType`, `ItemType`, `Recipe`), player/zone/loot/network constants. |
| `rng.ts` | Seedable RNG: `mulberry32`, `deriveSeed(seed, label)`, `pick`, `randRange`. **No `Math.random` in generators.** |
| `terrain.ts` | `terrainParams(seed)`, `sampleHeight`, `isOnLand`, `plateauCenter`, `buildHeightGrid`. |
| `worldgen.ts` | `generateWorld(seed, n)` → spawns, POIs, ruins, vegetation (= resource nodes), crates, spawn-floor items, `carePackagePos`. `assignSpawnIndices`, `bushAt`. Host and clients run this identically. |
| `timeline.ts` | Pure functions of round time `t`: `phaseAt`, `timeOfDayAt`, `fogAt`, `loudPingActiveAt`, `zoneAt(t,n)`, `zoneSteps`. |
| `movement.ts` | `freshMoveState`, `stepMovement(phys, id, move, input)`, `MAX_INPUT_DT`. The single movement integrator run by prediction (client) and authority (server). |
| `physics.ts` | `GamePhysics` wrapper over Rapier: `addPlayer`, `setPlayerPos`, `setPlayerSneaking`, `step`, `raycast(origin, dir, maxDist, ignorePlayerIds) → {point, dist, playerId} | null`. |
| `scoring.ts` | `scoreRound(eliminationGroups, n)`, `decideMatch(totals)`. |
| `protocol.ts` | `PROTOCOL_VERSION`, all message interfaces, `C2S`/`S2C` event-name maps, type guards. |

### `server/src/`
| File | Role |
|---|---|
| `game.ts` | `GameRoom` — the whole host: lobby, 3-round match loop, 30 Hz tick, 20 Hz snapshots, all combat/loot/zone/heal/timers, scoring, reconnect + host-migration. **This is where most server work lands.** |
| `inventory.ts` | `equipWeapon`, `weaponSlotState`, `grantStarterAmmo`. |
| `index.ts` | Express + Socket.io bootstrap; static-serves `client/dist`; prints LAN IPs. |

### `client/src/`
| File | Role |
|---|---|
| `main.ts` | Bootstraps Three.js; menu/lobby wiring; the render/predict/send loop (`frame()`); event handling (`onEvent`), snapshot handling (`onSnapshot`/`reconcile`), viewmodel/FOV/recoil/camera. |
| `input.ts` | Pointer-lock mouse look + WASD; edge-triggered keys (`slotPressed`, `reloadPressed`, `craftPressed`, `bandagePressed`), `applyRecoil`. |
| `net.ts` | Socket.io client wrapper (`join`, `sendInput`, `craft`, `useBandage`, `setReady`, `startMatch`, `rematch`; RTT/jitter/loss). |
| `world.ts` | Procedural terrain (8×8 chunks), instanced vegetation, sky/fog day-night lerp, zone shader ring, resource-node depletion, cover fade. |
| `entities.ts` | Remote player rigs, pickups, projectiles, care package, FX (tracer/impact/explosion/muzzle), first-person viewmodel. |
| `hud.ts` | DOM HUD + canvas minimap (shows self, zone, loud-pings, care — never enemy positions), scoreboard/round-end/match-end screens, killfeed, death recap. |
| `settings.ts` | Persisted settings (sensitivity, volumes, graphics, camera-shake, **keybinds**). |
| `sfx.ts` | Procedural WebAudio SFX by name (`Sfx.play(name, dist, intensity, pan)`). |

### `tests/` (vitest)
`combat.test.ts`, `inventory.test.ts`, `match.e2e.test.ts`, `physics.test.ts`, `protocol.test.ts`, `scaling.test.ts`, `scoring.test.ts`, `worldgen.test.ts`.

---

## 3. Conventions you MUST follow

1. **All tunable numbers go in `shared/src/constants.ts`.** No magic numbers in `game.ts`/`main.ts`.
2. **Determinism boundary:** `shared/` code that runs on *both* peers (worldgen, movement, timeline, terrain) must stay deterministic and seed-driven. **Bot AI and smoke state are host-only** (they live in `server/game.ts`, are never run on clients, and clients learn about them only via snapshots/events). Do **not** put bot logic or smoke occlusion into `shared/`.
3. **Reuse the authoritative pipeline.** Bots must drive the game by emitting `InputMsg` through the same `processPlayerInputs` → `stepMovement`/`tryFire`/`handleInteract` path. Never give bots a privileged side-channel.
4. **`sendTo(id, ...)` and `conns.get(id)` are already null-safe** — a `MatchPlayer` without a connection (a bot) must never crash a broadcast. Preserve this.
5. **Bump `PROTOCOL_VERSION` to 4** in `protocol.ts` and update `isInputMsg` / any affected type guards. All new optional `InputMsg` fields must be validated in `isInputMsg`.
6. **Client-side FX are predicted only for feedback, never for authority.** Kills, damage, blindness, smoke occlusion are resolved host-side and delivered as events/snapshots.
7. **German UI strings** (the game's UI is German). Keep new HUD/menu text in German, matching existing tone. Code identifiers and comments stay English.
8. Match the surrounding code style. Keep files focused; if `game.ts` grows unwieldy, extract cohesive helpers (e.g. `server/src/bot.ts`, `server/src/throwables.ts`) rather than bloating one function.

---

## 4. Features

### F1 — Sniper rifle with scope

**Goal:** a rare, long-range marksman weapon that hard-counters open-ground play but is weak up close, loud, and ammo-starved.

**Constants (`constants.ts`):**
- Extend `WeaponType` with `'sniper'`; extend `AmmoType` with `'sniper'`; extend `ItemType` with `'sniper'` (weapon pickup) and `'sniperAmmo'`.
- `WEAPONS.sniper`: `kind:'hitscan'`, `damage: 75`, `cooldown: 1.3`, `range: 200`, `ammo:'sniper'`, `magSize: 5`, `reloadTime: 3.2`, `loud: true`, `falloffStart`/`falloffEnd`: none (full damage at range), high `recoilPitch` (~0.06), high `hipSpread` (~0.09) and high `moveSpread` (~0.05) so it is only accurate scoped + still, low `aimSpread` (~0.0006). Add a new optional field `aimFov?: number` to `WeaponDef` and set `sniper.aimFov = 25` (other aimable weapons keep the default 55).
- Headshot uses the existing hitscan headshot multiplier (`dmg *= 1.65` in `hitscanShot`). 75×1.65 ≈ 123 ⇒ **one-shot headshot**; body = 2 shots. Verify this interaction; do not add a separate one-shot code path.
- Loot rarity: `AMMO_CAP.sniper` (~15), `WEAPON_START_AMMO.sniper` (~5), `AMMO_PICKUP.sniper` (~5). The sniper appears **only** in `top`-tier crates at low probability — edit `openCrate` in `game.ts` so `top` occasionally rolls `sniper` (+ a little `sniperAmmo`) instead of rifle/shotgun (keep it clearly rarer than the rifle).

**Server (`game.ts`):** no new hitscan path needed — `hitscanShot` already handles spread, falloff, headshots. Ensure reload/ammo/drop/pickup all work for the new ammo type (extend `freshInventory().ammo`, `dropInventory`, `tryTakePickup` `sniperAmmo` case, snapshot). The `sniper` weapon type flows through `activeWeapon`/`tryFire`/`weaponSlotState` unchanged.

**Client scope (`main.ts` + `input.ts` + `hud.ts` + `settings.ts`):**
- **Zoom:** when aiming with a weapon that has `aimFov`, target that FOV instead of the hard-coded 55 (`targetFov = (aiming ? (WEAPONS[myWeapon].aimFov ?? 55) : 75) + fireFovKick`).
- **Scope overlay:** a full-screen CSS element (black vignette with a circular cut-out + crosshair + thin cross-hairs) shown only while scoped with the sniper; hide the normal crosshair then. Add markup to `index.html` + CSS.
- **Sway that actually counts:** maintain a client sway offset `(swayYaw, swayPitch)` = small sum-of-sines over time, scaled up while moving, down while still/crouched. Apply it to **both** the camera **and the `InputMsg.yaw/pitch` that is sent** (effective aim = `input.yaw + swayYaw`), so the host raycast sees the sway. Do **not** accumulate it into `input.yaw` itself (keep it a separate additive offset).
- **Hold breath:** while scoped with the sniper, the **sprint key** acts as "hold breath" — it damps sway toward ~0 and drains a small breath meter (e.g. 4 s, refills when not held). Show the breath meter on the HUD while scoped. (No new keybind; reuse `keybinds.sprint`, which is otherwise unused while scoped.)
- Add SFX: distinct `sniperShot` and `sniperReload` (bolt cycle) in `sfx.ts`; route in `onEvent`'s `shot` handler.

**Acceptance:** Sniper headshot at 150 m kills a full-HP target in one shot; body shots take two; hip-firing while running is wildly inaccurate; scoped + breath-held is precise; scope overlay + 25° zoom + breath meter render; sniper/ammo can be looted (rarely), dropped on death, and picked back up. Tests: extend `combat.test.ts` for sniper body/headshot damage and falloff-free long range.

---

### F2 — Smoke + Flash throwables (slot-3 cycle)

**Goal:** add two utility throwables. **Smoke** = real, server-authoritative line-of-sight cover for rotations. **Flash** = a blind counter. Both share the throwable slot with the frag via a cycle.

**Inventory model change (`protocol.ts`, `game.ts`, `inventory.ts`, `hud.ts`, `main.ts`):**
- Replace `grenades: number` in `Inventory` (server) and `InventoryState` (protocol) with:
  ```ts
  throwables: { frag: number; smoke: number; flash: number };
  activeThrow: 'frag' | 'smoke' | 'flash';
  ```
  Update `freshInventory`, `dropInventory` (drop each throwable count), `pushInventory`, and the HUD throwable readout. Add `MAX_SMOKE`, `MAX_FLASH` (~2 each) to constants alongside `MAX_GRENADES`.
- Extend `ItemType` with `'smokeGrenade'`, `'flashGrenade'`; add pickup handling in `tryTakePickup` (respect max counts), crate drops in `openCrate` (smoke/flash appear in `good`/`top` tiers), and death drops.
- **Slot-3 cycle:** add `throwCycle?: boolean` to `InputMsg` (validate in `isInputMsg`). Client sends it when the throwable key (`Digit3`) is pressed **while already on slot 3**; server advances `activeThrow` to the next type the player **owns** (skip empty types; if none owned, stay). Also switching to slot 3 selects the first owned throwable. `SnapPlayer.weapon` for slot 3 should reflect the active throwable so remote viewmodels/killfeed read correctly (extend `WeaponType`? No — keep `weapon` as-is for guns, and add `SnapPlayer.activeThrow?` if the remote viewmodel needs it; simplest: send `activeThrow` in the snapshot for slot-3 players).

**Throwable physics (`game.ts` `spawnProjectile`/`updateProjectiles`):**
- Extend `Projectile.kind` and `SnapProjectile.kind` with `'smoke' | 'flash'`. They fly like a grenade (arc, bounce, gravity) with their own fuse (~1.5 s for flash, ~1.5 s for smoke before it "pops").
- **Smoke detonation:** create a **SmokeCloud** in host-only state: `{ id, x, y, z, radius: SMOKE_RADIUS (~4.5), bornAt, expiresAt (bornAt + SMOKE_DURATION ~12s) }`. Emit an event `{type:'smoke', state:'pop', x,y,z, radius}` and include active clouds in the snapshot (`SmokeSnap[]`) so clients render a growing/holding/fading volumetric puff in `entities.ts`. Remove clouds past `expiresAt`.
- **Server-side LOS occlusion (host-only, NOT in `shared/physics.ts`):** add a `GameRoom` helper `smokeBlocks(from: Vec3, to: Vec3): boolean` that returns true if the segment `from→to` passes through any active cloud (standard segment–sphere test: closest point of the segment to the cloud centre within `radius`). Call it in: `hitscanShot` (after a player hit, treat as blocked → no damage/no hitmarker), sniper (same path), `meleeAttack` LOS is short so optional, `explode` LOS, **flash LOS**, and **bot vision** (F4). Keep it O(players × clouds); clouds are few.

**Flash detonation (`game.ts`):**
- On flash fuse end, emit `{type:'explosion'...}`-style light FX event `{type:'flash', x,y,z}` for the pop, then for each **alive** player within `FLASH_RADIUS` (~14 m) with clear LOS (`!smokeBlocks && !terrain block via raycast`): compute `intensity ∈ [0,1]` from distance falloff × facing factor (`facing = clamp(dot(viewDir, dirToFlash), 0, 1)`, so back-turned ≈ small residual, e.g. `0.15 + 0.85*facing`). Send an **owner-only-style targeted** event `{type:'flashed', target, intensity, duration}` (duration `FLASH_MAX_BLIND` ~2.5 s scaled by intensity) via `sendTo(target, ...)`.
- Bots hit by flash get `blindUntil = t + duration*intensity` (F4 reads it: suppress engage, worsen aim).

**Client (`main.ts` + `entities.ts` + `hud.ts` + `sfx.ts`):**
- `flashed` event → full-screen white overlay at `intensity`, easing to 0 over `duration`; optional brief low-pass on SFX. Respect `prefers-reduced-motion` / `settings.cameraShake` for softening.
- `smoke` clouds → volumetric low-poly puff in `entities.ts` (a cluster of soft sprites/instanced spheres), growing over ~0.6 s, holding, fading before expiry.
- SFX: `smokePop`, `flashBang` (loud crack + ring).

**Acceptance:** Throwing smoke creates a cloud that (a) renders for all clients, (b) actually blocks hitscan/sniper damage and bot sight through it, (c) expires. Throwing flash whites-out players who can see it, scaled by how much they face it and blocked by walls **and** smoke; a player looking away is barely affected. Slot-3 cycles frag→smoke→flash among owned types. Tests: new `throwables.test.ts` — `smokeBlocks` segment-sphere true/false cases; flash intensity by angle/distance; cycle skips unowned types.

---

### F3 — Grenade cooking (frag only, cook-out self-damages)

**Goal:** hold to cook the frag's fuse, release to throw with the remaining fuse; hold too long and it detonates in your hand for full self-damage. Raises the skill ceiling.

**Server (`game.ts` `processPlayerInputs`/`tryFire`):** cooking applies **only** when `activeThrow === 'frag'` and the frag slot (3) is active.
- Detect fire **rising edge** (`inp.fire && !p.prevFire`): if a frag is available and not already cooking, start cooking: set `p.cookingSince = t`, decrement the frag from inventory reservation (or reserve on release — pick one and be consistent). Keep a per-player `cooking: { since: number } | null`.
- Each tick while cooking: if `t - cookingSince >= GRENADE_FUSE` → **cook-out**: explode at the player's own position, apply full self-damage (reuse `explode`/`applyDamage`), clear cooking. Emit an event so the client shows the hand-explosion.
- Detect fire **falling edge** (`!inp.fire && p.prevFire`) while cooking → **throw** a grenade projectile whose `fuseAt = spawnTime + max(0.2, GRENADE_FUSE - (t - cookingSince))` (i.e. remaining fuse). Reuse `spawnProjectile('grenade', ...)` but pass the shortened fuse. Apply the normal cooldown.
- Smoke/flash do **not** cook: they throw on fire press as before (immediate, standard fuse).
- Guard: cooking is cancelled (grenade thrown at full remaining fuse, or simply dropped) if the player switches slots, dies, or starts bandaging while cooking — pick "throw at current fuse on slot-switch away" or "cancel & keep grenade"; document the choice in code. Recommended: **switching away throws it** (committed pin).

**Client (`main.ts` + `input.ts` + `hud.ts` + `entities.ts` + `sfx.ts`):**
- While cooking (local prediction can mirror it from own fire-hold on slot 3 + frag), show a **fuse countdown** on the HUD and on the viewmodel, plus an accelerating **beep** (`grenadeBeep`) as it nears `GRENADE_FUSE`.
- The cook-out event → hand explosion FX + strong shake/rumble.

**Acceptance:** Holding LMB on the frag cooks it (visible countdown + beep); releasing throws with a shorter fuse so a well-cooked nade airbursts; holding past the fuse blows up in hand and self-damages (can kill). Smoke/flash still throw instantly. Tests: extend `combat.test.ts` — cook-out at ≥ fuse applies self-damage at own position; release before fuse throws with reduced remaining fuse.

---

### F4 — Tactical bots + Solo-Practice mode

**Goal:** a solo player can start a **full 3-round match** (real zone, day/night, scoring) against **1–4 tactical bots**. Bots loot, take cover, rotate with the zone, engage with reaction delay + inaccuracy, heal, and use throwables/smoke.

**Match entry (client + protocol + `game.ts`):**
- Menu: add a **"Solo üben"** button → a small practice setup panel (bot count **1–4**; difficulty **Easy / Normal / Hard**). Add `C2S.startPractice` with `{ bots: number; difficulty: 'easy'|'normal'|'hard' }` and a type guard.
- `game.ts`: `startPractice` is a sibling of `startMatch`, allowed when the caller is host and no match is running (works even with a single connected human). It builds a match with `n = clamp(1 + bots, 2, 5)`: one `MatchPlayer` for the human plus `bots` bot players. Everything else (worldgen, rounds, zone, scoring, snapshots) is the normal match flow. Practice matches are flagged (`this.practice = true`, `this.botDifficulty = ...`) and included in `matchStart`/`roundEnd`/`matchEnd` with a `practice: true` marker so the client can tag them (F5).

**Bot players (`server/src/bot.ts` + `game.ts`):**
- A bot is a `MatchPlayer` with `isBot: true`, a stable id (`bot-<k>`), a display name (`Bot Alpha/Bravo/...`), and **no `Conn`**. Confirm all connection-dependent paths tolerate this (`sendTo`, `pushInventory`, disconnect handling, `canStart`, lobby). Bots are added to `players`, `totals`, `matchStats`, and `phys.addPlayer`.
- Each server tick, **before** `processPlayerInputs`, generate one synthetic `InputMsg` per bot via `computeBotInput(bot, world, snapshotView, difficulty, t)` and push it into `bot.inputs`. Then the existing pipeline moves/shoots/interacts them. Walk-over pickups already work via `updatePickupsWalkover`; bots also get resource harvest/craft only if trivial (optional — skip crafting for v1).
- Bots issue high-level actions through `InputMsg` fields + the existing server helpers: firing via `inp.fire`, aiming via `inp.aim`, slot switch via `inp.slot`/`throwCycle`, reload via `inp.reload`, bandage via a direct `tryBandage(botId)` call (bots may call server methods for consumables since there's no socket round-trip — document this as the one allowed shortcut).

**Bot AI state machine (`bot.ts`):** per bot, evaluate each tick (or every few ticks for cost):
- **LOOT** (default early / when under-equipped): pick the nearest valuable, reachable pickup or crate (prefer weapons/ammo when slots/mags are empty); steer toward it (set `mx/mz` and `yaw` toward target; `interact` for crates/weapons swap; sprint on open ground). Simple avoidance: if speed ≈ 0 while trying to move (stuck on geometry), jitter the heading and occasionally `jump`.
- **ROTATE**: if outside the safe zone or the zone is shrinking toward you, path toward a safe point inside `zone.targetRadius` (bias toward cover, not dead-centre). Zone info comes from `zoneAt(t, n)`.
- **ENGAGE**: if an enemy is **visible** (within weapon range, LOS clear via `raycast` **and** `!smokeBlocks`, within a difficulty-scaled FOV/detection cone) → face them with a smoothed aim that has (a) a **reaction delay** before first shot after acquiring, and (b) **Gaussian aim error** that shrinks with better difficulty and when the bot is still. Fire respecting cooldown/mag/reload; use grenades/smoke situationally (throw frag at grouped/cornered targets, pop smoke to break a losing LOS). Lead is unnecessary for hitscan; for bow/sniper keep error large.
- **HEAL**: if `hp < 45`, has a bandage, and no enemy visible for ~1.5 s → `tryBandage`.
- **COVER / FLEE**: if `hp` low and taking fire → move to nearest cover (POI/rock/tree via worldgen) or pop smoke and retreat.
- **Difficulty** scales: reaction delay (Easy ~0.55 s → Hard ~0.18 s), aim error, detection range/FOV, aggression, throwable usage, and whether they pre-aim.
- **Bot vision must also be blocked by smoke** (call `smokeBlocks`) and by night fog (reduce detection range using `timeOfDayAt(t)` / `fogAt(t)`), so smoke and darkness matter against bots exactly as against humans.
- Bots respect `blindUntil` from F2 (no engage, big aim error while blind).
- Bot AI is host-only and need not be deterministic; use a bot RNG seeded from the match seed for reproducible tests.

**Client:** bots appear as normal remote players (they already do — they're in the snapshot). Lobby/scoreboard/killfeed/HUD show their names. No client changes beyond the practice-setup UI and match flow, plus not requiring the lobby "ready/2-human" gating for practice.

**Acceptance:** From a cold solo start, "Solo üben" → pick 3 bots / Normal → a full 3-round match runs; bots loot from spawn, fight each other and the human, rotate as the zone closes, heal, and can win rounds; smoke and night visibly reduce bots' ability to see/shoot you; scoring/round-end/match-end work with mixed human+bot standings. Tests: a `bot.match.e2e.test.ts` (fast via `timeScale`) — one human socket + N bots plays a match to `matchEnd` without errors and with sane placements; unit tests for `smokeBlocks` affecting bot vision and for state transitions (LOOT→ENGAGE→HEAL).

---

### F5 — Local profile + match history (client only)

**Goal:** persist the player's stats across matches in `localStorage`, keyed by player name; show a **Profil** screen (career aggregates + recent match list).

**Client (`main.ts`/new `client/src/profile.ts` + `hud.ts` + `index.html`):**
- On `matchEnd` (client already receives `standings`, `totals`, per-player `stats`), and using per-round `death` events counted during the match, write to `localStorage` under `islandProfile:<name.toLowerCase()>`:
  - **Career aggregate:** `matches`, `wins` (place 1 in match), `kills`, `deaths` (own `death` events across the match's rounds), `damageDealt`, `damageTaken`, `headshots`, `shotsFired`, `hits` (→ accuracy), `bestPlacement`, `roundsPlayed`. Accumulate from this match's `stats[myId]`.
  - **Match history entry** (keep last ~25): `{ date, seed, placement, points, kills, headshots, damageDealt, players: n, practice: boolean }`.
- **Practice/bot matches:** tag with `practice: true`. Show them in the history list but **exclude them from career aggregates** (or aggregate them under a separate "Übung" section). Keep the ranked career numbers "vs humans only".
- **Profil screen:** a new menu screen showing career tiles (K/D, win-rate, accuracy, headshot-%, best placement, matches) and a scrollable recent-match table with a small badge for practice matches. Reachable from the main menu; German labels.

**Acceptance:** After finishing a match, reopening the app and opening "Profil" shows updated career stats and the match in history; practice matches are visibly tagged and don't inflate ranked K/D. Test: a small pure unit test for the aggregation/merge function (feed a fake `matchEnd` + death count, assert the merged profile), kept framework-light so it runs under vitest without a DOM (extract the merge logic into a pure function in `profile.ts`).

---

## 5. Consolidated protocol changes (v4)

In `shared/src/protocol.ts` (bump `PROTOCOL_VERSION = 4`):
- **`InputMsg`**: add `throwCycle?: boolean`. (Cooking needs no new field — the server reads `fire` edges via `prevFire`.) Update `isInputMsg` to validate `throwCycle`.
- **`InventoryState`** & server `Inventory`: replace `grenades: number` with `throwables: {frag,smoke,flash}` + `activeThrow`.
- **`SnapPlayer`**: add `activeThrow?: 'frag'|'smoke'|'flash'` (for remote slot-3 viewmodel/killfeed).
- **`SnapProjectile.kind`** and server `Projectile.kind`: add `'smoke' | 'flash'`.
- **`SnapshotMsg`**: add `smokes: SmokeSnap[]` (`{id,x,y,z,radius,bornAt,expiresAt}`).
- **`GameEvent`** union: add `{type:'smoke'; state:'pop'; x;y;z;radius}`, `{type:'flash'; x;y;z}`, `{type:'flashed'; target; intensity; duration}`, `{type:'cookout'; by; x;y;z}`.
- **`C2S`**: add `startPractice`. **New guard** `isStartPracticeMsg`.
- **`MatchStartMsg`/`RoundEndMsg`/`MatchEndMsg`**: add optional `practice?: boolean`.
- `constants.ts`: `sniper` weapon/ammo, `aimFov`, `MAX_SMOKE`, `MAX_FLASH`, `SMOKE_RADIUS`, `SMOKE_DURATION`, `FLASH_RADIUS`, `FLASH_MAX_BLIND`, bot difficulty tables (reaction/aim-error/detection). Update `AMMO_CAP`, `AMMO_PICKUP`, `WEAPON_START_AMMO` for `sniper`.

---

## 6. Testing requirements

Keep `npm run typecheck && npm test` green at every feature boundary. Add/extend:
- `combat.test.ts`: sniper body/headshot/one-shot-headshot + long-range no-falloff; grenade cook-out self-damage; thrown cook reduces fuse.
- `throwables.test.ts` (new): `smokeBlocks` segment-sphere positive/negative; flash intensity vs angle & distance & smoke-block; slot-3 cycle skips unowned.
- `protocol.test.ts`: v4 guards incl. `throwCycle`, `isStartPracticeMsg`; new inventory/snapshot shapes round-trip.
- `bot.match.e2e.test.ts` (new): human + N bots → `matchEnd` under `timeScale` with valid standings, no exceptions; bot vision blocked by smoke.
- `profile` merge unit test (pure function).

---

## 7. Verification & done criteria

Before declaring done, run and paste the output of:
```
npm run typecheck
npm test
npm run build
```
All three must pass. Then sanity-run `npm start` and confirm: sniper scope renders and one-shots headshots; smoke blocks fire and expires; flash whites out only those facing it; cooking countdown + hand-explosion; "Solo üben" starts a bot match that plays to completion; Profil screen updates after a match and tags practice matches.

**Report honestly:** if a test fails or a piece is stubbed, say so with the actual output — do not claim completion without the green run.

---

## 8. Out of scope / guardrails

- **Do not** touch the determinism of `shared/` worldgen/movement/timeline, or move bot/smoke logic into `shared/`.
- **Do not** add rollback, lag-comp, internet matchmaking, accounts, or server-side persistence — profile is `localStorage` only.
- **Do not** introduce a "strictly best" weapon: the sniper must stay slow, loud, ammo-starved, and weak in close quarters.
- **Do not** break existing reconnect/host-migration or the null-safety that lets connection-less bots coexist with human players.
- Keep new art procedural (no downloaded assets), consistent with the existing low-poly look.
```
