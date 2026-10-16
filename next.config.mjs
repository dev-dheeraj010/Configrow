/** @type {import('next').NextConfig} */
// Tests build into their own folder (NEXT_DIST_DIR) so `npm run build` never overwrites a running `npm run dev`.
const nextConfig = { reactStrictMode: true, distDir: process.env.NEXT_DIST_DIR || '.next' };
export default nextConfig;
