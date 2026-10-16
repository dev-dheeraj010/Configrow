import type { SceneState } from './sceneState';

/** Camera + logo geometry shared by the 3D scene and the DOM layout that has to line up with it. */
export const FOV = 50;                 // degrees, vertical
export const TILE_HALF = 1.6;          // half the logo tile's world size (buildRig W / 2)
export const PROMISE_SCALE = 0.55;     // logo scale while it is the Promise hub
export const PROMISE_CAMZ = 9.5;       // camera distance during the Promise chapter

/** Half the logo tile's size on screen, in CSS px, for a viewport of the given height. */
export const tileHalfPx = (viewportH: number, scale = PROMISE_SCALE, camZ = PROMISE_CAMZ) =>
  (TILE_HALF * scale * viewportH) / (2 * camZ * Math.tan((FOV * Math.PI) / 360));

/** Promise pin progress (0-1) at which each of the five promises lights up, and where the payoff line fades in. */
export const PROMISE_STEPS = [0.1, 0.27, 0.44, 0.61, 0.78];
export const PROMISE_PAYOFF = 0.9;

/**
 * Services pin timeline, in pin progress (0-1). Heading + intro fade in over SERVICES_HEAD, card i enters during
 * SERVICES_CARDS[i], then everything holds. The logo's move into this chapter is a separate trigger on the same
 * element that ends exactly at progress 0 of the pin.
 */
export const SERVICES_HEAD = [0, 0.06] as const;
export const SERVICES_CARDS = [[0.06, 0.3], [0.34, 0.58], [0.62, 0.86]] as const;

const PI2 = Math.PI * 2;
export type Chapter = 'hero' | 'services' | 'promise' | 'growth' | 'enquiry';
type Fields = Omit<SceneState, 'sx' | 'sy'>;

/**
 * Full scene state at the END of each chapter's transition. Each is the previous one plus that chapter's changes,
 * so a transition is always a fromTo(previous -> this) and neighbouring chapters share their boundary values.
 */
export function keyframes(desk: boolean, sx: number, sy: number): Record<Chapter, Fields> {
  const hero: Fields = { px: sx * 1.35, py: sy, s: desk ? 0.85 : 1, rx: 0.1, ry: -0.45, solid: 0, glow: 0, lead: 0, ring: 1, camY: 1.2, camZ: 7.5, r2s: 1.3 };
  const services: Fields = { ...hero, px: -sx * 0.12, ry: 0.35, solid: 1, camY: 0, s: 1 };
  const promise: Fields = { ...services, px: 0, py: desk ? sy : 0.9, ry: PI2, s: PROMISE_SCALE, camZ: PROMISE_CAMZ, ring: 0, glow: 1, r2s: 2.1 };
  const growth: Fields = { ...promise, px: sx, py: sy, ry: PI2 + 0.35, s: 1, lead: 1, camZ: 6.5, ring: 1 };
  const enquiry: Fields = { ...growth, px: -sx * 1.35, ry: PI2 - 0.25, lead: 0.35, ...(desk ? {} : { s: 0.3, py: 2.4 }) }; // phones: small mark behind the form heading
  return { hero, services, promise, growth, enquiry };
}
