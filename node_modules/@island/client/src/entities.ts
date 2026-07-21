// Dynamic scene objects: remote players (interpolated in main.ts), pickups,
// projectiles, care package, tracer/explosion FX and the first-person viewmodel.
import * as THREE from 'three';
import { WEAPONS, type WeaponType } from '@shared/constants';
import type { PickupInfo, SnapProjectile } from '@shared/protocol';
import { deriveSeed, mulberry32, type Rng } from '@shared/rng';

const PLAYER_COLORS = [0xe5484d, 0x3d9df2, 0x46c46e, 0xd8b43a, 0xb26ee0];
const HIT_FLASH_BODY = new THREE.Color(0xffffff);
const HIT_FLASH_HEAD = new THREE.Color(0xffe7a3);

interface PlayerRig {
  group: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  weapon: THREE.Group;
  currentWeapon: WeaponType | null;
  crouchTarget: number;
  crouchBlend: number;
  aiming: boolean;
  flashT: number;
  bodyBaseEmissive: THREE.Color;
  headBaseEmissive: THREE.Color;
}

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
  grenade: { label: 'Granate', color: 0x83c66b, glyph: '!' },
  bandageItem: { label: 'Verband', color: 0xff6b6f, glyph: '+' },
  plateItem: { label: 'Panzerplatte', color: 0x70d7e8, glyph: 'A' },
  arrowBundle: { label: 'Pfeile', color: 0xd9a441, glyph: '↟' },
  pistolAmmo: { label: 'Pistolen-Munition', color: 0x65b7ee, glyph: '•' },
  rifleAmmo: { label: 'Gewehr-Munition', color: 0xb68cff, glyph: '•' },
  shellAmmo: { label: 'Schrot-Munition', color: 0xff8c56, glyph: '•' },
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

/** Readable low-poly silhouettes. All ranged weapons point toward -Z. */
function weaponModel(weapon: WeaponType | 'none'): THREE.Group {
  const g = new THREE.Group();
  const dark = 0x26313a, steel = 0xc4ced5, wood = 0x7a5030, grip = 0x171d22;
  switch (weapon) {
    case 'machete':
      addBox(g, [0.09, 0.62, 0.18], [0, 0.28, -0.04], steel, [0, 0, -0.12]);
      addCylinder(g, 0.055, 0.25, [0.07, -0.17, 0.02], grip, [0, 0, -0.12], 7);
      addBox(g, [0.22, 0.04, 0.12], [0.05, -0.03, 0], 0xd9a441, [0, 0, -0.12]);
      break;
    case 'spear':
      addCylinder(g, 0.035, 1.72, [0, 0, -0.53], wood, [Math.PI / 2, 0, 0], 7);
      {
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.32, 5), material(steel));
        tip.rotation.x = -Math.PI / 2; tip.position.z = -1.55; tip.castShadow = true; g.add(tip);
      }
      break;
    case 'bow': {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 6, 22, Math.PI * 1.35), material(0x9a672f));
      arc.rotation.set(0, 0, -Math.PI * 0.68); arc.castShadow = true; g.add(arc);
      const points = [new THREE.Vector3(0, -0.46, 0), new THREE.Vector3(-0.13, 0, 0), new THREE.Vector3(0, 0.46, 0)];
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xe8e2d4 })));
      addCylinder(g, 0.018, 0.9, [0.05, 0, -0.08], 0xc9b382, [0, 0, 0], 5);
      break;
    }
    case 'pistol':
      addBox(g, [0.15, 0.16, 0.5], [0, 0.02, -0.16], dark);
      addBox(g, [0.12, 0.28, 0.16], [0, -0.18, -0.01], grip, [-0.18, 0, 0]);
      addBox(g, [0.17, 0.045, 0.28], [0, 0.13, -0.22], 0x657580);
      break;
    case 'rifle':
      addBox(g, [0.15, 0.18, 0.92], [0, 0, -0.27], dark);
      addCylinder(g, 0.035, 0.58, [0, 0.05, -0.98], steel, [Math.PI / 2, 0, 0], 8);
      addBox(g, [0.14, 0.22, 0.38], [0, -0.02, 0.42], wood, [0.08, 0, 0]);
      addBox(g, [0.11, 0.28, 0.16], [0, -0.21, -0.24], grip, [-0.18, 0, 0]);
      addBox(g, [0.09, 0.09, 0.2], [0, 0.18, -0.2], 0xb68cff);
      break;
    case 'shotgun':
      addCylinder(g, 0.055, 1.15, [0, 0.07, -0.38], dark, [Math.PI / 2, 0, 0], 10);
      addBox(g, [0.16, 0.17, 0.5], [0, -0.01, 0.33], wood, [0.08, 0, 0]);
      addCylinder(g, 0.085, 0.34, [0, 0.02, -0.42], 0xa36c35, [Math.PI / 2, 0, 0], 8);
      break;
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

