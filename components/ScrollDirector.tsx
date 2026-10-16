'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneState as S } from '@/lib/sceneState';
import { keyframes, PROMISE_STEPS, type Chapter } from '@/lib/scene';
import { RANGE, scrubbed } from '@/lib/scroll';

type Key = keyof ReturnType<typeof keyframes>['hero'];

/**
 * Drives the fixed 3D logo. There is no global timeline: each chapter owns a scrubbed timeline built on its own
 * element (lib/scroll.ts), so the scene can never drift from the real section heights.
 *
 * Scroll map (every range is read from the DOM; "enter" = section top travels bottom -> top of viewport, "pin" = sticky stage held):
 *  #services  enter  Hero -> Services    logo drifts left of centre, wireframe fills in, grid fades (Blueprint -> Build)
 *  #services  pin    cards (Services.tsx) the logo holds still, so it can't fight the cards
 *  #promise   enter  Services -> Promise logo glides to the centre, spins once, shrinks to the hub; rings fade out in the last 20%
 *  #promise   pin    five promises       glow steps up at PROMISE_STEPS, outer ring widens (Launch)
 *  #about     enter  Promise -> Growth   logo moves right, rings return, lead particles stream out (Growth)
 *  #enquiry   enter  Growth -> Enquiry   logo moves left, calmer
 * Every tween is fromTo(previous chapter's end values -> this chapter's end values), so boundaries line up exactly.
 */
export default function ScrollDirector() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 801px)', mob: '(max-width: 800px)' }, (c) => {
      const desk = !!c.conditions?.desk;
      S.sx = desk ? 2.3 : 0; S.sy = desk ? 0 : 1.9;
      const K = keyframes(desk, S.sx, S.sy);
      Object.assign(S, K.hero);

      /** Tween only the fields that differ between two chapters' end states (minus `skip`, which the caller tweens itself). */
      const move = (tl: gsap.core.Timeline, a: Chapter, b: Chapter, skip: Key[] = []) => {
        const from: Record<string, number> = {}, to: Record<string, number> = {};
        (Object.keys(K[b]) as Key[]).forEach((k) => {
          if (skip.includes(k) || K[a][k] === K[b][k]) return;
          from[k] = K[a][k]; to[k] = K[b][k];
        });
        tl.fromTo(S, from, { ...to, immediateRender: false, duration: 1 }, 0);
      };

      if (document.getElementById('services')) move(scrubbed('#services', RANGE.enter), 'hero', 'services');

      if (document.getElementById('promise')) {
        const enter = scrubbed('#promise', RANGE.enter);
        move(enter, 'services', 'promise', ['ring', 'glow', 'r2s']);
        enter.fromTo(S, { ring: 1 }, { ring: 0, immediateRender: false, duration: 0.2 }, 0.8);
        const pin = scrubbed('#promise', RANGE.pin);
        pin.fromTo(S, { r2s: 1.3 }, { r2s: 2.1, immediateRender: false, duration: 1 }, 0);
        PROMISE_STEPS.forEach((p, k) => pin.fromTo(S, { glow: k * 0.2 }, { glow: (k + 1) * 0.2, immediateRender: false, duration: 0.05 }, p));
      }

      if (document.getElementById('about')) {
        const tl = scrubbed('#about', RANGE.enter);
        move(tl, 'promise', 'growth', ['ring']);
        tl.fromTo(S, { ring: 0 }, { ring: 1, immediateRender: false, duration: 0.5 }, 0);
      }

      if (document.getElementById('enquiry')) move(scrubbed('#enquiry', RANGE.enter), 'growth', 'enquiry');
    });
    return () => mm.revert();
  }, []);

  return <div className="glow" />;
}
