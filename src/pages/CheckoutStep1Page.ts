import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';
import { BasePage } from './BasePage';
import type { CheckoutFormData } from '../models/CheckoutForm';

export class CheckoutStep1Page extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorBanner: Locator;
  readonly errorDismiss: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorDismiss = page.locator('[data-test="error"] button');
  }

  async fill(data: CheckoutFormData): Promise<void> {
    logger.info(`CheckoutStep1: filling form — "${data.firstName} ${data.lastName}", zip: "${data.postalCode}"`);
    await this.safeFill(this.firstName, data.firstName, 'firstName');
    await this.safeFill(this.lastName, data.lastName, 'lastName');
    await this.safeFill(this.postalCode, data.postalCode, 'postalCode');
  }

  async clearAll(): Promise<void> {
    await this.firstName.clear();
    await this.lastName.clear();
    await this.postalCode.clear();
  }

  async continue(): Promise<void> {
    await this.safeClick(this.continueButton, 'continue');
  }

  async cancel(): Promise<void> {
    await this.safeClick(this.cancelButton, 'cancel');
  }

  async dismissError(): Promise<void> {
    await this.safeClick(this.errorDismiss, 'error-dismiss');
  }
}
