/** @type {import('next').NextConfig} */
// Tests build into their own folder (NEXT_DIST_DIR) so `npm run build` never overwrites a running `npm run dev`.
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] }];
  },
  distDir: process.env.NEXT_DIST_DIR || '.next' };
export default nextConfig;
