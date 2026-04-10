# Architecture

## Directory structure

```
.
├── global-setup.ts              # Playwright globalSetup — pre-run auth for all users × browsers
├── playwright.config.ts         # Playwright configuration (browsers, timeouts, reporters)
├── tsconfig.json
├── .eslintrc.json
├── .auth/                       # Generated — storageState snapshots (gitignored)
│   ├── chromium/
│   │   ├── standard_user.json
│   │   ├── problem_user.json
│   │   ├── performance_glitch_user.json
│   │   └── error_user.json
│   └── firefox/
│       └── (same files)
└── src/
    ├── config/
    │   └── users.ts             # Typed user map, reads from src/data/users.json
    ├── data/
    │   ├── users.json           # Credentials for all 5 test accounts
    │   ├── products.json        # Full product catalogue scraped from the live site
    │   └── checkoutForms.ts     # Typed checkout form fixtures
    ├── models/
    │   └── CheckoutForm.ts      # CheckoutFormData interface
    ├── fixtures/
    │   ├── index.ts             # test.extend — custom fixtures (standard, problem, error, …)
    │   └── SaucedemoPages.ts    # Lazy-loaded page aggregator per browser context
    ├── pages/
    │   ├── BasePage.ts          # Abstract base — safe action wrappers
    │   ├── LoginPage.ts
    │   ├── InventoryPage.ts
    │   ├── ProductDetailPage.ts
    │   ├── CartPage.ts
    │   ├── CheckoutStep1Page.ts
    │   ├── CheckoutStep2Page.ts
    │   ├── CheckoutCompletePage.ts
    │   ├── index.ts             # Re-exports all pages
    │   └── components/
    │       ├── Header.ts        # Shared header (cart badge, menu)
    │       └── Sidebar.ts       # Burger menu sidebar (logout, reset)
    ├── tests/
    │   ├── login.spec.ts        # Suite 1 — Login (TC-01 to TC-08)
    │   ├── logout.spec.ts       # Suite 2 — Logout (TC-10 to TC-13)
    │   ├── catalogue.spec.ts    # Suite 3 — Catalogue (TC-14 to TC-17)
    │   ├── cart.spec.ts         # Suite 4 — Cart (TC-18 to TC-24)
    │   └── checkout.spec.ts     # Suite 5 — Checkout (TC-25 to TC-34)
    └── utils/
        ├── SafeActions.ts       # Static safe interaction helpers
        └── logger.ts            # Winston console logger
```

---

## Layer overview

### 1. Data layer — `src/data/`

All test inputs live in one place. No string literals are scattered across test files.

| File | Purpose |
|---|---|
| `users.json` | Credentials for the 5 saucedemo test accounts |
| `products.json` | Scraped product catalogue: id, slug, name, description, price, image, detail URL |
| `checkoutForms.ts` | Typed `CheckoutFormData` fixtures (`standard`, `alternate`) |

`products.json` is the single source of truth for all product assertions. If a price or name changes on the site, the file is updated once and every test that references it is automatically correct.

### 2. Config layer — `src/config/users.ts`

```typescript
import rawUsers from '../data/users.json';
export const users = rawUsers satisfies Record<string, UserCredentials>;
export type UserKey = keyof typeof users;
```

The `satisfies` operator enforces the `UserCredentials` shape against the JSON at compile time without widening the type, preserving the literal keys for use in fixture definitions.

### 3. Authentication — `global-setup.ts` + `src/fixtures/index.ts`

Authentication follows a **cache-then-restore** pattern:

1. `global-setup.ts` runs once before the test suite. For each user × browser combination it opens a fresh context, performs a real login, and saves the session to `.auth/<browser>/<user>.json`.
2. Each test fixture (`standard`, `problem`, `error`, …) calls `browser.newContext({ storageState: filePath })`. The browser starts already authenticated — no login UI is touched during the test run.
3. If the cached file does not exist (first run or CI cold start), the fixture falls back to a live login and saves the state, so the suite is self-healing.

This ensures **complete test isolation**: every test gets its own `BrowserContext` and `Page`. State mutations (cart contents, sort order, URL) are never shared across tests.

### 4. Page Object Model — `src/pages/`

Every page in the application maps to a single class that extends `BasePage`.

```
BasePage (abstract)
│   safeFill / safeSelect / safeClick
│   isElementVisible / waitForVisible / waitForDetached
│
├── LoginPage
├── InventoryPage
├── ProductDetailPage
├── CartPage
├── CheckoutStep1Page
├── CheckoutStep2Page
├── CheckoutCompletePage
└── components/
    ├── Header
    └── Sidebar
```

Page classes expose:
- **Locators** as `readonly` properties (defined once in the constructor, never re-queried).
- **Action methods** that call the safe helpers and encapsulate multi-step interactions (e.g. `fill(data: CheckoutFormData)`, `getPrices()`).

Tests never call `page.locator()` or `page.fill()` directly. All DOM interaction goes through a page method.

