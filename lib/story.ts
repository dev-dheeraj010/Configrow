/**
 * Pricing story timing, in "units" where 1 unit = 100vh of scroll (the scrubbed timeline is 1:1 with scroll distance).
 * The stage's height is derived from the same numbers (stageHeightVh), so CSS and timeline cannot disagree.
 *
 * Per plan block (offset from the block start b = X0 + i*L):
 *   0.00        plan name (capsule) + 3D object builds
 *   0.45-1.95   features wipe in, one per scroll step (1.5 units shared by the plan's features)
 *   2.00-2.50   price fades in and counts up; it then stays on screen until the zoom-out starts at 3.20 (>= 0.7 screen)
 *   3.20-3.70   zoom to 1.7x, pan left, return to 1x as the next plan enters
 * Finale at F = X0 + (plans-1)*L + 3.2: pull back to 2.4x, objects fade, three tall plan cards, call-to-action.
 */
export const X0 = 0.3;                 // intro fades out first, then plan 1 starts here
export const L = 3.7;                  // length of one plan block
export const PRICE_AT = 2.0;           // price starts counting, relative to block start
export const ZOOM_AT = 3.2;            // zoom-out starts, relative to block start
export const FINALE_TAIL = 1.9;        // finale length after F

export const finaleStart = (plans: number) => X0 + (plans - 1) * L + ZOOM_AT;
export const storyLength = (plans: number) => finaleStart(plans) + FINALE_TAIL;
/** Height of the scroll stage: the story length plus the one viewport the sticky pin occupies. */
export const stageHeightVh = (plans: number) => (storyLength(plans) + 1) * 100;
