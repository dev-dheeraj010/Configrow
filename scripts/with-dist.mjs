// Usage: node scripts/with-dist.mjs <command...>  — runs the command with NEXT_DIST_DIR=.next-test
import { spawnSync } from 'node:child_process';
const [cmd, ...args] = process.argv.slice(2);
const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, env: { ...process.env, NEXT_DIST_DIR: '.next-test' } });
process.exit(r.status ?? 1);
