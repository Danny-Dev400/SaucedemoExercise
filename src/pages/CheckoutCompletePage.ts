import { Page, Locator } from '@playwright/test';
import { Header } from './components/Header';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly header: Header;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async backToProducts(): Promise<void> {
    await this.safeClick(this.backButton, 'back-to-products');
  }
}
