# Gameplay upgrade

Player promise: responsive tactical island combat with readable weapons, opponents and cover.
Primary verbs: move, aim and fire. Seek loot and advantageous positions while opponents and the
closing zone create pressure. Winning fights rewards equipment and round points; death leads
to spectating and the existing next-round/rematch flow. Good players time exposure, conserve
stamina and choose a second route when a doorway is covered.

Scope: movement, first-person weapons/hands, wreck combat space, character motion, material
impacts and subtle ambient motion. Vaulting and sliding remain outside this pass.

Wreck plan: approach from the island, choose the broken stern or broad side breach; cargo
provides a recovery point before crossing the exposed interior. A ramp leads to a partial
raised deck with longer sightlines and two ways down. The mast and torn sail mark the POI.
Loot stays under the existing seeded placement and clearance rules. Existing zone timing,
weapon damage and scoring remain the pressure/progression curve.

Tuning: ground acceleration 44 m/s², braking 58 m/s², reversal multiplier 1.3; 100 ms coyote
time and jump buffer; sprint recovers 0.65 seconds of reserve after exhaustion. State is
replicated with snapshots for identical server simulation and prediction replay.

Reference ledger (all read):
- yes: threejs-gameplay-systems/references/gameplay-workflows.md
- yes: threejs-gameplay-systems/references/game-design-level-design.md
- yes: threejs-gameplay-systems/references/physics-engine-selection.md
- yes: threejs-gameplay-systems/references/game-feel.md
- yes: threejs-gameplay-systems/references/checklists/game-design-level-design.md
- yes: threejs-gameplay-systems/references/checklists/game-feel.md

Architecture: retain fixed-step shared Rapier character physics and authoritative hit queries.
Use simple compound collision proxies, shared with procedural wreck visuals. Cosmetic weapon
and character layers run on render delta, never gate controls, and respect reduced motion.
No global hitstop is introduced into the real-time multiplayer simulation.

Implemented presentation: four dedicated procedural firearm models with beveled surfaces,
separate magazine/shell and bolt groups, support-hand reach, aligned iron sights and blended
sprint stance. Existing detailed hand assets are retained. Remote legs follow movement while
aim remains independent; speed-integrated cadence avoids phase jumps during acceleration.
Boot-height compensation and combat action layers are procedural, without per-foot terrain IK.

The wreck uses 16 shared compound parts with a partial upper deck, side breach, broken stern,
pointed bow and cargo cover. A graded terrain pad supports its floor and ramp. Static visual
details are merged by material into four batches, plus the animated sail. Walkable decks also
block upward head collision from below. Loot and decoration reservations still pass 1,000 seeds.

Material impact classification and normals come from authoritative Rapier ray hits. Clients
use bounded short-lived debris, directional bursts and the existing seeded WebAudio system.
Grass deformation uses a clone of shared geometry; restart cannot corrupt asset templates.

Verification: shared simulation tests cover coyote expiry, buffered landing, no held-key
auto-jump, diagonal acceleration, sprint exhaustion and prediction replay. Real Rapier walks
test both entrances, ramp ascent, ceiling collision and wood/metal hit normals on four seeds.
Animation tests cover strafe/aim separation, reset, reload cancellation, switching and FX cleanup.
Browser input tests fire, aim, reload and switch weapons against a real isolated game server,
and save screenshots of the wreck, hipfire, ADS, reload and pistol. Existing browser coverage
also checks live movement, two-client matchmaking, mobile lobby, reconnect and rematch.

Checklist outcome: requested mechanics and feedback have automated behavioral evidence and
visual inspection. Current controls and the existing combat/round loop are retained. Reduced
motion disables ambient deformation and stride bob. The relative tactical strength of the new
deck and final movement preference still benefit from human multiplayer playtesting. No claim
of full terrain IK, photorealistic assets or measured performance on mobile hardware is made.

Final checks: `npm run typecheck` and `npm run build` passed; `npm test` passed 256 tests
in 49 files; `npm run test:browser` passed all 8 browser tests. The existing Rapier bundle-size
warning remains informational. Screenshots are written to the Playwright test-results folder.

Additional references read: threejs-animation/SKILL.md, threejs-geometry/SKILL.md,
threejs-materials/SKILL.md, playwright-cli/SKILL.md and its Playwright test reference.
