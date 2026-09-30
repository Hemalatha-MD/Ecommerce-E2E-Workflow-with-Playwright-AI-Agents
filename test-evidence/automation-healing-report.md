# SauceDemo Checkout – Automation Execution and Healing Report

**User story:** SCRUM-101 – Saucedemo e-commerce Checkout Process
**Test plan:** [specs/saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md)
**Exploratory results:** [exploratory-testing-results.md](exploratory-testing-results.md)
**Executed:** 2026-09-30
**Command:** `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line`

## 1. Summary

| Run | Passed | Failed | Notes |
|---|---|---|---|
| Initial run (as generated) | 27 | 11 | 1 script fault, 10 application defects |
| After healing | 28 | 10 | All 10 failures are application defects |
| Stability check (28 non-defect tests × 3 repeats) | 84 | 0 | No flaky tests |

- **Healed:** 1 test (TC-24), fixed on the first attempt.
- **Could not be healed / marked `test.fixme()`:** none.
- **Failing because of real defects:** 10 tests, covering 8 defects. Their assertions were not changed.

The full command still exits with code 1 because the defect tests fail by design. To get a green run of everything that is expected to pass, use `npm run test:stable`.

## 2. Environment

| Item | Value |
|---|---|
| Playwright | `@playwright/test` 1.63.0 |
| Project | `chromium` only (Desktop Chrome device, bundled Chromium, headless) |
| Viewport | 1280x720 |
| Workers | 4, fully parallel |
| Retries | 0 |
| Config | [playwright.config.js](../playwright.config.js) |

## 3. Test suite files

| File | Plan section | Test cases |
|---|---|---|
| [cart-review.spec.js](../tests/saucedemo-checkout/cart-review.spec.js) | 4.1 Cart Review (AC1) | TC-01 to TC-06 |
| [checkout-information.spec.js](../tests/saucedemo-checkout/checkout-information.spec.js) | 4.2 Checkout Information Entry (AC2) | TC-07 to TC-14 |
| [input-validation.spec.js](../tests/saucedemo-checkout/input-validation.spec.js) | 4.3 Error Handling and Input Validation (AC5) | TC-15 to TC-22 |
| [order-overview.spec.js](../tests/saucedemo-checkout/order-overview.spec.js) | 4.4 Order Overview (AC3) | TC-23 to TC-28 |
| [order-completion.spec.js](../tests/saucedemo-checkout/order-completion.spec.js) | 4.5 Order Completion (AC4) | TC-29, TC-30 |
| [access-control.spec.js](../tests/saucedemo-checkout/access-control.spec.js) | 4.6 Business Rules and Access Control | TC-31 to TC-33 |
| [navigation.spec.js](../tests/saucedemo-checkout/navigation.spec.js) | 4.7 Navigation Flow and Back Button | TC-34 to TC-38 |
| [helpers.js](../tests/saucedemo-checkout/helpers.js) | Shared test data and flow helpers | – |

## 4. Initial run: 27 passed, 11 failed

| Test | Failure | Classification |
|---|---|---|
| TC-24 | `getByTestId('inventory-item').getByRole('button')` expected 0, received 2 | **Script fault** – healed |
| TC-03 | Cart container does not contain `$39.98` | Defect BUG-01 |
| TC-15 | No validation error shown; page moved to the overview | Defect BUG-02 |
| TC-16 | No validation error shown; page moved to the overview | Defect BUG-02 |
| TC-19 | No validation error shown; page moved to the overview | Defect BUG-02 |
| TC-17 | No validation error shown; page moved to the overview | Defect BUG-03 |
| TC-18 | Expected "Error: First Name is required"; no error element | Defect BUG-04 |
| TC-22 | Expected `/checkout-step-two.html`, received `/cart.html` | Defect BUG-05 |
| TC-30 | Checkout started from an empty cart, and the empty order was confirmed | Defect BUG-06 |
| TC-31 | `/checkout-step-two.html` opened directly with no redirect | Defect BUG-07 |
| TC-35 | Enabled Finish button count expected 0, received 1 after back from confirmation | Defect BUG-08 |

## 5. Healing activities

### TC-24: Overview lists all ordered items — healed (attempt 1 of 3)

