# First-person hand and grip review

Visual references (linked only; no external game assets are shipped):

- [Counter-Strike 2 butterfly knife and gloves](https://steamcommunity.com/sharedfiles/filedetails/?id=3579746353): forearm and wrist continue smoothly into the gripping hand, the blade rests diagonally ahead of the knuckles, and the handle sits inside the fingers.
- [VALORANT knife view](https://staticg.sportskeeda.com/editor/2024/07/15581-17207902224356-1920.jpg?w=640): both hands enter from the lower edge and leave the central aiming view clear.

| Check | Previous in-game capture | Revised in-game capture |
| --- | --- | --- |
| Knife idle | ![Previous idle: long bent arm and upright blade](before.png) | ![Revised idle: continuous forearm and diagonal blade](knife-idle.png) |

The previous forearm was stretched and swept sideways by vertex coordinates after posing. The revised export preserves its original length and cross-section and bends it through the source bone weights. The handle is now aligned with a grip socket inside the curled fingers instead of a guessed point in front of them. The butterfly assembly is scaled to fit the fist. The result keeps the sightline clear and the blade angle closer to the linked game references.

The lower fingers loosen during the butterfly inspect animation and close around both handles again at rest:

![Revised butterfly inspect frame](knife-inspect.png)

The Blender inspection below shows the posed anatomical fingers wrapping a grip-sized cylinder before the knife is placed in-game:

![Posed fingers around a grip reference](grip-inspection.png)

The same hand export is used on firearms. Its left support hand sits under the fore-end, with the elbow below the frame:

![Revised rifle aiming frame](rifle-aim.png)

All in-game images are 1280 × 720 Playwright captures from `tests/browser/gameplay-upgrade.spec.ts`. The grip inspection is rendered from the same baked mesh by `scripts/blender/build_view_hands.py`. The references show higher-detail commercial assets; this review checks pose, proportions, grip contact and screen coverage, not texture parity.
