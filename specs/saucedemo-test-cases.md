# SauceDemo — Full Test Case Specification

**Application:** https://www.saucedemo.com/  
**Page Title:** Swag Labs  
**Shared Password for all accounts:** `secret_sauce`

## Test User Accounts

| Username | Behaviour | Use for |
|----------|-----------|---------|
| `standard_user` | Fully functional | All happy-path and core tests |
| `locked_out_user` | Login is blocked by the app | Negative auth / error state tests |
| `problem_user` | Broken product images, some interactions fail | Visual regression comparison (TC-09) |
| `performance_glitch_user` | Login and page loads are artificially delayed | Timeout / wait handling tests (TC-01) |
| `error_user` | Triggers 503 telemetry error during checkout `finish()` | Error-handling scenarios (TC-30) |

## Available Modules

| Module | What it covers |
|--------|---------------|
| Login / Auth | Username + password form, session cookie, error message on bad credentials |
| Product Catalogue | Product grid, sort by name/price, product detail page, visual regression |
| Cart | Add / remove items, item count badge on header icon, cart page content |
| Checkout | 3-step flow: cart → customer info → order summary → confirmation |
| Logout | Accessible via the burger menu, session invalidation |

---

## Key Selectors Reference

**Login:** `[data-test="username"]` · `[data-test="password"]` · `[data-test="login-button"]` · `[data-test="error"]`  
**Header:** `#react-burger-menu-btn` · `[data-test="shopping-cart-link"]` · `[data-test="shopping-cart-badge"]`  
**Inventory:** `[data-test="product-sort-container"]` · `.active_option` · `[data-test="inventory-item-name"]` · `[data-test="inventory-item-price"]` · `[data-test="add-to-cart-{slug}"]` · `[data-test="remove-{slug}"]`  
**Cart:** `[data-test="cart-list"]` · `.cart_item` · `[data-test="inventory-item-name"]` · `[data-test="inventory-item-price"]` · `[data-test="continue-shopping"]` · `[data-test="checkout"]`  
**Checkout Step 1:** `[data-test="firstName"]` · `[data-test="lastName"]` · `[data-test="postalCode"]` · `[data-test="continue"]` · `[data-test="cancel"]`  
**Checkout Step 2:** `[data-test="checkout-summary-container"]` · `.cart_item` · `[data-test="subtotal-label"]` · `[data-test="tax-label"]` · `[data-test="total-label"]` · `[data-test="finish"]` · `[data-test="cancel"]`  
**Checkout Complete:** `[data-test="complete-header"]` · `[data-test="complete-text"]` · `[data-test="back-to-products"]`  
**Sidebar:** `[data-test="logout-sidebar-link"]`

---

## Data Sources

| File | Purpose |
|------|---------|
| `src/data/users.json` | Credentials for all 5 user accounts |
| `src/data/products.json` | Source of truth for all 6 products (name, description, price, imageSrc, detailUrl) sorted A to Z |
| `src/data/checkoutForms.ts` | Typed form data for checkout — `standard` (`John Doe, 12345`) and `alternate` (`Jane Smith, 90210`) |

---

## Suite 1: Login / Auth

---

### TC-01 — Successful Login

**Users:** `standard_user` · `performance_glitch_user` *(parametrized — runs once per user)*  
**Goal:** Verify that valid users are authenticated and redirected to the inventory page. For `performance_glitch_user`, verify the login completes despite an artificial delay.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Page loads. Login form is visible. No error banner. |
| 2 | Fill `[data-test="username"]` with the user's username. Fill `[data-test="password"]` with `secret_sauce`. | Fields are filled. |
| 3 | Click `[data-test="login-button"]` | URL changes to `/inventory.html` (within 15 s for `performance_glitch_user`). Page heading "Products" is visible. Six product cards are displayed. No error banner is visible. |

