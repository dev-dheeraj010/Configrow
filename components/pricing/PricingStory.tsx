'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MARK } from '@/lib/markData';
import { PLANS } from '@/lib/plans';
import { lenisControl } from '@/components/layout/SmoothScroll';

const W = 3.2, RR = 0.5, VH = 2 * 8 * Math.tan((25 * Math.PI) / 180);
const T = 12.8, X0 = 0.3, L = 3.7;          // timeline length / start offset / length of one plan block (units of 100vh)
const GL = [0.15, 0.5, 1];                  // glow per plan: the object gets richer from plan to plan
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');

function rr(w: number, r: number) {
  const h = w / 2, s = new THREE.Shape();
  s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false); s.lineTo(h, h - r);
  s.absarc(h - r, h - r, r, 0, Math.PI / 2, false); s.lineTo(-h + r, h); s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-h, -h + r); s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/**
 * 3D scrollytelling pricing page. Per plan: name -> features one by one -> price -> zoom out and pan to the next plan.
 * Finale: pull back, the 3D objects fade, three tall plan cards + "your answer is just a ring away".
 * Scroll map (units of 100vh): plan i starts at X0 + i*L; see the timeline below.
 */
export default function PricingStory() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; // always start the story from the top
    window.scrollTo(0, 0);
    const el = root.current!;
    const q = (s: string) => el.querySelector(s) as HTMLElement;
    const tr = q('#track');

    let R: THREE.WebGLRenderer | null = null;
    let O: any[] = [{}, {}, {}];
    const S: any = { pan: 0, zoom: 1, pa: 1 };
    let tick: ((t: number) => void) | null = null;
    let onResize = () => {};

    try {
      R = new THREE.WebGLRenderer({ canvas: cv.current!, antialias: true, alpha: true });
      R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
      scene.add(new THREE.AmbientLight(0x6f8fd8, 0.8));
      const pl = new THREE.PointLight(0x7fa6ff, 2.4, 60); pl.position.set(3, 4, 6); scene.add(pl);
      const dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(-2, 2, 6); scene.add(dl);

      const tileG = new THREE.ExtrudeGeometry(rr(W, RR), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 12 });
      tileG.translate(0, 0, -0.3);
      const rs = rr(W + 0.14, RR + 0.07); rs.holes.push(new THREE.Path(rr(W + 0.07, RR + 0.035).getPoints(16)));
      const rimG = new THREE.ExtrudeGeometry(rs, { depth: 0.08, bevelEnabled: false, curveSegments: 12 });
      const shapes = MARK.map((g) => {
        const f = (a: number[][]) => a.map((p) => new THREE.Vector2(p[0] * W, p[1] * W));
        const sh = new THREE.Shape(f(g[0]));
        for (let h = 1; h < g.length; h++) sh.holes.push(new THREE.Path(f(g[h])));
        return sh;
      });
      const markG = new THREE.ExtrudeGeometry(shapes, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3, curveSegments: 1 });
      const pos = markG.attributes.position as THREE.BufferAttribute, col = new Float32Array(pos.count * 3);
      const ca = new THREE.Color(0x66779c), cb = new THREE.Color(0x0a5cff), tc = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        tc.copy(ca).lerp(cb, Math.min(1, Math.max(0, (pos.getX(i) / W + 0.3) / 0.45)));
        col[i * 3] = tc.r; col[i * 3 + 1] = tc.g; col[i * 3 + 2] = tc.b;
      }
      markG.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const eT = new THREE.EdgesGeometry(tileG, 20), eM = new THREE.EdgesGeometry(markG, 25);
      const c1 = new THREE.Color(0x6f87b8), c2 = new THREE.Color(0xdce6ff);
      const hc = document.createElement('canvas'); hc.width = hc.height = 128;
      const hx = hc.getContext('2d')!, hg = hx.createRadialGradient(64, 64, 0, 64, 64, 64);
      hg.addColorStop(0, 'rgba(140,180,255,1)'); hg.addColorStop(0.4, 'rgba(6,82,221,.45)'); hg.addColorStop(1, 'rgba(6,82,221,0)');
      hx.fillStyle = hg; hx.fillRect(0, 0, 128, 128);
      const ht = new THREE.CanvasTexture(hc);

      // layers = stacked tiles (Standard has 3), nr = orbit rings (Next-gen has 2)
      const mk = (layers: number, nr: number) => {
        const g = new THREE.Group(), o: any = { g, build: 0, glow: 0, vis: 1, ms: [], rings: [] };
        for (let k = layers - 1; k >= 0; k--) {
          const m = new THREE.MeshStandardMaterial({ color: 0x07102e, metalness: 0.55, roughness: 0.4, transparent: true, opacity: 0, emissive: 0x0652dd, emissiveIntensity: 0 });
          const t = new THREE.Mesh(tileG, m); t.position.set(k * 0.3, -k * 0.3, -k * 0.6); g.add(t); o.ms.push(m);
        }
        o.rimM = new THREE.MeshBasicMaterial({ color: 0x7f93bd, transparent: true, opacity: 0 });
        const rim = new THREE.Mesh(rimG, o.rimM); rim.position.z = -0.04; g.add(rim);
        o.mM = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.35, transparent: true, opacity: 0, emissive: 0x0652dd, emissiveIntensity: 0 });
        const mm = new THREE.Mesh(markG, o.mM); mm.position.set(0, -0.11, 0.035); g.add(mm);
        o.lm = new THREE.LineBasicMaterial({ color: 0x6f87b8, transparent: true });
        const l1 = new THREE.LineSegments(eT, o.lm), l2 = new THREE.LineSegments(eM, o.lm); l2.position.copy(mm.position); g.add(l1, l2);
        for (let z = 0; z < nr; z++) {
          const r = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9fb0d0, transparent: true, opacity: 0 }));
          r.rotation.x = z ? 1.2 : 0; r.scale.setScalar(z ? 1.3 : 1); g.add(r); o.rings.push(r);
        }
        o.h = new THREE.Sprite(new THREE.SpriteMaterial({ map: ht, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false }));
        o.h.position.z = -0.6; g.add(o.h); scene.add(g);
        return o;
      };
      O = [mk(1, 0), mk(3, 1), mk(1, 2)];

      let Wu = 1, off = [0, 0];
      onResize = () => {
        const w = window.innerWidth, h = window.innerHeight, nar = w <= 800;
        R!.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
        Wu = (VH * w) / h; off = nar ? [0, 1.9] : [-0.25 * Wu, 0];
      };
      onResize(); window.addEventListener('resize', onResize);

      tick = (t: number) => {
        cam.position.set(S.pan * Wu, 0, 8 * S.zoom); cam.lookAt(S.pan * Wu, 0, 0);
        tr.style.transform = `scale(${1 / S.zoom}) translateX(${-S.pan * 100}vw)`; tr.style.opacity = String(S.pa);
        O.forEach((o: any, i: number) => {
          const b = o.build, g = o.glow, v = o.vis;
          o.g.position.set(i * Wu + off[0], off[1], 0);
          o.g.scale.setScalar(0.85 * (0.6 + 0.4 * b));
          o.g.rotation.set(0.1, (1 - b) * -1.2 + Math.sin(t * 0.6 + i) * 0.22, 0);
          o.ms.forEach((m: any, k: number) => { m.opacity = v * b * (1 - k * 0.18); m.emissiveIntensity = g * 0.08; });
          o.mM.opacity = v * b; o.rimM.opacity = v * b; o.mM.emissiveIntensity = g * 0.9;
          o.lm.opacity = v * (1 - b * 0.75); o.lm.color.copy(c1).lerp(c2, g);
          o.h.material.opacity = v * g * 0.4 * (b > 0.01 ? 1 : 0); o.h.scale.setScalar(7 + g * 4);
          o.rings.forEach((r: any) => { r.material.opacity = v * g * 0.45; r.rotation.z += 0.004; });
        });
        R!.render(scene, cam);
      };
      gsap.ticker.add(tick);
    } catch (e) {
      console.warn('3D unavailable, showing text only', e);
      if (cv.current) cv.current.style.display = 'none';
      O = [{}, {}, {}];
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 1 } });
      tl.to(q('#intro'), { opacity: 0, y: -30, duration: 0.3 }, 0);
      PLANS.forEach((p, i) => {
        const b = X0 + i * L, pn = tr.children[i] as HTMLElement;
        const cap = pn.querySelector('.cap'), rec = pn.querySelector('.rec');
        const lis = Array.from(pn.querySelectorAll('li')), num = pn.querySelector('.num') as HTMLElement, n = lis.length, cnt = { v: 0 };
        tl.fromTo(rec ? [cap, rec] : cap, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, b);                 // 1. plan name
        tl.to(O[i], { build: 1, duration: 0.55 }, b).to(O[i], { glow: GL[i], duration: 1.6 }, b + 0.5);                    //    the 3D object builds
        lis.forEach((li, k) => tl.fromTo(li, { opacity: 0, x: -40, filter: 'blur(8px)', clipPath: 'inset(0 100% 0 0)' },  // 2. features, one per scroll step
          { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', duration: 0.24 }, b + 0.45 + k * (1.5 / n)));
        tl.fromTo(pn.querySelector('.pr'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25 }, b + 2);          // 3. price counts up, then stays on screen
        tl.to(cnt, { v: p.p, duration: 0.5, onUpdate: () => { num.textContent = inr(cnt.v); } }, b + 2);
        tl.fromTo(pn.querySelector('.ho'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, b + 2.4);
        if (i < 2) tl.to(S, { zoom: 1.7, duration: 0.25 }, b + 3.2).to(S, { pan: i + 1, duration: 0.5 }, b + 3.2).to(S, { zoom: 1, duration: 0.25 }, b + 3.45); // 4. zoom out, move left, next plan
      });
      const F = X0 + 2 * L + 3.2;                                                                                          // finale
      tl.to(S, { zoom: 2.4, duration: 0.6 }, F).to(S, { pan: 1, duration: 0.6 }, F);
      tl.to(S, { zoom: 1, duration: 0.7 }, F + 0.7).to(S, { pan: 0, duration: 0.7 }, F + 0.7).to(S, { pa: 0, duration: 0.4 }, F + 0.7);
      O.forEach((o) => tl.to(o, { vis: 0, duration: 0.5 }, F + 0.6));
      tl.fromTo('.fc', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 }, F + 1);
      tl.fromTo('.cl', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, F + 1.4);
      tl.to({}, { duration: 0.1 }, T - 0.1);
      const rail = Array.from(el.querySelectorAll('#rail span'));
      ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: (t) => {
        const u = t.progress * T, ix = u < F ? Math.max(0, Math.min(2, Math.floor((u - X0) / L))) : -1;
        rail.forEach((e, i) => e.classList.toggle('on', i === ix));
      } });
    }, el);

    return () => {
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      R?.dispose();
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    };
  }, []);

  const skip = () => { const el = root.current!; lenisControl.scrollTo(el.offsetTop + el.offsetHeight - window.innerHeight); };

  return (
    <div id="stage" ref={root}>
      <div className="pin">
        <canvas className="pgl" ref={cv} aria-hidden="true" />
        <div id="intro"><div className="k">PRICING</div><h1>Three plans<b>.</b><br />One standard<b>.</b></h1><p>SCROLL TO EXPLORE ↓</p></div>
        <div id="rail">{PLANS.map((p, i) => <span key={p.n}>0{i + 1} {p.n.toUpperCase()}</span>)}</div>
        <div id="trackw">
          <div id="track">
            {PLANS.map((p, i) => (
              <section className="pp" key={p.n} style={{ left: `${i * 100}vw` }}>
                <div className="tx">
                  {p.rec && <div className="rec">RECOMMENDED</div>}
                  <div className={'cap' + (p.rec ? ' rc' : '')}>{p.n}</div>
                  <ul className="ft">{p.f.map((x) => <li key={x}><b>✓</b>{x}</li>)}</ul>
                  <div className="pr"><span className="rs">₹</span><span className="num">0</span><small className="ho">{p.h}</small></div>
                </div>
              </section>
            ))}
          </div>
        </div>
        <div id="fin">
          <div className="fr">
            {PLANS.map((p) => (
              <div className={'fc' + (p.rec ? ' rc' : '')} key={p.n}>
                {p.rec && <div className="bd">RECOMMENDED</div>}
                <div className="cap">{p.n}</div>
                <div className="fp">₹{inr(p.p)}</div>
                <small>{p.h}</small>
                <ul>{p.f.map((x) => <li key={x}>✓ {x}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="cl">
            <p>Not sure what&apos;s right for you?</p>
            <h2>Your answer is just a ring away<b>.</b></h2>
            <a className="call" href="tel:+919480933776">Call +91 94809 33776</a>
          </div>
        </div>
        <button className="skip" type="button" onClick={skip}>SKIP TO PLANS ↓</button>
      </div>
    </div>
  );
}
