// controls.js
import * as THREE from 'three';

let yaw = 0, pitch = 0;
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false
};
const euler = new THREE.Euler(0, 0, 0, 'YXZ');

document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === document.body) {
    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (keys.hasOwnProperty(k)) keys[k] = true;
});

document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (keys.hasOwnProperty(k)) keys[k] = false;
});

export { keys, yaw, pitch, euler };