> **Note:** `performance_glitch_user` will exhibit a noticeable delay before the page transitions. The test allows up to 15 seconds for the URL assertion. This is expected behaviour.

---

### TC-02 — Locked Out User Is Denied Access

**User:** `locked_out_user`  
**Goal:** Verify that a locked account cannot authenticate and shows the correct error.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill credentials for `locked_out_user` and click `[data-test="login-button"]`. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Sorry, this user has been locked out."** |

---

### TC-03 — Valid Username with Wrong Password

**User:** `standard_user`  
**Goal:** Verify that a correct username combined with a wrong password is rejected.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Fill `[data-test="password"]` with `wrong_password_123`. Click `[data-test="login-button"]`. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username and password do not match any user in this service"**. |

---

### TC-04 — Empty Username Field

**Goal:** Verify that submitting without a username shows the correct validation message.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Fill `[data-test="password"]` with `secret_sauce`. Click `[data-test="login-button"]`. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username is required"**. |

---

### TC-05 — Empty Password Field

**Goal:** Verify that submitting without a password shows the correct validation message.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Click `[data-test="login-button"]`. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Password is required"**. |

---

### TC-06 — Both Fields Empty

**Goal:** Verify that username is validated before password when both fields are empty.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Click `[data-test="login-button"]` without filling any field. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username is required"**. |

---

### TC-08 — Dismiss Error Banner via X Button

**Goal:** Verify that clicking the X close button on the error banner removes it and clears the error styling.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Fill `[data-test="password"]` with `bad_password_xyz`. Click `[data-test="login-button"]`. | Error banner `[data-test="error"]` is visible. |
| 3 | Click the X button inside `[data-test="error"]`. | The error banner is no longer visible. Red error borders on both input fields are removed. |

---

### TC-35 — Session Cookie Is Set with Correct Username After Login

**User:** `standard_user`  
**Goal:** Verify that a successful login writes the `session-username` cookie with the authenticated user's username as its value.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` and log in as `standard_user`. | URL changes to `/inventory.html`. |
| 2 | Inspect browser cookies for the current context. | A cookie named `session-username` is present. Its `value` equals **`standard_user`**. |

---

### TC-36 — Session Persists Across Page Reload

**User:** `standard_user`  
**Goal:** Verify that the session cookie is not discarded when the page is reloaded, keeping the user authenticated.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `standard_user`. Land on `/inventory.html`. | Cookie `session-username` = `standard_user` is present. |
| 2 | Reload the page (`page.reload()`). | URL remains on `/inventory.html` — the user is not redirected to the login page. Cookie `session-username` is still present with the correct value. |

---

### TC-37 — Direct Navigation to Protected Route Without Session Cookie Redirects to Login

**User:** Guest (unauthenticated context, no cookie)  
**Goal:** Verify that the application enforces server-side route protection: accessing a protected URL without any session cookie results in a redirect and an error message.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | In a fresh, unauthenticated browser context, navigate directly to `https://www.saucedemo.com/inventory.html`. | Application redirects to `https://www.saucedemo.com/`. URL is `/`. Error banner shows: **"Epic sadface: You can only access '/inventory.html' when you are logged in."** |

> **Note:** This differs from TC-32, which tests the redirect *after logout* (cookie is present but invalidated). TC-37 uses a guest context where the cookie was never set — it validates the guard independently of the logout flow.

---

## Suite 2: Product Catalogue

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`, unless stated otherwise.

---

### TC-09 — Inventory Page Displays Product Grid Correctly

**Users:** `standard_user` · `problem_user` *(parametrized — runs once per user)*  
**Goal:** Verify the full structure of the inventory page and capture a visual baseline. For `problem_user`, the screenshot is compared against the `standard_user` baseline to expose visual defects (broken images).

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in with the given user and navigate to `/inventory.html`. | `[data-test="title"]` shows **"Products"**. Exactly 6 product cards are visible (`.inventory_item`). Sort dropdown `.active_option` shows **"Name (A to Z)"**. `#react-burger-menu-btn` and `[data-test="shopping-cart-link"]` are visible in the header. |
| 2 | Capture a full-page screenshot and compare against the baseline `inventory-initial-load.png`. | **`standard_user`:** Screenshot matches the baseline within a 2% pixel difference ratio. **`problem_user`:** Screenshot does NOT match the baseline — pixel diff exposes broken product images. This failure is the expected and intended outcome of this test. |

