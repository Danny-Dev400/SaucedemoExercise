# SauceDemo — Full Test Case Specification

**Application:** https://www.saucedemo.com/  
**Page Title:** Swag Labs  
**Shared Password for all accounts:** `secret_sauce`

## Test User Accounts

| Username | Behaviour | Use for |
|----------|-----------|---------|
| `standard_user` | Fully functional | All happy-path and core tests |
| `locked_out_user` | Login is blocked by the app | Negative auth / error state tests |
| `problem_user` | Broken product images, some interactions fail | Visual / data assertion edge cases |
| `performance_glitch_user` | Login and page loads are artificially delayed | Timeout / wait handling tests |
| `error_user` | Intermittent form errors on checkout | Senior/Lead error-handling scenarios |

## Available Modules

| Module | What it covers |
|--------|---------------|
| Login / Auth | Username + password form, session cookie, error message on bad credentials |
| Product Catalogue | Product grid, sort by name/price, product detail page |
| Cart | Add / remove items, item count badge on header icon |
| Checkout | 3-step flow: cart → customer info → order summary → confirmation |
| Logout | Accessible via the burger menu |

---

## Key Selectors Reference

**Login:** `[data-test="username"]` · `[data-test="password"]` · `[data-test="login-button"]` · `[data-test="error"]`  
**Header:** `[data-test="open-menu"]` · `[data-test="shopping-cart-link"]` · `[data-test="shopping-cart-badge"]`  
**Inventory:** `[data-test="product_sort_container"]` · `[data-test="inventory-item-name"]` · `[data-test="inventory-item-price"]` · `[data-test="add-to-cart-{product-name}"]`  
**Cart:** `[data-test="cart-list"]` · `[data-test="remove-{product-name}"]` · `[data-test="continue-shopping"]` · `[data-test="checkout"]`  
**Checkout Step 1:** `[data-test="firstName"]` · `[data-test="lastName"]` · `[data-test="postalCode"]` · `[data-test="continue"]` · `[data-test="cancel"]`  
**Checkout Step 2:** `[data-test="subtotal-label"]` · `[data-test="tax-label"]` · `[data-test="total-label"]` · `[data-test="finish"]`  
**Checkout Step 3:** `[data-test="complete-header"]` · `[data-test="complete-text"]` · `[data-test="back-to-products"]`  
**Sidebar:** `[data-test="logout-sidebar-link"]` · `[data-test="inventory-sidebar-link"]` · `[data-test="reset-sidebar-link"]`

---

## Suite 1: Login / Auth

---

### TC-01 — Standard User Successful Login

**User:** `standard_user`  
**Goal:** Verify that a valid user is authenticated and redirected to the inventory page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Page loads. Tab title is "Swag Labs". Login form is visible with username, password fields, and Login button. Credentials hint at the bottom lists all accepted usernames and password. No error banner is shown. |
| 2 | Fill `[data-test="username"]` with `standard_user` | Value "standard_user" appears in the field. |
| 3 | Fill `[data-test="password"]` with `secret_sauce` | Characters are masked (dots/asterisks). |
| 4 | Click `[data-test="login-button"]` | URL changes to `/inventory.html`. Page heading "Products" is visible. Six product cards are displayed. Header shows hamburger menu and cart icon. No error banner is visible. |

---

### TC-02 — Locked Out User Is Denied Access

**User:** `locked_out_user`  
**Goal:** Verify that a locked account cannot authenticate and shows the correct error.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `locked_out_user` | Value appears in the field. |
| 3 | Fill `[data-test="password"]` with `secret_sauce` | Characters are masked. |
| 4 | Click `[data-test="login-button"]` | URL remains on `/`. Error banner `[data-test="error"]` is visible with text: **"Epic sadface: Sorry, this user has been locked out."** Red error border appears on both input fields. Red "X" close buttons appear on both fields. |

---

### TC-03 — Valid Username with Wrong Password

**User:** `standard_user`  
**Goal:** Verify that a correct username combined with a wrong password is rejected.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Fill `[data-test="password"]` with `wrong_password_123`. | Fields are filled as described. |
| 3 | Click `[data-test="login-button"]` | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username and password do not match any user in this service"**. Red error border appears on both fields. |

---

