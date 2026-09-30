# E-Commerce Checkout – Test Execution Report

**User story:** SCRUM-101 – Saucedemo e-commerce Checkout Process
**Application:** https://www.saucedemo.com
**Report date:** 2026-09-30
**Test plan:** [specs/saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md)

## 1. Executive Summary

The checkout flow works end to end for a normal purchase, but it does not meet the story as written. AC3 and AC4 are met, AC1 and AC2 are partly met, and AC5 (error handling) is not met: the site validates nothing beyond empty fields. Eight defects were found, four of them High severity.

| Measure | Manual (exploratory) | Automated |
|---|---|---|
| Test cases planned | 38 | 38 |
| Test cases executed | 38 | 38 |
| Passed | 28 | 28 |
| Failed | 10 | 10 |
| Blocked | 0 | 0 |
| Skipped / `test.fixme()` | – | 0 |

- **Both rounds agree.** The same 10 test cases fail in the exploratory round and in the automated suite, and all 10 failures trace to the 8 application defects.
- **Defects:** 8 in total — 4 High, 4 Medium, none Critical.
- **Automation health:** 1 script fault was found and healed. The 28 passing tests were repeated 3 times each (84 runs) with no flaky results.
- **Overall status: FAIL** against the story's acceptance criteria, because of AC5 and the defects against AC1 and AC2.

### How the "manual" round was run

The exploratory round was not hands-on clicking. The Playwright MCP browser tools were not available, so each step of the plan was driven through the Playwright library in a real Chromium browser, and the value actually seen was recorded for every step. It is a separate execution from the automated suite (different scripts, run earlier, with screenshots), but it is not independent human observation. Visual and usability judgement is therefore limited to what the screenshots show.

### Definition of Done

| Item | Status |
|---|---|
| All acceptance criteria have test cases | Done – 38 test cases across AC1–AC5 |
| Manual exploratory testing completed | Done, with the caveat above |
| Automated test scripts created and passing | Created. 28 of 38 pass; 10 fail on application defects |
| Test results documented | Done |
| Bugs logged for any failures | Documented in section 4 of this report; not yet entered in a bug tracker |
| Code committed to repository | Not done – the project folder is not a git repository |

## 2. Manual Test Results

**Source:** [test-evidence/exploratory-testing-results.md](../test-evidence/exploratory-testing-results.md) (includes expected and actual values for every step)
**Evidence:** 34 screenshots in [test-evidence/screenshots/](../test-evidence/screenshots/)

### 2.1 Results by test case

