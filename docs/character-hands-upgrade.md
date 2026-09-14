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

## Current models and verification

The September 14 anatomical-model replacement supersedes the former procedural
hands and low-poly character described by this upgrade. See
[model sources, rebuilding and verification](model-sources.md) and the
[shipped credits](../client/public/assets/CREDITS.md).

The secondary attack, shared cooldown, touch controls and depth-separated
viewmodel rendering described above remain in place. This asset replacement
requires no new protocol version; gameplay protocol 21 is unchanged.