> **Visual baseline:** Generated on first run for `standard_user`. `problem_user` is expected to fail the screenshot assertion, demonstrating a visual regression.

---

### TC-10 — Sort Products by Name (A to Z) — Default

**Goal:** Verify the default sort order is A to Z by product name.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Collect all `[data-test="inventory-item-name"]` text values. | The collected names are already in ascending alphabetical order. No sort action needed. |

---

### TC-11 — Sort Products by Name (Z to A)

**Goal:** Verify that products can be sorted in reverse alphabetical order.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Select option `za` from `[data-test="product-sort-container"]`. | Products reorder. Collected names match the reverse of the A to Z order. |

---

### TC-12 — Sort Products by Price (Low to High)

**Goal:** Verify that products can be sorted ascending by price.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Select option `lohi` from `[data-test="product-sort-container"]`. | Products reorder. Parsed prices from `[data-test="inventory-item-price"]` form a non-decreasing sequence. |

---

### TC-13 — Sort Products by Price (High to Low)

**Goal:** Verify that products can be sorted descending by price.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Select option `hilo` from `[data-test="product-sort-container"]`. | Products reorder. Parsed prices form a non-increasing sequence. |

---

### TC-14 — Navigate to Product Detail Page and Back

**Goal:** Verify that clicking the first product (default A to Z = "Sauce Labs Backpack") opens the detail page with data matching `src/data/products.json`, and the back button returns to the inventory.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Click the first `[data-test="inventory-item-name"]`. | URL changes to `/inventory-item.html?id=4`. |
| 2 | Assert product data against `products[0]` from `products.json`. | `[data-test="inventory-item-name"]` = **"Sauce Labs Backpack"**. `[data-test="inventory-item-desc"]` = correct description. `[data-test="inventory-item-price"]` = **"$29.99"**. `[data-test="add-to-cart"]` and `[data-test="back-to-products"]` are visible. |
| 3 | Click `[data-test="back-to-products"]`. | URL returns to `/inventory.html`. Six product cards are visible. |

---

### TC-15 — Add to Cart from Product Detail Page

**Goal:** Verify that a product can be added to the cart from the detail page and that badge and remove button reflect the change.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to the detail page of the first product ("Sauce Labs Backpack"). | `[data-test="inventory-item-name"]` = **"Sauce Labs Backpack"**. `[data-test="inventory-item-price"]` = **"$29.99"**. No `[data-test="shopping-cart-badge"]` is visible. |
| 2 | Click `[data-test="add-to-cart"]`. | `[data-test="shopping-cart-badge"]` appears and shows **"1"**. |
| 3 | Click `[data-test="back-to-products"]`. | Returns to `/inventory.html`. Badge still shows **"1"**. `[data-test="remove-sauce-labs-backpack"]` button is visible on the product card. |

---