| ID | Title | Covers | Result | Defect | Evidence |
|---|---|---|---|---|---|
| TC-01 | Cart displays a single added item with full details | AC1 | PASS | | [screenshot](../test-evidence/screenshots/TC-01-cart-single-item.png) |
| TC-02 | Cart displays multiple items with correct details | AC1 | PASS | | [screenshot](../test-evidence/screenshots/TC-02-cart-two-items.png) |
| TC-03 | Cart shows the total price calculation | AC1 | **FAIL** | BUG-01 | [screenshot](../test-evidence/screenshots/TC-03-cart-no-total.png) |
| TC-04 | Cart offers Continue Shopping and Checkout options | AC1 | PASS | | [screenshot](../test-evidence/screenshots/TC-04-cart-buttons.png) |
| TC-05 | Removing an item from the cart updates the list and badge | AC1 | PASS | | [screenshot](../test-evidence/screenshots/TC-05-cart-emptied.png) |
| TC-06 | Cart with all six products | AC1 | PASS | | [screenshot](../test-evidence/screenshots/TC-06-cart-six-items.png) |
| TC-07 | Checkout button opens the information page | AC2 | PASS | | – |
| TC-08 | Information page shows the required form elements | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-08-information-page.png) |
| TC-09 | All fields empty shows a required-field error | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-09-error-all-empty.png) |
| TC-10 | First Name empty shows "First Name is required" | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-10-error-first-name.png) |
| TC-11 | Last Name empty shows "Last Name is required" | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-11-error-last-name.png) |
| TC-12 | Zip/Postal Code empty shows "Postal Code is required" | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-12-error-postal-code.png) |
| TC-13 | Error message can be dismissed | AC2 | PASS | | [screenshot](../test-evidence/screenshots/TC-13-error-dismissed.png) |
| TC-14 | Correcting the error allows the user to proceed | AC2, AC5 | PASS | | – |
| TC-15 | Special characters in name fields are rejected | AC5 | **FAIL** | BUG-02 | [screenshot](../test-evidence/screenshots/TC-15-special-chars-accepted.png) |
| TC-16 | Numeric values in name fields are rejected | AC5 | **FAIL** | BUG-02 | [screenshot](../test-evidence/screenshots/TC-16-numeric-names-accepted.png) |
| TC-17 | Invalid Zip/Postal Code format is rejected | AC5 | **FAIL** | BUG-03 | [screenshot](../test-evidence/screenshots/TC-17-alpha-zip-accepted.png) |
| TC-18 | Whitespace-only values are treated as empty | AC2, AC5 | **FAIL** | BUG-04 | [screenshot](../test-evidence/screenshots/TC-18-whitespace-accepted.png) |
| TC-19 | Script input is not executed and is rejected | AC5 | **FAIL** | BUG-02 | [screenshot](../test-evidence/screenshots/TC-19-script-input-accepted.png) |
| TC-20 | Minimum-length values are accepted | AC5 | PASS | | – |
| TC-21 | Very long values are handled | AC5 | PASS | | [screenshot](../test-evidence/screenshots/TC-21-long-input.png) |
| TC-22 | Pressing Enter submits the form | AC3, AC5 | **FAIL** | BUG-05 | [screenshot](../test-evidence/screenshots/TC-22-enter-key-result.png) |
| TC-23 | Valid information opens the overview page | AC3 | PASS | | – |
| TC-24 | Overview lists all ordered items | AC3 | PASS | | [screenshot](../test-evidence/screenshots/TC-24-overview-two-items.png) |
| TC-25 | Overview shows payment and shipping information | AC3 | PASS | | [screenshot](../test-evidence/screenshots/TC-25-overview-payment-shipping.png) |
| TC-26 | Overview shows correct subtotal, tax and total for two items | AC3 | PASS | | – |
| TC-27 | Totals are correct for one low-priced item and for all six items | AC3 | PASS | | [screenshot](../test-evidence/screenshots/TC-27-overview-six-items.png) |
| TC-28 | Overview offers Cancel and Finish options | AC3 | PASS | | – |
| TC-29 | End-to-end purchase completes successfully | AC1–AC4, cart-clear rule | PASS | | [form](../test-evidence/screenshots/TC-29-step1-information-filled.png), [confirmation](../test-evidence/screenshots/TC-29-order-complete.png) |
| TC-30 | Checkout is blocked when the cart is empty | AC1, AC2 | **FAIL** | BUG-06 | [cart](../test-evidence/screenshots/TC-30-empty-cart.png), [overview](../test-evidence/screenshots/TC-30-empty-cart-overview.png), [confirmed](../test-evidence/screenshots/TC-30-empty-cart-order-confirmed.png) |
| TC-31 | Overview cannot be reached without entering checkout information | AC2, AC3 | **FAIL** | BUG-07 | [screenshot](../test-evidence/screenshots/TC-31-overview-by-direct-url.png) |
| TC-32 | Checkout pages require login | Login rule | PASS | | [screenshot](../test-evidence/screenshots/TC-32-unauthenticated-redirect.png) |
| TC-33 | Checkout is inaccessible after logout | Login rule | PASS | | [screenshot](../test-evidence/screenshots/TC-33-back-after-logout.png) |
| TC-34 | Cancel on the information page returns to the cart | AC2, navigation | PASS | | – |
| TC-35 | Browser back button through the checkout flow | AC2–AC4, navigation | **FAIL** | BUG-08 | [fields cleared](../test-evidence/screenshots/TC-35-back-to-information-fields-cleared.png), [after order](../test-evidence/screenshots/TC-35-back-after-order-complete.png) |
| TC-36 | Cart contents persist across checkout navigation and re-login | AC1, navigation | PASS | | [screenshot](../test-evidence/screenshots/TC-36-burger-menu-open.png) |
| TC-37 | Item name links on cart and overview open the product page | AC1, AC3, navigation | PASS | | – |
| TC-38 | Confirmation page survives a reload without placing a second order | AC4 | PASS | | [screenshot](../test-evidence/screenshots/TC-38-complete-after-reload.png) |

