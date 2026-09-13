# Character, hands and secondary knife attack

The goal is a clearer first-person grip and a more rounded survivor silhouette,
while retaining the island's stylized appearance and small asset download.

## Controls and reference

- Left click: quick knife cut, 35 base damage, 0.55 s cooldown, 1.8 m configured reach.
- Right click: stronger forward stab, 65 base damage, 0.95 s cooldown, 1.45 m reach.
- F: inspect and flip. Either attack interrupts inspection. On touch, the aim
  button becomes “Stich”; tapping the active knife slot still inspects.
- Firearms retain right-click aiming. One server cooldown covers both knife
  attacks and survives slot changes. Armor and cover checks still apply.

[CSanywhere's arena](https://csany.vercel.app/game) was revisited. The arena loaded,
but mouse capture remained blocked in the available reference browser. It was
not possible to verify its combat animations directly. The heavy/short/slow
secondary attack follows the established Counter-Strike pattern documented in
the [knife guide](https://liquipedia.net/counterstrike/Knife); these game values
are our own balance choices. No reference-site models or code were extracted.

## Models and animation

The Blender character now has shaped torso, upper arms, forearms and legs,
a fitted face covering, closed gloves, cloth seams, vest webbing, pouch flaps,
boot details and a radio. Profile colors and existing equipment toggles remain.
`art/survivor.blend` is the editable character source; regenerate it with:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python scripts/blender/build_island_assets.py -- --character-only
npm run assets:build
```

The export uses the existing paired Object3D limb pivots, rather than a new
skeleton. Structured Blender inspection measured Z bounds -0.005 to 1.959 m,
X bounds ±0.488 m, Z-up/+Y-forward before glTF conversion. Exported gameplay
coordinates remain Y-up/-Z-forward. Ground contact is within 5 mm of the origin.
The optimized character has 5,728 triangles and is 122,704 bytes.

First-person hands are original procedural geometry: rounded palm, four curled
fingers, opposing thumb, knuckle pads, seams and cuffs. Knife, trigger and support
grips use separate poses. Fixed glove geometry is merged by material, keeping
each hand to five draw calls. The sleeve follows the wrist and an off-screen elbow
through attacks, inspection, running and firearm reloads. Individual finger
joints are not yet animated.

The remote knife follows the animated right forearm and sits at the closed fist.
Local hands and weapons render after clearing world depth, so nearby terrain
cannot cut the blade off. Internal hand/weapon depth tests remain enabled.

## Verification

Type checking, production build, gameplay and protocol tests, asset validation,
and browser input scenarios cover the changes. Regression coverage includes
secondary damage/reach, the shared cooldown, interruption of inspection, sleeve
attachment over both attack cycles, and restoration of rendering state.
The browser suite writes lobby, firearm and knife pose screenshots under
`test-results`. The total validated asset payload is 746.2 KiB.

The protocol is now version 21: deploy the server and client together.

Verified 2026-09-13: all 265 tests in the full Vitest run passed; the added sleeve
regression and the affected animation/render tests then passed (266 tests total).
The final complete browser run passed all eight scenarios. Ready, inspection,
attack, firearm and lobby screenshots were visually reviewed.
