// player.js
import * as THREE from 'three';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import { defaultMaterial, world } from './world.js';
import { keys } from '../setup/controls.js';

const playerRadius = 0.5;

const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Sphere(playerRadius),
  position: new CANNON.Vec3(0, 3, 0),
  material: defaultMaterial,
});
world.addBody(playerBody);

const playerMesh = new THREE.Mesh(
  new THREE.SphereGeometry(playerRadius, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);

let canJump = false;

world.addEventListener('postStep', () => {
  canJump = false;
  world.contacts.forEach((c) => {
    const contactNormal = new CANNON.Vec3();
    if (c.bi === playerBody) {
      c.ni.negate(contactNormal);
    } else if (c.bj === playerBody) {
      contactNormal.copy(c.ni);
    }
    if (contactNormal.y > 0.5) {
      canJump = true;
    }
  });
});

function updatePlayerMovement(yaw, pitch) {
  const speed = keys.shift ? 10 : 5;

  const direction = new THREE.Vector3(
    (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    0,
    (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
  );
  if (direction.lengthSq() > 0) direction.normalize();

  const yawRotation = new THREE.Euler(0, yaw, 0, 'YXZ');
  direction.applyEuler(yawRotation);

  const currentY = playerBody.velocity.y;
  playerBody.velocity.set(direction.x * speed, currentY, direction.z * speed);

  if (playerBody.velocity.y < -50) {
    playerBody.velocity.y = -50;
  }
}

function tryJump() {
  if (canJump) {
    playerBody.velocity.y = 8;
    canJump = false;
  }
}

export { playerBody, playerMesh, updatePlayerMovement, tryJump };
