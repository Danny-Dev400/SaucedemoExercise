import { test, expect } from '../fixtures';

test.describe('Suite 5 — Logout', () => {
  test.beforeEach(async ({ standard: pages }) => {
    await pages.inventoryPage.goto();
  });

  test('TC-31 — Logout via burger menu', async ({ standard: pages }) => {
    await pages.inventoryPage.header.openMenu();
    await expect(pages.sidebar.logoutLink).toBeVisible();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL('/');
    await expect(pages.loginPage.username).toHaveValue('');
    await expect(pages.loginPage.password).toHaveValue('');
    await expect(pages.loginPage.loginButton).toBeVisible();
    await expect(pages.loginPage.errorBanner).toBeHidden();
  });

  test('TC-32 — Protected routes redirect to login after logout', async ({ standard: pages }) => {
    await pages.inventoryPage.header.openMenu();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL('/');

    await pages.page.goto('/inventory.html');
    await expect(pages.page).toHaveURL('/');
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );

    await pages.page.goto('/cart.html');
    await expect(pages.page).toHaveURL('/');
    await expect(pages.loginPage.errorBanner).toBeVisible();
  });

  test('TC-33 — Browser back button after logout does not restore session', async ({ standard: pages }) => {
    await pages.inventoryPage.header.openMenu();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL('/');
    await pages.page.goBack();
    await expect(pages.page).toHaveURL('/');
    await expect(pages.loginPage.loginButton).toBeVisible();
  });
});
