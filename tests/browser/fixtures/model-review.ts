import * as THREE from 'three';
import { gameAssets } from '../../../client/src/game-assets';
import { Entities } from '../../../client/src/entities';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1100, 800);
renderer.setPixelRatio(1);
document.body.style.margin = '0';
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x65747c);
const camera = new THREE.PerspectiveCamera(75, 1100 / 800, 0.04, 100);
camera.layers.enable(1);
scene.add(camera);
const hemi = new THREE.HemisphereLight(0xe7f8ff, 0x55504a, 2);
const sun = new THREE.DirectionalLight(0xffefdd, 2.7);
sun.position.set(-3, 4, 5);
hemi.layers.enable(1); sun.layers.enable(1);
scene.add(hemi, sun);
await gameAssets.preload(renderer);
const entities = new Entities(scene, camera, 1);
entities.setViewWeapon('knife');
entities.update(1, 1);
function render() { renderer.render(scene, camera); }
render();
(window as any).modelReview = {
  entities, camera,
  pose(kind: string, t: number) {
    entities.setViewWeapon('pistol', true);
    entities.setViewWeapon('knife', true);
    if (kind !== 'draw') entities.update(1, 1);
    if (kind === 'inspect') entities.inspectKnife();
    if (kind === 'primary' || kind === 'secondary') entities.meleeSwing(kind);
    entities.update(t, 1 + t);
    render();
  },
  angle(yaw: number) {
    const model = entities.viewRoot.children[0];
    model.rotation.y += yaw;
    render();
  },
};
