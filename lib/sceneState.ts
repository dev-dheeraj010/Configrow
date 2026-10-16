// Shared mutable state: GSAP (ScrollDirector) writes it, the R3F scene (Scene.tsx) reads it every frame.
export const sceneState = {
  px: 0, py: 0, s: 1, rx: 0.1, ry: -0.45,      // logo group position / scale / rotation
  solid: 0, glow: 0, lead: 0, grid: 1, ring: 1, // Blueprint -> Build -> Launch -> Growth
  camY: 1.2, camZ: 7.5, r2s: 1.3,
  sx: 2.3, sy: 0,                               // horizontal / vertical offsets (desktop vs mobile)
};
export type SceneState = typeof sceneState;

// Test hook: lets Playwright read the live scene values (px, solid, grid...) to prove chapter hand-offs.
if (typeof window !== 'undefined') (window as unknown as { __scene: typeof sceneState }).__scene = sceneState;