### TC-04 — Empty Username Field

**Goal:** Verify that submitting without a username shows the correct validation message.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Leave `[data-test="username"]` empty. Fill `[data-test="password"]` with `secret_sauce`. | Password is filled; username remains empty. |
| 3 | Click `[data-test="login-button"]` | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username is required"**. |

---

### TC-05 — Empty Password Field

**Goal:** Verify that submitting without a password shows the correct validation message.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Leave `[data-test="password"]` empty. | Username is filled; password remains empty. |
| 3 | Click `[data-test="login-button"]` | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Password is required"**. |

---

### TC-06 — Both Fields Empty

**Goal:** Verify that username is validated before password when both are empty.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. Both fields are empty. |
| 2 | Click `[data-test="login-button"]` without filling any field. | URL remains on `/`. Error banner is visible with text: **"Epic sadface: Username is required"**. |

---

### TC-07 — Performance Glitch User — Delayed Login

**User:** `performance_glitch_user`  
**Goal:** Verify that login completes successfully despite an artificially delayed server response.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `performance_glitch_user`. Fill `[data-test="password"]` with `secret_sauce`. | Fields are filled. |
| 3 | Click `[data-test="login-button"]` | A noticeable delay (~5 seconds) occurs before any page transition. This is expected behavior. Eventually URL changes to `/inventory.html`. Inventory page loads correctly. No error banner is visible. |

---

### TC-08 — Dismiss Error Banner via X Button

**Goal:** Verify that clicking the X close button on the error banner removes it and clears the error styling.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `https://www.saucedemo.com/` | Login page is visible. |
| 2 | Fill `[data-test="username"]` with `standard_user`. Fill `[data-test="password"]` with `bad_password_xyz`. | Fields are filled. |
| 3 | Click `[data-test="login-button"]` | Error banner `[data-test="error"]` is visible. Red "X" close buttons appear on both input fields. |
| 4 | Click the X button on the `[data-test="error"]` banner. | The error banner is no longer visible. Red error borders on both input fields are removed. The form remains interactive and ready for re-entry. |

---

