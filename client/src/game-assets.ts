import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { WeaponType } from '@shared/constants';
import type { PoiKind } from '@shared/worldgen';

const WEAPON_NAMES = [
  'fists', 'machete', 'spear', 'bow', 'pistol', 'rifle', 'shotgun', 'sniper',
  'grenade', 'smoke', 'flash',
] as const satisfies readonly WeaponType[];
const LANDMARK_NAMES = ['wreck', 'watchtower', 'bunker'] as const satisfies readonly PoiKind[];
const PROP_NAMES = [
  'crate_common', 'crate_good', 'crate_top', 'care', 'bandage', 'plate', 'arrow_bundle',
  'pistol_ammo', 'rifle_ammo', 'shell_ammo', 'sniper_ammo', 'projectile_arrow',
] as const;
const ENVIRONMENT_NAMES = [
  'tree_pine', 'tree_broadleaf', 'tree_palm',
  'rock_boulder', 'rock_slab', 'rock_cluster',
  'bush', 'grass', 'stump', 'rock_chips', 'rubble', 'barrel',
  'brazier', 'torch', 'spawn_marker', 'ruin_wall', 'ruin_cap',
] as const;
const ASSET_REVISION = '2026-07-22-night-and-melee-v3';

type AssetWeapon = (typeof WEAPON_NAMES)[number];
type AssetLandmark = (typeof LANDMARK_NAMES)[number];
export type AssetProp = (typeof PROP_NAMES)[number];
export type AssetEnvironment = (typeof ENVIRONMENT_NAMES)[number];

export interface CharacterAsset {
  group: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  weaponSocket: THREE.Group;
  armLeft: THREE.Object3D;
  armRight: THREE.Object3D;
  legLeft: THREE.Object3D;
  legRight: THREE.Object3D;
}

function publicAsset(path: string): string {
  const url = new URL(`assets/${path}`, document.baseURI);
  url.searchParams.set('v', ASSET_REVISION);
  return url.toString();
}

function collectTemplates<T extends string>(
  root: THREE.Object3D,
  names: readonly T[],
  prefix: string,
): Map<T, THREE.Object3D> {
  const templates = new Map<T, THREE.Object3D>();
  for (const name of names) {
    const object = root.getObjectByName(`${prefix}_${name}`);
    if (!object) throw new Error(`Asset template missing: ${prefix}_${name}`);
    templates.set(name, object);
  }
  return templates;
}

/**
 * Blender object names are scene-global, so repeated child names such as
 * `visual_lod0` are exported as `visual_lod0.001`, `.002`, … even though they
 * live under different asset roots. Resolve the semantic name inside the root
 * instead of accidentally falling back or rendering both LODs at once.
 */
export function findSemanticChild(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  return root.children.find((child) => child.name === name || child.name.startsWith(`${name}.`));
}

/**
 * Match-scoped instances share geometry and one atlas texture, while each
 * instance gets its own tiny material so pickup fades never affect other items.
 */
class GameAssetLibrary {
  private loadPromise: Promise<boolean> | null = null;
  private weapons = new Map<AssetWeapon, THREE.Object3D>();
  private landmarks = new Map<AssetLandmark, THREE.Object3D>();
  private props = new Map<AssetProp, THREE.Object3D>();
  private environment = new Map<AssetEnvironment, THREE.Object3D>();
  private character: THREE.Object3D | null = null;
  private atlasMaterial: THREE.MeshStandardMaterial | null = null;

  preload(renderer: THREE.WebGLRenderer): Promise<boolean> {
    if (this.atlasMaterial) return Promise.resolve(true);
    if (!this.loadPromise) this.loadPromise = this.load(renderer);
    return this.loadPromise;
  }

  private async load(renderer: THREE.WebGLRenderer): Promise<boolean> {
    let texture: THREE.Texture | null = null;
    try {
      texture = await new THREE.TextureLoader().loadAsync(publicAsset('island-atlas.png'));
      texture.name = 'island-atlas';
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      texture.userData.assetShared = true;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const [weaponGltf, propGltf, environmentGltf, landmarkGltf, characterGltf] = await Promise.all([
        loader.loadAsync(publicAsset('weapons.glb')),
        loader.loadAsync(publicAsset('props.glb')),
        loader.loadAsync(publicAsset('environment.glb')),
        loader.loadAsync(publicAsset('landmarks.glb')),
        loader.loadAsync(publicAsset('character.glb')),
      ]);

      const baseMaterial = new THREE.MeshStandardMaterial({
        name: 'island-atlas-material',
        map: texture,
        color: 0xffffff,
        roughness: 0.78,
        metalness: 0.12,
        flatShading: true,
      });
      this.prepareTemplates(weaponGltf.scene, baseMaterial);
      this.prepareTemplates(propGltf.scene, baseMaterial);
      this.prepareTemplates(environmentGltf.scene, baseMaterial);
      this.prepareTemplates(landmarkGltf.scene, baseMaterial);
      this.prepareTemplates(characterGltf.scene, baseMaterial);
      this.weapons = collectTemplates(weaponGltf.scene, WEAPON_NAMES, 'weapon');
      this.props = collectTemplates(propGltf.scene, PROP_NAMES, 'prop');
      this.environment = collectTemplates(environmentGltf.scene, ENVIRONMENT_NAMES, 'env');
      this.landmarks = collectTemplates(landmarkGltf.scene, LANDMARK_NAMES, 'poi');
      this.character = characterGltf.scene.getObjectByName('player_survivor') ?? null;
      if (!this.character) throw new Error('Asset template missing: player_survivor');
      baseMaterial.userData.assetShared = true;
      this.atlasMaterial = baseMaterial;
      return true;
    } catch (error) {
      texture?.dispose();
      this.weapons.clear();
      this.props.clear();
      this.environment.clear();
      this.landmarks.clear();
      this.character = null;
      console.warn('Compact game assets unavailable; using procedural fallback.', error);
      return false;
    }
  }

