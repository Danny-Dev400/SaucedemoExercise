import { test, expect } from "../fixtures";
import products from "../data/products.json";

const PRODUCT = products[0].slug;

test.describe("Suite 3 — Cart", () => {
  test.beforeEach(async ({ standard: pages }) => {
    await pages.inventoryPage.goto();
  });

  test("TC-18 — Add a single item to cart — badge updates to 1", async ({
    standard: pages,
  }) => {
    await expect(pages.inventoryPage.header.cartBadge).toBeHidden();
    await pages.inventoryPage.addToCart(PRODUCT);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
    await expect(pages.inventoryPage.removeButton(PRODUCT)).toBeVisible();
  });

  test("TC-19 — Add multiple items — badge count updates correctly", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.addToCart(products[0].slug);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
    await pages.inventoryPage.addToCart(products[1].slug);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("2");
    await pages.inventoryPage.addToCart(products[2].slug);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("3");
  });

  test("TC-20 — Remove item from inventory page", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.addToCart(PRODUCT);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
    await pages.inventoryPage.removeFromCart(PRODUCT);
    await expect(pages.inventoryPage.header.cartBadge).toBeHidden();
    await expect(
      pages.page.locator(`[data-test="add-to-cart-${PRODUCT}"]`),
    ).toBeVisible();
  });

  test("TC-21 — Cart page displays added items correctly", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.addToCart(products[0].slug);
    await pages.inventoryPage.addToCart(products[1].slug);
    await pages.inventoryPage.header.openCart();
    await expect(pages.page).toHaveURL(/\/cart\.html/);
    await expect(pages.cartPage.items).toHaveCount(2);
    await expect(pages.cartPage.itemNames).toHaveText([
      products[0].name,
      products[1].name,
    ]);
    await expect(pages.cartPage.itemPrices).toHaveText([
      products[0].price,
      products[1].price,
    ]);
    await expect(pages.cartPage.continueShopping).toBeVisible();
    await expect(pages.cartPage.checkout).toBeVisible();
  });

  test("TC-22 — Remove item from cart page", async ({ standard: pages }) => {
    await pages.inventoryPage.addToCart(products[0].slug);
    await pages.inventoryPage.addToCart(products[1].slug);
    await pages.inventoryPage.header.openCart();
    await expect(pages.cartPage.header.cartBadge).toHaveText("2");
    await pages.cartPage.removeItemByIndex(0);
    await expect(pages.cartPage.header.cartBadge).toHaveText("1");
    await pages.cartPage.removeItemByIndex(0);
    await expect(pages.cartPage.header.cartBadge).toBeHidden();
    await expect(pages.cartPage.items).toHaveCount(0);
  });

  test("TC-23 — Empty cart state", async ({ standard: pages }) => {
    await pages.cartPage.goto();
    await expect(pages.page.locator('[data-test="cart-list"]')).toBeVisible();
    await expect(pages.cartPage.items).toHaveCount(0);
    await expect(pages.cartPage.header.cartBadge).toBeHidden();
    await expect(pages.cartPage.continueShopping).toBeVisible();
    await expect(pages.cartPage.checkout).toBeVisible();
  });

  test("TC-24 — Continue shopping returns to inventory", async ({
    standard: pages,
  }) => {
    await pages.inventoryPage.addToCart(PRODUCT);
    await pages.inventoryPage.header.openCart();
    await pages.cartPage.continueShopping.click();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);
    await expect(pages.inventoryPage.items).toHaveCount(6);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
    await expect(pages.inventoryPage.removeButton(PRODUCT)).toBeVisible();
  });
});