## Suite 2: Product Catalogue

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`, unless stated otherwise.

---

### TC-09 — Inventory Page Displays Product Grid Correctly

**Goal:** Verify the full structure and content of the inventory page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `standard_user` and land on `/inventory.html`. | Page title `[data-test="title"]` shows "Products". Exactly 6 product cards are visible. Each card shows: product image, product name, description, price (e.g., "$9.99"), and an "Add to cart" button. Sort dropdown `[data-test="product_sort_container"]` is present and defaults to "Name (A to Z)". Header shows the cart icon and hamburger menu. |

---

### TC-10 — Sort Products by Name (A to Z) — Default

**Goal:** Verify the default sort order is A to Z by product name.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. Inspect the product order without changing the sort dropdown. | Products are displayed alphabetically from A to Z. The first product name comes before the last product name alphabetically. The sort dropdown shows "Name (A to Z)" selected. |

---

### TC-11 — Sort Products by Name (Z to A)

**Goal:** Verify that products can be sorted in reverse alphabetical order.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | Default sort is "Name (A to Z)". |
| 2 | Select "Name (Z to A)" from `[data-test="product_sort_container"]`. | Products reorder immediately. The first product in the list now comes after the last one alphabetically. The order is the reverse of the A to Z sort. |

---

### TC-12 — Sort Products by Price (Low to High)

**Goal:** Verify that products can be sorted ascending by price.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | Default sort is applied. |
| 2 | Select "Price (low to high)" from `[data-test="product_sort_container"]`. | Products reorder. The first product has the lowest price. The last product has the highest price. Prices increase from top to bottom. |

---

### TC-13 — Sort Products by Price (High to Low)

**Goal:** Verify that products can be sorted descending by price.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | Default sort is applied. |
| 2 | Select "Price (high to low)" from `[data-test="product_sort_container"]`. | Products reorder. The first product has the highest price. The last product has the lowest price. Prices decrease from top to bottom. |

---

### TC-14 — Navigate to Product Detail Page and Back

**Goal:** Verify that clicking a product name opens the detail page with all expected elements, and the back button returns to the inventory.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | Six product cards are visible. |
| 2 | Click on the name of any product (e.g., "Sauce Labs Backpack"). | URL changes to `/inventory-item.html?id={n}`. The product detail page loads. `[data-test="inventory-item-name"]` shows the correct product name. `[data-test="inventory-item-desc"]` shows the product description. `[data-test="inventory-item-price"]` shows the product price. A product image is displayed. `[data-test="add-to-cart"]` button is visible and labeled "Add to cart". `[data-test="back-to-products"]` button is visible. |
| 3 | Click `[data-test="back-to-products"]`. | URL returns to `/inventory.html`. The full product grid is visible again. |

---

### TC-15 — Add to Cart from Product Detail Page

**Goal:** Verify that a product can be added to the cart from the product detail page, and the button label and badge update accordingly.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to any product detail page. | `[data-test="add-to-cart"]` is labeled "Add to cart". No cart badge is visible (or badge shows 0). |
| 2 | Click `[data-test="add-to-cart"]`. | The button label changes to "Remove". `[data-test="shopping-cart-badge"]` appears in the header and shows "1". |
| 3 | Click `[data-test="back-to-products"]`. | Returns to `/inventory.html`. The corresponding product card shows "Remove" button. Badge still shows "1". |

---

### TC-16 — Problem User — Broken Product Images Are Shown

**User:** `problem_user`  
**Goal:** Verify that `problem_user` can access the inventory page, but product images are visually broken (wrong images shown).

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `problem_user` / `secret_sauce`. | URL changes to `/inventory.html`. No error banner is visible. |
| 2 | Inspect the product images on the inventory page. | All product images display the same incorrect image (visual defect — expected behavior for this user). Product names, descriptions, and prices are still present. The page is otherwise functional. |

---

### TC-17 — Performance Glitch User — Delayed Inventory Page Load

**User:** `performance_glitch_user`  
**Goal:** Verify that the inventory page eventually loads for `performance_glitch_user` despite an artificial delay.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `performance_glitch_user` / `secret_sauce`. | After a noticeable delay, URL changes to `/inventory.html`. |
| 2 | Inspect the inventory page. | All 6 product cards are eventually visible. Page is fully loaded and functional. The delay is expected behavior for this user type. |

---

## Suite 3: Cart

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`, unless stated otherwise.

---

### TC-18 — Add a Single Item to Cart — Badge Updates to 1

**Goal:** Verify that adding one product updates the cart badge to 1.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | No `[data-test="shopping-cart-badge"]` is visible (cart is empty). |
| 2 | Click the "Add to cart" button on any product. | The button label changes to "Remove". `[data-test="shopping-cart-badge"]` appears and shows **"1"**. |

---

### TC-19 — Add Multiple Items — Badge Count Updates Correctly

**Goal:** Verify that the cart badge count increments correctly as multiple items are added.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Land on `/inventory.html`. | Cart badge is not visible. |
| 2 | Click "Add to cart" on the first product. | Badge appears and shows "1". |
| 3 | Click "Add to cart" on a second product. | Badge updates and shows "2". |
| 4 | Click "Add to cart" on a third product. | Badge updates and shows "3". |

---

### TC-20 — Remove Item from Inventory Page

**Goal:** Verify that clicking "Remove" on a product from the inventory page removes it from the cart and updates the badge.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add one product to the cart from `/inventory.html`. | Badge shows "1". The product button shows "Remove". |
| 2 | Click the "Remove" button on the same product. | The button label changes back to "Add to cart". The badge disappears (cart is now empty). |

---

### TC-21 — Cart Page Displays Added Items Correctly

**Goal:** Verify that the cart page lists all added items with the correct details.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add 2 products to the cart from `/inventory.html`. | Badge shows "2". |
| 2 | Click `[data-test="shopping-cart-link"]` in the header. | URL changes to `/cart.html`. `[data-test="cart-list"]` is visible. Both added products are listed. Each item shows: quantity ("1"), product name, description, and price. `[data-test="continue-shopping"]` and `[data-test="checkout"]` buttons are visible. |

---

### TC-22 — Remove Item from Cart Page

