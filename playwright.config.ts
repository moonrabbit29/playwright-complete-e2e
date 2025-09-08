// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'src',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000/',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'api:contract',
      testMatch: ['api/**/*.contract.spec.ts'],
      use: {
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
    {
      name: 'api:integration',
      testMatch: ['api/integration/**/*.api.spec.ts'],
      use: {
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
    {
      name: 'chromium',
      testMatch: ['**/*.ui.spec.ts', '**/*.spec.ts'], // kalau mau gabung UI biasa
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: ['**/*.ui.spec.ts', '**/*.spec.ts'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: ['**/*.ui.spec.ts', '**/*.spec.ts'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
