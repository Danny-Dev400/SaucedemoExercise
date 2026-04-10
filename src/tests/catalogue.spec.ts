import { test, expect, createUserSession } from "../fixtures";
import type { UserKey } from "../config/users";
import products from "../data/products.json";

const visualCases: Array<{ label: string; userKey: UserKey }> = [
  { label: "standard user", userKey: "standard" },
  { label: "problem user", userKey: "problem" },
];

test.describe("Suite 2 — Product Catalogue", () => {
  for (const { label, userKey } of visualCases) {
    test(`TC-09 — Inventory page displays product grid correctly — ${label}`, async ({
      browser,
      browserName,
    }) => {
      const pages = await createUserSession(browser, browserName, userKey);
      try {
        await pages.inventoryPage.goto();
        await expect(pages.inventoryPage.title).toHaveText("Products");
        await expect(pages.inventoryPage.items).toHaveCount(6);
        await expect(pages.inventoryPage.activeSort).toHaveText(
          "Name (A to Z)",
        );
        await expect(pages.inventoryPage.header.burgerMenuButton).toBeVisible();
        await expect(pages.inventoryPage.header.cartLink).toBeVisible();
        await expect(pages.page).toHaveScreenshot("inventory-initial-load.png");
      } finally {
        await pages.context.close();
      }
    });
  }

  test("TC-10 — Sort products by name A to Z (default)", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.goto();
    const names = await pages.inventoryPage.itemNames.allTextContents();
    expect(names).toEqual([...names].sort());
  });

  test("TC-11 — Sort products by name Z to A", async ({ standard: pages }) => {
    await pages.inventoryPage.goto();
    await pages.inventoryPage.sortBy("za");
    const names = await pages.inventoryPage.itemNames.allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });

  test("TC-12 — Sort products by price low to high", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.goto();
    await pages.inventoryPage.sortBy("lohi");
    const prices = await pages.inventoryPage.itemPrices.allTextContents();
    const parsed = prices.map((p) => parseFloat(p.replace("$", "")));
    expect(parsed).toEqual([...parsed].sort((a, b) => a - b));
  });

  test("TC-13 — Sort products by price high to low", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.goto();
    await pages.inventoryPage.sortBy("hilo");
    const prices = await pages.inventoryPage.itemPrices.allTextContents();
    const parsed = prices.map((p) => parseFloat(p.replace("$", "")));
    expect(parsed).toEqual([...parsed].sort((a, b) => b - a));
  });

  test("TC-14 — Navigate to product detail page and back", async ({
    standard: pages,
  }) => {
    const firstProduct = products[0];
    await pages.inventoryPage.goto();
    await pages.inventoryPage.openFirstProduct();
    await expect(pages.page).toHaveURL(/\/inventory-item\.html/);
    await expect(pages.productDetail.name).toHaveText(firstProduct.name);
    await expect(pages.productDetail.description).toHaveText(
      firstProduct.description,
    );
    await expect(pages.productDetail.price).toHaveText(firstProduct.price);
    await expect(pages.productDetail.addToCartButton).toBeVisible();
    await expect(pages.productDetail.backButton).toBeVisible();
    await pages.productDetail.back();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);
    await expect(pages.inventoryPage.items).toHaveCount(6);
  });

  test("TC-15 — Add to cart from product detail page", async ({
    standard: pages,
  }) => {
    const firstProduct = products[0];
    await pages.inventoryPage.goto();
    await pages.inventoryPage.openFirstProduct();
    await expect(pages.productDetail.name).toHaveText(firstProduct.name);
    await expect(pages.productDetail.price).toHaveText(firstProduct.price);
    await expect(pages.productDetail.header.cartBadge).toBeHidden();
    await pages.productDetail.addToCart();
    await expect(pages.productDetail.header.cartBadge).toHaveText("1");
    await pages.productDetail.back();
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
    await expect(
      pages.inventoryPage.removeButton(firstProduct.slug),
    ).toBeVisible();
  });
});