### 2.2 Issues found during manual testing

Eight defects, BUG-01 to BUG-08, detailed in section 4.

### 2.3 Observations

These did not fail a test case but are worth recording.

| # | Observation |
|---|---|
| O1 | Only one required-field error is shown at a time, in field order. |
| O2 | When a single field is empty, error styling is applied to all three fields; only the message names the right one. |
| O3 | The error message stays on screen while the user types a correction. |
| O4 | Entered information is not kept after the browser back button from the overview, or after Cancel then Checkout. |
| O5 | An empty order shows "Item total: $0" beside "Tax: $0.00" and "Total: $0.00". |
| O6 | Fields have no maximum length; 300 characters per field were accepted without breaking the layout. The story sets no limit. |
| O7 | The confirmation page has a "Generate PDF order" button not mentioned in the story. It disappears after a reload. Not tested. |
| O8 | The cart survives logout and login in the same browser. |
| O9 | Opening `/checkout-complete.html` directly with an item in the cart shows the confirmation but does not clear the cart. |
| O10 | A third-party telemetry call (`events.backtrace.io`) returns 401 on most pages, with no visible effect. |
| O11 | Reloading or directly opening `/cart.html` returns HTTP 404 for the document, although the page then renders normally. |
| O12 | Tax is 8% of the item total, rounded to two decimals; correct for the three carts checked. |

## 3. Automated Test Results

**Source:** [test-evidence/automation-healing-report.md](../test-evidence/automation-healing-report.md)
**Scripts:** [tests/saucedemo-checkout/](../tests/saucedemo-checkout/) (JavaScript, `@playwright/test` 1.63.0)
**Command:** `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line`

### 3.1 Run history

| Run | Passed | Failed | Notes |
|---|---|---|---|
| Initial run (as generated) | 27 | 11 | 1 script fault, 10 application defects |
| After healing | 28 | 10 | All failures are application defects |
| Confirmation re-run | 28 | 10 | Same result |
| Stability check (28 non-defect tests × 3) | 84 | 0 | No flaky tests |

### 3.2 Healing activities

| Test | Attempts | Failure | Root cause | Fix | Outcome |
|---|---|---|---|---|---|
| TC-24 | 1 of 3 | `rows.getByRole('button')` expected 0, received 2 | The item title link is rendered with `role="button"`, so the locator matched it | Match the Remove button by name: `getByRole('button', { name: 'Remove' })` | Healed; passing in every run since |

- **Tests that could not be healed:** none. No test is marked `test.fixme()`.
- **Defect tests:** the 10 tests failing on application defects were not healed. Their assertions are unchanged; each carries a `@defect` tag, an `issue` annotation with the bug ID, and a `// DEFECT` comment. They fail in a normal run, so the full command exits with code 1.

### 3.3 Final results by test suite

| Suite file | Plan section | Tests | Passed | Failed | Failing tests |
|---|---|---|---|---|---|
| `cart-review.spec.js` | Cart Review (AC1) | 6 | 5 | 1 | TC-03 |
| `checkout-information.spec.js` | Checkout Information Entry (AC2) | 8 | 8 | 0 | – |
| `input-validation.spec.js` | Error Handling and Input Validation (AC5) | 8 | 2 | 6 | TC-15, TC-16, TC-17, TC-18, TC-19, TC-22 |
| `order-overview.spec.js` | Order Overview (AC3) | 6 | 6 | 0 | – |
| `order-completion.spec.js` | Order Completion (AC4) | 2 | 1 | 1 | TC-30 |
| `access-control.spec.js` | Business Rules and Access Control | 3 | 2 | 1 | TC-31 |
| `navigation.spec.js` | Navigation Flow and Back Button | 5 | 4 | 1 | TC-35 |
| **Total** | | **38** | **28** | **10** | |

Per-test results match the manual table in section 2.1 exactly: the same 28 pass and the same 10 fail.

### 3.4 Approach

- `data-test` selectors throughout, through `getByTestId`; IDs only on the login page.
- Web-first assertions with no fixed waits. Navigation helpers wait on the page title, because the URL changes before the new page renders.
- `beforeEach` logs in and sets up shared state; `afterEach` attaches the final URL on failure.
- Screenshots and traces are kept for failed tests in `test-results/`; the HTML report is in `playwright-report/`.

