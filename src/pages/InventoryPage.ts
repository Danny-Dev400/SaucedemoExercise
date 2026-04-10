import { Page, Locator } from '@playwright/test';
import { Header } from './components/Header';
import { logger } from '../utils/logger';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly header: Header;
  readonly title: Locator;
  readonly items: Locator;
  readonly sortDropdown: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly activeSort: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.itemImages = page.locator('.inventory_item img');
    this.activeSort = page.locator('.active_option');
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    logger.debug('InventoryPage: navigating to /inventory.html');
    await this.page.goto('/inventory.html', options);
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    logger.debug(`InventoryPage: sorting by "${value}"`);
    await this.safeSelect(this.sortDropdown, value, 'sort-dropdown');
  }

  async addToCart(productSlug: string): Promise<void> {
    logger.info(`InventoryPage: adding "${productSlug}" to cart`);
    await this.safeClick(this.page.locator(`[data-test="add-to-cart-${productSlug}"]`), `add-to-cart-${productSlug}`);
  }

  async removeFromCart(productSlug: string): Promise<void> {
    await this.safeClick(this.page.locator(`[data-test="remove-${productSlug}"]`), `remove-${productSlug}`);
  }

  removeButton(productSlug: string): Locator {
    return this.page.locator(`[data-test="remove-${productSlug}"]`);
  }

  async addItemByIndex(index: number): Promise<void> {
    await this.page.locator('[data-test^="add-to-cart-"]').nth(index).click();
  }

  async openFirstProduct(): Promise<void> {
    await this.safeClick(this.itemNames.first(), 'first-product-name');
  }

  async getImageSrcs(): Promise<string[]> {
    return this.itemImages.evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.src));
  }
}
