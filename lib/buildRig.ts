import * as THREE from 'three';
import { MARK } from './markData';

const W = 3.2, RR = 0.5;

function rrect(w: number, r: number) {
  const h = w / 2, s = new THREE.Shape();
  s.moveTo(-h + r, -h); s.lineTo(h - r, -h);
  s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false); s.lineTo(h, h - r);
  s.absarc(h - r, h - r, r, 0, Math.PI / 2, false); s.lineTo(-h + r, h);
  s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false); s.lineTo(-h, -h + r);
  s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Builds the whole 3D set (logo, rings, halo, lead particles). Client-only. */
export function buildRig() {
  const G = new THREE.Group(), P = new THREE.Group();
  G.add(P);

  // tile
  const tileG = new THREE.ExtrudeGeometry(rrect(W, RR), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 12 });
  tileG.translate(0, 0, -0.3);
  const tileM = new THREE.MeshStandardMaterial({ color: 0x07102e, metalness: 0.55, roughness: 0.4, transparent: true, opacity: 0, emissive: 0x0652dd, emissiveIntensity: 0 });
  const tile = new THREE.Mesh(tileG, tileM);

  // glowing rim
  const rs = rrect(W + 0.14, RR + 0.07);
  rs.holes.push(new THREE.Path(rrect(W + 0.07, RR + 0.035).getPoints(16)));
  const rimM = new THREE.MeshBasicMaterial({ color: 0x7f93bd, transparent: true, opacity: 0 });
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: 0.08, bevelEnabled: false, curveSegments: 12 }), rimM);
  rim.position.z = -0.04;

  // CG mark (extruded from the traced outline, grey -> blue like the logo)
  const shapes = MARK.map((g) => {
    const f = (a: number[][]) => a.map((q) => new THREE.Vector2(q[0] * W, q[1] * W));
    const sh = new THREE.Shape(f(g[0]));
    for (let h = 1; h < g.length; h++) sh.holes.push(new THREE.Path(f(g[h])));
    return sh;
  });
  const markG = new THREE.ExtrudeGeometry(shapes, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3, curveSegments: 1 });
  const pos = markG.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3), cg = new THREE.Color(0x66779c), cb = new THREE.Color(0x0a5cff), tc = new THREE.Color();
  for (let q = 0; q < pos.count; q++) {
    const t = Math.min(1, Math.max(0, (pos.getX(q) / W + 0.3) / 0.45));
    tc.copy(cg).lerp(cb, t);
    col[q * 3] = tc.r; col[q * 3 + 1] = tc.g; col[q * 3 + 2] = tc.b;
  }
  markG.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const markM = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.35, transparent: true, opacity: 0, emissive: 0x0652dd, emissiveIntensity: 0 });
  const mark = new THREE.Mesh(markG, markM);
  mark.position.set(0, -0.11, 0.035);

  // blueprint wireframe edges
  const lm = new THREE.LineBasicMaterial({ color: 0x6f87b8, transparent: true });
  const l1 = new THREE.LineSegments(new THREE.EdgesGeometry(tileG, 20), lm);
  const l2 = new THREE.LineSegments(new THREE.EdgesGeometry(markG, 25), lm);
  l2.position.set(0, -0.11, 0.035);
  P.add(tile, rim, mark, l1, l2);

  // orbit rings
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0x6c7fa8, transparent: true, opacity: 0.5 }));
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.01, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9fb0d0, transparent: true, opacity: 0.35 }));
  r2.scale.setScalar(1.3); r2.rotation.x = 1.2;

  // halo
  const hc = document.createElement('canvas'); hc.width = hc.height = 128;
  const hx = hc.getContext('2d')!, hg = hx.createRadialGradient(64, 64, 0, 64, 64, 64);
  hg.addColorStop(0, 'rgba(140,180,255,1)'); hg.addColorStop(0.4, 'rgba(6,82,221,.45)'); hg.addColorStop(1, 'rgba(6,82,221,0)');
  hx.fillStyle = hg; hx.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false }));
  halo.position.z = -0.5;

  // "leads" particles streaming out in the Growth chapter
  const LN = 360, ld: number[][] = [], lp = new Float32Array(LN * 3), lg = new THREE.BufferGeometry();
  for (let j = 0; j < LN; j++) {
    const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
    ld.push([Math.sin(b) * Math.cos(a), Math.sin(b) * Math.sin(a), Math.cos(b), Math.random()]);
  }
  lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  // round, fixed-pixel-size dots (no perspective growth, so nothing balloons when it passes close to the camera)
  const dc = document.createElement('canvas'); dc.width = dc.height = 32;
  const dx = dc.getContext('2d')!; dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(16, 16, 15, 0, 6.283); dx.fill();
  const leads = new THREE.Points(lg, new THREE.PointsMaterial({ color: 0xffffff, size: 3.2, sizeAttenuation: false, map: new THREE.CanvasTexture(dc), alphaTest: 0.4, transparent: true, opacity: 0, depthWrite: false }));
  G.add(r1, r2, halo, leads);

  return { G, P, tileM, markM, rimM, lm, r1, r2, halo, leads, lg, lp, ld, LN };
}
