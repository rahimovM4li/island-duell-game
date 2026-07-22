import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { WeaponType } from '@shared/constants';
import type { PoiKind } from '@shared/worldgen';

const WEAPON_NAMES = [
  'machete', 'spear', 'bow', 'pistol', 'rifle', 'shotgun', 'sniper',
  'grenade', 'smoke', 'flash',
] as const satisfies readonly WeaponType[];
const LANDMARK_NAMES = ['wreck', 'watchtower', 'bunker'] as const satisfies readonly PoiKind[];

type AssetWeapon = (typeof WEAPON_NAMES)[number];
type AssetLandmark = (typeof LANDMARK_NAMES)[number];

function publicAsset(path: string): string {
  return new URL(`assets/${path}`, document.baseURI).toString();
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
 * Match-scoped instances share geometry and one atlas texture, while each
 * instance gets its own tiny material so pickup fades never affect other items.
 */
class GameAssetLibrary {
  private loadPromise: Promise<boolean> | null = null;
  private weapons = new Map<AssetWeapon, THREE.Object3D>();
  private landmarks = new Map<AssetLandmark, THREE.Object3D>();
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
      const [weaponGltf, landmarkGltf] = await Promise.all([
        loader.loadAsync(publicAsset('weapons.glb')),
        loader.loadAsync(publicAsset('landmarks.glb')),
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
      this.prepareTemplates(landmarkGltf.scene, baseMaterial);
      this.weapons = collectTemplates(weaponGltf.scene, WEAPON_NAMES, 'weapon');
      this.landmarks = collectTemplates(landmarkGltf.scene, LANDMARK_NAMES, 'poi');
      this.atlasMaterial = baseMaterial;
      return true;
    } catch (error) {
      texture?.dispose();
      this.weapons.clear();
      this.landmarks.clear();
      console.warn('Compact game assets unavailable; using procedural fallback.', error);
      return false;
    }
  }

  private prepareTemplates(root: THREE.Object3D, material: THREE.Material): void {
    const oldMaterials = new Set<THREE.Material>();
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((old) => oldMaterials.add(old));
      mesh.material = material;
      mesh.geometry.userData.assetShared = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    oldMaterials.forEach((old) => old.dispose());
  }

  private clone(template: THREE.Object3D | undefined): THREE.Group | null {
    if (!template || !this.atlasMaterial) return null;
    const model = template.clone(true) as THREE.Group;
    const material = this.atlasMaterial.clone();
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) mesh.material = material;
    });
    model.userData.compactAsset = true;
    return model;
  }

  cloneWeapon(weapon: WeaponType | 'none'): THREE.Group | null {
    if (weapon === 'fists' || weapon === 'none') return null;
    return this.clone(this.weapons.get(weapon as AssetWeapon));
  }

  cloneLandmark(poi: PoiKind): THREE.Group | null {
    if (poi === 'ruins') return null;
    return this.clone(this.landmarks.get(poi as AssetLandmark));
  }
}

export const gameAssets = new GameAssetLibrary();

export function isSharedAssetResource(resource: { userData?: Record<string, unknown> } | null | undefined): boolean {
  return resource?.userData?.assetShared === true;
}
