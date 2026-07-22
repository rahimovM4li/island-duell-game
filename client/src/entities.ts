// Dynamic scene objects: remote players (interpolated in main.ts), pickups,
// projectiles, care package, tracer/explosion FX and the first-person viewmodel.
import * as THREE from 'three';
import { WEAPONS, type WeaponType } from '@shared/constants';
import type { PickupInfo, SmokeSnap, SnapProjectile } from '@shared/protocol';
import { deriveSeed, mulberry32, type Rng } from '@shared/rng';
import { gameAssets, isSharedAssetResource } from './game-assets';

const PLAYER_COLORS = [0xe5484d, 0x3d9df2, 0x46c46e, 0xd8b43a, 0xb26ee0];
const HIT_FLASH_BODY = new THREE.Color(0xffffff);
const HIT_FLASH_HEAD = new THREE.Color(0xffe7a3);

interface PlayerRig {
  group: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  weapon: THREE.Group;
  armLeft: THREE.Object3D;
  armRight: THREE.Object3D;
  legLeft: THREE.Object3D;
  legRight: THREE.Object3D;
  armLeftBase: THREE.Euler;
  armRightBase: THREE.Euler;
  legLeftBase: THREE.Euler;
  legRightBase: THREE.Euler;
  headBase: THREE.Euler;
  currentWeapon: WeaponType | null;
  crouchTarget: number;
  crouchBlend: number;
  proneTarget: number;
  proneBlend: number;
  aiming: boolean;
  flashT: number;
  bodyBaseEmissive: THREE.Color;
  headBaseEmissive: THREE.Color;
  alive: boolean;
  forcedDeath: boolean;
  deathT: number;
  deathSide: number;
  baseY: number;
  celebrating: boolean;
  celebrationT: number;
  celebrationWeight: number;
  celebrationYaw: number;
  reducedCelebrationMotion: boolean;
}

const DEATH_ANIMATION_DURATION = 1.35;

interface ItemVisual {
  label: string;
  color: number;
  glyph: string;
}

const ITEM_VISUALS: Record<string, ItemVisual> = {
  machete: { label: 'Machete', color: 0xd9e2e8, glyph: 'M' },
  spear: { label: 'Speer', color: 0xd9e2e8, glyph: 'S' },
  bow: { label: 'Bogen', color: 0xd9a441, glyph: 'B' },
  pistol: { label: 'Pistole', color: 0x65b7ee, glyph: 'P' },
  rifle: { label: 'Gewehr', color: 0xb68cff, glyph: 'G' },
  shotgun: { label: 'Schrotflinte', color: 0xff8c56, glyph: 'S' },
  sniper: { label: 'Scharfschützengewehr', color: 0x7ee0c2, glyph: '◎' },
  grenade: { label: 'Granate', color: 0x83c66b, glyph: '!' },
  smokeGrenade: { label: 'Rauchgranate', color: 0xb9c4cc, glyph: '◌' },
  flashGrenade: { label: 'Blendgranate', color: 0xffe9a8, glyph: '✳' },
  bandageItem: { label: 'Verband', color: 0xff6b6f, glyph: '+' },
  plateItem: { label: 'Panzerplatte', color: 0x70d7e8, glyph: 'A' },
  arrowBundle: { label: 'Pfeile', color: 0xd9a441, glyph: '↟' },
  pistolAmmo: { label: 'Pistolen-Munition', color: 0x65b7ee, glyph: '•' },
  rifleAmmo: { label: 'Gewehr-Munition', color: 0xb68cff, glyph: '•' },
  shellAmmo: { label: 'Schrot-Munition', color: 0xff8c56, glyph: '•' },
  sniperAmmo: { label: 'Sniper-Munition', color: 0x7ee0c2, glyph: '•' },
  care: { label: 'Versorgungspaket', color: 0xffc247, glyph: '★' },
};

const material = (color: number, emissive = 0x000000): THREE.MeshLambertMaterial =>
  new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: emissive ? 0.18 : 0 });

function addBox(
  group: THREE.Group, size: [number, number, number], pos: [number, number, number],
  color: number, rot: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color));
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

function addCylinder(
  group: THREE.Group, radius: number, length: number, pos: [number, number, number],
  color: number, rot: [number, number, number] = [0, 0, 0], sides = 8,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, sides), material(color));
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

/** Tapered cylinder (radiusTop ≠ radiusBottom): barrels, muzzles, tapered grips. */
function addTaper(
  group: THREE.Group, rTop: number, rBottom: number, length: number,
  pos: [number, number, number], color: number, rot: [number, number, number] = [0, 0, 0], sides = 8,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, length, sides), material(color));
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

function addCone(
  group: THREE.Group, radius: number, height: number, pos: [number, number, number],
  color: number, rot: [number, number, number] = [0, 0, 0], sides = 6,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, sides), material(color));
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

