import { test as base, Browser, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { SaucedemoPages } from './SaucedemoPages';
import { users, UserCredentials, UserKey } from '../config/users';
import { logger } from '../utils/logger';

const SESSION_MAP: Record<UserKey, { file: string; credentials: UserCredentials }> = {
  standard:          { file: 'standard_user.json',           credentials: users.standard },
  problem:           { file: 'problem_user.json',            credentials: users.problem },
  performanceGlitch: { file: 'performance_glitch_user.json', credentials: users.performanceGlitch },
  error:             { file: 'error_user.json',              credentials: users.error },
  lockedOut:         { file: 'standard_user.json',           credentials: users.standard },
};

export async function createUserSession(
  browser: Browser,
  browserName: string,
  userKey: UserKey
): Promise<SaucedemoPages> {
  const { file, credentials } = SESSION_MAP[userKey];
  return createSession(browser, browserName, file, credentials);
}

type Fixtures = {
  standard: SaucedemoPages;
  problem: SaucedemoPages;
  performanceGlitch: SaucedemoPages;
  error: SaucedemoPages;
  guest: SaucedemoPages;
};

const authPath = (browserName: string, file: string) =>
  path.resolve(__dirname, '../../.auth', browserName, file);

async function createSession(
  browser: Browser,
  browserName: string,
  storageFile: string,
  credentials: UserCredentials
): Promise<SaucedemoPages> {
  const filePath = authPath(browserName, storageFile);

  if (fs.existsSync(filePath)) {
    logger.debug(`Auth: loading cached session from ${browserName}/${storageFile}`);
    const context = await browser.newContext({ storageState: filePath });
    const page = await context.newPage();
    return new SaucedemoPages(page, context);
  }

  logger.warn(`Auth: no cached state for "${credentials.username}" on ${browserName} — performing fresh login`);
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill(credentials.username);
  await page.locator('[data-test="password"]').fill(credentials.password);
  await page.locator('[data-test="login-button"]').click({ timeout: 10_000 });
  await page.waitForURL('**/inventory.html', { timeout: 30_000 });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await context.storageState({ path: filePath });
  logger.info(`Auth: session cached at ${browserName}/${storageFile}`);

  return new SaucedemoPages(page, context);
}

export const test = base.extend<Fixtures>({
  standard: async ({ browser, browserName }, use) => {
    const pages = await createSession(browser, browserName, 'standard_user.json', users.standard);
    await use(pages);
    await pages.context.close();
  },

  problem: async ({ browser, browserName }, use) => {
    const pages = await createSession(browser, browserName, 'problem_user.json', users.problem);
    await use(pages);
    await pages.context.close();
  },

  performanceGlitch: async ({ browser, browserName }, use) => {
    const pages = await createSession(browser, browserName, 'performance_glitch_user.json', users.performanceGlitch);
    await use(pages);
    await pages.context.close();
  },

  error: async ({ browser, browserName }, use) => {
    const pages = await createSession(browser, browserName, 'error_user.json', users.error);
    await use(pages);
    await pages.context.close();
  },

  guest: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext();
    const page = await context.newPage();
    await use(new SaucedemoPages(page, context));
    await context.close();
  },
});

export { expect } from '@playwright/test';
