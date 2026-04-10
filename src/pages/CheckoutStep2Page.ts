import { Page, Locator, Response } from "@playwright/test";
import { Header } from "./components/Header";
import { logger } from "../utils/logger";
import { BasePage } from "./BasePage";

export class CheckoutStep2Page extends BasePage {
  readonly header: Header;
  readonly summaryContainer: Locator;
  readonly items: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.summaryContainer = page.locator(
      '[data-test="checkout-summary-container"]',
    );
    this.items = page.locator(
      '[data-test="checkout-summary-container"] .cart_item',
    );
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async getPrices(): Promise<{ subtotal: number; tax: number; total: number }> {
    const parse = async (locator: Locator) =>
      parseFloat(((await locator.textContent()) ?? "").replace(/[^0-9.]/g, ""));
    return {
      subtotal: await parse(this.subtotalLabel),
      tax: await parse(this.taxLabel),
      total: await parse(this.totalLabel),
    };
  }

  async finish(): Promise<void> {
    this.page.on("response", (response: Response) => {
      if (
        response.url().includes("submit.backtrace.io") &&
        response.status() === 503
      ) {
        logger.warn(
          "CheckoutStep2: error telemetry returned 503 — fault injection active (error_user)",
        );
      }
    });
    logger.info("CheckoutStep2: submitting order");
    await this.safeClick(this.finishButton, "finish");
  }

  async cancel(): Promise<void> {
    await this.safeClick(this.cancelButton, "cancel");
  }
}