- **Failure:** step 3 asserts the overview rows have no action buttons, using `rows.getByRole('button')`. It found 2 elements.
- **Analysis:** the item title link is rendered as `<a role="button" aria-label="View details for …">`, so it matches the button role. With two items in the cart, that is two matches. The overview rows have no Remove button, so the application behaves as the plan expects; the locator was too broad.
- **Fix:** match the Remove button by accessible name: `rows.getByRole('button', { name: 'Remove' })`, with a comment explaining the quirk.
- **Verification:** passed in the full re-run and in all 3 stability repeats.

### Defect tests — marked, not healed

Each of the 10 tests that fail because the application does not meet the acceptance criteria was left with its assertion unchanged. They were given:

- a `@defect` tag, so they can be included or excluded with `--grep`;
- an `issue` annotation carrying the defect ID and summary, which shows in the HTML report;
- a `// DEFECT BUG-xx` comment above the test.

This is done through a `knownDefect(id, description)` helper in `helpers.js`. The tests still fail in a normal run. `test.fail()` was deliberately not used, since it would report these tests as passed.

## 6. Final run: 28 passed, 10 failed

### Passing (28)

TC-01, TC-02, TC-04, TC-05, TC-06, TC-07, TC-08, TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-20, TC-21, TC-23, TC-24, TC-25, TC-26, TC-27, TC-28, TC-29, TC-32, TC-33, TC-34, TC-36, TC-37, TC-38.

### Failing because of real defects (10)

| Test | Defect | AC | Expected | Actual |
|---|---|---|---|---|
| TC-03 | BUG-01 | AC1 | Cart page shows a total of $39.98 | No total on the cart page |
| TC-15 | BUG-02 | AC5 | Special characters rejected with an error | Accepted; overview opens |
| TC-16 | BUG-02 | AC5 | Digits in name fields rejected | Accepted; overview opens |
| TC-19 | BUG-02 | AC5 | Script tag as First Name rejected | Accepted; overview opens (no dialog fired) |
| TC-17 | BUG-03 | AC5 | `ABCDE` rejected as a postal code | Accepted; overview opens |
| TC-18 | BUG-04 | AC2, AC5 | Whitespace-only fields give "First Name is required" | Accepted; overview opens |
| TC-22 | BUG-05 | AC3 | Enter submits the form to the overview | Goes to the cart page |
| TC-30 | BUG-06 | AC1, AC2 | Checkout blocked with an empty cart | Checkout starts and a $0.00 order is confirmed |
| TC-31 | BUG-07 | AC2, AC3 | Direct URL to the overview redirects | Overview opens with Finish enabled |
| TC-35 | BUG-08 | AC4 | Finish unavailable after going back from the confirmation | Finish is enabled on an empty $0.00 overview |

Full defect descriptions and screenshots are in the exploratory results. BUG-01 and BUG-03 depend on what the story intends (where the total should appear; what a valid postal code is) and should be confirmed with the product owner before being raised.

Failure screenshots and traces from the latest run are in `test-results/`; the HTML report is in `playwright-report/` (`npm run report`).

## 7. Selectors and strategies applied from exploratory testing

- **`data-test` attributes throughout**, via `testIdAttribute: 'data-test'` in the config and `page.getByTestId()`. IDs are used only on the login page.
- **No fixed waits.** The app is a single-page app where the URL changes before the new page renders, so navigation helpers wait on the page title with a web-first assertion. Negative checks ("must stay on this page") assert on the URL.
- **Cart badge** is asserted with `toHaveCount(0)` when empty, because the element is removed rather than hidden.
- **Continue button** is an `<input type="submit">`, so its label is asserted with `toHaveValue('Continue')`.
- **Item title links have `role="button"`**, so row buttons are matched by name (the TC-24 fix).
- **Error highlighting** uses the `input.error` and `.error_icon` classes, scoped to `.checkout_info`, as no `data-test` hooks exist for it.
- **TC-30 uses `expect.soft`** for step 2 so that step 3 is also evaluated and both failures are reported.
- **Hooks:** `beforeEach` logs in (the `seed.spec.ts` steps) and sets up shared state; `afterEach` attaches the final URL when a test fails. TC-32 runs in its own `describe` without login.

## 8. How to run

| Purpose | Command |
|---|---|
| Everything | `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line` |
| Only tests expected to pass | `npm run test:stable` |
| Only defect tests | `npm run test:defects` |
| Open the HTML report | `npm run report` |