function crateModel(color: number, care = false): THREE.Group {
  const g = new THREE.Group();
  const w = care ? 1.35 : 1.05, h = care ? 0.9 : 0.68, d = care ? 1.08 : 0.86;
  addBox(g, [w, h, d], [0, h / 2, 0], color);
  addBox(g, [w + 0.06, 0.12, d + 0.06], [0, h + 0.03, 0], care ? 0x39434a : 0x72502f);
  addBox(g, [0.12, h + 0.04, d + 0.08], [-w * 0.3, h / 2, 0], 0x2d3940);
  addBox(g, [0.12, h + 0.04, d + 0.08], [w * 0.3, h / 2, 0], 0x2d3940);
  addBox(g, [0.22, 0.2, 0.08], [0, h * 0.62, d / 2 + 0.05], care ? 0xffc247 : 0xd8aa61);
  return g;
}

function ammoModel(color: number, shells = false): THREE.Group {
  const g = new THREE.Group();
  addBox(g, [0.46, 0.26, 0.34], [0, 0.13, 0], 0x303c43);
  addBox(g, [0.48, 0.07, 0.36], [0, 0.28, 0], color);
  if (shells) {
    for (let i = -1; i <= 1; i++) addCylinder(g, 0.035, 0.28, [i * 0.1, 0.43, 0], 0xc54739, [Math.PI / 2, 0, 0], 8);
  }
  return g;
}

function pickupModel(p: PickupInfo): THREE.Group {
  if (p.item === 'crate') {
    const color = p.tier === 'top' ? 0xc98a2e : p.tier === 'good' ? 0x397f9f : 0x6d604d;
    return crateModel(color);
  }
  if (p.item === 'care') return crateModel(0xb94739, true);
  if (p.item in WEAPON_MODEL_KEYS) return weaponModel(p.item as WeaponType);
  const g = new THREE.Group();
  if (p.item === 'bandageItem') {
    addBox(g, [0.5, 0.22, 0.42], [0, 0.11, 0], 0xf1eee7);
    addBox(g, [0.14, 0.05, 0.3], [0, 0.245, 0], 0xd84c52);
    addBox(g, [0.34, 0.05, 0.12], [0, 0.245, 0], 0xd84c52);
  } else if (p.item === 'plateItem') {
    addBox(g, [0.46, 0.58, 0.12], [0, 0.3, 0], 0x5c9ead);
    addBox(g, [0.54, 0.13, 0.16], [0, 0.54, 0], 0x9ce7ee);
    addBox(g, [0.12, 0.3, 0.16], [0, 0.3, 0], 0x304e5b);
  } else if (p.item === 'arrowBundle') {
    for (let i = -1; i <= 1; i++) {
      addCylinder(g, 0.025, 0.92, [i * 0.09, 0.28, 0], 0xc9b382, [0, 0, 0.08 * i], 5);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 5), material(0xc4ced5));
      tip.position.set(i * 0.09, 0.82, 0); g.add(tip);
    }
    addBox(g, [0.34, 0.09, 0.12], [0, 0.25, 0], 0x8b5530);
  } else {
    return ammoModel(
      p.item === 'pistolAmmo' ? 0x65b7ee : p.item === 'rifleAmmo' ? 0xb68cff : 0xff8c56,
      p.item === 'shellAmmo',
    );
  }
  return g;
}

