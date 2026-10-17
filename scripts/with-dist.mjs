// Usage: node scripts/with-dist.mjs <command...>
// Runs the command against an isolated build folder (.next-test) with Cloudflare's public always-pass Turnstile test key
// and a fake GA id, so tests can exercise those code paths without any real account or network call.
import { spawnSync } from 'node:child_process';
const [cmd, ...args] = process.argv.slice(2);
const r = spawnSync(cmd, args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: '.next-test', NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA', NEXT_PUBLIC_GA_ID: 'G-TEST000000' },
});
process.exit(r.status ?? 1);