**Goal:** Verify that clicking "Remove" from the cart page removes the item and updates the badge.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add 2 items to the cart. Navigate to `/cart.html`. | Both items are listed. Badge shows "2". |
| 2 | Click `[data-test="remove-{product-name}"]` on one of the items. | That item is removed from the cart list. Badge updates to "1". |
| 3 | Click the Remove button on the remaining item. | Cart list is empty. Badge disappears. |

---

### TC-23 — Empty Cart State

**Goal:** Verify the cart page renders correctly when it contains no items.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Ensure no items are in the cart. Navigate to `/cart.html`. | `[data-test="cart-list"]` is visible but contains no product rows. Column headers (QTY, Description) are still visible. No cart badge appears in the header. `[data-test="continue-shopping"]` and `[data-test="checkout"]` buttons are visible. |

---

### TC-24 — Continue Shopping Returns to Inventory

**Goal:** Verify that clicking "Continue Shopping" from the cart page returns the user to the inventory.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add an item and navigate to `/cart.html`. | Cart page is visible with the added item. |
| 2 | Click `[data-test="continue-shopping"]`. | URL returns to `/inventory.html`. The product grid is displayed. Previously added item still shows "Remove" button. Badge still shows the correct count. |

---

## Suite 4: Checkout

> **Precondition for all TC in this suite:** User is logged in as `standard_user`, has at least one item in the cart, and is on `/cart.html`, unless stated otherwise.

---

### TC-25 — Complete Checkout Happy Path

**User:** `standard_user`  
**Goal:** Verify the full 3-step checkout flow completes successfully.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add one item to the cart. Navigate to `/cart.html`. | Item is listed. |
| 2 | Click `[data-test="checkout"]`. | URL changes to `/checkout-step-one.html`. Form with `[data-test="firstName"]`, `[data-test="lastName"]`, and `[data-test="postalCode"]` fields is visible. Cancel and Continue buttons are present. |
| 3 | Fill `[data-test="firstName"]` with `John`. Fill `[data-test="lastName"]` with `Doe`. Fill `[data-test="postalCode"]` with `12345`. | All fields are filled. |
| 4 | Click `[data-test="continue"]`. | URL changes to `/checkout-step-two.html`. Order summary container `[data-test="checkout-summary-container"]` is visible. The added item is listed. Payment info, shipping info, item subtotal, tax, and total are shown. Finish and Cancel buttons are present. |
| 5 | Click `[data-test="finish"]`. | URL changes to `/checkout-complete.html`. `[data-test="complete-header"]` shows **"Thank you for your order!"**. `[data-test="complete-text"]` shows the dispatch confirmation message. Pony Express image is visible. `[data-test="back-to-products"]` button is visible. Cart badge is gone. |
| 6 | Click `[data-test="back-to-products"]`. | URL returns to `/inventory.html`. Cart is empty. No badge shown. |

---

### TC-26 — Checkout Step 1 — Required Field Validations (First Name, Last Name, Zip)

**Goal:** Verify that each required field on the customer info form shows the correct error message when left empty. All three validations are tested sequentially in a single browser session on the same page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to `/checkout-step-one.html`. | Form is visible with all three fields empty. Cancel and Continue buttons are present. |
| 2 | Leave `[data-test="firstName"]` empty. Fill `[data-test="lastName"]` with `Doe`. Fill `[data-test="postalCode"]` with `12345`. Click `[data-test="continue"]`. | URL remains on `/checkout-step-one.html`. Error banner `[data-test="error"]` is visible with text: **"Error: First Name is required"**. |
| 3 | Close the error banner. Clear all fields. Fill `[data-test="firstName"]` with `John`. Leave `[data-test="lastName"]` empty. Fill `[data-test="postalCode"]` with `12345`. Click `[data-test="continue"]`. | URL remains on `/checkout-step-one.html`. Error banner is visible with text: **"Error: Last Name is required"**. |
| 4 | Close the error banner. Clear all fields. Fill `[data-test="firstName"]` with `John`. Fill `[data-test="lastName"]` with `Doe`. Leave `[data-test="postalCode"]` empty. Click `[data-test="continue"]`. | URL remains on `/checkout-step-one.html`. Error banner is visible with text: **"Error: Postal Code is required"**. |

---

### TC-27 — Checkout Step 2 — Order Summary Price Breakdown

