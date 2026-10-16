import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Configrow — Great websites build trust.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: '#00091b', color: '#f2f5fb' }}>
        <div style={{ fontSize: 22, letterSpacing: 6, color: 'rgba(242,245,251,.6)' }}>CONFIGROW · WEB STUDIO FOR LOCAL BUSINESSES</div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 112, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95, textTransform: 'uppercase' }}>
          <span>Great websites build trust</span><span style={{ color: '#0652dd' }}>.</span>
        </div>
        <div style={{ marginTop: 36, fontSize: 30, color: 'rgba(242,245,251,.6)' }}>Premium, SEO-ready websites made to generate leads.</div>
      </div>
    ),
    size,
  );
}
