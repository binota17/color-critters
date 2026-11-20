import { defineConfig } from '@playwright/test';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1024, height: 640 },
    headless: true,
  },
  webServer: {
    command: `${npmCmd} run dev -- --port 5173`,
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 20000,
  },
});
