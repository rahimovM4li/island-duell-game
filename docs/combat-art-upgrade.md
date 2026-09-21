# Combat spaces and island art

The player chooses an exposed short approach or a longer flank with cover, contests loot, and rotates before the zone closes. Better positioning should create an advantage without making one doorway the only way to challenge it. Surviving earns placement points; elimination leads to spectating and another round. Existing scoring, round timing, movement and rewards stay in place.

## Encounter plan

- Bunker: broad front opening, 2.2 m rear entrance, two 2.2 m side routes. Low barriers on the approach and rear; tall cover on the outer flanks gives a place to reload. Both entries are readable through amber lintel markers.
- Tower: retain the existing stairs and exposed upper deck; add two clear ground flanks and staggered low/tall cover. Attackers can rotate around the tower without pushing the staircase head-on. This does not add a second staircase.
- Grade the tower's terrain transition from the existing 11 m flat pad to 32 m, replacing the steep 16 m apron. This keeps the new flanks walkable without changing the character controller.
- Ruins: four 2.8 m approach lanes, each with staggered low and tall masonry on either side. Central loot and interior layout remain intact.
- Reserve routes before loot and vegetation placement. Trails are terrain vertex colours, so they follow the terrain without floating decals. Cover foundations account for the terrain at all corners.

The existing Rapier controller and fixed simulation step remain the authority. New cover reuses box colliders in the shared deterministic generation; the bunker visual uses those same dimensions instead of the old closed-back GLB. No new physics engine, moving bodies or dependencies.

## Art direction

Muted sage grass, sand-coloured paths, warm wood, grey-green masonry, cool equipment and small amber details. Bevels catch light while broad forms stay readable. Cloth, leaves and skin are matte; hard equipment has restrained highlights. Weapons on the ground and in the hand still use the same model factory. The existing stylized character rig gains a compact field pack; hand proportions and knife animation remain unchanged. Daytime fill light opens shadows without changing night gameplay.

## Reference ledger

Loaded successfully from `threejs-gameplay-systems`: `references/gameplay-workflows.md`, `references/game-design-level-design.md`, `references/physics-engine-selection.md`, `references/checklists/game-design-level-design.md`, `references/game-feel.md`, `references/checklists/game-feel.md`. Also loaded `threejs-geometry/SKILL.md`, `threejs-materials/SKILL.md`, `threejs-animation/SKILL.md` and `systematic-debugging/SKILL.md`. No new-game or impact feedback work is included.

Character transitions now start from the currently visible pose, even when crouch, prone, walking and sprinting interrupt each other. The 0.12–0.28 second blend timings remain unchanged; the fix removes the sudden jump to the previous state's fully settled pose. A regression test reproduces repeated interruptions and verifies continuity and reset.

## Verification

Automated checks cover deterministic generation, clear loot/resource footprints, passage widths, real-controller flank and bunker traversal, unobstructed rear-entry sightline, and visual/collider agreement. Browser screenshots and real input check the rendered result. Competitive balance and preferred pacing still require multiplayer playtesting.

Validation results: full suite 273 tests passed before the final animation change; all 21 affected animation/entity/gameplay tests pass with that change (including the new interruption regression). Final layout checks: 35 tests passed, including 1,000 generation seeds for loot clearance and 11 real-physics traversal seeds. Three browser tests passed: combat scenery/rear-door traversal, firearm actions/knife inspection, and mobile inventory. Screenshots are emitted under `test-results/combat-art-*/`.

Checklist outcome: both flank choices and the rear entry are implemented and traversable; rewards and zone pressure retain their existing round flow; recovery cover and paths are visible; collision and model dimensions agree. No new controls or dependencies. Cover trim is batched by material. Human multiplayer balance remains a playtest question, not something a screenshot or automated traversal proves.
