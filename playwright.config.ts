import { defineConfig, devices } from '@playwright/test';
import { apiConfig } from './api/config';

// .env підвантажується в api/config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: apiConfig.baseURL,
    locale: 'uk-UA',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/tests/api/**/*.spec.ts',
      use: {
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
    {
      name: 'ui',
      testMatch: '**/tests/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // BAD_CSRF у headless (KNOWN-ISSUES U1) — UI завжди headed; у CI — xvfb-run.
        headless: false,
      },
    },
  ],
});
