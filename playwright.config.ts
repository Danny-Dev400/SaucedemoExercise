import { defineConfig, devices } from '@playwright/test';

const TEST_TIMEOUT   = 600 * 1000;
const ACTIONS_TIMEOUT = 50 * 1000;

const chromeSettings = {
  ...devices['Desktop Chrome'],
  viewport: { width: 1920, height: 1080 },
  actionTimeout: ACTIONS_TIMEOUT,
};

const firefoxSettings = {
  ...devices['Desktop Firefox'],
  viewport: { width: 1920, height: 1080 },
  actionTimeout: ACTIONS_TIMEOUT,
};

export default defineConfig({
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.04 },
  },
  globalSetup: './global-setup',
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  timeout: TEST_TIMEOUT,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    baseURL: 'https://www.saucedemo.com',
    headless: true,
  },

  projects: [
    { name: 'chromium', use: { ...chromeSettings } },
    { name: 'firefox',  use: { ...firefoxSettings } },
  ],
});
