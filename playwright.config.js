const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run start:backend',
      port: 3030,
      reuseExistingServer: true,
    },
    {
      command: 'npm run start:frontend',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
});
