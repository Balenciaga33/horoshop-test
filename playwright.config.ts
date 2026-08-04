import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { apiConfig } from './api/config';

dotenv.config({ path: path.resolve(__dirname, '.env') });

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
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
    {
      name: 'ui',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Horoshop cart AJAX returns BAD_CSRF under headless Chromium.
        headless: false,
      },
    },
  ],
});
