import { Page, Locator } from "@playwright/test";
import { Header } from "./components/Header";
import { logger } from "../utils/logger";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  readonly header: Header;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly continueShopping: Locator;
  readonly checkout: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.items = page.locator('[data-test="cart-list"] .cart_item');
    this.itemNames = page.locator(
      '[data-test="cart-list"] [data-test="inventory-item-name"]',
    );
    this.itemPrices = page.locator(
      '[data-test="cart-list"] [data-test="inventory-item-price"]',
    );
    this.continueShopping = page.locator('[data-test="continue-shopping"]');
    this.checkout = page.locator('[data-test="checkout"]');
  }

  async goto(): Promise<void> {
    logger.debug("CartPage: navigating to /cart.html");
    await this.page.goto("/cart.html");
  }

  async removeItemByIndex(index: number): Promise<void> {
    await this.safeClick(
      this.page.locator('[data-test^="remove-"]').nth(index),
      `remove-item-${index}`,
    );
  }
}
