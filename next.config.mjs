const isProd = process.env.NODE_ENV === 'production';

// Origin of the Supabase project (the enquiry form posts to its Edge Function); NEXT_PUBLIC_* values are available at build time.
const supabaseOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin; } catch { return ''; }
})();

const TURNSTILE = 'https://challenges.cloudflare.com';
const GA = ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'];

/**
 * Content-Security-Policy. Next.js injects small inline scripts for hydration, so script-src needs 'unsafe-inline'
 * (a per-request nonce would force every page to be rendered dynamically, which we avoid). Everything else is locked down:
 * no plugins, no framing, no foreign form targets, connections only to ourselves, Supabase, Turnstile and Google Analytics.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' ${isProd ? '' : "'unsafe-eval' "}${TURNSTILE} https://www.googletagmanager.com`,
  `connect-src 'self' ${supabaseOrigin} ${GA.join(' ')}${isProd ? '' : ' ws: http://localhost:*'}`,
  `img-src 'self' data: blob: ${GA.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `frame-src ${TURNSTILE}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

/** @type {import('next').NextConfig} */
// Tests build into their own folder (NEXT_DIST_DIR) so `npm run build` never overwrites a running `npm run dev`.
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The only image is our logo (served as-is), so the image-optimizer endpoint is switched off entirely.
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
