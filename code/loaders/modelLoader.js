import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { registerLidarTargets } from '../lidar.js';
import * as THREE from 'three';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import { createTrimesh } from '../physics/trimesh.js';
import { world, defaultMaterial } from '../physics/world.js';

export function loadModel(scene, modelFile) {
  const loader = new GLTFLoader();
  loader.load(
    `../models/${modelFile}`,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      registerLidarTargets(model); // 👈 Add this

      model.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const name = child.name.toLowerCase();

          // Make bounding boxes invisible
          if (name.startsWith("bound")) {
            child.visible = false;
          }

          child.geometry.computeBoundingBox();

          // Create collider shape for floor, bounding boxes, and seats
          let shape = null;
          
            shape = createTrimesh(child.geometry);
          

          if (!shape) return;

          const body = new CANNON.Body({
            mass: 0,
            shape,
            material: defaultMaterial
          });

          body.position.copy(child.getWorldPosition(new THREE.Vector3()));
          body.quaternion.copy(child.getWorldQuaternion(new THREE.Quaternion()));
          world.addBody(body);
        }
      });
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );
}
