import { test, expect } from "../fixtures";

test.describe("Suite 5 — Logout", () => {
  test.beforeEach(async ({ standard: pages }) => {
    await pages.inventoryPage.goto();
  });

  test("TC-31 — Logout via burger menu", async ({ standard: pages }) => {
    await pages.inventoryPage.header.openMenu();
    await expect(pages.sidebar.logoutLink).toBeVisible();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.username).toHaveValue("");
    await expect(pages.loginPage.password).toHaveValue("");
    await expect(pages.loginPage.loginButton).toBeVisible();
    await expect(pages.loginPage.errorBanner).toBeHidden();
  });

  test("TC-32 — Protected routes redirect to login after logout", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.header.openMenu();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL("/");

    await pages.page.goto("/inventory.html");
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );

    await pages.page.goto("/cart.html");
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.errorBanner).toBeVisible();
  });

  test("TC-33 — Browser back button after logout does not restore session", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.header.openMenu();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL("/");
    await pages.page.goBack();
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.loginButton).toBeVisible();
  });

  test("TC-38 — Session cookie is cleared after logout", async ({
    standard: pages,
  }) => {
    const cookiesBefore = await pages.context.cookies();
    const cookieBefore = cookiesBefore.find((c) => c.name === "session-username");
    expect(cookieBefore).toBeDefined();
    expect(cookieBefore?.value).toBe("standard_user");

    await pages.inventoryPage.header.openMenu();
    await pages.sidebar.logout();
    await expect(pages.page).toHaveURL("/");

    const cookiesAfter = await pages.context.cookies();
    const cookieAfter = cookiesAfter.find((c) => c.name === "session-username");
    expect(cookieAfter).toBeUndefined();
  });
});
