import * as THREE from 'three';

/** Warm island masonry/wood, cool equipment, restrained amber navigation accents. */
export const ISLAND_STYLE = {
  sand: 0xd4bd8b, grass: 0x72845b, stone: 0x88948f, stoneEdge: 0xa8b3a6,
  wood: 0x88684b, woodEdge: 0xb4976e, steel: 0x71858b, dark: 0x35464c,
  rubber: 0x303b36, brass: 0xc5a469, trail: 0xa99773,
} as const;

export function islandMaterial(kind: 'stone' | 'wood' | 'steel' | 'dark' | 'rubber' | 'brass'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: ISLAND_STYLE[kind],
    roughness: kind === 'steel' ? 0.48 : kind === 'brass' ? 0.42 : 0.9,
    metalness: kind === 'steel' ? 0.35 : kind === 'brass' ? 0.5 : 0,
  });
}
