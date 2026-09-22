# Island POI expansion

Players should recognise each destination before entering it, choose a route to contest its loot, and find a way out when pressured. Aim/shoot/rotate remain the core verbs; zone pressure escalates the existing round, survival earns placement points, and eliminated players spectate until the next round. Skilled players can now contest the tower from two directions. No new controls, weapon balance or extra loot tiers.

## Encounter and visual plan

- Wreck: shore-side salvage cargo, a marked side approach, deck winch, rope coils and painted ship details. Stern access, the breach and the upper-deck ramp stay open.
- Watchtower: a second 1.9 m stair on the rear, plus an equipment locker and pennant. Attackers choose the original steep front stair or the longer rear stair. The flanking path passes beneath the upper portion of the new stair. The flat terrain pad extends to 14 m to support the new foot.
- Bunker: recessed front shoulders, two wall-side equipment consoles and a roof radio mast/dish. The central line between both entrances stays open; side recesses offer a place to break contact and reload. An amber station sign marks the entrance.
- Ruins: four tall gate remnants on the outside approaches, alternating complete and broken lintels. Pillars frame the routes without narrowing their 2.8 m reserved width. Central loot pads and the interior arena stay intact.

Shared box data drives structural collision and rendering. Cosmetic details are batched per material, with no extra dynamic lights or physics bodies. Signs are local canvas text, not downloaded textures. Existing terrain, art palette, seed determinism and Rapier simulation remain authoritative.

Both the compact asset and fallback grass renderers reserve structural footprints and crate footprints, so grass no longer grows through POI floors, walls and equipment.

## Reference ledger and verification

Reused the previously loaded `threejs-gameplay-systems` workflow, level-design, physics-engine-selection and level-design checklist references, plus `threejs-geometry` and `threejs-materials`. No new engine, downloaded assets or rendering dependencies.

Verify new stair ascent and the existing underpass/flanks with Rapier; preserve clear loot and resource footprints across seeds; inspect all four POIs in the browser and check console errors and draw calls. Automated checks establish accessibility and collision consistency; competitive advantage and sightline preference still need human multiplayer playtesting.

Verification results: all 276 tests passed in the full suite. The 46 world/layout/physics checks passed again after fixing the rear stair/deck transition, including ascent and descent from the outer approach across 11 seeds. The deck uses the existing walk-surface snapping while retaining overhead collision. Loot clearance covers 1,000 seeds; the world audit and route vegetation checks cover 100. Type checking and the production build pass. The Edge browser smoke test visits all four POIs, traverses the bunker and climbs the second stair using keyboard input; screenshots were visually inspected with no browser errors. POI details are merged by material and the new scenery stays under 40 meshes in the geometry regression check.
