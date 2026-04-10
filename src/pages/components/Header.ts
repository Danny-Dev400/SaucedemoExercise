import { Page, Locator } from "@playwright/test";
import { BasePage } from "../BasePage";

export class Header extends BasePage {
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly burgerMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.burgerMenuButton = page.locator("#react-burger-menu-btn");
  }

  async openCart(): Promise<void> {
    await this.safeClick(this.cartLink, "cart-link");
  }

  async openMenu(): Promise<void> {
    await this.safeClick(this.burgerMenuButton, "burger-menu");
  }
}