const WEAPON_MODEL_KEYS: Record<WeaponType, true> = {
  fists: true, machete: true, spear: true, bow: true, pistol: true,
  rifle: true, shotgun: true, grenade: true,
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
  const scale = weapon === 'rifle' || weapon === 'shotgun' || weapon === 'spear'
    ? 0.36 : weapon === 'bow' || weapon === 'machete' ? 0.46 : 0.54;
  g.scale.setScalar(scale);
  g.rotation.y = -0.08;
  return g;
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const renderable = obj as THREE.Mesh & THREE.Sprite;
    if (!renderable.isSprite) renderable.geometry?.dispose();
    const mats = Array.isArray(renderable.material)
      ? renderable.material : renderable.material ? [renderable.material] : [];
    for (const mat of mats) {
      const withMap = mat as THREE.Material & { map?: THREE.Texture };
      withMap.map?.dispose();
      mat.dispose();
    }
  });
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

  constructor(private scene: THREE.Scene, private camera: THREE.Camera, seed = 1) {
    this.rng = mulberry32(deriveSeed(seed, 'client-entity-fx'));
    camera.add(this.viewRoot);
    this.viewRoot.position.set(0.38, -0.38, -0.72);
  }

  // ---------- remote players ----------
  ensurePlayer(id: string, colorIndex: number): void {
    if (this.players.has(id)) return;
    const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });
    const darkMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.62) });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.78, 0.38), mat);
    body.position.y = 1.08;
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.32), darkMat);
    hips.position.y = 0.64;
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.64, 7), darkMat);
    leftLeg.position.set(-0.17, 0.31, 0);
    const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.17;
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.62, 7), mat);
    leftArm.position.set(-0.39, 1.08, 0); leftArm.rotation.z = -0.12;
    const rightArm = leftArm.clone(); rightArm.position.x = 0.39; rightArm.rotation.z = 0.12;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8a878 }));
    head.position.y = 1.67;
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.2), darkMat);
    backpack.position.set(0, 1.08, 0.28);
    const weapon = new THREE.Group();
    weapon.position.set(0.34, 1.22, -0.18);
    weapon.scale.setScalar(0.48);
    for (const mesh of [body, hips, leftLeg, rightLeg, leftArm, rightArm, head, backpack]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    group.add(body, hips, leftLeg, rightLeg, leftArm, rightArm, head, backpack, weapon);
    this.scene.add(group);
    this.players.set(id, {
      group, body, head, weapon, currentWeapon: null,
      crouchTarget: 0, crouchBlend: 0, aiming: false,
      flashT: 0,
      bodyBaseEmissive: (body.material as THREE.MeshLambertMaterial).emissive.clone(),
      headBaseEmissive: (head.material as THREE.MeshLambertMaterial).emissive.clone(),
    });
  }

  updatePlayer(
    id: string, x: number, y: number, z: number, yaw: number, pitch: number,
    alive: boolean, weapon: WeaponType, sneaking: boolean, aiming: boolean,
  ): void {
    const rig = this.players.get(id);
    if (!rig) return;
    rig.group.visible = alive;
    rig.group.position.set(x, y, z);
    rig.group.rotation.y = yaw;
    rig.crouchTarget = sneaking ? 1 : 0;
    rig.aiming = aiming;
    rig.head.rotation.x = -pitch * 0.8;
    if (rig.currentWeapon !== weapon) {
      for (const child of [...rig.weapon.children]) disposeObject(child);
      rig.weapon.clear();
      if (weapon !== 'fists') rig.weapon.add(weaponModel(weapon));
      rig.currentWeapon = weapon;
    }
    rig.weapon.visible = weapon !== 'fists';
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
          const m = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4),
            new THREE.MeshLambertMaterial({ color: 0xc9b382 }),
          );
          m.rotation.x = Math.PI / 2;
          const holder = new THREE.Group();
          holder.add(m);
          obj = holder;
        } else {
          obj = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color: 0x4a7a4a }));
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
      rig.group.scale.y = THREE.MathUtils.lerp(1, 0.68, rig.crouchBlend);
      rig.weapon.position.y = THREE.MathUtils.lerp(1.22, 1.3, rig.aiming ? 1 : 0);
      rig.flashT = Math.max(0, rig.flashT - dt);
      const flash = Math.min(1, rig.flashT / 0.08);
      const bodyMat = rig.body.material as THREE.MeshLambertMaterial;
      const headMat = rig.head.material as THREE.MeshLambertMaterial;
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
      this.viewWeapon.rotation.x = -swing * 0.9 + reloadDrop * 0.35;
      this.viewWeapon.rotation.z = reloadRoll;
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
    this.clearPlayers();
    this.clearPickups();
    this.clearProjectiles();
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
