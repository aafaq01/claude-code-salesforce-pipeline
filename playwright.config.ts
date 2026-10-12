import { defineConfig } from '@playwright/test';

const port = process.env.PORT ?? '3417';

export default defineConfig({
  testDir: './e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: 'node demo-app/server.js',
    url: `http://localhost:${port}/health`,
    env: { PORT: port },
    reuseExistingServer: !process.env.CI,
  },
});