## Suite 3: Cart

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`, unless stated otherwise.

---

### TC-18 — Add a Single Item to Cart — Badge Updates to 1

**Product:** `sauce-labs-backpack`  
**Goal:** Verify that adding one product updates the cart badge to 1.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | `[data-test="shopping-cart-badge"]` is not visible. |
| 2 | Click `[data-test="add-to-cart-sauce-labs-backpack"]`. | `[data-test="shopping-cart-badge"]` appears and shows **"1"**. `[data-test="remove-sauce-labs-backpack"]` button is visible. |

---

### TC-19 — Add Multiple Items — Badge Count Updates Correctly

**Products:** `sauce-labs-backpack` · `sauce-labs-bike-light` · `sauce-labs-bolt-t-shirt`  
**Goal:** Verify that the cart badge increments correctly as multiple items are added.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click `[data-test="add-to-cart-sauce-labs-backpack"]`. | Badge shows **"1"**. |
| 2 | Click `[data-test="add-to-cart-sauce-labs-bike-light"]`. | Badge shows **"2"**. |
| 3 | Click `[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]`. | Badge shows **"3"**. |

---

### TC-20 — Remove Item from Inventory Page

**Product:** `sauce-labs-backpack`  
**Goal:** Verify that clicking "Remove" on a product card removes it from the cart and hides the badge.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add `sauce-labs-backpack` to the cart. | Badge shows **"1"**. Remove button is visible. |
| 2 | Click `[data-test="remove-sauce-labs-backpack"]`. | Badge disappears. `[data-test="add-to-cart-sauce-labs-backpack"]` button is visible again. |

---

### TC-21 — Cart Page Displays Added Items Correctly

**Products:** `sauce-labs-backpack` · `sauce-labs-bike-light`  
**Goal:** Verify that the cart page lists the correct items with names and prices matching `products.json`.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add `sauce-labs-backpack` and `sauce-labs-bike-light` to the cart. Click `[data-test="shopping-cart-link"]`. | URL changes to `/cart.html`. `[data-test="cart-list"]` contains exactly 2 `.cart_item` rows. |
| 2 | Assert item names and prices from `[data-test="cart-list"]`. | Names (in order): **"Sauce Labs Backpack"**, **"Sauce Labs Bike Light"**. Prices: **"$29.99"**, **"$9.99"**. `[data-test="continue-shopping"]` and `[data-test="checkout"]` are visible. |

---

### TC-22 — Remove Item from Cart Page

**Products:** `sauce-labs-backpack` · `sauce-labs-bike-light`  
**Goal:** Verify that items can be removed one by one from the cart page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add both products. Navigate to `/cart.html`. | Cart shows 2 items. Badge shows **"2"**. |
| 2 | Click the first `[data-test^="remove-"]` button. | Cart shows 1 item. Badge shows **"1"**. |
| 3 | Click the remaining `[data-test^="remove-"]` button. | Cart is empty. Badge disappears. |

---

### TC-23 — Empty Cart State

**Goal:** Verify the cart page renders correctly when it contains no items.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/cart.html` with no items in cart. | `[data-test="cart-list"]` is visible but contains 0 `.cart_item` rows. No badge in the header. `[data-test="continue-shopping"]` and `[data-test="checkout"]` are visible. |

---

### TC-24 — Continue Shopping Returns to Inventory

**Product:** `sauce-labs-backpack`  
**Goal:** Verify that clicking "Continue Shopping" from the cart page returns the user to the inventory with the cart state preserved.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add `sauce-labs-backpack` to the cart. Navigate to `/cart.html`. Click `[data-test="continue-shopping"]`. | URL returns to `/inventory.html`. Six product cards visible. Badge shows **"1"**. `[data-test="remove-sauce-labs-backpack"]` is visible. |

---

## Suite 4: Checkout

> **Precondition for all TC in this suite:** User is logged in as `standard_user`, has added `sauce-labs-backpack` to the cart, and has navigated to `/cart.html`, unless stated otherwise.  
> **Form data source:** `checkoutForms.standard` = `{ firstName: "John", lastName: "Doe", postalCode: "12345" }`.

---

### TC-25 — Complete Checkout Happy Path

