# Anatomical models — September 2026

The old procedural first-person hands and character asset are replaced with
textured Blender models. The character has a 53-joint skeleton, a modeled face,
hair, layered jacket, jeans, gloves and shoes. Profile colors lightly tint the
jacket. Each player receives an independent skeleton and materials.

The glove material in `art/textures/tactical-glove.png` was generated for this
project over the original CC0 UV layout, adding pebbled leather, fabric panels,
reinforced sections and stitching. The first-person glove uses individually posed
finger joints and an opposing thumb fitted to the butterfly's hilt. The hilt is
sized to the finger row; its two handles sit together inside the closed grip.
The complete anatomical arm has wrist, elbow and shoulder skinning joints.
The glove cuff follows the wrist; a separate grip anchor keeps its fingers fixed
on the handles. Skin overlaps beneath the cuff to cover the articulated seam.
Two-bone inverse kinematics preserves the forearm and upper-arm lengths during
attacks, inspection and reloads. An unreachable pose moves the shoulder instead
of stretching the forearm. Finger joints are not animated individually at runtime.
The balisong has separate blade/handle pivots, titanium
and steel materials, studio reflections, equip flips and inspection animations.
Left and right click retain their existing quick-cut/heavy-stab behavior.

## Attribution and reproducible inputs

[Shipped model credits](../client/public/assets/CREDITS.md) contain the original
authors, licenses and source links. Preserve these credits when redistributing
the models. The knife is CC BY 4.0; the human and glove sources are CC0.

`scripts/blender/download_model_sources.py` downloads the original sources and
checks SHA256 hashes before extracting the selected assets. The large source
archives live in ignored `art/source/`; they are not browser dependencies. The
official MakeHuman pack is approximately 267 MB, downloaded only for rebuilding.

```powershell
python scripts/blender/download_model_sources.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python scripts/blender/build_realistic_models.py
npm run assets:build
npm run assets:validate
```

Append `-- --hands-only` to the Blender command to rebuild just the hand/arm and
knife. The builder reports finger-tip positions in the Three.js hand frame and
fails if the bounded thumb articulation misses its grip target by more than 2 mm
in the source model. These contact landmarks are also exported as GLB extras.

Editable, packed sources are checked in as `art/survivor.blend`, `art/hands.blend`
and `art/butterfly.blend`. The builder preserves source UVs and interpolates
clothing weights from MakeHuman's fitting data. Hidden body faces are removed.
Textures are limited to 1024 pixels, encoded as WebP quality 88, and meshes use
Meshopt compression. Blender's Z-up coordinates are converted to Three.js Y-up;
character facing is baked into mesh and joint coordinates, so yaw, arm flexion
and prone rotation use the same axes as the gameplay controller.

The environment/weapon builder no longer overwrites the character; its historical
`--character-only` flag forwards to the new builder. Preview the editable files
with `scripts/blender/preview_models.py -- survivor` (or `hands` / `knife`).

## Budgets and verification

The character has 27,162 triangles (~1.09 MB), the first-person hand/arm 13,688
(~321 KB), and the balisong 20,473 (~255 KB). The complete eight-file GLB bundle
plus terrain atlas is approximately 2.3 MB. `assets:validate` checks semantic
nodes, UVs, per-model triangle limits, compression and a 4 MB total ceiling.

Vitest decodes production geometry and skins to verify hilt/finger proportions,
opposing thumb contact, fixed limb lengths throughout both attacks,
independent skeleton instances and knife pivots. Browser tests render the actual
textures and exercise equip, inspection, both attacks, firearm aiming/reloading,
slot changes and lobby models. `model-review.spec.ts` additionally renders the
ready, equip, inspect and attack poses in controlled light, plus a side view of
the grip. Screenshots are written under `test-results/`.

The visual reference is [CSanywhere](https://csany.vercel.app/game). Its arena
loaded, but browser mouse capture was blocked, so its combat animations could not
be inspected directly. The supplied screenshot guided the hand/material direction.
