import { chromium, firefox } from '@playwright/test';
import { users } from './src/config/users';
import path from 'path';
import fs from 'fs';

const browsers = [
  { launcher: chromium, name: 'chromium' },
  { launcher: firefox,  name: 'firefox' },
] as const;

const sessions: Array<{ key: keyof typeof users; file: string }> = [
  { key: 'standard',          file: 'standard_user.json' },
  { key: 'problem',           file: 'problem_user.json' },
  { key: 'performanceGlitch', file: 'performance_glitch_user.json' },
  { key: 'error',             file: 'error_user.json' },
];

export default async function globalSetup() {
  const missing = sessions.filter(({ key }) => !users[key].username);
  if (missing.length > 0) {
    throw new Error(
      `Missing credentials for: ${missing.map(s => s.key).join(', ')}. Check your .env file.`
    );
  }

  for (const { launcher, name } of browsers) {
    const authDir = path.resolve(__dirname, '.auth', name);
    fs.mkdirSync(authDir, { recursive: true });

    const browser = await launcher.launch();
    try {
      await Promise.all(
        sessions.map(async ({ key, file }) => {
          const context = await browser.newContext();
          const page = await context.newPage();
          try {
            await page.goto('https://www.saucedemo.com/');
            await page.locator('[data-test="username"]').fill(users[key].username);
            await page.locator('[data-test="password"]').fill(users[key].password);
            await page.locator('[data-test="login-button"]').click();
            await page.waitForURL('**/inventory.html', { timeout: 30_000 });
            await context.storageState({ path: path.resolve(authDir, file) });
          } catch (err) {
            throw new Error(`Auth setup failed for "${key}" on ${name}: ${err}`);
          } finally {
            await context.close();
          }
        })
      );
    } finally {
      await browser.close();
    }
  }
}
