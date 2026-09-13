import type * as THREE from 'three';

/** Keep camera-space weapons clear of walls/terrain while preserving hand/blade depth. */
export function renderGame(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, showHands: boolean): void {
  renderer.render(scene, camera);
  if (!showHands) return;
  const background = scene.background;
  const layers = camera.layers.mask;
  const autoClear = renderer.autoClear;
  const autoReset = renderer.info.autoReset;
  const shadowUpdate = renderer.shadowMap.autoUpdate;
  try {
    scene.background = null;
    camera.layers.set(1);
    renderer.autoClear = false;
    renderer.info.autoReset = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.clearDepth();
    renderer.render(scene, camera);
  } finally {
    scene.background = background;
    camera.layers.mask = layers;
    renderer.autoClear = autoClear;
    renderer.info.autoReset = autoReset;
    renderer.shadowMap.autoUpdate = shadowUpdate;
  }
}