/** Readable low-poly silhouettes. All ranged weapons point toward -Z. */
function proceduralWeaponModel(weapon: WeaponType | 'none'): THREE.Group {
  const g = new THREE.Group();
  const dark = 0x26313a, steel = 0xc4ced5, wood = 0x7a5030, grip = 0x171d22;
  const bluedSteel = 0x3a444d, brass = 0xd9a441, leather = 0x5a3d28;
  switch (weapon) {
    case 'machete': {
      // tapered blade (wide → point) with a fuller line, brass guard and wrapped grip
      addTaper(g, 0.02, 0.13, 0.66, [0, 0.3, -0.03], steel, [0, 0, 0], 4);
      addCone(g, 0.09, 0.2, [0, 0.72, -0.03], steel, [0, Math.PI / 4, 0], 4); // pointed tip
      addBox(g, [0.015, 0.5, 0.02], [0.02, 0.32, -0.08], 0x9aa4ac);           // fuller highlight
      addBox(g, [0.24, 0.05, 0.13], [0, 0, 0], brass);                        // crossguard
      addCylinder(g, 0.05, 0.26, [0, -0.16, 0.01], leather, [0, 0, 0], 8);    // grip
      for (let i = 0; i < 3; i++) addCylinder(g, 0.052, 0.02, [0, -0.08 - i * 0.07, 0.01], 0x3a281a, [0, 0, 0], 8); // wrap ridges
      addCylinder(g, 0.062, 0.05, [0, -0.3, 0.01], brass, [0, 0, 0], 8);      // pommel
      g.rotation.z = -0.12;
      break;
    }
    case 'spear': {
      addTaper(g, 0.028, 0.036, 1.74, [0, 0, -0.5], wood, [Math.PI / 2, 0, 0], 8); // shaft
      addCone(g, 0.11, 0.42, [0, 0, -1.55], steel, [-Math.PI / 2, 0, 0], 6);       // leaf tip
      addBox(g, [0.02, 0.02, 0.24], [0, 0, -1.42], 0x9aa4ac);                       // socket highlight
      for (let i = 0; i < 4; i++) addCylinder(g, 0.04, 0.02, [0, 0, -1.28 + i * 0.09], leather, [Math.PI / 2, 0, 0], 8); // bindings
      addCone(g, 0.05, 0.14, [0, 0, 0.63], 0x8a7a5a, [Math.PI / 2, 0, 0], 6);       // butt cap
      break;
    }
    case 'bow': {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.032, 8, 26, Math.PI * 1.42), material(0x9a672f));
      arc.rotation.set(0, 0, -Math.PI * 0.71); arc.castShadow = true; g.add(arc);
      // recurve tips
      addCylinder(g, 0.02, 0.12, [0.02, 0.5, 0], 0x6f4a22, [0, 0, 0.25], 6);
      addCylinder(g, 0.02, 0.12, [0.02, -0.5, 0], 0x6f4a22, [0, 0, -0.25], 6);
      const points = [new THREE.Vector3(0.02, -0.52, 0), new THREE.Vector3(-0.14, 0, 0), new THREE.Vector3(0.02, 0.52, 0)];
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xe8e2d4 })));
      addCylinder(g, 0.03, 0.24, [-0.02, 0, 0], leather, [0, 0, 0], 8);            // grip wrap
      addCylinder(g, 0.016, 0.9, [-0.02, 0.02, -0.08], 0xc9b382, [0, 0, 0], 5);    // nocked arrow
      addCone(g, 0.035, 0.1, [-0.02, 0.02, -0.55], steel, [-Math.PI / 2, 0, 0], 5);
      break;
    }
    case 'pistol':
      addBox(g, [0.14, 0.14, 0.52], [0, 0.05, -0.15], bluedSteel);               // slide
      addBox(g, [0.145, 0.05, 0.5], [0, 0.115, -0.15], dark);                     // slide top
      for (let i = 0; i < 4; i++) addBox(g, [0.15, 0.09, 0.012], [0, 0.05, 0.02 + i * 0.03], 0x1c242b); // serrations
      addBox(g, [0.12, 0.1, 0.4], [0, -0.02, -0.13], 0x20272e);                   // frame
      addBox(g, [0.125, 0.28, 0.15], [0, -0.2, 0.02], grip, [-0.22, 0, 0]);       // grip
      addBox(g, [0.09, 0.24, 0.02], [0, -0.2, 0.1], 0x0f1418, [-0.22, 0, 0]);     // grip panel
      addBox(g, [0.05, 0.11, 0.13], [0, -0.11, -0.06], dark);                     // trigger guard front
      addCylinder(g, 0.045, 0.12, [0, 0.05, -0.44], 0x0d1216, [Math.PI / 2, 0, 0], 8); // muzzle
      addBox(g, [0.02, 0.03, 0.02], [0, 0.15, -0.36], steel);                     // front sight
      addBox(g, [0.06, 0.03, 0.02], [0, 0.15, 0.08], steel);                      // rear sight
      break;
    case 'rifle':
      addBox(g, [0.13, 0.16, 0.86], [0, 0, -0.24], bluedSteel);                   // receiver
      addBox(g, [0.11, 0.1, 0.5], [0, 0.02, -0.62], 0x30383f);                    // handguard
      addCylinder(g, 0.028, 0.62, [0, 0.04, -0.98], steel, [Math.PI / 2, 0, 0], 8); // barrel
      addCylinder(g, 0.04, 0.1, [0, 0.04, -1.26], 0x0d1216, [Math.PI / 2, 0, 0], 8); // flash hider
      addBox(g, [0.13, 0.2, 0.4], [0, -0.03, 0.4], wood, [0.09, 0, 0]);           // stock
      addBox(g, [0.11, 0.26, 0.15], [0, -0.2, -0.2], grip, [-0.2, 0, 0]);         // pistol grip
      addTaper(g, 0.05, 0.075, 0.26, [0, -0.24, -0.02], 0x2a323a, [0.28, 0, 0], 6); // curved magazine
      addBox(g, [0.05, 0.06, 0.34], [0, 0.15, -0.24], 0xb68cff);                  // optic
      addCylinder(g, 0.032, 0.05, [0, 0.15, -0.42], 0xd7c4ff, [Math.PI / 2, 0, 0], 10); // lens
      break;
    case 'shotgun':
      addCylinder(g, 0.05, 1.18, [0, 0.08, -0.36], bluedSteel, [Math.PI / 2, 0, 0], 10); // barrel
      addCylinder(g, 0.038, 1.0, [0, 0.005, -0.32], 0x20272e, [Math.PI / 2, 0, 0], 8);   // magazine tube
      addBox(g, [0.11, 0.13, 0.32], [0, 0.02, -0.02], dark);                             // receiver
      addCylinder(g, 0.06, 0.2, [0, 0.005, -0.5], 0x4a3520, [Math.PI / 2, 0, 0], 8);     // pump
      for (let i = 0; i < 3; i++) addCylinder(g, 0.062, 0.02, [0, 0.005, -0.58 + i * 0.07], 0x38281a, [Math.PI / 2, 0, 0], 8); // pump grooves
      addBox(g, [0.15, 0.18, 0.46], [0, -0.02, 0.36], wood, [0.1, 0, 0]);                // stock
      addBox(g, [0.13, 0.2, 0.14], [0, -0.14, 0.02], 0x4a3520, [-0.2, 0, 0]);            // grip wrist
      addCylinder(g, 0.02, 0.03, [0, 0.135, -0.92], 0xffcf6b, [Math.PI / 2, 0, 0], 6);   // bead sight
      break;
    case 'sniper':
      // long barrel + boxy receiver + prominent scope tube: readable at range
      addBox(g, [0.14, 0.17, 0.78], [0, 0, -0.14], dark);
      addCylinder(g, 0.03, 0.95, [0, 0.03, -1.02], steel, [Math.PI / 2, 0, 0], 8);
      addCylinder(g, 0.05, 0.12, [0, 0.03, -1.46], dark, [Math.PI / 2, 0, 0], 8); // muzzle brake
      addBox(g, [0.13, 0.2, 0.42], [0, -0.03, 0.42], wood, [0.07, 0, 0]);
      addBox(g, [0.1, 0.26, 0.15], [0, -0.2, -0.1], grip, [-0.18, 0, 0]);
      addCylinder(g, 0.055, 0.34, [0, 0.19, -0.18], 0x2b4f46, [Math.PI / 2, 0, 0], 10); // scope
      addCylinder(g, 0.065, 0.04, [0, 0.19, -0.36], 0x7ee0c2, [Math.PI / 2, 0, 0], 10); // lens
      addBox(g, [0.035, 0.09, 0.03], [0.08, 0.06, 0.06], steel, [0, 0, -0.9]); // bolt handle
      break;
    case 'smoke': {
      addCylinder(g, 0.11, 0.34, [0, 0.02, 0], 0x8d99a3, [0, 0, 0], 10);
      addCylinder(g, 0.06, 0.08, [0, 0.22, 0], dark, [0, 0, 0], 7);
      addBox(g, [0.05, 0.15, 0.04], [0.1, 0.24, 0], 0xd2d9de, [0, 0, -0.55]);
      break;
    }
    case 'flash': {
      addCylinder(g, 0.1, 0.3, [0, 0.02, 0], 0xcfc39a, [0, 0, 0], 10);
      addCylinder(g, 0.055, 0.08, [0, 0.2, 0], dark, [0, 0, 0], 7);
      addBox(g, [0.05, 0.15, 0.04], [0.09, 0.22, 0], 0xffe9a8, [0, 0, -0.55]);
      break;
    }
    case 'grenade': {
      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.19, 0), material(0x527b48));
      body.castShadow = true; g.add(body);
      addCylinder(g, 0.07, 0.1, [0, 0.2, 0], dark, [0, 0, 0], 7);
      addBox(g, [0.05, 0.17, 0.04], [0.09, 0.25, 0], 0xd2b65e, [0, 0, -0.55]);
      break;
    }
    default: {
      const hand = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), material(0xd8a878));
      hand.scale.set(0.9, 0.75, 1.1);
      hand.position.set(0, 0.03, -0.07);
      hand.castShadow = true;
      g.add(hand);
      addCylinder(g, 0.075, 0.25, [0, -0.13, 0.03], 0xc98e65, [0, 0, -0.14], 8);
    }
  }
  return g;
}

