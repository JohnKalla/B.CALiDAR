import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

export function createTrimesh(geometry) {
  const vertices = geometry.attributes.position?.array;
  if (!vertices) return null;

  const indices = geometry.index
    ? geometry.index.array
    : Array.from({ length: vertices.length / 3 }, (_, i) => i);

  return new CANNON.Trimesh(vertices, indices);
}
