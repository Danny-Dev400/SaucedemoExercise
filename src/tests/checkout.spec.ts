import { test, expect } from "../fixtures";
import { SaucedemoPages } from "../fixtures/SaucedemoPages";
import products from "../data/products.json";
import { checkoutForms } from "../data/checkoutForms";

const PRODUCT = products[0].slug;

async function goToCheckout(pages: SaucedemoPages): Promise<void> {
  await pages.inventoryPage.goto();
  await pages.inventoryPage.addToCart(PRODUCT);
  await pages.inventoryPage.header.openCart();
  await pages.cartPage.checkout.click();
}

test.describe("Suite 4 — Checkout", () => {
  test("TC-25 — Complete checkout happy path", async ({ standard: pages }) => {
    await goToCheckout(pages);
    await expect(pages.page).toHaveURL(/\/checkout-step-one\.html/);

    await pages.checkoutStep1.fill(checkoutForms.standard);
    await pages.checkoutStep1.continue();
    await expect(pages.page).toHaveURL(/\/checkout-step-two\.html/);
    await expect(pages.checkoutStep2.summaryContainer).toBeVisible();
    await expect(pages.checkoutStep2.subtotalLabel).toBeVisible();
    await expect(pages.checkoutStep2.taxLabel).toBeVisible();
    await expect(pages.checkoutStep2.totalLabel).toBeVisible();

    await pages.checkoutStep2.finish();
    await expect(pages.page).toHaveURL(/\/checkout-complete\.html/);
    await expect(pages.checkoutComplete.completeHeader).toHaveText(
      "Thank you for your order!",
    );
    await expect(pages.checkoutComplete.completeText).toBeVisible();
    await expect(pages.checkoutComplete.backButton).toBeVisible();
    await expect(pages.checkoutComplete.header.cartBadge).toBeHidden();

    await pages.checkoutComplete.backToProducts();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);
    await expect(pages.inventoryPage.header.cartBadge).toBeHidden();
  });

  test("TC-26 — Checkout step 1 — required field validations", async ({
    standard: pages,
  }) => {
    await goToCheckout(pages);

    await pages.checkoutStep1.fill({
      ...checkoutForms.standard,
      firstName: "",
    });
    await pages.checkoutStep1.continue();
    await expect(pages.checkoutStep1.errorBanner).toContainText(
      "Error: First Name is required",
    );

    await pages.checkoutStep1.dismissError();
    await pages.checkoutStep1.clearAll();
    await pages.checkoutStep1.fill({ ...checkoutForms.standard, lastName: "" });
    await pages.checkoutStep1.continue();
    await expect(pages.checkoutStep1.errorBanner).toContainText(
      "Error: Last Name is required",
    );

    await pages.checkoutStep1.dismissError();
    await pages.checkoutStep1.clearAll();
    await pages.checkoutStep1.fill({
      ...checkoutForms.standard,
      postalCode: "",
    });
    await pages.checkoutStep1.continue();
    await expect(pages.checkoutStep1.errorBanner).toContainText(
      "Error: Postal Code is required",
    );
  });

  test("TC-27 — Checkout step 2 — order summary price breakdown", async ({
    standard: pages,
  }) => {
    await goToCheckout(pages);
    await pages.checkoutStep1.fill(checkoutForms.standard);
    await pages.checkoutStep1.continue();
    await expect(pages.page).toHaveURL(/\/checkout-step-two\.html/);

    const { subtotal, tax, total } = await pages.checkoutStep2.getPrices();
    expect(subtotal).toBeCloseTo(
      parseFloat(products[0].price.replace("$", "")),
      2,
    );
    expect(total).toBeCloseTo(subtotal + tax, 2);
    await expect(pages.checkoutStep2.finishButton).toBeVisible();
  });

  test("TC-28 — Cancel checkout from step 1 returns to cart", async ({
    standard: pages,
  }) => {
    await goToCheckout(pages);
    await expect(pages.page).toHaveURL(/\/checkout-step-one\.html/);
    await pages.checkoutStep1.cancel();
    await expect(pages.page).toHaveURL(/\/cart\.html/);
    await expect(pages.cartPage.items).toHaveCount(1);
    await expect(pages.cartPage.header.cartBadge).toHaveText("1");
  });

  test("TC-29 — Cancel checkout from step 2 returns to inventory", async ({
    standard: pages,
  }) => {
    await goToCheckout(pages);
    await pages.checkoutStep1.fill(checkoutForms.standard);
    await pages.checkoutStep1.continue();
    await expect(pages.page).toHaveURL(/\/checkout-step-two\.html/);
    await pages.checkoutStep2.cancel();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);
    await expect(pages.inventoryPage.header.cartBadge).toHaveText("1");
  });

  test("TC-30 — Error User — Intermittent Checkout Form Errors - Fail on Purpose", async ({
    error: pages,
  }) => {
    await goToCheckout(pages);
    await expect(pages.page).toHaveURL(/\/checkout-step-one\.html/);

    await pages.checkoutStep1.fill(checkoutForms.standard);
    await pages.checkoutStep1.continue();

    await pages.checkoutStep2.finish();
    await expect(pages.page).toHaveURL(/\/checkout-complete\.html/);

    await pages.checkoutComplete.backToProducts();
    await expect(pages.page).toHaveURL(/\/inventory\.html/);
    await expect(pages.inventoryPage.header.cartBadge).toBeHidden();
  });

  test("TC-34 — Checkout with multiple products — subtotal matches sum of item prices", async ({
    standard: pages,
  }) => {
    const selectedProducts = products.slice(0, 3);
    const expectedSubtotal = selectedProducts.reduce(
      (sum, p) => sum + parseFloat(p.price.replace("$", "")),
      0,
    );

    await pages.inventoryPage.goto();
    for (const product of selectedProducts) {
      await pages.inventoryPage.addToCart(product.slug);
    }
    await expect(pages.inventoryPage.header.cartBadge).toHaveText(
      `${selectedProducts.length}`,
    );
    await pages.inventoryPage.header.openCart();

    await expect(pages.cartPage.items).toHaveCount(selectedProducts.length);
    await pages.cartPage.checkout.click();

    await expect(pages.page).toHaveURL(/\/checkout-step-one\.html/);
    await pages.checkoutStep1.fill(checkoutForms.standard);
    await pages.checkoutStep1.continue();
    await expect(pages.page).toHaveURL(/\/checkout-step-two\.html/);

    await expect(pages.checkoutStep2.items).toHaveCount(
      selectedProducts.length,
    );
    const { subtotal, tax, total } = await pages.checkoutStep2.getPrices();
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    await pages.checkoutStep2.finish();
    await expect(pages.page).toHaveURL(/\/checkout-complete\.html/);
    await expect(pages.checkoutComplete.completeHeader).toHaveText(
      "Thank you for your order!",
    );
    await expect(pages.checkoutComplete.header.cartBadge).toBeHidden();
  });
});
