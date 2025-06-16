import * as THREE from 'three';
import { scene } from './setup/scene.js';

// Store all mesh objects for raycasting
const raycastTargets = [];

export function registerLidarTargets(root) {
  root.traverse(child => {
    if (child.isMesh && child.visible) {
      raycastTargets.push(child);
    }
  });
}

const tempRaycaster = new THREE.Raycaster();

// Point cloud data
const maxPoints = 500000;
const pointPositions = new Float32Array(maxPoints * 3); // x, y, z for each point
let pointCount = 0;

const pointGeometry = new THREE.BufferGeometry();
pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
pointGeometry.setDrawRange(0, 0);

const pointMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, sizeAttenuation: true});
const lidarPointCloud = new THREE.Points(pointGeometry, pointMaterial);
scene.add(lidarPointCloud);

export function scanLidar(origin, direction, spread = 0.5, raysPerShot = 20, maxDistance = 100) {
  const points = [];

  const offset = new THREE.Vector3();
  const scatteredDir = new THREE.Vector3();

  for (let i = 0; i < raysPerShot; i++) {
    offset.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    scatteredDir.copy(direction).add(offset).normalize();
    tempRaycaster.set(origin, scatteredDir);
    tempRaycaster.far = maxDistance;

    const intersects = tempRaycaster.intersectObjects(raycastTargets, false);
    if (intersects.length > 0) {
      const hit = intersects[0].point.clone().add(scatteredDir.clone().multiplyScalar(-0.03));

      points.push(hit);

      if (pointCount < maxPoints) {
        pointPositions[pointCount * 3 + 0] = hit.x;
        pointPositions[pointCount * 3 + 1] = hit.y;
        pointPositions[pointCount * 3 + 2] = hit.z;
        pointCount++;
      } else {
        // Overwrite old points in a ring buffer style
        const index = (pointCount % maxPoints) * 3;
        pointPositions[index + 0] = hit.x;
        pointPositions[index + 1] = hit.y;
        pointPositions[index + 2] = hit.z;
        pointCount++;
      }
    }
  }

  // Update the geometry draw range and mark it for update
  pointGeometry.setDrawRange(0, Math.min(pointCount, maxPoints));
  pointGeometry.attributes.position.needsUpdate = true;
  pointGeometry.computeBoundingSphere(); // <-- important

  return points;
}
