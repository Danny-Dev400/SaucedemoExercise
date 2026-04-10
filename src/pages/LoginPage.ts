import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;
  readonly errorDismiss: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorDismiss = page.locator('[data-test="error"] button');
  }

  async goto(): Promise<void> {
    logger.debug('LoginPage: navigating to login page');
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    logger.info(`LoginPage: attempting login as "${username}"`);
    await this.safeFill(this.username, username, 'username');
    await this.safeFill(this.password, password, 'password');
    await this.safeClick(this.loginButton, 'login-button');
  }

  async dismissError(): Promise<void> {
    logger.debug('LoginPage: dismissing error banner');
    await this.safeClick(this.errorDismiss, 'error-dismiss');
  }
}
