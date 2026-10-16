import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll ranges, always read from the section's own element (never from a height constant):
 *  enter = the section travels from the bottom edge of the viewport to its top edge (the previous chapter hands over to it)
 *  pin   = the section's sticky stage is fixed on screen (top of section at top of viewport -> bottom of section at bottom of viewport)
 */
export const RANGE = {
  enter: { start: 'top bottom', end: 'top top' },
  pin: { start: 'top top', end: 'bottom bottom' },
} as const;

export const prefersReducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A timeline scrubbed over `range` of `trigger`. Timeline time 0-1 equals scroll progress through the range. */
export function scrubbed(trigger: string | Element, range: { start: string; end: string }, smooth: number | boolean = 1) {
  gsap.registerPlugin(ScrollTrigger);
  return gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger, start: range.start, end: range.end, scrub: prefersReducedMotion() ? true : smooth, invalidateOnRefresh: true },
  });
}
