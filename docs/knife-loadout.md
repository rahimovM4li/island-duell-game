# Butterfly and four-slot loadout

The player always has a butterfly knife in slot 1. Slots 2 and 3 store firearms;
slot 4 selects the grenade family. Pressing 4 again cycles through owned frag,
smoke and flash grenades. The mouse wheel includes the permanent knife and skips
empty firearm/grenade slots. Selecting an empty firearm slot retains the existing
melee fallback behavior. Q only drops firearms; dropping the last firearm selects 1.
Crafting moved to 5/6. F inspects the knife; on touch, tap the active knife slot.
An existing custom F key binding takes priority over inspection.

## Design and references

The desired feel is a readable, responsive first-person balisong: dark milled
handles, visible hinges, a cyan/violet/pink/gold blade, an opening flourish and a
short forward stab. The knife provides a reliable fallback and an 8% movement
bonus; firearms retain their ranged role. There are no new melee pickups.

- [CSanywhere](https://csany.vercel.app/) was inspected in the browser. Its loadout
  preview showed Butterfly / Prism Tide with dark perforated handles and a colored
  blade. The arena loaded, but its mouse-capture gate prevented an actual combat
  playthrough in the in-app browser. The visual design is a reference; the model,
  geometry and animation in this repo are original, not extracted site assets.
- [Three.js ExtrudeGeometry](https://threejs.org/docs/pages/ExtrudeGeometry.html):
  shapes with depth and bevels support the blade and genuine handle cutouts.
- [Three.js Object3D](https://threejs.org/docs/pages/Object3D.html): parent/child
  transforms provide separate safe-handle, blade and bite-handle pivots.
- [Three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html):
  clearcoat and iridescence provide the finish, alongside a vertex-color fade.

The implementation follows the installed Three.js gameplay, geometry, materials
and animation skills. The procedural approach needs no additional downloaded
model or texture. The existing firearm/character GLBs remain in use.

## Behavior and implementation

- The draw lasts 0.92 seconds; inspection lasts 1.65 seconds. Both use time-based
  hinge keyframes with smooth interpolation. Reduced motion keeps the hinges still.
- A confirmed melee attack interrupts cosmetic animation and thrusts the knife
  forward. Damage remains server-authoritative: 35 base damage, 0.55-second cooldown,
  1.8 m configured reach plus the existing melee contact tolerance. Cover blocks hits.
- Switching slots preserves the combat cooldown. Inspection cannot bypass it.
- The same butterfly geometry appears on remote players; the elaborate flip is
  local cosmetic feedback. Remote players use the existing melee action animation.
- Fists, machete and spear definitions, loot entries, procedural alternatives and
  GLB nodes have been removed. The Blender source and asset validation agree with
  the reduced bundle. UVs are retained because the game assigns its atlas at load time.
- Protocol version 20 covers the slot layout and new weapon identity. Restart the
  server and reload clients together when updating an existing running instance.

## Validation

Run `npm run typecheck`, `npm test`, `npm run assets:validate` and
`npm run test:browser`. Unit coverage checks permanent inventory, four-slot mapping,
knife damage/cooldown/cover/range, animation interruption and geometry validity.
The browser fixture exercises both firearms, knife draw/inspect/stab, all grenade
selections and an actual flash throw through real input. It writes screenshots
for the knife ready, draw, inspect and stab poses into `test-results`.

Verified on 2026-09-11: typecheck, production build, 263 Vitest tests and asset
validation passed (746.5 KiB total asset payload). Six unaffected browser scenarios
passed in the complete run; the gameplay and movement smoke scenarios passed again
after the final hand-pose and grenade-cooldown fixture adjustments. The ready,
inspect and stab screenshots were visually checked.

Known limits: no separately rigged finger animation or randomized knife skins.
The existing generated melee swish is retained. A later cosmetic pass could add
finger poses and hinge clicks without changing combat timing.
