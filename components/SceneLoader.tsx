'use client';
import dynamic from 'next/dynamic';
import { Component, ReactNode, useEffect, useState } from 'react';
import { webglAvailable } from '@/lib/dispose';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

/** If the 3D scene throws (lost context, driver bug), render nothing: the page's text content stands on its own. */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn('3D scene unavailable, showing text only', e); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function SceneLoader() {
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(webglAvailable()); }, []);
  return ok ? <Boundary><Scene /></Boundary> : null;
}
