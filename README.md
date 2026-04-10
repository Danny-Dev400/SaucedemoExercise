# Saucedemo Playwright Test Suite

End-to-end test suite for [saucedemo.com](https://www.saucedemo.com) built with Playwright and TypeScript.

> Full test case specification: [`specs/saucedemo-test-cases.md`](specs/saucedemo-test-cases.md) — 35 cases across 5 suites (Login, Catalogue, Cart, Checkout, Logout).

> Take a look also to the Architecture of the Framework: [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | `>= 18.0.0` |
| npm | `>= 9.0.0` |

---

## Setup

```bash
npm install
npx playwright install
```

`npx playwright install` downloads the browser binaries (Chromium and Firefox) required by the suite. This only needs to be run once after `npm install`.

---

## Running tests

### Run all tests

```bash
npx playwright test
```

Expected output: two browser projects run in parallel (`chromium` · `firefox`). All passing tests are reported as green. TC-30 (`error_user` checkout) is expected to fail by design — it documents a known intermittent 503 from the error user's backtrace endpoint.

### Run a specific test file

```bash
npx playwright test src/tests/checkout.spec.ts
npx playwright test src/tests/cart.spec.ts
npx playwright test src/tests/login.spec.ts
npx playwright test src/tests/catalogue.spec.ts
npx playwright test src/tests/logout.spec.ts
```

### Run a specific test by name

```bash
npx playwright test --grep "TC-25"
npx playwright test --grep "Complete checkout happy path"
```

The `--grep` flag accepts a string or regex and matches against the test title.

### Run tests on a single browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

---

## Viewing the HTML report

After any test run, open the interactive HTML report:

```bash
npx playwright show-report
```

This serves the report at `http://localhost:9323`. The report includes pass/fail status, screenshots captured on failure, and downloadable traces for any test that did not pass.

A JSON report is also generated at `test-results/results.json` after each run, suitable for CI integrations.

---

## Configuration notes

### Timeouts

| Setting | Value | Reason |
|---|---|---|
| `timeout` | 60 000 ms | Outer test timeout. `performance_glitch_user` intentionally adds network delay on every request; a standard 30 s timeout would cause false failures on slower machines. |
| `actionTimeout` | 10 000 ms | Per-action timeout. Applied on both browser projects. Accounts for the glitch user's random latency spikes without slowing down the default `waitFor` calls across all other users. |

### Retries

Retries are set to `1` in CI (`process.env.CI`) and `0` locally. This catches transient network flakes in the pipeline without masking real bugs during local development.

### Screenshots

Playwright's built-in `screenshot: 'only-on-failure'` is used. Screenshots are saved automatically by the framework to the `test-results/` directory. No custom hook is needed — the built-in covers all failure modes including timeouts, assertion errors, and unexpected exceptions.

### Reporters

- **HTML** (`reporter: 'html'`) — interactive report with timeline, screenshots, and traces.
- **JSON** (`outputFile: 'test-results/results.json'`) — machine-readable output for CI dashboards or post-processing.

---

## Design decisions

The suite follows the **Page Object Model** with an abstract `BasePage` class that wraps every interaction in safe, retry-aware helpers (`safeFill`, `safeSelect`, `safeClick`). This prevents tests from breaking on minor DOM timing issues and keeps assertion logic out of the infrastructure layer.

**Test isolation** is achieved through Playwright's `storageState` mechanism: `global-setup.ts` logs in each user once per browser at the start of the run and persists the session to `.auth/<browser>/<user>.json`. Each test receives a fresh `BrowserContext` restored from that snapshot — no test can pollute another's auth state, and login overhead is paid exactly once.

**Data-driven testing** is enforced via a single source of truth in `src/data/`: product catalogue scraped from the live site (`products.json`), form fixtures (`checkoutForms.ts`), and user credentials (`users.json`). Assertions reference these files directly, so a product price change in the catalogue is caught automatically without touching test logic.

The main trade-off under time constraints was **breadth over depth**: every functional area has happy-path and key negative-path coverage, but visual regression tests (`toHaveScreenshot`) are limited to the initial inventory load because baseline maintenance would require a dedicated review step.

---

## Bonus

### `performance_glitch_user` — timeout threshold

TC-01 is parametrized and runs for both `standard_user` and `performance_glitch_user`. The URL assertion after login uses an explicit `timeout: 15_000` (15 s). The reasoning is documented inline in [`src/tests/login.spec.ts`](src/tests/login.spec.ts):

- `performance_glitch_user` injects an artificial ~5 s delay on every network request before the page resolves.
- Observed baseline load time on the app is ~2–3 s, putting the realistic worst case at ~8 s.
- 15 s provides a ~7 s safety margin for CI runner variance without being so permissive that a genuine hang would go undetected.
- `standard_user` always resolves well under this threshold, so the elevated timeout does not mask regressions for normal users.

### Onboarding a Junior Engineer

The first thing I would do is point a new team member at this README and [`ARCHITECTURE.md`](ARCHITECTURE.md) before they touch a single test file. Understanding the layered design — data layer, page objects, fixtures, safe actions — prevents the common mistake of writing raw `page.locator()` calls inside tests and bypassing all the reliability infrastructure we built.

Next, I would walk them through one complete test case end-to-end: pick TC-25 (checkout happy path), trace it from the fixture that sets up the authenticated context, through `SaucedemoPages` to the POM methods, down to `SafeActions`. Seeing that a single `pages.checkoutStep1.fill(checkoutForms.standard)` call expands into a validated, retry-aware sequence of browser interactions makes the value of each layer tangible.

For documentation I would add a short `CONTRIBUTING.md` with three rules: (1) never hardcode a product name, price, or credential — always import from `src/data/`; (2) never call Playwright APIs directly in a test — go through the page object; (3) always extend an existing suite or add a new spec file rather than appending to an unrelated one. These three rules cover the most common ways a junior engineer accidentally introduces fragile tests.

On test data pollution in a shared environment like SauceDemo: the key protection is that every test fixture creates its own isolated `BrowserContext` restored from a storageState snapshot. Cart contents, session tokens, and URL state are all scoped to that context and discarded at teardown — no test can leave dirty state for the next one. For the checkout and cart suites specifically, tests always start from a clean inventory page and explicitly add only the items they need. I would also make it clear that SauceDemo resets cart state on every new session, so there is no need for explicit teardown calls — but if we ever moved to a stateful environment, we would add `afterEach` cleanup hooks at the fixture level, not inside individual tests, so cleanup stays out of the assertion logic.
