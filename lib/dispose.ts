import * as THREE from 'three';

/** Frees GPU memory held by everything under `root` (geometries, materials, textures). Safe to call twice. */
export function disposeTree(root: THREE.Object3D) {
  const seen = new Set<unknown>();
  const free = (v: unknown) => {
    if (!v || seen.has(v)) return;
    seen.add(v);
    (v as { dispose?: () => void }).dispose?.();
  };
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    free(m.geometry);
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((mat) => {
      Object.values(mat).forEach((val) => { if (val instanceof THREE.Texture) free(val); });
      free(mat);
    });
  });
}

/** True if this browser can create a WebGL context (checked before mounting the 3D scene). */
export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}
