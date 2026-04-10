import { Locator } from "@playwright/test";
import { logger } from "./logger";

export type FieldAction = "fill" | "select";

export interface SafeActionOptions {
  fieldName?: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 15_000;

export class SafeActions {
  static async safeFill(
    locator: Locator,
    value: string,
    options: SafeActionOptions = {},
  ): Promise<void> {
    const { fieldName = "field", timeout = DEFAULT_TIMEOUT } = options;

    logger.debug(`SafeActions: filling "${fieldName}" with "${value}"`);

    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
    await locator.clear();
    await locator.fill(value);
    await locator.dispatchEvent("change");
    await locator.dispatchEvent("blur");

    await this.verifyAndRetry(locator, value, "fill", fieldName);
  }

  static async safeSelect(
    locator: Locator,
    value: string,
    options: SafeActionOptions = {},
  ): Promise<void> {
    const { fieldName = "select", timeout = DEFAULT_TIMEOUT } = options;

    logger.debug(`SafeActions: selecting "${value}" on "${fieldName}"`);

    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
    await locator.selectOption(value);
    await locator.dispatchEvent("input");
    await locator.dispatchEvent("change");
    await locator.dispatchEvent("blur");

    await this.verifyAndRetry(locator, value, "select", fieldName);
  }

  static async safeClick(
    locator: Locator,
    options: SafeActionOptions = {},
  ): Promise<void> {
    const { fieldName = "element", timeout = DEFAULT_TIMEOUT } = options;

    logger.debug(`SafeActions: clicking "${fieldName}"`);

    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
  }

  static async verifyAndRetry(
    locator: Locator,
    expectedValue: string,
    action: FieldAction,
    fieldName: string,
  ): Promise<void> {
    const actual = await locator.inputValue();

    if (actual === expectedValue) {
      logger.debug(`SafeActions: verified "${fieldName}" = "${actual}"`);
      return;
    }

    logger.warn(
      `SafeActions: value mismatch on "${fieldName}" — expected "${expectedValue}", got "${actual}". Retrying.`,
    );

    switch (action) {
      case "fill":
        await locator.clear();
        await locator.fill(expectedValue);
        await locator.dispatchEvent("change");
        await locator.dispatchEvent("blur");
        break;
      case "select":
        await locator.selectOption(expectedValue);
        await locator.dispatchEvent("change");
        break;
    }

    const retryValue = await locator.inputValue();
    if (retryValue !== expectedValue) {
      logger.error(
        `SafeActions: retry failed on "${fieldName}" — expected "${expectedValue}", got "${retryValue}"`,
      );
    } else {
      logger.info(`SafeActions: retry successful on "${fieldName}"`);
    }
  }
}
