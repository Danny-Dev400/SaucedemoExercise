import { test, expect } from "../fixtures";
import { users } from "../config/users";

const successfulLoginCases = [
  { label: "standard user", user: users.standard },
  { label: "performance glitch user", user: users.performanceGlitch },
];

test.describe("Suite 1 — Login / Auth", () => {
  test.beforeEach(async ({ guest: pages }) => {
    await pages.loginPage.goto();
  });

  for (const { label, user } of successfulLoginCases) {
    test(`TC-01 — Successful login — ${label}`, async ({ guest: pages }) => {
      await pages.loginPage.login(user.username, user.password);

      // Timeout rationale: performance_glitch_user injects an artificial delay of
      // ~5 s on every network request before the page resolves. Observed baseline
      // load time is ~2–3 s, giving a realistic worst-case of ~8 s. 15 s was chosen
      // to provide a ~7 s safety margin for CI runner variance without being so
      // permissive that a genuine hang would pass undetected. standard_user will
      // always resolve well under this threshold, so the higher value does not mask
      // regressions for normal users.
      await expect(pages.page).toHaveURL(/\/inventory\.html/, {
        timeout: 15_000,
      });
      await expect(pages.page.locator('[data-test="title"]')).toHaveText(
        "Products",
      );
      await expect(pages.page.locator(".inventory_item")).toHaveCount(6);
      await expect(pages.loginPage.errorBanner).toBeHidden();
    });
  }

  test("TC-02 — Locked out user is denied access", async ({ guest: pages }) => {
    await pages.loginPage.login(
      users.lockedOut.username,
      users.lockedOut.password,
    );
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: Sorry, this user has been locked out.",
    );
  });

  test("TC-03 — Valid username with wrong password", async ({
    guest: pages,
  }) => {
    await pages.loginPage.login(users.standard.username, "wrong_password_123");
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("TC-04 — Empty username field", async ({ guest: pages }) => {
    await pages.loginPage.password.fill(users.standard.password);
    await pages.loginPage.loginButton.click();
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: Username is required",
    );
  });

  test("TC-05 — Empty password field", async ({ guest: pages }) => {
    await pages.loginPage.username.fill(users.standard.username);
    await pages.loginPage.loginButton.click();
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: Password is required",
    );
  });

  test("TC-06 — Both fields empty", async ({ guest: pages }) => {
    await pages.loginPage.loginButton.click();
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: Username is required",
    );
  });

  test("TC-08 — Dismiss error banner via X button", async ({
    guest: pages,
  }) => {
    await pages.loginPage.login(users.standard.username, "bad_password_xyz");
    await expect(pages.loginPage.errorBanner).toBeVisible();
    await pages.loginPage.dismissError();
    await expect(pages.loginPage.errorBanner).toBeHidden();
    await expect(pages.loginPage.username).not.toHaveClass("error");
    await expect(pages.loginPage.password).not.toHaveClass("error");
  });

  test("TC-35 — Session cookie is set with correct username after login", async ({
    guest: pages,
  }) => {
    await pages.loginPage.login(users.standard.username, users.standard.password);
    await expect(pages.page).toHaveURL(/\/inventory\.html/);

    const cookies = await pages.context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "session-username");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe(users.standard.username);
  });

  test("TC-36 — Session persists across page reload", async ({
    guest: pages,
  }) => {
    await pages.loginPage.login(users.standard.username, users.standard.password);
    await expect(pages.page).toHaveURL(/\/inventory\.html/);

    await pages.page.reload();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);

    const cookies = await pages.context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "session-username");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe(users.standard.username);
  });

  test("TC-37 — Direct navigation to protected route without a session cookie redirects to login", async ({
    guest: pages,
  }) => {
    await pages.page.goto("/inventory.html");
    await expect(pages.page).toHaveURL("/");
    await expect(pages.loginPage.errorBanner).toContainText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });
});
