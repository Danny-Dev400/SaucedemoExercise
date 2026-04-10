import { Locator, Page } from '@playwright/test';
import { SafeActions } from '../utils/SafeActions';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async safeFill(locator: Locator, value: string, fieldName?: string): Promise<void> {
    await SafeActions.safeFill(locator, value, { fieldName });
  }

  protected async safeSelect(locator: Locator, value: string, fieldName?: string): Promise<void> {
    await SafeActions.safeSelect(locator, value, { fieldName });
  }

  protected async safeClick(locator: Locator, fieldName?: string): Promise<void> {
    await SafeActions.safeClick(locator, { fieldName });
  }

  protected async isElementVisible(locator: Locator, timeout = 3_000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  protected async waitForVisible(locator: Locator, timeout = 15_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  protected async waitForDetached(locator: Locator, timeout = 15_000): Promise<void> {
    await locator.waitFor({ state: 'detached', timeout });
  }
}