## 4. Defects Log

| Bug ID | Severity | Title | AC | Failed tests |
|---|---|---|---|---|
| BUG-01 | Medium | Cart page does not show a total price | AC1 | TC-03 |
| BUG-02 | High | Name fields accept special characters, digits and script tags | AC5 | TC-15, TC-16, TC-19 |
| BUG-03 | Medium | Zip/Postal Code accepts any text | AC5 | TC-17 |
| BUG-04 | High | Whitespace-only values satisfy the mandatory-field check | AC2, AC5 | TC-18 |
| BUG-05 | Medium | Pressing Enter in the form cancels checkout | AC3 | TC-22 |
| BUG-06 | High | Checkout can be completed with an empty cart | AC1, AC2 | TC-30 |
| BUG-07 | High | Checkout information step can be bypassed by URL | AC2, AC3 | TC-31 |
| BUG-08 | Medium | Back button after order completion shows a submittable empty order | AC4 | TC-35 |

All defects were reproduced in both the exploratory round and the automated suite. All steps below start logged in as `standard_user` on the Products page with an empty cart.

### BUG-01: Cart page does not show a total price

- **Severity:** Medium
- **Description:** AC1 requires the cart page to show the total price calculation. The cart shows only item rows and buttons.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart.
  2. Click the cart icon.
- **Expected:** A total of $39.98 is displayed on the cart page.
- **Actual:** No total or subtotal appears anywhere on the page. Totals first appear on the overview page.
- **Evidence:** [TC-03-cart-no-total.png](../test-evidence/screenshots/TC-03-cart-no-total.png)
- **Note:** If the total is only intended on the overview page, AC1 should be amended instead. Confirm with the product owner.

### BUG-02: Name fields accept special characters, digits and script tags

- **Severity:** High
- **Description:** AC5 requires validation errors for invalid data such as special characters. The First Name and Last Name fields accept any non-empty value.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack, open the cart, click Checkout.
  2. Enter First Name `@#$%`, Last Name `!^&*`, Zip `<>?/`.
  3. Click Continue.
  4. Repeat with `123` / `456` / `12345`, and with First Name `<script>alert(1)</script>`.
- **Expected:** A validation error is shown and the user stays on the information page.
- **Actual:** No error; the overview page opens in all three cases. The script is not executed (no dialog appears).
- **Evidence:** [TC-15](../test-evidence/screenshots/TC-15-special-chars-accepted.png), [TC-16](../test-evidence/screenshots/TC-16-numeric-names-accepted.png), [TC-19](../test-evidence/screenshots/TC-19-script-input-accepted.png)

### BUG-03: Zip/Postal Code accepts any text

- **Severity:** Medium
- **Description:** The postal code field has no format validation.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack, open the cart, click Checkout.
  2. Enter First Name `John`, Last Name `Doe`, Zip `ABCDE`.
  3. Click Continue.
- **Expected:** A postal code validation error.
- **Actual:** The overview page opens with no error.
- **Evidence:** [TC-17-alpha-zip-accepted.png](../test-evidence/screenshots/TC-17-alpha-zip-accepted.png)
- **Note:** The story does not define a valid format. Confirm whether alphanumeric codes (for example UK postcodes) are allowed before raising this.

### BUG-04: Whitespace-only values satisfy the mandatory-field check

- **Severity:** High
- **Description:** AC2 makes all three fields mandatory. A single space in each field passes the check, so an order can be placed with no real customer information.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack, open the cart, click Checkout.
  2. Type one space in each of First Name, Last Name and Zip/Postal Code.
  3. Click Continue.
- **Expected:** "Error: First Name is required"; the user stays on the information page.
- **Actual:** The overview page opens with no error.
- **Evidence:** [TC-18-whitespace-accepted.png](../test-evidence/screenshots/TC-18-whitespace-accepted.png)

### BUG-05: Pressing Enter in the form cancels checkout

- **Severity:** Medium
- **Description:** Submitting the information form with the Enter key behaves like Cancel instead of Continue.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack, open the cart, click Checkout.
  2. Enter `John`, `Doe`, `12345`.
  3. With focus in Zip/Postal Code, press Enter.