  private prepareTemplates(root: THREE.Object3D, material: THREE.Material): void {
    const oldMaterials = new Set<THREE.Material>();
    const oldTextures = new Set<THREE.Texture>();
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((old) => {
        oldMaterials.add(old);
        const withMap = old as THREE.Material & { map?: THREE.Texture };
        if (withMap.map) oldTextures.add(withMap.map);
      });
      mesh.material = material;
      mesh.geometry.userData.assetShared = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    oldMaterials.forEach((old) => old.dispose());
    oldTextures.forEach((old) => old.dispose());
  }

  private clone(template: THREE.Object3D | undefined): THREE.Group | null {
    if (!template || !this.atlasMaterial) return null;
    const model = template.clone(true) as THREE.Group;
    const material = this.instanceMaterial();
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) mesh.material = material;
    });
    model.userData.compactAsset = true;
    return model;
  }

  private instanceMaterial(): THREE.MeshStandardMaterial {
    const material = this.atlasMaterial!.clone();
    material.userData.assetShared = false;
    return material;
  }

  cloneWeapon(weapon: WeaponType | 'none'): THREE.Group | null {
    if (weapon === 'none') return null;
    return this.clone(this.weapons.get(weapon as AssetWeapon));
  }

  cloneLandmark(poi: PoiKind): THREE.Object3D | null {
    if (poi === 'ruins') return null;
    const template = this.landmarks.get(poi as AssetLandmark);
    if (!template || !this.atlasMaterial) return null;
    const lod0 = findSemanticChild(template, 'visual_lod0');
    const lod1 = findSemanticChild(template, 'visual_lod1');
    if (!lod0 || !lod1) return this.clone(template);
    const material = this.instanceMaterial();
    const prepare = (source: THREE.Object3D): THREE.Object3D => {
      const object = source.clone(true);
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) mesh.material = material;
      });
      return object;
    };
    const model = new THREE.LOD();
    model.addLevel(prepare(lod0), 0);
    model.addLevel(prepare(lod1), 55);
    model.userData.compactAsset = true;
    return model;
  }

  cloneProp(prop: AssetProp): THREE.Group | null {
    return this.clone(this.props.get(prop));
  }

  cloneEnvironment(asset: AssetEnvironment, lod = 0): THREE.Group | null {
    const template = this.environment.get(asset);
    const visual = template ? (findSemanticChild(template, `visual_lod${lod}`)
      ?? findSemanticChild(template, 'visual_lod0')) : undefined;
    return this.clone(visual);
  }

  createEnvironmentInstances(
    asset: AssetEnvironment, count: number, lod = 0, doubleSided = false,
  ): THREE.InstancedMesh | null {
    const template = this.environment.get(asset);
    const visual = template ? (findSemanticChild(template, `visual_lod${lod}`)
      ?? findSemanticChild(template, 'visual_lod0')) : undefined;
    const mesh = visual as THREE.Mesh | undefined;
    if (!mesh?.isMesh || !this.atlasMaterial) return null;
    const material = this.instanceMaterial();
    if (doubleSided) material.side = THREE.DoubleSide;
    const instances = new THREE.InstancedMesh(mesh.geometry, material, count);
    instances.userData.compactAsset = true;
    instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return instances;
  }

  cloneCharacter(color: number): CharacterAsset | null {
    if (!this.character || !this.atlasMaterial) return null;
    const group = this.character.clone(true) as THREE.Group;
    const body = group.getObjectByName('player_body') as THREE.Mesh | undefined;
    const head = group.getObjectByName('player_head') as THREE.Mesh | undefined;
    const weaponSocket = group.getObjectByName('player_weapon_socket') as THREE.Group | undefined;
    const armLeft = group.getObjectByName('player_arm_l_pivot');
    const armRight = group.getObjectByName('player_arm_r_pivot');
    const legLeft = group.getObjectByName('player_leg_l_pivot');
    const legRight = group.getObjectByName('player_leg_r_pivot');
    if (!body?.isMesh || !head?.isMesh || !weaponSocket
      || !armLeft || !armRight || !legLeft || !legRight) return null;
    const lod1 = findSemanticChild(group, 'visual_lod1');
    if (lod1) lod1.visible = false;
    group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = this.instanceMaterial();
      if (mesh === body) material.color.setHex(color);
      mesh.material = material;
    });
    group.userData.compactAsset = true;
    return { group, body, head, weaponSocket, armLeft, armRight, legLeft, legRight };
  }
}

export const gameAssets = new GameAssetLibrary();

export function isSharedAssetResource(resource: { userData?: Record<string, unknown> } | null | undefined): boolean {
  return resource?.userData?.assetShared === true;
}