**Goal:** Verify the full 3-step checkout flow completes successfully.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click `[data-test="checkout"]` from the cart page. | URL changes to `/checkout-step-one.html`. Form with firstName, lastName, postalCode fields is visible. |
| 2 | Fill the form with `checkoutForms.standard`. Click `[data-test="continue"]`. | URL changes to `/checkout-step-two.html`. Order summary container is visible. Subtotal, tax, and total labels are present. |
| 3 | Click `[data-test="finish"]`. | URL changes to `/checkout-complete.html`. `[data-test="complete-header"]` shows **"Thank you for your order!"**. `[data-test="complete-text"]` is visible. `[data-test="back-to-products"]` is visible. Cart badge is gone. |
| 4 | Click `[data-test="back-to-products"]`. | URL returns to `/inventory.html`. Cart is empty. No badge shown. |

---

### TC-26 — Checkout Step 1 — Required Field Validations

**Goal:** Verify that each required field shows the correct error when left empty. All three validations are tested sequentially in the same session.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Fill form with `{ ...checkoutForms.standard, firstName: "" }`. Click `[data-test="continue"]`. | Error banner shows: **"Error: First Name is required"**. |
| 2 | Dismiss error. Clear all fields. Fill with `{ ...checkoutForms.standard, lastName: "" }`. Click `[data-test="continue"]`. | Error banner shows: **"Error: Last Name is required"**. |
| 3 | Dismiss error. Clear all fields. Fill with `{ ...checkoutForms.standard, postalCode: "" }`. Click `[data-test="continue"]`. | Error banner shows: **"Error: Postal Code is required"**. |

---

### TC-27 — Checkout Step 2 — Order Summary Price Breakdown

**Goal:** Verify that the subtotal on the summary page matches the known product price and that total = subtotal + tax.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Complete Step 1 with `checkoutForms.standard`. Land on `/checkout-step-two.html`. | Order summary is displayed. |
| 2 | Read `[data-test="subtotal-label"]`, `[data-test="tax-label"]`, `[data-test="total-label"]`. | `subtotal` = **$29.99** (matches `products[0].price` from `products.json`). `total` ≈ `subtotal + tax` (within 2 decimal places). `[data-test="finish"]` is visible. |

---

### TC-28 — Cancel Checkout from Step 1 Returns to Cart

**Goal:** Verify that cancelling from Step 1 returns the user to the cart without losing cart contents.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click `[data-test="checkout"]`. Land on `/checkout-step-one.html`. Click `[data-test="cancel"]`. | URL returns to `/cart.html`. Cart still contains 1 item. Badge shows **"1"**. |

---

### TC-29 — Cancel Checkout from Step 2 Returns to Inventory

**Goal:** Verify that cancelling from Step 2 returns the user to the inventory with cart contents preserved.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Complete Step 1. Land on `/checkout-step-two.html`. Click `[data-test="cancel"]`. | URL returns to `/inventory.html`. Cart still has 1 item. Badge shows **"1"**. |

---

### TC-30 — Error User — Checkout Triggers Telemetry Error (Fail on Purpose)

**User:** `error_user`  
**Goal:** Verify that `error_user` triggers a 503 response to `submit.backtrace.io` during the `finish()` action. The framework logs this as a warning. The checkout does NOT complete, demonstrating a known defect for this user type.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `error_user`. Add one item to cart. Complete Step 1 with `checkoutForms.standard`. Land on `/checkout-step-two.html`. | Step 2 summary is visible. |
| 2 | Click `[data-test="finish"]`. | A `POST` to `https://submit.backtrace.io/…/json` fires and receives a **503** response. The framework logs: `[warn] CheckoutStep2: error telemetry returned 503 — fault injection active (error_user)`. URL does **not** change to `/checkout-complete.html` — the checkout is blocked. |

> **Expected test result:** FAIL (intentional). This test documents the defect and demonstrates the framework's error telemetry logging. `standard_user` completing the same flow (TC-25) is the passing baseline.

---

### TC-34 — Checkout with Multiple Products — Subtotal Matches Sum of Item Prices

