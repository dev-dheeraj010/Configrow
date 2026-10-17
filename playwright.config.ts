import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  workers: 1,
  reporter: 'list',
  use: { // everyone starts with 'Essential only' already chosen, so the cookie banner never covers other tests (consent tests clear it)
    storageState: { cookies: [{ name: 'cg_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: false, ts: 1 })), domain: 'localhost', path: '/', expires: 4102444800, httpOnly: false, secure: false, sameSite: 'Lax' }], origins: [] },
    colorScheme: 'dark', baseURL: 'http://localhost:3100', headless: true, launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } },
  webServer: { command: 'node scripts/with-dist.mjs next start -p 3100', port: 3100, reuseExistingServer: false, timeout: 60_000 },
});
