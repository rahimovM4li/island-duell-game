import { expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { renderGame } from '../client/src/render-game';

it('draws the weapon after clearing world depth and restores render state', () => {
  const scene = new THREE.Scene();
  const background = scene.background = new THREE.Color('blue');
  const camera = new THREE.PerspectiveCamera();
  const calls: string[] = [];
  const renderer = {
    autoClear: true, info: { autoReset: true }, shadowMap: { autoUpdate: true },
    clearDepth: vi.fn(() => calls.push('depth')),
    render: vi.fn(() => calls.push(`${camera.layers.mask}:${scene.background === null}`)),
  };
  renderGame(renderer as never, scene, camera, true);
  expect(calls).toEqual(['1:false', 'depth', '2:true']);
  expect(scene.background).toBe(background);
  expect(camera.layers.mask).toBe(1);
  expect(renderer.autoClear && renderer.info.autoReset && renderer.shadowMap.autoUpdate).toBe(true);
  calls.length = 0;
  renderGame(renderer as never, scene, camera, false);
  expect(calls).toEqual(['1:false']);
});
