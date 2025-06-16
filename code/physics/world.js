import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material('default');
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.4,
  restitution: 0.3
});
world.defaultContactMaterial = contactMaterial;

export { world, defaultMaterial };