### 5. Safe actions — `src/utils/SafeActions.ts`

A static utility class that wraps every interaction with a reliability layer:

| Method | Behaviour |
|---|---|
| `safeFill` | `waitFor(visible)` → `click` → `clear` → `fill` → dispatch `change`/`blur` → `verifyAndRetry` |
| `safeSelect` | `waitFor(visible)` → `click` → `selectOption` → dispatch `input`/`change`/`blur` → `verifyAndRetry` |
| `safeClick` | `waitFor(visible)` → `click` |
| `verifyAndRetry` | Reads back `inputValue()`, warns on mismatch, retries once, logs an error if retry also fails |

`verifyAndRetry` exists because React's controlled-input re-renders can swallow a `fill` call if the component re-mounts between the clear and the fill. Reading the value back after every fill catches this silently.

### 6. Page aggregator — `src/fixtures/SaucedemoPages.ts`

Each fixture provides a `SaucedemoPages` instance rather than individual page objects. Page objects are lazily instantiated via `??=` so they are only created when actually used by a test.

```typescript
get inventoryPage() {
  return (this._inventoryPage ??= new InventoryPage(this.page));
}
```

This avoids the overhead of constructing every page object for every test, and keeps the fixture API ergonomic (`pages.inventoryPage.addToCart(slug)`).

### 7. Fixtures — `src/fixtures/index.ts`

Custom fixtures are defined with `test.extend<Fixtures>`. Each fixture:
- Creates a `BrowserContext` restored from the matching storageState file.
- Opens a new `Page` inside that context.
- Constructs a `SaucedemoPages` instance and yields it via `use(pages)`.
- Closes the context in teardown, discarding all in-test state.

The `guest` fixture skips storageState entirely and provides a clean unauthenticated context for login tests.

### 8. Test files — `src/tests/`

Tests import `{ test, expect }` from `../fixtures` (not from `@playwright/test`) to get the enriched fixture API. Each spec file maps to one functional module:

| Suite | File | Users |
|---|---|---|
| Suite 1 — Login | `login.spec.ts` | `guest`, `standard`, `lockedOut`, `performanceGlitch` |
| Suite 2 — Logout | `logout.spec.ts` | `standard` |
| Suite 3 — Catalogue | `catalogue.spec.ts` | `standard`, `problem` |
| Suite 4 — Cart | `cart.spec.ts` | `standard` |
| Suite 5 — Checkout | `checkout.spec.ts` | `standard`, `error` |

---

## Authentication flow diagram

```
npm test
    │
    ▼
global-setup.ts
    ├── chromium: login standard_user   → .auth/chromium/standard_user.json
    ├── chromium: login problem_user    → .auth/chromium/problem_user.json
    ├── chromium: login error_user      → .auth/chromium/error_user.json
    ├── chromium: login glitch_user     → .auth/chromium/performance_glitch_user.json
    ├── firefox:  (same four sessions)
    │
    ▼
Test run (fullyParallel: true)
    │
    ├── TC-25 [chromium]
    │       └── fixture: standard
    │               └── newContext({ storageState: .auth/chromium/standard_user.json })
    │                       └── already on /inventory.html, no login needed
    │
    └── TC-25 [firefox]
            └── fixture: standard
                    └── newContext({ storageState: .auth/firefox/standard_user.json })
```

---

## Data flow for a checkout test

```
products.json ──────────────────────────────────────────┐
                                                         │
checkoutForms.ts ────────────────────────────────┐      │
                                                 │      │
checkout.spec.ts                                 │      │
  │  import checkoutForms.standard               │      │
  │  import products[0].price ──────────────────────────┘
  │                                              │
  ▼                                              ▼
pages.checkoutStep1.fill(checkoutForms.standard)
    └─ safeFill(firstName, "John")
    └─ safeFill(lastName, "Doe")
    └─ safeFill(postalCode, "12345")

pages.checkoutStep2.getPrices()
    └─ returns { subtotal, tax, total }

expect(subtotal).toBeCloseTo(parseFloat(products[0].price.replace('$', '')), 2)
```

---

## Key design decisions

**Why `BasePage` and not direct Playwright calls in tests?**
Centralizing interactions means a locator change or a reliability fix is applied once, not across every test that touches that element.

**Why static `SafeActions` instead of instance methods on each page?**
Pages already inherit from `BasePage`. A static utility avoids a second inheritance chain and keeps the reliability layer independently testable and reusable.

**Why storageState and not `beforeEach` login?**
On a 33-test suite across 2 browsers with `fullyParallel: true`, a `beforeEach` login would add ~1–2 s per test × 66 runs = 66–132 extra seconds. StorageState restores cookies and localStorage in milliseconds.

**Why `products.json` instead of hardcoded values?**
The site's product data is stable but not guaranteed. Scraping once and storing as a fixture means tests never drift silently from the real UI values, and adding a new data-driven test case requires no new hardcoded strings.
