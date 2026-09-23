# First-person hands: source and production notes

`source.blend` and `new_diff.png` are the unmodified source files from
[FPS arms (rigged only), by para](https://opengameart.org/content/fps-arms-rigged-only),
downloaded on 2026-09-22. The source filename was `FPS ARMS RIG 1.blend`.
The author identifies the underlying mesh and texture as MakeHuman assets and
publishes this package under [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
The shipped `client/public/assets/view-hands.glb` is our modified derivative.
No Counter-Strike or VALORANT game assets are included.

## Design references

- [Riot: How the VALORANT Arsenal was built](https://playvalorant.com/en-us/news/dev/how-the-valorant-arsenal-was-built/):
  readable silhouettes, deliberate weapon interaction and preserving the aiming view.
- [Riot: Breathing life into Elderflame](https://playvalorant.com/en-gb/news/dev/breathing-life-into-elderflame/):
  hands remain connected to the weapon and animation beats communicate the action.
- [Epic: First Person Template](https://dev.epicgames.com/documentation/unreal-engine/first-person-template?application_version=4.27):
  dedicated first-person arms with authored poses rather than a small world-character mesh.
- [Epic: First Person Rendering](https://dev.epicgames.com/documentation/en-us/unreal-engine/first-person-rendering):
  evaluate the viewmodel through the game camera; screen coverage and perspective matter.

## Rebuild

From the repository root, using Blender 5.2 and Node 22:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --disable-autoexec --python scripts/blender/build_view_hands.py
npm run assets:build
```

The builder removes source constraints, poses the finger chains, preserves the
anatomical mesh and skin UVs, and bakes static knife, trigger and support poses.
It sculpts shallow knuckle contours into that mesh, raises the leather wrist
cuff, and exports a restrained woven grain with glancing leather highlights.
The gameplay animation moves these posed meshes with their weapon attachment;
there is no runtime skeletal animation or finger IK. The source rig stays intact.
The elbow and upper-arm poses follow the source rig's skin weights, preserving
forearm length and shape while routing the upper arms below the camera. Exported
grip sockets place each weapon handle inside the curled fingers. The knife mesh
also contains a `release` shape key: the lower fingers open during a butterfly
flip and close around the handles when the animation ends.
Canonical exported axes are +X towards the thumb, +Y towards the fingertips and
+Z into the palm. The sockets are exported in the GLB and are aligned with
weapon-space grip targets in `client/src/entities.ts`.
The left hand is a mirrored instance with its own attachment orientation.

Review screenshots for knife idle/draw/inspect/stab, rifle hip/aim/reload and pistol
switch. In particular, check wrist continuity, grip contact, visible knuckles,
and an unobstructed sight line. Blender inspection renders are written under
`test-results/hand-source`; in-game captures come from the gameplay browser test.
