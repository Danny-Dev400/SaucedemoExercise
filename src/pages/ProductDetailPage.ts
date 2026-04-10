import { Page, Locator } from "@playwright/test";
import { Header } from "./components/Header";
import { BasePage } from "./BasePage";

export class ProductDetailPage extends BasePage {
  readonly header: Header;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.name = page.locator('[data-test="inventory-item-name"]');
    this.description = page.locator('[data-test="inventory-item-desc"]');
    this.price = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async addToCart(): Promise<void> {
    await this.safeClick(this.addToCartButton, "add-to-cart");
  }

  async back(): Promise<void> {
    await this.safeClick(this.backButton, "back-to-products");
  }
}