**Goal:** Verify that the order summary on Step 2 correctly displays item subtotal, tax, and total.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add one item to the cart. Navigate through Step 1 with valid customer info. Land on `/checkout-step-two.html`. | Order summary is displayed. |
| 2 | Inspect the price breakdown. | `[data-test="subtotal-label"]` shows the correct item total (sum of item prices). `[data-test="tax-label"]` shows a calculated tax value. `[data-test="total-label"]` shows the grand total (subtotal + tax). Payment info shows "SauceCard #31337". Shipping info shows "Free Pony Express Delivery!". |

---

### TC-28 — Cancel Checkout from Step 1 Returns to Cart

**Goal:** Verify that cancelling from Step 1 brings the user back to the cart without losing cart contents.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add one item to the cart. Navigate to `/checkout-step-one.html`. | Step 1 form is visible. |
| 2 | Click `[data-test="cancel"]`. | URL returns to `/cart.html`. The previously added item is still listed in the cart. Badge still shows the correct count. |

---

### TC-29 — Cancel Checkout from Step 2 Returns to Inventory

**Goal:** Verify that cancelling from Step 2 (overview) brings the user back to the inventory.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Add one item. Complete Step 1 with valid info. Land on `/checkout-step-two.html`. | Order summary is visible. |
| 2 | Click `[data-test="cancel"]`. | URL returns to `/inventory.html`. Cart still contains the item. Badge shows correct count. |

---

### TC-30 — Error User — Intermittent Checkout Form Errors

**User:** `error_user`  
**Goal:** Verify that `error_user` encounters form-level errors during checkout that do not occur for `standard_user`.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `error_user` / `secret_sauce`. Add one item to the cart. Navigate to `/checkout-step-one.html`. | Step 1 form is visible. |
| 2 | Fill all checkout fields with valid data: First Name, Last Name, Zip Code. Click `[data-test="continue"]`. | An error may appear on the form or one of the input fields may not accept input as expected. Errors are intermittent — the same action that fails once may succeed on a retry. |
| 3 | Observe behavior across multiple attempts. | At least one interaction during the checkout flow (field input or form submission) fails in a way that does not occur for `standard_user`. Errors should be specific and actionable (e.g., a field not accepting input, a validation error on a pre-filled field). |

---

## Suite 5: Logout

> **Precondition for all TC in this suite:** User is logged in as `standard_user` and is on `/inventory.html`.

---

### TC-31 — Logout via Burger Menu

**Goal:** Verify that a user can log out via the sidebar menu and is redirected to the login page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click `[data-test="open-menu"]` (hamburger icon) in the top-left header. | A sidebar navigation drawer opens. Menu items are visible: "All Items", "About", "Logout", "Reset App State". |
| 2 | Click `[data-test="logout-sidebar-link"]`. | URL changes to `https://www.saucedemo.com/`. Both username and password fields are empty. No error banner is visible. The Login button is visible. |

---

### TC-32 — Protected Routes Redirect to Login After Logout

**Goal:** Verify that accessing protected pages after logout redirects the user to the login page.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log out via the burger menu. | URL is on `/`. |
| 2 | Navigate directly to `https://www.saucedemo.com/inventory.html`. | User is redirected to `/`. Error banner `[data-test="error"]` is visible with text: **"Epic sadface: You can only access '/inventory.html' when you are logged in."** |
| 3 | Navigate directly to `https://www.saucedemo.com/cart.html`. | User is redirected to `/`. An appropriate "not logged in" error message is displayed. |

---

### TC-33 — Browser Back Button After Logout Does Not Restore Session

**Goal:** Verify that pressing the browser back button after logout does not allow re-entry into the application.

**Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `standard_user`. Navigate to `/inventory.html`. | User is on the inventory page. |
| 2 | Log out via the burger menu. | URL returns to `/`. |
| 3 | Press the browser Back button. | The application does not navigate back into the inventory page. The user remains on the login page or is immediately redirected back to it. Session is fully invalidated. |

---

## Summary

| Suite | # Cases |
|-------|---------|
| Suite 1 — Login / Auth | 8 |
| Suite 2 — Product Catalogue | 9 |
| Suite 3 — Cart | 7 |
| Suite 4 — Checkout | 6 |
| Suite 5 — Logout | 3 |
| **Total** | **33** |
