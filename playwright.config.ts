import { defineConfig, devices } from "@playwright/test";

const TEST_TIMEOUT = 60 * 1000;
const ACTIONS_TIMEOUT = 10 * 1000;

const chromeSettings = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1920, height: 1080 },
  actionTimeout: ACTIONS_TIMEOUT,
};

const firefoxSettings = {
  ...devices["Desktop Firefox"],
  viewport: { width: 1920, height: 1080 },
  actionTimeout: ACTIONS_TIMEOUT,
};

export default defineConfig({
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.04 },
  },
  globalSetup: "./global-setup",
  testDir: "./src/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: TEST_TIMEOUT,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],
    ['html', { open: 'never' }]
  ],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    baseURL: "https://www.saucedemo.com",
    headless: true,
  },

  projects: [
    { name: "chromium", use: { ...chromeSettings } }
  ],
});
