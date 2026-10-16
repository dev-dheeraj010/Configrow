'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildRig } from '@/lib/buildRig';
import { sceneState as S } from '@/lib/sceneState';

function Rig() {
  const rig = useMemo(() => buildRig(), []);
  const c1 = useMemo(() => new THREE.Color(0x6f87b8), []);
  const c2 = useMemo(() => new THREE.Color(0xdce6ff), []);
  const m = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => { m.current.x = e.clientX / innerWidth - 0.5; m.current.y = e.clientY / innerHeight - 0.5; };
    addEventListener('pointermove', onMove);
    return () => removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock, camera }, delta) => {
    const t = clock.elapsedTime, k = delta * 60, p = m.current;
    const { G, P, r1, r2, tileM, markM, rimM, lm, halo, leads, lg, lp, ld, LN, grid } = rig;
    G.position.set(S.px, S.py, 0); G.rotation.set(S.rx, S.ry, 0); G.scale.setScalar(S.s);
    P.position.y = Math.sin(t * 0.8) * 0.08;
    P.rotation.y += (p.x * 0.5 - P.rotation.y) * 0.05;
    P.rotation.x += (p.y * 0.35 - P.rotation.x) * 0.05;
    r1.rotation.z += 0.004 * k; r2.rotation.y += 0.003 * k; r2.scale.setScalar(S.r2s);
    tileM.opacity = S.solid; markM.opacity = S.solid; rimM.opacity = S.solid;
    markM.emissiveIntensity = S.glow * 0.9; tileM.emissiveIntensity = S.glow * 0.08;
    lm.opacity = 1 - S.solid * 0.75; lm.color.copy(c1).lerp(c2, S.glow);
    (r1.material as THREE.MeshBasicMaterial).opacity = 0.5 * S.ring;
    (r2.material as THREE.MeshBasicMaterial).opacity = 0.35 * S.ring;
    (halo.material as THREE.SpriteMaterial).opacity = S.glow * 0.4; halo.scale.setScalar(7 + S.glow * 4);
    (grid.material as THREE.LineBasicMaterial).opacity = S.grid * 0.4;
    (leads.material as THREE.PointsMaterial).opacity = S.lead;
    if (S.lead > 0.01) {
      for (let i = 0; i < LN; i++) {
        const d = ld[i], u = (t * 0.35 + d[3]) % 1, rr = 2.3 + u * 7;
        lp[i * 3] = d[0] * rr; lp[i * 3 + 1] = d[1] * rr; lp[i * 3 + 2] = d[2] * rr;
      }
      lg.attributes.position.needsUpdate = true;
    }
    camera.position.x += (p.x * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (S.camY - p.y * 0.6 - camera.position.y) * 0.05;
    camera.position.z = S.camZ;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight color={0x6f8fd8} intensity={0.8} />
      <pointLight position={[3, 4, 5]} color={0x7fa6ff} intensity={2.4} distance={30} />
      <directionalLight position={[-2, 2, 6]} intensity={0.7} />
      <primitive object={rig.G} />
      <primitive object={rig.gridGroup} />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      className="gl"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} // R3F's wrapper sets inline position:relative, which would beat .gl
      camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 7.5] }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <Rig />
    </Canvas>
  );
}
