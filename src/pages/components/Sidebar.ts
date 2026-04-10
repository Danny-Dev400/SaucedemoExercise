import { Page, Locator } from "@playwright/test";
import { logger } from "../../utils/logger";
import { BasePage } from "../BasePage";

export class Sidebar extends BasePage {
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async logout(): Promise<void> {
    logger.info("Sidebar: logging out");
    await this.safeClick(this.logoutLink, "logout-link");
  }
}