- **Expected:** The overview page opens.
- **Actual:** The browser goes to `/cart.html` ("Your Cart") and the entered information is lost.
- **Evidence:** [TC-22-enter-key-result.png](../test-evidence/screenshots/TC-22-enter-key-result.png)
- **Likely cause (not confirmed):** Cancel is a submit button placed before Continue in the form, so it may be acting as the form's default button.

### BUG-06: Checkout can be completed with an empty cart

- **Severity:** High
- **Description:** The acceptance criteria assume a cart with items. Nothing stops a user checking out an empty cart.
- **Steps to reproduce:**
  1. With an empty cart, click the cart icon.
  2. Click Checkout.
  3. Enter `John`, `Doe`, `12345`; click Continue.
  4. Click Finish.
- **Expected:** Checkout is blocked when the cart has no items.
- **Actual:** Checkout is enabled. The overview shows "Item total: $0", "Tax: $0.00", "Total: $0.00", and Finish confirms the order with "Thank you for your order!".
- **Evidence:** [empty cart](../test-evidence/screenshots/TC-30-empty-cart.png), [overview](../test-evidence/screenshots/TC-30-empty-cart-overview.png), [order confirmed](../test-evidence/screenshots/TC-30-empty-cart-order-confirmed.png)

### BUG-07: Checkout information step can be bypassed by URL

- **Severity:** High
- **Description:** A logged-in user can reach the overview page, and finish the order, without entering a name or postal code.
- **Steps to reproduce:**
  1. Add Sauce Labs Backpack to the cart.
  2. Navigate directly to `https://www.saucedemo.com/checkout-step-two.html`.
- **Expected:** Redirect to the information page or the cart.
- **Actual:** The overview page opens with the item listed and Finish enabled.
- **Evidence:** [TC-31-overview-by-direct-url.png](../test-evidence/screenshots/TC-31-overview-by-direct-url.png)

### BUG-08: Back button after order completion shows a submittable empty order

- **Severity:** Medium
- **Description:** After an order is confirmed, the browser back button returns to an overview page from which a second, empty order can be submitted.
- **Steps to reproduce:**
  1. Add Backpack and Bike Light; complete checkout with `John`, `Doe`, `12345`; click Finish.
  2. On the confirmation page, click the browser back button.
- **Expected:** The completed order cannot be resubmitted: Finish is unavailable or the user is redirected.
- **Actual:** `/checkout-step-two.html` is shown with no items, "Total: $0.00", and Finish enabled.
- **Evidence:** [TC-35-back-after-order-complete.png](../test-evidence/screenshots/TC-35-back-after-order-complete.png)

### Environment details

| Item | Value |
|---|---|
| Application | https://www.saucedemo.com (public demo site) |
| Test account | `standard_user` |
| Browser | Chromium bundled with Playwright 1.63.0 (Desktop Chrome profile), headless |
| Viewport | 1280x720 |
| Operating system | Windows 11 Home |
| Test date | 2026-09-30 |

Testing used Playwright's bundled Chromium, not branded Google Chrome. The story says "Chrome browser only"; if branded Chrome is required, the suite needs one run with `channel: 'chrome'`.

## 5. Test Coverage Analysis

### 5.1 Coverage by requirement

Every test case was executed both in the exploratory round and in the automated suite, so manual and automated coverage are identical.

| Requirement | Test cases | Manual | Automated | Passed | Failed | Verdict |
|---|---|---|---|---|---|---|
| AC1 – Cart Review | TC-01 to TC-06, TC-29, TC-30, TC-36, TC-37 | 10 | 10 | 8 | 2 | Partly met |
| AC2 – Checkout Information Entry | TC-07 to TC-14, TC-18, TC-30, TC-31, TC-34, TC-35 | 13 | 13 | 9 | 4 | Partly met |
| AC3 – Order Overview | TC-22 to TC-29, TC-31, TC-35, TC-37 | 11 | 11 | 8 | 3 | Met on the page itself; failures are in how it is reached |
| AC4 – Order Completion | TC-29, TC-35, TC-38 | 3 | 3 | 2 | 1 | Met; failure is back-button behaviour afterwards |
| AC5 – Error Handling | TC-14 to TC-22 | 9 | 9 | 3 | 6 | Not met |
| Rule: login required | TC-32, TC-33 | 2 | 2 | 2 | 0 | Met |
| Rule: confirmation clears cart | TC-29, TC-38 | 2 | 2 | 2 | 0 | Met |
| Navigation and back button | TC-34 to TC-37 | 4 | 4 | 3 | 1 | Partly met |

