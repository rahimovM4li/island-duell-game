import * as THREE from 'three';
import { playerSkinColor, type PlayerSkinId } from '@shared/multiplayer';
import type { PartyMemberInfo } from '@shared/protocol';
import { gameAssets, type CharacterAsset } from './game-assets';

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
  else material.dispose();
};

const CHARACTER_FACING_CAMERA_Y = Math.PI + 0.42;
const MAX_LOBBY_MEMBERS = 5;

export interface LobbyMemberLabelAnchor {
  id: string;
  x: number;
  y: number;
  right: number;
  visible: boolean;
}

export class LobbyScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  private characters: {
    id: string;
    asset: CharacterAsset;
    baseX: number;
    baseY: number;
    baseZ: number;
    phase: number;
    label: THREE.Sprite;
  }[] = [];
  private currentSkin: PlayerSkinId;
  private readonly pedestalBases = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.78, 0.9, 0.18, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    MAX_LOBBY_MEMBERS,
  );
  private readonly pedestalInsets = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.68, 0.74, 0.08, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    MAX_LOBBY_MEMBERS,
  );
  private readonly nature = new THREE.Group();
  private readonly desktopDetails = new THREE.Group();
  private readonly clouds = new THREE.Group();
  private readonly reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  get memberCount(): number { return this.characters.length; }
  get pedestalCount(): number { return this.pedestalBases.count; }

  constructor(skin: PlayerSkinId) {
    this.currentSkin = skin;
    this.scene.background = new THREE.Color(0x86c3d7);
    this.scene.fog = new THREE.Fog(0xb6d9d5, 30, 72);
    this.camera.position.set(7.4, 4.2, 9.8);
    this.camera.lookAt(0, 1.65, 0);

    const hemisphere = new THREE.HemisphereLight(0xe7f8ff, 0x355539, 1.8);
    this.scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xffefc7, 2.7);
    sun.position.set(-7, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9;
    sun.shadow.camera.bottom = -9;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8bcfe4, 0.55);
    fill.position.set(10, 6, -8);
    this.scene.add(fill);

    this.pedestalBases.name = 'Lobby_PlayerPedestal_Bases';
    this.pedestalInsets.name = 'Lobby_PlayerPedestal_Insets';
    this.pedestalBases.count = 0;
    this.pedestalInsets.count = 0;
    this.pedestalBases.castShadow = true;
    this.pedestalBases.receiveShadow = true;
    this.pedestalInsets.receiveShadow = true;
    this.pedestalBases.frustumCulled = false;
    this.pedestalInsets.frustumCulled = false;
    this.scene.add(this.pedestalBases, this.pedestalInsets);

    this.addLandscape();
    this.scene.add(this.nature);
    this.nature.add(this.desktopDetails);
    this.scene.add(this.clouds);
    this.addIslandSilhouettes();
  }

  private addLandscape(): void {
    const skyGeometry = new THREE.SphereGeometry(76, 24, 12);
    const skyPositions = skyGeometry.getAttribute('position');
    const skyColors: number[] = [];
    const horizon = new THREE.Color(0xc4e0d4);
    const zenith = new THREE.Color(0x65aed0);
    const sample = new THREE.Color();
    for (let index = 0; index < skyPositions.count; index++) {
      const height = skyPositions.getY(index);
      const blend = THREE.MathUtils.smoothstep(height, -18, 45);
      sample.lerpColors(horizon, zenith, blend);
      skyColors.push(sample.r, sample.g, sample.b);
    }
    skyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(skyColors, 3));
    const sky = new THREE.Mesh(
      skyGeometry,
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    );
    sky.name = 'Lobby_SkyGradient';
    sky.position.y = -7;
    sky.renderOrder = -20;
    this.scene.add(sky);

    const water = new THREE.Mesh(
      new THREE.CircleGeometry(76, 64),
      new THREE.MeshLambertMaterial({ color: 0x4e9fac }),
    );
    water.name = 'Lobby_Water';
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.76;
    water.receiveShadow = true;
    this.scene.add(water);

    const islandBase = new THREE.Mesh(
      new THREE.CylinderGeometry(16.8, 19, 1.25, 48),
      [
        new THREE.MeshLambertMaterial({ color: 0x687a48 }),
        new THREE.MeshLambertMaterial({ color: 0x4e8b42 }),
        new THREE.MeshLambertMaterial({ color: 0x435f37 }),
      ],
    );
    islandBase.name = 'Lobby_IslandBase';
    islandBase.position.y = -0.66;
    islandBase.receiveShadow = true;
    this.scene.add(islandBase);

    const meadow = new THREE.Mesh(
      new THREE.CircleGeometry(12.4, 40),
      new THREE.MeshLambertMaterial({ color: 0x62a54f }),
    );
    meadow.name = 'Lobby_Meadow';
    meadow.rotation.x = -Math.PI / 2;
    meadow.rotation.z = -0.08;
    meadow.position.y = -0.025;
    meadow.receiveShadow = true;
    this.scene.add(meadow);

    const trailMaterial = new THREE.MeshLambertMaterial({ color: 0xa8ad91 });
    const trailGeometry = new THREE.CircleGeometry(0.72, 7);
    const trail = new THREE.Group();
    trail.name = 'Lobby_Trail';
    const trailPoints = [
      [0.35, 3.3, 1, 0.64, 0.14],
      [0.75, 4.65, 1.18, 0.56, -0.16],
      [1.12, 6.05, 0.9, 0.6, 0.23],
      [1.55, 7.42, 1.16, 0.57, -0.08],
      [2.12, 8.85, 0.94, 0.62, 0.17],
    ] as const;
    trailPoints.forEach(([x, z, scaleX, scaleY, rotation], index) => {
      const stone = new THREE.Mesh(trailGeometry, trailMaterial);
      stone.name = `Lobby_TrailStone_${index + 1}`;
      stone.rotation.x = -Math.PI / 2;
      stone.rotation.z = rotation;
      stone.scale.set(scaleX, scaleY, 1);
      stone.position.set(x, 0.015 + index * 0.0005, z);
      stone.receiveShadow = true;
      trail.add(stone);
    });
    this.scene.add(trail);

    const hillGeometry = new THREE.ConeGeometry(7.8, 2.4, 12);
    const hillMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x4d8351 }),
      new THREE.MeshLambertMaterial({ color: 0x5a8f57 }),
      new THREE.MeshLambertMaterial({ color: 0x47774c }),
    ];
    const hills = [
      [-17, -0.05, -30, 0.9, 0],
      [-4, -0.15, -34, 0.68, 1],
      [11, -0.08, -32, 0.84, 2],
      [23, -0.18, -35, 0.62, 1],
    ] as const;
    hills.forEach(([x, y, z, scale, material], index) => {
      const hill = new THREE.Mesh(hillGeometry, hillMaterials[material]);
      hill.name = `Lobby_DistantHill_${index + 1}`;
      hill.position.set(x, y, z);
      hill.scale.set(scale, scale * 0.8, scale);
      hill.rotation.y = index * 0.47;
      this.nature.add(hill);
    });

    const cloudGeometry = new THREE.IcosahedronGeometry(1, 1);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xf2f2df,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      fog: false,
    });
    const cloudPlacements = [
      [-12, 6.7, -30, 1.05],
      [5, 8.1, -35, 0.82],
      [17, 6.2, -32, 0.94],
    ] as const;
    cloudPlacements.forEach(([x, y, z, scale], index) => {
      const cloud = new THREE.Group();
      cloud.name = `Lobby_Cloud_${index + 1}`;
      const lobes = [
        [-1.05, 0, 0, 1.05],
        [0, 0.3, 0, 1.35],
        [1.15, -0.02, 0, 0.92],
        [0.45, -0.2, 0.32, 1.04],
      ] as const;
      lobes.forEach(([lx, ly, lz, lobeScale]) => {
        const lobe = new THREE.Mesh(cloudGeometry, cloudMaterial);
        lobe.position.set(lx, ly, lz);
        lobe.scale.set(lobeScale * 1.35, lobeScale * 0.65, lobeScale);
        cloud.add(lobe);
      });
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(scale);
      cloud.userData.baseX = x;
      this.clouds.add(cloud);
    });
  }

  private addIslandSilhouettes(): void {
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x62432a });
    const pineDark = new THREE.MeshLambertMaterial({ color: 0x205b38 });
    const pineLight = new THREE.MeshLambertMaterial({ color: 0x397a43 });
    const broadleaf = new THREE.MeshLambertMaterial({ color: 0x4f8c4e });
    const pineTierGeometry = new THREE.ConeGeometry(0.92, 1.4, 7);
    const trunkGeometry = new THREE.CylinderGeometry(0.17, 0.25, 2.3, 7);
    const crownGeometry = new THREE.IcosahedronGeometry(1.2, 1);

    const makePine = (): THREE.Group => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.05;
      group.add(trunk);
      [1.55, 2.18, 2.76].forEach((height, index) => {
        const tier = new THREE.Mesh(pineTierGeometry, index === 1 ? pineLight : pineDark);
        tier.position.y = height;
        tier.scale.setScalar(1 - index * 0.17);
        group.add(tier);
      });
      return group;
    };

    const makeBroadleaf = (): THREE.Group => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.12;
      group.add(trunk);
      const crown = new THREE.Mesh(crownGeometry, broadleaf);
      crown.scale.set(1.15, 0.86, 1);
      crown.position.y = 2.65;
      group.add(crown);
      return group;
    };

    const coreTrees = [
      [-8.5, -8, 1.02, 'pine'],
      [-2, -12.5, 0.88, 'broadleaf'],
      [6.5, -11.5, 0.98, 'pine'],
      [10, -8, 0.82, 'broadleaf'],
    ] as const;
    coreTrees.forEach(([x, z, scale, type], index) => {
      const group = type === 'pine' ? makePine() : makeBroadleaf();
      group.name = `Lobby_BackgroundTree_${index + 1}`;
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      group.rotation.y = index * 0.67;
      this.nature.add(group);
    });

    const extraTrees = [
      [-14, -2.5, 1.06, 'broadleaf'],
      [-12, 3.5, 0.84, 'pine'],
      [15, -2.5, 0.94, 'pine'],
      [11, -5.5, 0.72, 'broadleaf'],
      [-7, -5, 0.74, 'pine'],
    ] as const;
    extraTrees.forEach(([x, z, scale, type], index) => {
      const group = type === 'pine' ? makePine() : makeBroadleaf();
      group.name = `Lobby_DetailTree_${index + 1}`;
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      group.rotation.y = index * 0.83;
      this.desktopDetails.add(group);
    });

    const rockGeometry = new THREE.DodecahedronGeometry(0.65, 0);
    const rockMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x71827a }),
      new THREE.MeshLambertMaterial({ color: 0x87928a }),
    ];
    const rocks = [
      [-8.2, -4.6, 1.1, 0],
      [6.4, -8.4, 0.82, 1],
      [11.8, -5.1, 1.3, 0],
      [-13.2, -1.5, 0.88, 1],
      [13.5, 1.8, 0.7, 1],
    ] as const;
    rocks.forEach(([x, z, scale, material], index) => {
      const rock = new THREE.Mesh(rockGeometry, rockMaterials[material]);
      rock.name = `Lobby_Rock_${index + 1}`;
      rock.position.set(x, scale * 0.42, z);
      rock.scale.set(scale, scale * 0.72, scale * 0.86);
      rock.rotation.set(index * 0.14, index * 0.49, index * 0.1);
      rock.receiveShadow = true;
      (index < 3 ? this.nature : this.desktopDetails).add(rock);
    });

    const bushGeometry = new THREE.IcosahedronGeometry(0.62, 1);
    const bushMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x347044 }),
      new THREE.MeshLambertMaterial({ color: 0x4b8449 }),
    ];
    const bushes = [
      [-5.8, -7.2, 0.95],
      [4.2, -8.6, 0.8],
      [-9.8, -2.2, 0.74],
      [9.4, -4.8, 0.88],
      [-12.4, 1.7, 0.72],
      [12.8, 1.2, 0.76],
    ] as const;
    bushes.forEach(([x, z, scale], index) => {
      const bush = new THREE.Group();
      bush.name = `Lobby_Bush_${index + 1}`;
      const left = new THREE.Mesh(bushGeometry, bushMaterials[index % bushMaterials.length]);
      left.position.set(-0.42, 0.48, 0);
      left.scale.set(1, 0.74, 0.9);
      const right = new THREE.Mesh(bushGeometry, bushMaterials[(index + 1) % bushMaterials.length]);
      right.position.set(0.42, 0.42, 0.12);
      right.scale.set(0.88, 0.66, 0.82);
      bush.add(left, right);
      bush.position.set(x, 0, z);
      bush.scale.setScalar(scale);
      bush.rotation.y = index * 0.78;
      (index < 4 ? this.nature : this.desktopDetails).add(bush);
    });
  }

  loadCharacter(): boolean {
    return this.setPartyMembers([{
      id: 'local-preview',
      name: '',
      skin: this.currentSkin,
      isHost: false,
      connected: true,
    }]);
  }

  setSkin(skin: PlayerSkinId): void {
    if (skin === this.currentSkin && this.characters.length > 0) return;
    this.currentSkin = skin;
    this.loadCharacter();
  }

  setPartyMembers(members: PartyMemberInfo[], localMemberId?: string): boolean {
    const incoming = members.length > 0
      ? members.slice(0, 5)
      : [{
          id: 'local-preview',
          name: '',
          skin: this.currentSkin,
          isHost: false,
          connected: true,
        }];
    const localIndex = localMemberId
      ? incoming.findIndex((member) => member.id === localMemberId)
      : 0;
    const roster = localIndex > 0
      ? [incoming[localIndex], ...incoming.filter((_, index) => index !== localIndex)]
      : incoming;
    const positions = this.lineupPositions(roster.length);
    const next = roster.map((member, index) => {
      const asset = gameAssets.cloneCharacter(playerSkinColor(member.skin));
      if (!asset) return null;
      const { x, z } = positions[index];
      const lineupScale = roster.length >= 5
        ? 0.94
        : roster.length === 4 ? 1 : roster.length === 3 ? 1.07 : roster.length === 2 ? 1.13 : 1.2;
      const scale = lineupScale + (index === 0 ? 0.04 : 0);
      asset.group.position.set(x, 0.26, z);
      asset.group.rotation.y = CHARACTER_FACING_CAMERA_Y + x * -0.025;
      asset.group.scale.setScalar(scale);
      asset.group.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      const label = this.makeNameLabel(member.name, member.isHost, member.connected);
      const labelWidth = roster.length >= 5
        ? 1.1
        : roster.length === 4 ? 1.3 : roster.length === 3 ? 1.62 : roster.length === 2 ? 2 : 2.5;
      label.scale.set(labelWidth, labelWidth / 4.54, 1);
      label.position.set(x, 0.26 + 3.25 * scale, z + 0.08);
      this.scene.add(asset.group, label);
      return {
        id: member.id,
        asset,
        baseX: x,
        baseY: 0.26,
        baseZ: z,
        phase: index * 1.17,
        label,
      };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    if (next.length !== roster.length) {
      for (const entry of next) {
        this.scene.remove(entry.asset.group, entry.label);
        entry.label.material.map?.dispose();
        entry.label.material.dispose();
      }
      return false;
    }
    this.clearCharacters();
    this.characters = next;
    this.updatePedestals(positions);
    return true;
  }

  private lineupPositions(count: number): Array<{ x: number; z: number }> {
    const formations: Record<number, Array<{ side: number; front: number }>> = {
      1: [{ side: 0, front: 0.72 }],
      2: [{ side: 0, front: 0.72 }, { side: 2, front: -0.18 }],
      3: [
        { side: 0, front: 0.72 },
        { side: -1.82, front: -0.28 },
        { side: 1.82, front: -0.28 },
      ],
      4: [
        { side: 0, front: 0.78 },
        { side: -2.35, front: -0.42 },
        { side: -0.92, front: -0.72 },
        { side: 1.55, front: -0.48 },
      ],
      5: [
        { side: 0, front: 0.82 },
        { side: -2.58, front: -0.45 },
        { side: -1.26, front: -0.76 },
        { side: 1.26, front: -0.76 },
        { side: 2.58, front: -0.45 },
      ],
    };
    const cameraDistance = Math.hypot(this.camera.position.x, this.camera.position.z);
    const towardCameraX = this.camera.position.x / cameraDistance;
    const towardCameraZ = this.camera.position.z / cameraDistance;
    const screenRightX = towardCameraZ;
    const screenRightZ = -towardCameraX;
    return formations[Math.max(1, Math.min(MAX_LOBBY_MEMBERS, count))].map(({ side, front }) => ({
      x: screenRightX * side + towardCameraX * front,
      z: screenRightZ * side + towardCameraZ * front,
    }));
  }

  private updatePedestals(positions: Array<{ x: number; z: number }>): void {
    const transform = new THREE.Object3D();
    const localBase = new THREE.Color(0x607979);
    const remoteBase = new THREE.Color(0x516a6c);
    const localInset = new THREE.Color(0x99b7aa);
    const remoteInset = new THREE.Color(0x82a49a);
    this.pedestalBases.count = positions.length;
    this.pedestalInsets.count = positions.length;
    positions.forEach(({ x, z }, index) => {
      transform.position.set(x, 0.09, z);
      transform.updateMatrix();
      this.pedestalBases.setMatrixAt(index, transform.matrix);
      this.pedestalBases.setColorAt(index, index === 0 ? localBase : remoteBase);
      transform.position.y = 0.22;
      transform.updateMatrix();
      this.pedestalInsets.setMatrixAt(index, transform.matrix);
      this.pedestalInsets.setColorAt(index, index === 0 ? localInset : remoteInset);
    });
    this.pedestalBases.instanceMatrix.needsUpdate = true;
    this.pedestalInsets.instanceMatrix.needsUpdate = true;
    if (this.pedestalBases.instanceColor) this.pedestalBases.instanceColor.needsUpdate = true;
    if (this.pedestalInsets.instanceColor) this.pedestalInsets.instanceColor.needsUpdate = true;
  }

  memberLayout(): Array<{ id: string; x: number; z: number; local: boolean }> {
    return this.characters.map((entry, index) => ({
      id: entry.id,
      x: entry.baseX,
      z: entry.baseZ,
      local: index === 0,
    }));
  }

  projectMemberLabels(width: number, height: number): LobbyMemberLabelAnchor[] {
    this.camera.updateMatrixWorld();
    const cameraRight = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    return this.characters.map((entry) => {
      const center = entry.label.getWorldPosition(new THREE.Vector3());
      const right = center.clone().addScaledVector(cameraRight, entry.label.scale.x * 0.42);
      center.project(this.camera);
      right.project(this.camera);
      return {
        id: entry.id,
        x: (center.x * 0.5 + 0.5) * width,
        y: (-center.y * 0.5 + 0.5) * height,
        right: (right.x * 0.5 + 0.5) * width,
        visible: center.z >= -1 && center.z <= 1,
      };
    });
  }

  private makeNameLabel(name: string, host: boolean, connected: boolean): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(7, 17, 22, .84)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 96, 22);
    ctx.fill();
    ctx.strokeStyle = host ? '#ffc45c' : 'rgba(231,244,247,.28)';
    ctx.lineWidth = host ? 5 : 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 38px Segoe UI, sans-serif';
    ctx.fillStyle = connected ? '#f4f7f8' : '#9aa9b2';
    ctx.fillText(`${host ? '★ ' : ''}${name || 'Du'}`, 256, 57);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    }));
    sprite.scale.set(2.5, 0.55, 1);
    sprite.renderOrder = 10;
    return sprite;
  }

  private clearCharacters(): void {
    for (const entry of this.characters) {
      this.scene.remove(entry.asset.group, entry.label);
      entry.asset.group.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) disposeMaterial(mesh.material);
      });
      entry.label.material.map?.dispose();
      entry.label.material.dispose();
    }
    this.characters = [];
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    const compact = width < 720;
    this.desktopDetails.visible = !compact;
    this.camera.position.set(compact ? 6.2 : 7.4, compact ? 4.7 : 4.2, compact ? 11.8 : 9.8);
    this.camera.lookAt(0, compact ? 1.8 : 1.65, 0);
  }

  update(elapsed: number): void {
    if (this.characters.length === 0) return;
    for (const entry of this.characters) {
      const breathe = this.reduceMotion ? 0 : Math.sin(elapsed * 1.55 + entry.phase);
      entry.asset.group.position.y = entry.baseY + breathe * 0.018;
      entry.asset.group.rotation.y = CHARACTER_FACING_CAMERA_Y + entry.baseX * -0.025
        + (this.reduceMotion ? 0 : Math.sin(elapsed * 0.32 + entry.phase) * 0.025);
      entry.asset.armLeft.rotation.x = 0.04 + breathe * 0.025;
      entry.asset.armRight.rotation.x = -0.04 - breathe * 0.025;
    }
    if (!this.reduceMotion) {
      this.clouds.children.forEach((cloud, index) => {
        cloud.position.x = Number(cloud.userData.baseX)
          + Math.sin(elapsed * 0.055 + index * 1.9) * (0.6 + index * 0.13);
      });
    }
  }
}
