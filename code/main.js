// main.js
import * as THREE from 'three';
import { scene, camera, renderer } from './setup/scene.js';
import { addLighting } from './setup/lighting.js';
import { world } from './physics/world.js';
import { playerBody, playerMesh, updatePlayerMovement, tryJump } from './physics/player.js';
import { loadModel } from './loaders/modelLoader.js';
import { keys, yaw, pitch, euler } from './setup/controls.js';
import { handleResize } from './utils/resize.js';
import { scanLidar } from './lidar.js';

import {
  EffectComposer,
  RenderPass,
  EffectPass,
  ChromaticAberrationEffect,
} from 'postprocessing';

// Scene Setup
addLighting(scene);
loadModel(scene);
scene.add(playerMesh);
handleResize(camera, renderer);

const lidarPointsGroup = new THREE.Group();
scene.add(lidarPointsGroup);

// Chromatic Aberration Effect
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const chromaticAberration = new ChromaticAberrationEffect({
  offset: new THREE.Vector2(0.00024, 0.00024), // tweak this
});
const effectPass = new EffectPass(camera, chromaticAberration);

composer.addPass(renderPass);
composer.addPass(effectPass);

let lidarActive = false;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') tryJump();
  if (e.code === 'KeyE') lidarActive = true;
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyE') lidarActive = false;
});

document.addEventListener('mousedown', (e) => {
  lidarActive = true;
});
document.addEventListener('mouseup', (e) => {
  lidarActive = false;
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  updatePlayerMovement(yaw, pitch);
  world.step(1 / 60);

  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);

  camera.position.copy(playerBody.position);
  euler.set(pitch, yaw, 0);
  camera.quaternion.setFromEuler(euler);

  if (lidarActive) {
    const origin = new THREE.Vector3().copy(playerBody.position);
    const dir = camera.getWorldDirection(new THREE.Vector3());
    scanLidar(origin, dir);
  }

  composer.render(); // ← use composer instead of renderer
}

// Fade in the menu when page loads
window.addEventListener('load', () => {
  const menu = document.getElementById('main-menu');
  if (menu) {
    // Trigger fade-in by adding class after a tiny delay
    setTimeout(() => {
      menu.classList.add('fade-in');
    }, 50);
  }
});

const buttons = document.querySelectorAll('#main-menu .menu-button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const menu = document.getElementById('main-menu');
    if (!menu) return;

    // Start fade-out
    menu.classList.remove('fade-in');
    menu.classList.add('fade-out');

    // Wait for fade transition to end (~1s)
    menu.addEventListener('transitionend', function handler(event) {
      if (event.propertyName === 'opacity') {
        menu.style.display = 'none'; // hide menu after fade out
        menu.removeEventListener('transitionend', handler);

        // Load the selected map and start animation
        const modelFile = button.getAttribute('data-map');
        loadModel(scene, modelFile);
        animate();
      }
    });
  });
});