Test cases that cover more than one requirement are counted in each row, so the rows do not sum to 38.

### 5.2 Coverage by test type

| Type | Test cases |
|---|---|
| Happy path | TC-01, TC-02, TC-03, TC-07, TC-23, TC-24, TC-26, TC-29 |
| Negative | TC-09 to TC-12, TC-14 to TC-19, TC-30 to TC-33 |
| Boundary and edge cases | TC-05, TC-06, TC-20, TC-21, TC-22, TC-27, TC-36, TC-38 |
| Navigation | TC-34, TC-35, TC-36, TC-37 |
| UI element validation | TC-04, TC-08, TC-13, TC-25, TC-28, TC-37 |

### 5.3 Gaps

- **No hands-on manual testing.** The exploratory round was script-driven, so visual layout, usability and anything not asserted was checked only through screenshots.
- **Branded Chrome not used.** See the environment note above.
- **Other user accounts.** Only `standard_user` was tested; SauceDemo's other accounts (for example `problem_user`, `locked_out_user`) were out of scope.
- **"Generate PDF order" button.** Present on the confirmation page but not in the story, and not tested.
- **Accessibility and keyboard use.** Only the Enter key was checked (BUG-05). Tab order, focus handling and screen-reader labels were not.
- **Unverified observations.** O3 and O9 came from the planning exploration and have no test case.
- **Undefined rules.** The story sets no postal code format and no maximum field length, so TC-17 and TC-21 cannot be judged definitively.
- **Non-functional.** No performance, security (beyond one script-injection input) or responsive-layout testing.
- **Multiple quantities.** The site offers no way to set a quantity above 1, so quantity handling beyond 1 is untested.

### 5.4 Recommendations for additional testing

1. One hands-on exploratory session in branded Chrome, focused on layout, error styling (O2) and keyboard navigation.
2. Test cases for O3 and O9, and for the "Generate PDF order" button once its intended behaviour is known.
3. A data-driven validation suite once the product owner defines the name, postal code and length rules.
4. A keyboard and accessibility pass on the information form.
5. A run of the suite against the other SauceDemo accounts, if they are in scope.

## 6. Summary and Recommendations

### Overall quality assessment

The core purchase path is solid. Items, prices, tax, totals, payment and shipping information, the confirmation message and cart clearing all behave correctly, and the checkout pages are protected when logged out. The weaknesses are in input validation and in guarding the flow: the form accepts almost anything, and the steps can be skipped, entered with an empty cart, or revisited after completion.

Against the story as written, the feature does not pass: AC5 is not met and AC1 and AC2 have open defects.

### Risk areas

| Risk | Defects | Impact |
|---|---|---|
| Orders with missing or meaningless customer details | BUG-02, BUG-04, BUG-07 | Orders that cannot be delivered; the mandatory-information rule is ineffective |
| Empty or duplicate orders | BUG-06, BUG-08 | $0.00 orders reach confirmation |
| Keyboard users lose their input | BUG-05 | Enter cancels the form; an accessibility and usability problem |
| Requirement ambiguity | BUG-01, BUG-03 | May be story wording issues, not application faults |

### Next steps

1. **Confirm intent with the product owner** for BUG-01 (where the total should appear) and BUG-03 (valid postal code format), and define maximum field lengths.
2. **Log the defects** in the bug tracker, prioritising the four High-severity ones: BUG-02, BUG-04, BUG-06, BUG-07.
3. **Re-run the defect tests after fixes** with `npm run test:defects`. When a test passes, remove its `@defect` marker.
4. **Use `npm run test:stable` as the regression gate** until the defects are fixed, since the full suite fails by design.
5. **Put the project under version control** to close the last Definition of Done item.
6. **Close the coverage gaps** listed in section 5.4, starting with a hands-on session in branded Chrome.