**Products:** `sauce-labs-backpack` ($29.99) · `sauce-labs-bike-light` ($9.99) · `sauce-labs-bolt-t-shirt` ($15.99)  
**Goal:** Verify that the checkout summary correctly reflects the combined price of three products added to the cart.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add `sauce-labs-backpack`, `sauce-labs-bike-light`, and `sauce-labs-bolt-t-shirt` to the cart. | Badge shows **"3"**. |
| 2 | Navigate to `/cart.html`. | Cart contains exactly 3 `.cart_item` rows. |
| 3 | Click `[data-test="checkout"]`. Fill form with `checkoutForms.standard`. Click `[data-test="continue"]`. | URL changes to `/checkout-step-two.html`. |
| 4 | Assert item count and prices in the summary. | Summary contains exactly **3** `.cart_item` rows. `subtotal` ≈ **$55.97** (29.99 + 9.99 + 15.99, calculated from `products.json`). `total` ≈ `subtotal + tax`. |
| 5 | Click `[data-test="finish"]`. | URL changes to `/checkout-complete.html`. `[data-test="complete-header"]` shows **"Thank you for your order!"**. Cart badge is gone. |

---

## Suite 5: Logout

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`.

---

### TC-31 — Logout via Burger Menu

**Goal:** Verify that a user can log out via the sidebar menu and is redirected to the login page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click `#react-burger-menu-btn` in the top-left header. | Sidebar drawer opens. `[data-test="logout-sidebar-link"]` is visible. |
| 2 | Click `[data-test="logout-sidebar-link"]`. | URL changes to `https://www.saucedemo.com/`. Both `[data-test="username"]` and `[data-test="password"]` fields are empty. Login button is visible. No error banner is shown. |

---

### TC-32 — Protected Routes Redirect to Login After Logout

**Goal:** Verify that accessing protected pages after logout redirects the user to the login page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log out via the burger menu. URL is on `/`. | Session is cleared. |
| 2 | Navigate directly to `https://www.saucedemo.com/inventory.html`. | Redirected to `/`. Error banner shows: **"Epic sadface: You can only access '/inventory.html' when you are logged in."** |
| 3 | Navigate directly to `https://www.saucedemo.com/cart.html`. | Redirected to `/`. Error banner is visible. |

---

### TC-33 — Browser Back Button After Logout Does Not Restore Session

**Goal:** Verify that pressing the browser back button after logout does not re-enter the application.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log out via the burger menu. URL is on `/`. | Session is cleared. |
| 2 | Press the browser Back button. | Application does not navigate back to the inventory. User remains on the login page. Session is fully invalidated. |

---

### TC-38 — Session Cookie Is Cleared After Logout

**User:** `standard_user`  
**Goal:** Verify that logging out removes the `session-username` cookie from the browser context, fully invalidating the client-side session.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `standard_user` and land on `/inventory.html`. Inspect the browser context cookies. | Cookie `session-username` is present with value **`standard_user`**. |
| 2 | Open the burger menu and click `[data-test="logout-sidebar-link"]`. | URL changes to `/`. |
| 3 | Inspect the browser context cookies again. | Cookie `session-username` is no longer present in the context. |

---

## Summary

| Suite | TC IDs | # Cases |
|-------|--------|---------|
| Suite 1 — Login / Auth | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-08, TC-35, TC-36, TC-37 | 10 |
| Suite 2 — Product Catalogue | TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15 | 7 |
| Suite 3 — Cart | TC-18, TC-19, TC-20, TC-21, TC-22, TC-23, TC-24 | 7 |
| Suite 4 — Checkout | TC-25, TC-26, TC-27, TC-28, TC-29, TC-30, TC-34 | 7 |
| Suite 5 — Logout | TC-31, TC-32, TC-33, TC-38 | 4 |
| **Total** | | **35** |

> **Removed test cases:** TC-07 (merged into TC-01 as parametrized run for `performance_glitch_user`). TC-16 and TC-17 (replaced by the `problem_user` run of TC-09 with visual regression comparison).