type LitPlayerMaterial = THREE.MeshLambertMaterial | THREE.MeshStandardMaterial;

function weaponModel(weapon: WeaponType | 'none'): THREE.Group {
  return gameAssets.cloneWeapon(weapon) ?? proceduralWeaponModel(weapon);
}

function crateModel(color: number, care = false): THREE.Group {
  const g = new THREE.Group();
  const w = care ? 1.35 : 1.05, h = care ? 0.9 : 0.68, d = care ? 1.08 : 0.86;
  const trim = care ? 0x39434a : 0x72502f, corner = 0x2d3940;
  addBox(g, [w, h, d], [0, h / 2, 0], color);
  addBox(g, [w + 0.06, 0.12, d + 0.06], [0, h + 0.03, 0], trim);           // lid
  // corner brackets on all four verticals
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    addBox(g, [0.1, h + 0.04, 0.1], [sx * w * 0.44, h / 2, sz * d * 0.44], corner);
  }
  // banded straps around the body
  addBox(g, [w + 0.03, 0.07, d + 0.03], [0, h * 0.32, 0], trim);
  addBox(g, [w + 0.03, 0.07, d + 0.03], [0, h * 0.72, 0], trim);
  addBox(g, [0.22, 0.2, 0.08], [0, h * 0.62, d / 2 + 0.05], care ? 0xffc247 : 0xd8aa61); // latch
  if (care) {
    // hazard chevrons + a small parachute knot so the airdrop reads instantly
    for (let i = -1; i <= 1; i++) addBox(g, [0.16, 0.16, 0.02], [i * 0.34, h + 0.14, d / 2 - 0.3], i % 2 === 0 ? 0xffc247 : 0x1c2228, [0, 0, Math.PI / 4]);
    addBox(g, [0.14, 0.14, 0.14], [0, h + 0.22, 0], 0xcc4433);
  } else {
    addCone(g, 0.12, 0.14, [0, h + 0.16, 0], 0x1c2228, [0, Math.PI / 4, 0], 4); // small lock/knob
  }
  return g;
}

function ammoModel(color: number, shells = false): THREE.Group {
  const g = new THREE.Group();
  addBox(g, [0.46, 0.26, 0.34], [0, 0.13, 0], 0x2a343b);        // ammo can body
  addBox(g, [0.48, 0.06, 0.36], [0, 0.27, 0], 0x353f47);        // lid
  addBox(g, [0.5, 0.05, 0.05], [0, 0.32, 0], 0x1c242b);         // latch/handle bar
  addBox(g, [0.42, 0.1, 0.02], [0, 0.14, 0.18], color);         // colour-coded label
  if (shells) {
    for (let i = -1; i <= 1; i++) {
      addCylinder(g, 0.038, 0.3, [i * 0.11, 0.44, 0], 0xc54739, [Math.PI / 2, 0, 0], 8);
      addCylinder(g, 0.04, 0.06, [i * 0.11, 0.44, 0.13], 0xe8b44a, [Math.PI / 2, 0, 0], 8); // brass base
    }
  } else {
    // a few loose rounds standing in the tray
    for (let i = -1; i <= 1; i++) {
      addCylinder(g, 0.028, 0.14, [i * 0.1, 0.35, -0.06], 0xe8b44a, [0, 0, 0], 8);
      addCone(g, 0.028, 0.06, [i * 0.1, 0.45, -0.06], color, [0, 0, 0], 8);
    }
  }
  return g;
}

function pickupModel(p: PickupInfo): THREE.Group {
  if (p.item === 'crate') {
    const compact = gameAssets.cloneProp(
      p.tier === 'top' ? 'crate_top' : p.tier === 'good' ? 'crate_good' : 'crate_common',
    );
    if (compact) return compact;
    const color = p.tier === 'top' ? 0xc98a2e : p.tier === 'good' ? 0x397f9f : 0x6d604d;
    return crateModel(color);
  }
  if (p.item === 'care') return gameAssets.cloneProp('care') ?? crateModel(0xb94739, true);
  if (p.item in WEAPON_MODEL_KEYS) return weaponModel(p.item as WeaponType);
  const compactProp = p.item === 'bandageItem' ? 'bandage'
    : p.item === 'plateItem' ? 'plate'
      : p.item === 'arrowBundle' ? 'arrow_bundle'
        : p.item === 'pistolAmmo' ? 'pistol_ammo'
          : p.item === 'rifleAmmo' ? 'rifle_ammo'
            : p.item === 'shellAmmo' ? 'shell_ammo'
              : p.item === 'sniperAmmo' ? 'sniper_ammo' : null;
  if (compactProp) {
    const compact = gameAssets.cloneProp(compactProp);
    if (compact) return compact;
  }
  const g = new THREE.Group();
  if (p.item === 'bandageItem') {
    addCylinder(g, 0.22, 0.2, [0, 0.13, 0], 0xf1eee7, [Math.PI / 2, 0, 0], 12); // rolled gauze
    addCylinder(g, 0.1, 0.21, [0, 0.13, 0], 0xe6ddce, [Math.PI / 2, 0, 0], 12);  // inner core
    addBox(g, [0.16, 0.05, 0.06], [0, 0.13, 0.02], 0xd84c52);                    // red cross
    addBox(g, [0.05, 0.16, 0.06], [0, 0.13, 0.02], 0xd84c52);
  } else if (p.item === 'plateItem') {
    // curved-ish armour plate: a slab flanked by two angled shoulder wings
    addBox(g, [0.34, 0.54, 0.1], [0, 0.32, 0], 0x5c9ead);
    addBox(g, [0.12, 0.5, 0.08], [-0.22, 0.32, 0.03], 0x4a7f8b, [0, 0.4, 0]);
    addBox(g, [0.12, 0.5, 0.08], [0.22, 0.32, 0.03], 0x4a7f8b, [0, -0.4, 0]);
    addBox(g, [0.5, 0.12, 0.14], [0, 0.55, 0], 0x9ce7ee);                        // top edge
    addBox(g, [0.24, 0.24, 0.02], [0, 0.34, 0.08], 0x304e5b);                    // center panel
  } else if (p.item === 'arrowBundle') {
    for (let i = -1; i <= 1; i++) {
      addCylinder(g, 0.025, 0.92, [i * 0.09, 0.28, 0], 0xc9b382, [0, 0, 0.08 * i], 5);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 5), material(0xc4ced5));
      tip.position.set(i * 0.09, 0.82, 0); g.add(tip);
    }
    addBox(g, [0.34, 0.09, 0.12], [0, 0.25, 0], 0x8b5530);
  } else if (p.item === 'smokeGrenade') {
    return weaponModel('smoke');
  } else if (p.item === 'flashGrenade') {
    return weaponModel('flash');
  } else {
    return ammoModel(
      p.item === 'pistolAmmo' ? 0x65b7ee
        : p.item === 'rifleAmmo' ? 0xb68cff
          : p.item === 'sniperAmmo' ? 0x7ee0c2 : 0xff8c56,
      p.item === 'shellAmmo',
    );
  }
  return g;
}

const WEAPON_MODEL_KEYS: Record<WeaponType, true> = {
  fists: true, machete: true, spear: true, bow: true, pistol: true,
  rifle: true, shotgun: true, sniper: true, grenade: true, smoke: true, flash: true,
};

