// Dynamic scene objects: remote players (interpolated in main.ts), pickups,
// projectiles, care package, tracer/explosion FX and the first-person viewmodel.
import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_RADIUS, type WeaponType } from '@shared/constants';
import type { PickupInfo, SnapProjectile } from '@shared/protocol';

const PLAYER_COLORS = [0xe5484d, 0x3d9df2, 0x46c46e, 0xd8b43a, 0xb26ee0];

function makeNameSprite(name: string): THREE.Sprite {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 64;
  const g = cv.getContext('2d')!;
  g.font = 'bold 34px system-ui, sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 6;
  g.strokeStyle = 'rgba(0,0,0,0.85)';
  g.strokeText(name, 128, 44);
  g.fillStyle = '#fff';
  g.fillText(name, 128, 44);
  const tex = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(2.6, 0.65, 1);
  return sp;
}

interface PlayerRig {
  group: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  weapon: THREE.Mesh;
  currentWeapon: WeaponType | null;
}

function pickupColor(p: PickupInfo): number {
  if (p.item === 'care') return 0xff5533;
  if (p.item === 'crate') return p.tier === 'top' ? 0xe0a63c : p.tier === 'good' ? 0x58b7d8 : 0x8d7a5c;
  switch (p.item) {
    case 'machete': case 'spear': return 0xb9c4cc;
    case 'bow': return 0x8a6a3e;
    case 'pistol': case 'rifle': case 'shotgun': return 0x4d5a66;
    case 'grenade': return 0x4a7a4a;
    case 'bandageItem': return 0xf0f0f0;
    case 'plateItem': return 0x9db8e8;
    default: return 0xd8c185; // ammo
  }
}

function pickupGeometry(p: PickupInfo): THREE.BufferGeometry {
  if (p.item === 'care') return new THREE.BoxGeometry(1.4, 1.1, 1.4);
  if (p.item === 'crate') return new THREE.BoxGeometry(1.0, 0.8, 1.0);
  switch (p.item) {
    case 'machete': return new THREE.BoxGeometry(0.12, 0.75, 0.28);
    case 'spear': return new THREE.CylinderGeometry(0.05, 0.05, 1.6, 5);
    case 'bow': return new THREE.TorusGeometry(0.42, 0.05, 5, 12, Math.PI);
    case 'pistol': return new THREE.BoxGeometry(0.3, 0.28, 0.14);
    case 'rifle': return new THREE.BoxGeometry(0.95, 0.22, 0.12);
    case 'shotgun': return new THREE.BoxGeometry(0.85, 0.2, 0.14);
    case 'grenade': return new THREE.SphereGeometry(0.16, 8, 6);
    case 'bandageItem': return new THREE.BoxGeometry(0.34, 0.16, 0.34);
    case 'plateItem': return new THREE.BoxGeometry(0.42, 0.5, 0.09);
    default: return new THREE.BoxGeometry(0.26, 0.2, 0.26); // ammo boxes
  }
}

function viewmodelFor(weapon: WeaponType | 'none'): THREE.Group {
  const g = new THREE.Group();
  const metal = new THREE.MeshLambertMaterial({ color: 0x3e4a54 });
  const wood = new THREE.MeshLambertMaterial({ color: 0x7a5a38 });
  const skin = new THREE.MeshLambertMaterial({ color: 0xd8a878 });
  switch (weapon) {
    case 'machete': {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.14), new THREE.MeshLambertMaterial({ color: 0xc4ccd4 }));
      blade.position.set(0, 0.28, -0.12);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.18, 6), wood);
      g.add(blade, grip);
      break;
    }
    case 'spear': {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), wood);
      shaft.rotation.x = Math.PI / 2 - 0.15;
      shaft.position.z = -0.5;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), metal);
      tip.rotation.x = -Math.PI / 2 + 0.15;
      tip.position.set(0, 0.12, -1.22);
      g.add(shaft, tip);
      break;
    }
    case 'bow': {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 14, Math.PI * 0.9), wood);
      arc.rotation.z = Math.PI / 2 + 0.15;
      g.add(arc);
      break;
    }
    case 'pistol': {
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.3), metal);
      barrel.position.z = -0.12;
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.09), metal);
      grip.position.set(0, -0.1, 0.04);
      grip.rotation.x = 0.25;
      g.add(barrel, grip);
      break;
    }
    case 'rifle': {
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.85), metal);
      barrel.position.z = -0.3;
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.25), wood);
      stock.position.set(0, -0.03, 0.22);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), metal);
      mag.position.set(0, -0.12, -0.12);
      g.add(barrel, stock, mag);
      break;
    }
    case 'shotgun': {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.8, 8), metal);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = -0.3;
      const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 8), wood);
      pump.rotation.x = Math.PI / 2;
      pump.position.z = -0.35;
      pump.position.y = -0.04;
      g.add(barrel, pump);
      break;
    }
    case 'grenade': {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshLambertMaterial({ color: 0x4a7a4a }));
      g.add(ball);
      break;
    }
    default: { // fists
      const fist = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.16), skin);
      g.add(fist);
    }
  }
  return g;
}

export class Entities {
  private players = new Map<string, PlayerRig>();
  private pickups = new Map<string, THREE.Object3D>();
  private projectiles = new Map<number, THREE.Object3D>();
  private fx: { obj: THREE.Object3D; life: number; maxLife: number }[] = [];
  private careBeacon: THREE.Mesh | null = null;

