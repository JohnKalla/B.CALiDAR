import * as THREE from 'three';

export function addLighting(scene) {
  // Dim ambient light for overall darkness
  const ambientLight = new THREE.AmbientLight(0x111111);
  scene.add(ambientLight);

  // // Directional light to simulate minimal light source
  // const light = new THREE.DirectionalLight(0xffffff, 0.3);
  // light.position.set(5, 10, 7.5);
  // scene.add(light);
}