function pickupVisual(p: PickupInfo): ItemVisual {
  if (p.item === 'crate') {
    return p.tier === 'top'
      ? { label: 'Top-Loot-Kiste', color: 0xffbd55, glyph: '★' }
      : p.tier === 'good'
        ? { label: 'Gute Kiste', color: 0x62c4e8, glyph: '◆' }
        : { label: 'Loot-Kiste', color: 0xc3ad88, glyph: '□' };
  }
  const base = ITEM_VISUALS[p.item] ?? { label: String(p.item), color: 0xffffff, glyph: '•' };
  if (p.weaponMag !== undefined && p.item in WEAPON_MODEL_KEYS) {
    const max = WEAPONS[p.item as WeaponType].magSize;
    if (max) return { ...base, label: `${base.label} · ${p.weaponMag}/${max}` };
  }
  return base;
}

function pickupLabel(p: PickupInfo): THREE.Sprite {
  const info = pickupVisual(p);
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 112;
  const g = cv.getContext('2d')!;
  g.fillStyle = 'rgba(8, 15, 20, 0.92)';
  g.beginPath(); g.roundRect(8, 8, 496, 96, 18); g.fill();
  g.strokeStyle = `#${info.color.toString(16).padStart(6, '0')}`;
  g.lineWidth = 5; g.stroke();
  g.fillStyle = g.strokeStyle; g.font = '800 42px system-ui, sans-serif'; g.textAlign = 'center';
  g.fillText(info.glyph, 58, 72);
  g.fillStyle = '#f4f7f8'; g.font = '700 34px system-ui, sans-serif'; g.textAlign = 'left';
  g.fillText(info.label, 102, 70);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(1.35, 0.3, 1);
  return sprite;
}

function viewmodelFor(weapon: WeaponType | 'none'): THREE.Group {
  const g = weaponModel(weapon);
  const scale = weapon === 'rifle' || weapon === 'shotgun' || weapon === 'spear' || weapon === 'sniper'
    ? 0.36 : weapon === 'bow' ? 0.48 : 0.54;
  g.scale.setScalar(scale);
  const baseRotation = weapon === 'machete'
    ? { x: 0.06, y: -0.28, z: -0.3 }
    : weapon === 'bow'
      ? { x: 0.02, y: 0.18, z: 0.04 }
      : { x: 0, y: -0.08, z: 0 };
  g.rotation.set(baseRotation.x, baseRotation.y, baseRotation.z);
  g.userData.viewmodelBaseRotation = baseRotation;
  return g;
}

