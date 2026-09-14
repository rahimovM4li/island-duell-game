# Anatomical models — September 2026

The old procedural first-person hands and character asset are replaced with
textured Blender models. The character has a 53-joint skeleton, a modeled face,
hair, layered jacket, jeans, gloves and shoes. Profile colors lightly tint the
jacket. Each player receives an independent skeleton and materials.

The glove material in `art/textures/tactical-glove.png` was generated for this
project over the original CC0 UV layout, adding pebbled leather, fabric panels,
reinforced sections and stitching. The first-person glove uses a baked closed grip on an anatomical forearm. A
separate two-joint skin keeps the wrist on the weapon and the elbow outside the
camera during attacks, inspection and reloads. Finger joints are not animated
individually at runtime. The balisong has separate blade/handle pivots, titanium
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

The character has 27,162 triangles (~1.09 MB), the first-person hand about 11,500
(~303 KB), and the balisong 20,473 (~255 KB). The complete eight-file GLB bundle
plus terrain atlas is approximately 2.3 MB. `assets:validate` checks semantic
nodes, UVs, per-model triangle limits, compression and a 4 MB total ceiling.

Vitest decodes production geometry and skins to verify the grip, arm anchoring,
independent skeleton instances and knife pivots. Browser tests render the actual
textures and exercise equip, inspection, both attacks, firearm aiming/reloading,
slot changes and lobby models. Screenshots are written under `test-results/`.

The visual reference is [CSanywhere](https://csany.vercel.app/game). Its arena
loaded, but browser mouse capture was blocked, so its combat animations could not
be inspected directly. The supplied screenshot guided the hand/material direction.