  // first-person viewmodel
  readonly viewRoot = new THREE.Group();
  private viewWeapon: THREE.Group | null = null;
  private viewWeaponType: WeaponType | 'none' | null = null;
  private swingT = 1; // 0..1 melee swing animation
  private kickT = 1;  // fire recoil

  constructor(private scene: THREE.Scene, camera: THREE.Camera) {
    camera.add(this.viewRoot);
    this.viewRoot.position.set(0.32, -0.3, -0.55);
  }

  // ---------- remote players ----------
  ensurePlayer(id: string, name: string, colorIndex: number): void {
    if (this.players.has(id)) return;
    const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - 2 * PLAYER_RADIUS, 4, 10), mat,
    );
    body.position.y = PLAYER_HEIGHT / 2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8a878 }));
    head.position.y = 1.62;
    const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.6), new THREE.MeshLambertMaterial({ color: 0x39434c }));
    weapon.position.set(0.35, 1.25, -0.25);
    const label = makeNameSprite(name);
    label.position.y = 2.25;
    group.add(body, head, weapon, label);
    this.scene.add(group);
    this.players.set(id, { group, body, head, weapon, currentWeapon: null });
  }

  updatePlayer(id: string, x: number, y: number, z: number, yaw: number, pitch: number, alive: boolean, weapon: WeaponType): void {
    const rig = this.players.get(id);
    if (!rig) return;
    rig.group.visible = alive;
    rig.group.position.set(x, y, z);
    rig.group.rotation.y = yaw;
    rig.head.rotation.x = -pitch * 0.8;
    rig.weapon.visible = weapon !== 'fists';
    rig.weapon.rotation.x = -pitch;
  }

  removePlayer(id: string): void {
    const rig = this.players.get(id);
    if (rig) { this.scene.remove(rig.group); this.players.delete(id); }
  }

  clearPlayers(): void {
    for (const id of [...this.players.keys()]) this.removePlayer(id);
  }

  // ---------- pickups ----------
  addPickup(p: PickupInfo): void {
    if (this.pickups.has(p.id)) return;
    const mesh = new THREE.Mesh(pickupGeometry(p), new THREE.MeshLambertMaterial({ color: pickupColor(p) }));
    const holder = new THREE.Group();
    holder.add(mesh);
    holder.position.set(p.x, p.y + 0.45, p.z);
    holder.userData.baseY = p.y + 0.45;
    holder.userData.spin = p.item !== 'crate' && p.item !== 'care';
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

  removePickup(id: string): void {
    const m = this.pickups.get(id);
    if (m) { this.scene.remove(m); this.pickups.delete(id); }
  }

  clearPickups(): void {
    for (const id of [...this.pickups.keys()]) this.removePickup(id);
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
      if (!seen.has(id)) { this.scene.remove(obj); this.projectiles.delete(id); }
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
    this.fx.push({ obj: s, life: 0.35, maxLife: 0.35 });
    const light = new THREE.PointLight(0xffa030, 30, radius * 4);
    light.position.set(x, y + 1, z);
    this.scene.add(light);
    this.fx.push({ obj: light, life: 0.25, maxLife: 0.25 });
  }

  addMuzzleFlash(camera: THREE.Camera): void {
    const light = new THREE.PointLight(0xffd890, 8, 10);
    const p = new THREE.Vector3();
    camera.getWorldPosition(p);
    light.position.copy(p);
    this.scene.add(light);
    this.fx.push({ obj: light, life: 0.06, maxLife: 0.06 });
    this.kickT = 0;
  }

  meleeSwing(): void { this.swingT = 0; }

  // ---------- viewmodel ----------
  setViewWeapon(weapon: WeaponType | 'none'): void {
    if (weapon === this.viewWeaponType) return;
    if (this.viewWeapon) this.viewRoot.remove(this.viewWeapon);
    this.viewWeapon = viewmodelFor(weapon);
    this.viewWeaponType = weapon;
    this.viewRoot.add(this.viewWeapon);
  }

  setViewVisible(v: boolean): void { this.viewRoot.visible = v; }

  update(dt: number, time: number): void {
    for (const [, m] of this.pickups) {
      if (m.userData.spin) {
        m.rotation.y += dt * 1.6;
        m.position.y = m.userData.baseY + Math.sin(time * 2 + m.position.x) * 0.08;
      }
    }
    this.swingT = Math.min(1, this.swingT + dt * 3.2);
    this.kickT = Math.min(1, this.kickT + dt * 7);
    if (this.viewWeapon) {
      const swing = Math.sin(this.swingT * Math.PI) * 1.1;
      const kick = Math.sin(this.kickT * Math.PI) * 0.06;
      this.viewWeapon.rotation.x = -swing * 0.9;
      this.viewWeapon.position.z = swing * -0.25 + kick;
      this.viewWeapon.position.y = Math.sin(time * 1.7) * 0.008; // idle sway
    }
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i];
      f.life -= dt;
      const k = Math.max(0, f.life / f.maxLife);
      const anyObj = f.obj as THREE.Mesh & THREE.PointLight;
      if ((anyObj as THREE.PointLight).isPointLight) anyObj.intensity *= k;
      else if (anyObj.material) (anyObj.material as THREE.Material & { opacity: number }).opacity = k * 0.85;
      if (f.life <= 0) { this.scene.remove(f.obj); this.fx.splice(i, 1); }
    }
  }
}
