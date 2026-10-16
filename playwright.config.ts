import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  workers: 1,
  reporter: 'list',
  use: { colorScheme: 'dark', baseURL: 'http://localhost:3100', headless: true, launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } },
  webServer: { command: 'node scripts/with-dist.mjs next start -p 3100', port: 3100, reuseExistingServer: false, timeout: 60_000 },
});
