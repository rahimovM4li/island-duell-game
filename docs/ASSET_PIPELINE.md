# Island Duell – Blender asset specification

## Visual target

- Promise: tactical low-poly objects that remain recognizable while moving and at mid-range.
- Feeling: rugged, improvised island-survival gear; chunky silhouettes; restrained detail.
- Non-goals: photorealism, large PBR texture sets, skeletal character animation, and visual-mesh collision.
- Coordinate system: metres, Y-up in glTF/Three.js, asset origin at ground/handle pivot, ranged weapons face `-Z` after export.

## Browser budgets

| Package | Contents | Target download | Geometry budget |
| --- | --- | ---: | ---: |
| `weapons.glb` | 10 held/pickup weapons | 220 KB | 1,500 triangles per weapon |
| `props.glb` | crates, healing, armour, ammo, projectiles | 180 KB | 800 triangles per prop |
| `environment.glb` | tree, rock, bush, grass, remnants, ruins props | 180 KB | 600 triangles per LOD0 asset |
| `landmarks.glb` | wreck, watchtower, bunker with LODs/proxies | 300 KB | 8,000 triangles per LOD0 POI |
| `character.glb` | modular survivor with named sockets | 150 KB | 2,500 triangles LOD0 |
| Atlas + all GLBs | complete initial art payload | **1 MB maximum** | Meshopt-compressed |

The atlas is a single power-of-two `512×256` sRGB PNG. Geometry reuses one matte atlas material. Normal, metallic and roughness maps are deliberately omitted; form, UV colour blocks and lighting provide readability.

## Names, pivots and LODs

- Weapons: `weapon_<type>`. Handle/origin is `(0,0,0)`; firearms point along `-Z`.
- Props: `prop_<type>`. Origin is centred on the footprint at ground level.
- Environment: `env_<type>` with children `visual_lod0` and `visual_lod1` where useful.
- Landmarks: `poi_<type>` with `visual_lod0`, `visual_lod1`, and `COL_*` proxy empties.
- Character: `player_survivor`, with `player_body`, `player_head`, `player_gear`, and `player_weapon_socket`.
- Character transform rig: `player_arm_l_pivot`, `player_arm_r_pivot`, `player_leg_l_pivot`, and `player_leg_r_pivot`. These are lightweight Empty pivots, not a skinned armature.
- Landmark LOD1 switches at 55 m. The survivor LOD1 is authored but kept hidden until component-aware character switching is added; instanced vegetation uses its compact LOD0 because it is already below the mobile-safe triangle target.

Blender object names are unique across the complete master scene. Repeated semantic child names are therefore exported with suffixes such as `visual_lod0.001`. Runtime lookup resolves these suffixes inside the owning asset root; code must never assume the first scene-global `visual_lod0` belongs to every template.

## Model quality pass

- Weapons use distinct receiver, stock, magazine, optic, muzzle, grip and throwable silhouettes; held forward is Blender `+Y` and glTF/Three.js `-Z`.
- Crates use chamfered corners, structural cross-braces, latches and handles. Healing, armour and ammunition have unique profiles rather than colour-only variants.
- Trees, bushes and grass use asymmetric clustered geometry. Repeated vegetation remains instanced and grass/bushes remain walk-through cover.
- The wreck uses a faceted V-hull and triangular sail; the watchtower uses thin stair treads, stringers, railings and structural X-braces; the bunker has a recessed entrance, roof lip, vents and firing slits.
- The survivor faces Blender `+Y`: goggles and weapon socket are forward, backpack and bedroll are behind. Head pitch pivots at the neck and feet contact ground at `Z=0`.
- The shared atlas adds tile-local wood grain, foliage mottling, metal highlights and hazard bands without adding another texture request.

The current optimized payload is 337.9 KiB: 3,734 weapon triangles, 3,432 prop triangles, 1,774 environment triangles, 2,766 landmark triangles and 1,208 character triangles. This leaves substantial headroom below the 1 MB browser cap.

## Collision policy

- Rapier owns gameplay collision; render code never creates physics bodies.
- Terrain uses the existing heightfield. Players use the existing kinematic capsule.
- Vegetation uses cylinders; bushes and grass remain walk-through cover.
- POIs use authored box proxies matching the `COL_*` nodes. Detailed GLB triangles never become colliders.
- The watchtower platform is split around a stair opening. A 13-step proxy ramp reaches the opening without a low ceiling, so a standing capsule can reach the deck.

## Required validation

1. Blender scene contains every named asset and saves as `art/island-duell-assets.blend`.
2. Each GLB contains the expected roots and no missing UVs.
3. Optimized GLBs use Meshopt and the total payload stays below 1 MB.
4. Runtime loading, fallback paths, typecheck, unit tests and production build pass.
5. Browser smoke test has no page/console error and visually renders the imported assets.
6. Automated physics traversal proves the watchtower stair route reaches deck height.

## Rebuild workflow

1. Run `scripts/blender/build_island_assets.py` in Blender 5.2+ (the Codex Blender-MCP connection executes the same script). A local Blender CLI can use:

   ```powershell
   blender --background --python scripts/blender/build_island_assets.py
   ```

2. Compress and validate the raw exports:

   ```powershell
   npm run assets:build
   ```

3. Validate existing committed outputs without rewriting them:

   ```powershell
   npm run assets:validate
   ```

The Blender step writes the editable master, atlas, five raw GLBs and the shared collider manifest. The Node step welds and Meshopt-compresses the GLBs, checks all required root names/UVs, enforces triangle and payload budgets, and rejects an invalid atlas size.