function disposeObject(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((obj) => {
    const renderable = obj as THREE.Mesh & THREE.Sprite;
    if (!renderable.isSprite && renderable.geometry && !isSharedAssetResource(renderable.geometry)) {
      geometries.add(renderable.geometry);
    }
    const mats = Array.isArray(renderable.material)
      ? renderable.material : renderable.material ? [renderable.material] : [];
    for (const mat of mats) {
      const withMap = mat as THREE.Material & { map?: THREE.Texture };
      if (withMap.map && !isSharedAssetResource(withMap.map)) textures.add(withMap.map);
      if (!isSharedAssetResource(mat)) materials.add(mat);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((mat) => mat.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function setObjectOpacity(root: THREE.Object3D, opacity: number): void {
  root.traverse((obj) => {
    const renderable = obj as THREE.Mesh & THREE.Sprite;
    const mats = Array.isArray(renderable.material)
      ? renderable.material : renderable.material ? [renderable.material] : [];
    for (const mat of mats) {
      mat.transparent = true;
      mat.depthWrite = false;
      mat.opacity = opacity;
    }
  });
}

export class Entities {
  private players = new Map<string, PlayerRig>();
  private pickups = new Map<string, THREE.Object3D>();
  private projectiles = new Map<number, THREE.Object3D>();
  private fx: {
    obj: THREE.Object3D;
    life: number;
    maxLife: number;
    velocity?: THREE.Vector3;
    expand?: number;
    spin?: number;
    volumePop?: boolean;
    fadeChildren?: boolean;
    lightIntensity?: number;
  }[] = [];
  private careBeacon: THREE.Mesh | null = null;
  private rng: Rng;

  // first-person viewmodel
  readonly viewRoot = new THREE.Group();
  private viewWeapon: THREE.Group | null = null;
  private viewWeaponType: WeaponType | 'none' | null = null;
  private swingT = 1; // 0..1 melee swing animation
  private kickT = 1;  // fire recoil
  private aiming = false;
  private aimBlend = 0;
  private reloadT = -1;
  private reloadDuration = 1;
  private victoryPlayerId: string | null = null;
  private victoryProxyId: string | null = null;
  private victoryLights: THREE.PointLight[] = [];
  private victoryBurstPlayed = false;

  constructor(private scene: THREE.Scene, private camera: THREE.Camera, seed = 1) {
    this.rng = mulberry32(deriveSeed(seed, 'client-entity-fx'));
    camera.add(this.viewRoot);
    this.viewRoot.position.set(0.38, -0.38, -0.72);
  }

  // ---------- remote players ----------
  ensurePlayer(id: string, colorIndex: number): void {
    if (this.players.has(id)) return;
    const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
    const compact = gameAssets.cloneCharacter(color);
    if (compact) {
      const bodyMaterial = compact.body.material as LitPlayerMaterial;
      const headMaterial = compact.head.material as LitPlayerMaterial;
      this.scene.add(compact.group);
      this.players.set(id, {
        group: compact.group,
        body: compact.body,
        head: compact.head,
        weapon: compact.weaponSocket,
        armLeft: compact.armLeft,
        armRight: compact.armRight,
        legLeft: compact.legLeft,
        legRight: compact.legRight,
        armLeftBase: compact.armLeft.rotation.clone(),
        armRightBase: compact.armRight.rotation.clone(),
        legLeftBase: compact.legLeft.rotation.clone(),
        legRightBase: compact.legRight.rotation.clone(),
        headBase: compact.head.rotation.clone(),
        currentWeapon: null,
        crouchTarget: 0,
        crouchBlend: 0,
        proneTarget: 0,
        proneBlend: 0,
        aiming: false,
        flashT: 0,
        bodyBaseEmissive: bodyMaterial.emissive.clone(),
        headBaseEmissive: headMaterial.emissive.clone(),
        alive: true, forcedDeath: false, deathT: -1, deathSide: 1, baseY: 0,
        celebrating: false, celebrationT: 0, celebrationWeight: 0,
        celebrationYaw: 0, reducedCelebrationMotion: false,
      });
      return;
    }
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });
    const darkMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.62) });
    const gearMat = new THREE.MeshLambertMaterial({ color: 0x2b333b });   // straps/vest/boots
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd8a878 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.78, 0.38), mat);
    body.position.y = 1.08;
    // chest rig / plate carrier over the torso (reads as a survivor silhouette)
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.42), gearMat);
    vest.position.set(0, 1.12, 0);
    const beltStrap = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.12, 0.42), gearMat);
    beltStrap.position.set(0, 0.78, 0);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.14, 8), gearMat);
    collar.position.set(0, 1.44, 0);
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), darkMat);
    shoulderL.position.set(-0.36, 1.4, 0); shoulderL.scale.set(1, 0.8, 1);
    const shoulderR = shoulderL.clone(); shoulderR.position.x = 0.36;
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.32), darkMat);
    hips.position.y = 0.64;
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.64, 8), darkMat);
    leftLeg.position.set(-0.17, 0.31, 0);
    const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.17;
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.14, 0.3), gearMat);
    bootL.position.set(-0.17, 0.05, 0.04);
    const bootR = bootL.clone(); bootR.position.x = 0.17;
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.62, 8), mat);
    leftArm.position.set(-0.39, 1.08, 0); leftArm.rotation.z = -0.12;
    const rightArm = leftArm.clone(); rightArm.position.x = 0.39; rightArm.rotation.z = 0.12;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 7, 6), gearMat);
    handL.position.set(-0.42, 0.79, 0);
    const handR = handL.clone(); handR.position.x = 0.42;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skinMat);
    head.position.y = 1.67;
    // low-poly helmet cap + visor
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.255, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), darkMat);
    helmet.position.y = 1.7;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.06), gearMat);
    visor.position.set(0, 1.7, -0.22);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.22), gearMat);
    backpack.position.set(0, 1.12, 0.3);
    const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.44, 8), mat);
    bedroll.rotation.z = Math.PI / 2; bedroll.position.set(0, 1.4, 0.34);
    const weapon = new THREE.Group();
    weapon.position.set(0.34, 1.22, -0.18);
    weapon.scale.setScalar(0.48);
    const extras = [
      vest, beltStrap, collar, shoulderL, shoulderR, hips, leftLeg, rightLeg,
      bootL, bootR, leftArm, rightArm, handL, handR, helmet, visor, backpack, bedroll,
    ];
    for (const mesh of [body, head, ...extras]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    group.add(body, head, weapon, ...extras);
    this.scene.add(group);
    this.players.set(id, {
      group, body, head, weapon, currentWeapon: null,
      armLeft: leftArm, armRight: rightArm, legLeft: leftLeg, legRight: rightLeg,
      armLeftBase: leftArm.rotation.clone(), armRightBase: rightArm.rotation.clone(),
      legLeftBase: leftLeg.rotation.clone(), legRightBase: rightLeg.rotation.clone(),
      headBase: head.rotation.clone(),
      crouchTarget: 0, crouchBlend: 0, proneTarget: 0, proneBlend: 0, aiming: false,
      flashT: 0,
      bodyBaseEmissive: (body.material as THREE.MeshLambertMaterial).emissive.clone(),
      headBaseEmissive: (head.material as THREE.MeshLambertMaterial).emissive.clone(),
      alive: true, forcedDeath: false, deathT: -1, deathSide: 1, baseY: 0,
      celebrating: false, celebrationT: 0, celebrationWeight: 0,
      celebrationYaw: 0, reducedCelebrationMotion: false,
    });
  }

  private resetCelebrationPose(rig: PlayerRig): void {
    rig.celebrating = false;
    rig.celebrationT = 0;
    rig.celebrationWeight = 0;
    rig.group.position.y = rig.baseY;
    rig.group.rotation.x = 0;
    rig.group.rotation.y = rig.celebrationYaw;
    rig.group.rotation.z = 0;
    rig.group.scale.set(1, 1, 1);
    rig.armLeft.rotation.copy(rig.armLeftBase);
    rig.armRight.rotation.copy(rig.armRightBase);
    rig.legLeft.rotation.copy(rig.legLeftBase);
    rig.legRight.rotation.copy(rig.legRightBase);
    rig.head.rotation.copy(rig.headBase);
  }

  /** Creates a visible third-person winner when the local first-person player wins. */
  startVictoryCelebration(
    winnerId: string,
    localWinner: boolean,
    x: number,
    y: number,
    z: number,
    yaw: number,
    colorIndex: number,
    weapon: WeaponType,
    reducedMotion: boolean,
  ): string {
    this.endVictoryCelebration();
    const presentationId = localWinner ? `__victory_${winnerId}` : winnerId;
    this.ensurePlayer(presentationId, colorIndex);
    this.updatePlayer(presentationId, x, y, z, yaw, 0, true, weapon, false, false, false);
    const rig = this.players.get(presentationId)!;
    rig.forcedDeath = false;
    rig.deathT = -1;
    rig.alive = true;
    rig.group.visible = true;
    rig.baseY = y;
    rig.celebrationYaw = yaw;
    rig.celebrating = true;
    rig.celebrationT = 0;
    rig.celebrationWeight = 0;
    rig.reducedCelebrationMotion = reducedMotion;
    rig.weapon.visible = false;
    this.victoryPlayerId = presentationId;
    this.victoryProxyId = localWinner ? presentationId : null;
    this.victoryBurstPlayed = false;

    const facingX = -Math.sin(yaw);
    const facingZ = -Math.cos(yaw);
    const key = new THREE.PointLight(0xffd08a, 18, 10, 2);
    key.position.set(x + facingX * 2.2, y + 2.7, z + facingZ * 2.2);
    const rim = new THREE.PointLight(0x72b8ff, 7, 8, 2);
    rim.position.set(x - facingX * 1.5, y + 2.15, z - facingZ * 1.5);
    this.scene.add(key, rim);
    this.victoryLights.push(key, rim);
    return presentationId;
  }

  setVictoryDanceWeight(weight: number): void {
    const rig = this.victoryPlayerId ? this.players.get(this.victoryPlayerId) : null;
    if (!rig) return;
    const nextWeight = THREE.MathUtils.clamp(weight, 0, 1);
    if (!this.victoryBurstPlayed && nextWeight > 0.08) {
      this.victoryBurstPlayed = true;
      if (!rig.reducedCelebrationMotion) this.spawnVictoryBurst(rig);
    }
    rig.celebrationWeight = nextWeight;
  }

  private spawnVictoryBurst(rig: PlayerRig): void {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.82, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffc85b, transparent: true, opacity: 0.82,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(rig.group.position.x, rig.baseY + 0.035, rig.group.position.z);
    this.scene.add(ring);
    this.fx.push({ obj: ring, life: 2.1, maxLife: 2.1, expand: 0.72 });

    for (let i = 0; i < 14; i++) {
      const confetti = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.2, 0.035),
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xffffff : i % 2 === 0 ? 0xff9f43 : 0xffd866,
          transparent: true,
          opacity: 0.92,
        }),
      );
      const angle = (i / 14) * Math.PI * 2;
      const speed = 1.45 + (i % 4) * 0.18;
      confetti.position.set(
        rig.group.position.x + Math.cos(angle) * 0.34,
        rig.baseY + 1.05,
        rig.group.position.z + Math.sin(angle) * 0.34,
      );
      confetti.rotation.z = angle;
      this.scene.add(confetti);
      this.fx.push({
        obj: confetti, life: 1.85, maxLife: 1.85,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 4.1 + (i % 3) * 0.25, Math.sin(angle) * speed),
        spin: 6 + (i % 4),
      });
    }
  }

  endVictoryCelebration(): void {
    const playerId = this.victoryPlayerId;
    const proxyId = this.victoryProxyId;
    this.victoryPlayerId = null;
    this.victoryProxyId = null;
    for (const light of this.victoryLights) this.scene.remove(light);
    this.victoryLights.length = 0;
    this.victoryBurstPlayed = false;
    if (!playerId) return;
    const rig = this.players.get(playerId);
    if (rig) this.resetCelebrationPose(rig);
    if (proxyId) this.removePlayer(proxyId);
  }

  private beginDeath(rig: PlayerRig): void {
    if (rig.deathT >= 0) return;
    rig.alive = false;
    rig.deathT = 0;
    rig.deathSide = Math.sin(rig.group.position.x * 1.73 + rig.group.position.z * 2.11) >= 0 ? 1 : -1;
    rig.group.visible = true;
  }

  updatePlayer(
    id: string, x: number, y: number, z: number, yaw: number, pitch: number,
    alive: boolean, weapon: WeaponType, sneaking: boolean, prone: boolean, aiming: boolean,
  ): void {
    const rig = this.players.get(id);
    if (!rig) return;
    if (!alive) rig.forcedDeath = false;
    const effectiveAlive = alive && !rig.forcedDeath;
    if (rig.alive && !effectiveAlive) this.beginDeath(rig);
    else if (!rig.alive && effectiveAlive) {
      rig.alive = true;
      rig.deathT = -1;
      rig.group.visible = true;
      rig.group.rotation.x = 0;
      rig.group.rotation.z = 0;
      rig.group.scale.set(1, 1, 1);
    }
    rig.alive = effectiveAlive;
    rig.group.visible = effectiveAlive || (rig.deathT >= 0 && rig.deathT < DEATH_ANIMATION_DURATION);
    rig.group.position.set(x, y, z);
    rig.baseY = y;
    rig.group.rotation.y = yaw;
    rig.crouchTarget = sneaking ? 1 : 0;
    rig.proneTarget = prone ? 1 : 0;
    rig.aiming = aiming;
    rig.head.rotation.x = -pitch * 0.8;
    if (rig.currentWeapon !== weapon) {
      for (const child of [...rig.weapon.children]) disposeObject(child);
      rig.weapon.clear();
      if (weapon !== 'fists') rig.weapon.add(weaponModel(weapon));
      rig.currentWeapon = weapon;
    }
    rig.weapon.visible = effectiveAlive && weapon !== 'fists';
    rig.weapon.rotation.x = -pitch;
    rig.weapon.position.z = aiming ? -0.28 : -0.18;
  }

  removePlayer(id: string): void {
    const rig = this.players.get(id);
    if (rig) {
      this.scene.remove(rig.group);
      disposeObject(rig.group);
      this.players.delete(id);
    }
  }

  clearPlayers(): void {
    for (const id of [...this.players.keys()]) this.removePlayer(id);
  }

  flashPlayer(id: string, headshot: boolean): void {
    const rig = this.players.get(id);
    if (rig) rig.flashT = headshot ? 0.16 : 0.11;
  }

  /** Start the readable remote-player fall immediately and add a short world-space confirmation pulse. */
  playElimination(id: string, localKill: boolean): void {
    const rig = this.players.get(id);
    if (!rig) return;
    rig.forcedDeath = true;
    this.beginDeath(rig);

    const color = localKill ? 0xffc45c : 0xf05d62;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.48, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(rig.group.position);
    ring.position.y += 0.04;
    this.scene.add(ring);
    this.fx.push({ obj: ring, life: 0.7, maxLife: 0.7, expand: 2.3 });

    for (let i = 0; i < 7; i++) {
      const shard = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.22, 0.035),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 }),
      );
      const angle = (i / 7) * Math.PI * 2;
      shard.position.copy(rig.group.position).add(new THREE.Vector3(Math.cos(angle) * 0.22, 0.85, Math.sin(angle) * 0.22));
      this.scene.add(shard);
      this.fx.push({
        obj: shard, life: 0.58, maxLife: 0.58,
        velocity: new THREE.Vector3(Math.cos(angle) * 1.15, 2.2 + (i % 2) * 0.35, Math.sin(angle) * 1.15),
        spin: 5,
      });
    }
  }

  resetPlayerAnimations(): void {
    this.endVictoryCelebration();
    for (const rig of this.players.values()) {
      rig.forcedDeath = false;
      rig.deathT = -1;
      rig.alive = true;
      rig.group.visible = true;
      rig.group.rotation.x = 0;
      rig.group.rotation.z = 0;
      rig.group.scale.set(1, 1, 1);
      rig.armLeft.rotation.copy(rig.armLeftBase);
      rig.armRight.rotation.copy(rig.armRightBase);
      rig.legLeft.rotation.copy(rig.legLeftBase);
      rig.legRight.rotation.copy(rig.legRightBase);
      rig.head.rotation.copy(rig.headBase);
    }
  }

  // ---------- pickups ----------
  addPickup(p: PickupInfo): void {
    if (this.pickups.has(p.id)) return;
    const info = pickupVisual(p);
    const model = pickupModel(p);
    const holder = new THREE.Group();
    holder.add(model);
    const isContainer = p.item === 'crate' || p.item === 'care';
    if (!isContainer) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.46, 0.62, 28),
        new THREE.MeshBasicMaterial({ color: info.color, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.34;
      holder.add(ring);
      const label = pickupLabel(p);
      label.position.y = 1.14;
      label.userData.pickupLabel = true;
      holder.add(label);
    }
    holder.position.set(p.x, p.y + (isContainer ? 0.02 : 0.58), p.z);
    holder.userData.baseY = holder.position.y;
    holder.userData.spin = p.item !== 'crate' && p.item !== 'care';
    holder.userData.phase = (p.x * 0.17 + p.z * 0.11) % (Math.PI * 2);
    if (p.item === 'care') {
      // vertical light beam so the drop is visible across the island (§7)
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 60, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
      );
      beam.position.y = 30;
      holder.add(beam);
    }
    this.scene.add(holder);
    this.pickups.set(p.id, holder);
  }

  removePickup(id: string, animate = false): void {
    const m = this.pickups.get(id);
    if (m) {
      this.pickups.delete(id);
      if (animate) {
        setObjectOpacity(m, 1);
        this.fx.push({
          obj: m, life: 0.28, maxLife: 0.28,
          velocity: new THREE.Vector3(0, 1.35, 0), spin: 7, volumePop: true,
          fadeChildren: true,
        });
      } else {
        this.scene.remove(m);
        disposeObject(m);
      }
    }
  }

  clearPickups(): void {
    for (const id of [...this.pickups.keys()]) this.removePickup(id, false);
  }

  /** care package incoming marker (falling crate + beacon before it lands) */
  setCareIncoming(x: number, z: number, active: boolean): void {
    if (active && !this.careBeacon) {
      this.careBeacon = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 80, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
      );
      this.careBeacon.position.set(x, 40, z);
      this.scene.add(this.careBeacon);
    } else if (!active && this.careBeacon) {
      this.scene.remove(this.careBeacon);
      disposeObject(this.careBeacon);
      this.careBeacon = null;
    }
  }

  // ---------- projectiles ----------
  syncProjectiles(list: SnapProjectile[]): void {
    const seen = new Set<number>();
    for (const pr of list) {
      seen.add(pr.id);
      let obj = this.projectiles.get(pr.id);
      if (!obj) {
        if (pr.kind === 'arrow') {
          const compactArrow = gameAssets.cloneProp('projectile_arrow');
          if (compactArrow) {
            obj = compactArrow;
          } else {
          const m = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4),
            new THREE.MeshLambertMaterial({ color: 0xc9b382 }),
          );
          m.rotation.x = Math.PI / 2;
          const holder = new THREE.Group();
          holder.add(m);
          obj = holder;
          }
        } else {
          const weaponKind = pr.kind === 'smoke' ? 'smoke' : pr.kind === 'flash' ? 'flash' : 'grenade';
          const compactThrowable = gameAssets.cloneWeapon(weaponKind);
          if (compactThrowable) {
            obj = compactThrowable;
            obj.scale.setScalar(0.68);
          }
          else {
            const color = pr.kind === 'smoke' ? 0x8d99a3 : pr.kind === 'flash' ? 0xcfc39a : 0x4a7a4a;
            obj = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color }));
          }
        }
        this.scene.add(obj);
        this.projectiles.set(pr.id, obj);
      }
      obj.position.set(pr.x, pr.y, pr.z);
      if (pr.kind === 'arrow') {
        const dir = new THREE.Vector3(pr.vx, pr.vy, pr.vz);
        if (dir.lengthSq() > 0.01) obj.lookAt(obj.position.clone().add(dir));
      }
    }
    for (const [id, obj] of this.projectiles) {
      if (!seen.has(id)) {
        this.scene.remove(obj);
        disposeObject(obj);
        this.projectiles.delete(id);
      }
    }
  }

  // ---------- smoke clouds (§F2) ----------
  private smokeGeometry = new THREE.SphereGeometry(1, 8, 6);
  private smokeClouds = new Map<number, {
    group: THREE.Group; puffs: THREE.Mesh[]; material: THREE.MeshLambertMaterial;
  }>();

  /** Mirror the host's active smoke clouds; grow in, hold, fade out near expiry. */
  syncSmokes(smokes: SmokeSnap[], t: number): void {
    const seen = new Set<number>();
    for (const cloud of smokes) {
      seen.add(cloud.id);
      let entry = this.smokeClouds.get(cloud.id);
      if (!entry) {
        const group = new THREE.Group();
        const puffs: THREE.Mesh[] = [];
        const smokeMaterial = new THREE.MeshLambertMaterial({
          color: 0xb9c2c9, transparent: true, opacity: 0, depthWrite: false,
        });
        const puffRng = mulberry32(cloud.id + 77);
        for (let i = 0; i < 5; i++) {
          const r = cloud.radius * (0.42 + puffRng() * 0.3);
          const puff = new THREE.Mesh(this.smokeGeometry, smokeMaterial);
          puff.scale.setScalar(r);
          puff.position.set(
            (puffRng() - 0.5) * cloud.radius * 1.1,
            (puffRng() - 0.35) * cloud.radius * 0.75,
            (puffRng() - 0.5) * cloud.radius * 1.1,
          );
          group.add(puff);
          puffs.push(puff);
        }
        group.position.set(cloud.x, cloud.y, cloud.z);
        this.scene.add(group);
        entry = { group, puffs, material: smokeMaterial };
        this.smokeClouds.set(cloud.id, entry);
      }
      const age = t - cloud.bornAt;
      const left = cloud.expiresAt - t;
      const grow = Math.min(1, age / 0.6);
      const fade = Math.min(1, Math.max(0, left / 1.6));
      entry.group.scale.setScalar(0.25 + 0.75 * grow);
      entry.group.rotation.y = age * 0.14;
      for (const puff of entry.puffs) {
        (puff.material as THREE.MeshLambertMaterial).opacity = 0.82 * grow * fade;
      }
    }
    for (const [id, entry] of this.smokeClouds) {
      if (!seen.has(id)) {
        this.scene.remove(entry.group);
        entry.material.dispose();
        entry.group.clear();
        this.smokeClouds.delete(id);
      }
    }
  }

  clearSmokes(): void { this.syncSmokes([], 0); }

  // ---------- FX ----------
  addTracer(from: THREE.Vector3, to: THREE.Vector3): void {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.85 }));
    this.scene.add(line);
    this.fx.push({ obj: line, life: 0.09, maxLife: 0.09 });
  }

  addExplosion(x: number, y: number, z: number, radius: number): void {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.55, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffa030, transparent: true, opacity: 0.85 }),
    );
    s.position.set(x, y, z);
    this.scene.add(s);
    s.scale.setScalar(0.25);
    this.fx.push({ obj: s, life: 0.35, maxLife: 0.35, expand: 5.5 });
    const light = new THREE.PointLight(0xffa030, 30, radius * 4);
    light.position.set(x, y + 1, z);
    this.scene.add(light);
    this.fx.push({ obj: light, life: 0.25, maxLife: 0.25, lightIntensity: 30 });
  }

  addImpact(x: number, y: number, z: number, weapon: WeaponType): void {
    const color = weapon === 'rifle' ? 0xc7a4ff : weapon === 'shotgun' ? 0xffa66f : 0xffe2a0;
    for (let i = 0; i < 5; i++) {
      const spark = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.035, 0.09),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }),
      );
      spark.position.set(x, y, z);
      const velocity = new THREE.Vector3(
        (this.rng() - 0.5) * 2.8,
        0.5 + this.rng() * 1.9,
        (this.rng() - 0.5) * 2.8,
      );
      spark.lookAt(spark.position.clone().add(velocity));
      this.scene.add(spark);
      this.fx.push({ obj: spark, life: 0.18, maxLife: 0.18, velocity });
    }
  }

  clearProjectiles(): void {
    for (const obj of this.projectiles.values()) {
      this.scene.remove(obj);
      disposeObject(obj);
    }
    this.projectiles.clear();
  }

  addMuzzleFlash(camera: THREE.Camera): void {
    const light = new THREE.PointLight(0xffd890, 8, 10);
    const p = new THREE.Vector3();
    camera.getWorldPosition(p);
    light.position.copy(p);
    this.scene.add(light);
    this.fx.push({ obj: light, life: 0.06, maxLife: 0.06, lightIntensity: 8 });
    this.kickT = 0;
  }

  meleeSwing(): void { this.swingT = 0; }

  // ---------- viewmodel ----------
  setViewWeapon(weapon: WeaponType | 'none'): void {
    if (weapon === this.viewWeaponType) return;
    if (this.viewWeapon) {
      this.viewRoot.remove(this.viewWeapon);
      disposeObject(this.viewWeapon);
    }
    this.viewWeapon = viewmodelFor(weapon);
    this.viewWeaponType = weapon;
    this.reloadT = -1;
    this.viewRoot.add(this.viewWeapon);
  }

  setAiming(aiming: boolean): void { this.aiming = aiming; }

  setReloading(reloading: boolean, duration = 1): void {
    if (reloading) {
      if (this.reloadT < 0) this.reloadT = 0;
      this.reloadDuration = Math.max(0.2, duration);
    } else {
      this.reloadT = -1;
    }
  }

  setViewVisible(v: boolean): void { this.viewRoot.visible = v; }

  update(dt: number, time: number): void {
    const cameraPos = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPos);
    for (const [, m] of this.pickups) {
      if (m.userData.spin) {
        m.rotation.y += dt * 1.6;
        m.position.y = m.userData.baseY + Math.sin(time * 2 + m.userData.phase) * 0.1;
        const distance = cameraPos.distanceTo(m.position);
        const label = m.children.find((child) => child.userData.pickupLabel) as THREE.Sprite | undefined;
        if (label) {
          label.visible = distance > 2.1 && distance < 14;
          (label.material as THREE.SpriteMaterial).opacity = Math.min(1, Math.max(0, (14 - distance) / 3));
        }
      }
    }
    for (const rig of this.players.values()) {
      const ease = 1 - Math.exp(-dt * 12);
      rig.crouchBlend += (rig.crouchTarget - rig.crouchBlend) * ease;
      rig.proneBlend += (rig.proneTarget - rig.proneBlend) * ease;
      if (rig.celebrating) {
        rig.celebrationT += dt;
        const weight = rig.celebrationWeight;
        const beat = rig.reducedCelebrationMotion ? 0 : Math.sin(rig.celebrationT * 7.2);
        const halfBeat = rig.reducedCelebrationMotion ? 0 : Math.sin(rig.celebrationT * 3.6);
        const bounce = rig.reducedCelebrationMotion ? 0 : Math.max(0, beat) * 0.105;
        rig.group.position.y = rig.baseY + bounce * weight;
        rig.group.rotation.x = 0;
        rig.group.rotation.y = rig.celebrationYaw + halfBeat * 0.14 * weight;
        rig.group.rotation.z = beat * 0.055 * weight;
        rig.group.scale.set(1, 1, 1);
        rig.armLeft.rotation.x = THREE.MathUtils.lerp(rig.armLeftBase.x, rig.armLeftBase.x + beat * 0.32, weight);
        rig.armRight.rotation.x = THREE.MathUtils.lerp(rig.armRightBase.x, rig.armRightBase.x - beat * 0.32, weight);
        rig.armLeft.rotation.z = THREE.MathUtils.lerp(rig.armLeftBase.z, rig.armLeftBase.z - 2.35 - halfBeat * 0.18, weight);
        rig.armRight.rotation.z = THREE.MathUtils.lerp(rig.armRightBase.z, rig.armRightBase.z + 2.35 + halfBeat * 0.18, weight);
        rig.legLeft.rotation.x = THREE.MathUtils.lerp(rig.legLeftBase.x, rig.legLeftBase.x + beat * 0.22, weight);
        rig.legRight.rotation.x = THREE.MathUtils.lerp(rig.legRightBase.x, rig.legRightBase.x - beat * 0.22, weight);
        rig.head.rotation.x = rig.headBase.x;
        rig.head.rotation.y = rig.headBase.y - halfBeat * 0.16 * weight;
        rig.weapon.visible = false;
      } else if (rig.deathT >= 0) {
        rig.deathT += dt;
        const progress = Math.min(1, rig.deathT / DEATH_ANIMATION_DURATION);
        const fall = 1 - Math.pow(1 - progress, 3);
        rig.group.rotation.z = rig.deathSide * fall * 1.32;
        rig.group.rotation.x = -fall * 0.14;
        rig.group.position.y = rig.baseY + Math.sin(progress * Math.PI) * 0.08 - Math.max(0, progress - 0.72) * 0.32;
        rig.group.scale.set(1, THREE.MathUtils.lerp(1, 0.82, fall), 1);
        rig.weapon.visible = rig.deathT < 0.28 && rig.currentWeapon !== 'fists';
        if (rig.deathT >= DEATH_ANIMATION_DURATION) rig.group.visible = false;
      } else {
        const crouchScale = THREE.MathUtils.lerp(1, 0.68, rig.crouchBlend);
        rig.group.scale.y = THREE.MathUtils.lerp(crouchScale, 1, rig.proneBlend);
        rig.group.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.43, rig.proneBlend);
        rig.group.position.y = rig.baseY + rig.proneBlend * 0.43;
      }
      rig.weapon.position.y = THREE.MathUtils.lerp(1.22, 1.3, rig.aiming ? 1 : 0);
      rig.flashT = Math.max(0, rig.flashT - dt);
      const flash = Math.min(1, rig.flashT / 0.08);
      const bodyMat = rig.body.material as LitPlayerMaterial;
      const headMat = rig.head.material as LitPlayerMaterial;
      bodyMat.emissive.copy(rig.bodyBaseEmissive).lerp(HIT_FLASH_BODY, flash * 0.72);
      headMat.emissive.copy(rig.headBaseEmissive).lerp(HIT_FLASH_HEAD, flash * 0.78);
    }
    this.swingT = Math.min(1, this.swingT + dt * 3.2);
    this.kickT = Math.min(1, this.kickT + dt * 7);
    this.aimBlend += ((this.aiming ? 1 : 0) - this.aimBlend) * (1 - Math.exp(-dt * 14));
    this.viewRoot.position.set(
      THREE.MathUtils.lerp(0.38, 0, this.aimBlend),
      THREE.MathUtils.lerp(-0.38, -0.255, this.aimBlend),
      THREE.MathUtils.lerp(-0.72, -0.57, this.aimBlend),
    );
    if (this.viewWeapon) {
      const baseRotation = this.viewWeapon.userData.viewmodelBaseRotation as {
        x: number; y: number; z: number;
      } | undefined;
      const swing = Math.sin(this.swingT * Math.PI) * 1.1;
      const kick = Math.sin(this.kickT * Math.PI) * 0.06;
      let reloadDrop = 0;
      let reloadRoll = 0;
      if (this.reloadT >= 0) {
        this.reloadT += dt;
        const progress = Math.min(1, this.reloadT / this.reloadDuration);
        reloadDrop = Math.sin(progress * Math.PI);
        reloadRoll = Math.sin(progress * Math.PI * 2) * 0.18 - reloadDrop * 0.55;
        if (progress >= 1) this.reloadT = -1;
      }
      this.viewWeapon.rotation.x = (baseRotation?.x ?? 0) - swing * 0.9 + reloadDrop * 0.35;
      this.viewWeapon.rotation.y = baseRotation?.y ?? -0.08;
      this.viewWeapon.rotation.z = (baseRotation?.z ?? 0) + reloadRoll;
      this.viewWeapon.position.x = reloadDrop * 0.08;
      this.viewWeapon.position.z = swing * -0.25 + kick + reloadDrop * 0.04;
      this.viewWeapon.position.y = Math.sin(time * 1.7) * 0.008 - reloadDrop * 0.16;
    }
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i];
      f.life -= dt;
      if (f.velocity) {
        f.obj.position.addScaledVector(f.velocity, dt);
        f.velocity.y -= 8 * dt;
      }
      if (f.expand) f.obj.scale.addScalar(f.expand * dt);
      if (f.spin) f.obj.rotation.y += f.spin * dt;
      const k = Math.max(0, f.life / f.maxLife);
      if (f.volumePop) {
        const width = 1 + Math.sin((1 - k) * Math.PI) * 0.24;
        f.obj.scale.set(width, 1 / (width * width), width);
      }
      const anyObj = f.obj as THREE.Mesh & THREE.PointLight;
      if ((anyObj as THREE.PointLight).isPointLight) anyObj.intensity = (f.lightIntensity ?? 1) * k;
      else if (f.fadeChildren) setObjectOpacity(f.obj, k);
      else if (anyObj.material) (anyObj.material as THREE.Material & { opacity: number }).opacity = k * 0.85;
      if (f.life <= 0) {
        this.scene.remove(f.obj);
        disposeObject(f.obj);
        this.fx.splice(i, 1);
      }
    }
  }

  stats(): { players: number; pickups: number; projectiles: number; effects: number } {
    return {
      players: this.players.size,
      pickups: this.pickups.size,
      projectiles: this.projectiles.size,
      effects: this.fx.length,
    };
  }

  dispose(): void {
    this.endVictoryCelebration();
    this.clearPlayers();
    this.clearPickups();
    this.clearProjectiles();
    this.clearSmokes();
    this.smokeGeometry.dispose();
    for (const f of this.fx) { this.scene.remove(f.obj); disposeObject(f.obj); }
    this.fx.length = 0;
    if (this.careBeacon) { this.scene.remove(this.careBeacon); disposeObject(this.careBeacon); }
    this.careBeacon = null;
    this.camera.remove(this.viewRoot);
    disposeObject(this.viewRoot);
    this.viewRoot.clear();
    this.viewWeapon = null;
    this.viewWeaponType = null;
  }
}
