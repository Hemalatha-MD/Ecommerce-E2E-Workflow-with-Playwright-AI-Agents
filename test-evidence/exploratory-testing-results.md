# SauceDemo Checkout – Exploratory Testing Results

**User story:** SCRUM-101 – Saucedemo e-commerce Checkout Process
**Test plan:** [specs/saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md)
**Executed:** 2026-09-30
**Application:** https://www.saucedemo.com (user `standard_user`)

## 1. How the tests were executed

| Item | Value |
|---|---|
| Browser | Chromium (Playwright 1.63.0 bundled build), headless |
| Viewport | 1280x720 for every check; never resized |
| Isolation | Each test case ran in a fresh browser context (empty cart, new login) |
| Evidence | 34 screenshots in [screenshots/](screenshots/) |

The Playwright MCP browser tools were not available in the session, so the scenarios were not clicked through interactively. Each step in the plan was instead driven through the Playwright library against the live site, and the actual value seen in the browser was recorded for every step. The "Actual" columns below are those recorded values, not expectations.

## 2. Summary

| Result | Count |
|---|---|
| PASS | 28 |
| FAIL | 10 |
| BLOCKED | 0 |
| **Total** | **38** |

All 10 failures were predicted in the test plan (section 6) and are defects or gaps against the acceptance criteria, not test problems. No test case was blocked.

| Acceptance criterion | Verdict | Notes |
|---|---|---|
| AC1 – Cart Review | Partly met | Item details and both buttons work. No total price on the cart page (BUG-01). Checkout allowed with an empty cart (BUG-06). |
| AC2 – Checkout Information Entry | Mostly met | Form, mandatory-field errors and error dismissal work. Whitespace-only values pass as filled (BUG-04). The step can be skipped by URL (BUG-07). |
| AC3 – Order Overview | Met | Items, payment, shipping, subtotal, tax, total, Cancel and Finish all correct. Enter key does not reach this page (BUG-05). |
| AC4 – Order Completion | Met | Confirmation message, Back Home and cart clearing all correct. |
| AC5 – Error Handling | Not met | No validation beyond empty-field checks (BUG-02, BUG-03, BUG-04). |
| Rule: login required | Met | All four checkout URLs redirect to login when logged out. |
| Rule: confirmation clears cart | Met | Badge removed and cart empty after Finish. |

## 3. Results by test case

| ID | Title | Covers | Result | Defect |
|---|---|---|---|---|
| TC-01 | Cart displays a single added item with full details | AC1 | **PASS** |  |
| TC-02 | Cart displays multiple items with correct details | AC1 | **PASS** |  |
| TC-03 | Cart shows the total price calculation | AC1 | **FAIL** | BUG-01 |
| TC-04 | Cart offers Continue Shopping and Checkout options | AC1 | **PASS** |  |
| TC-05 | Removing an item from the cart updates the list and badge | AC1 | **PASS** |  |
| TC-06 | Cart with all six products | AC1 | **PASS** |  |
| TC-07 | Checkout button opens the information page | AC2 | **PASS** |  |
| TC-08 | Information page shows the required form elements | AC2 | **PASS** |  |
| TC-09 | All fields empty shows a required-field error | AC2 | **PASS** |  |
| TC-10 | First Name empty shows "First Name is required" | AC2 | **PASS** |  |
| TC-11 | Last Name empty shows "Last Name is required" | AC2 | **PASS** |  |
| TC-12 | Zip/Postal Code empty shows "Postal Code is required" | AC2 | **PASS** |  |
| TC-13 | Error message can be dismissed | AC2 | **PASS** |  |
| TC-14 | Correcting the error allows the user to proceed | AC2, AC5 | **PASS** |  |
| TC-15 | Special characters in name fields are rejected | AC5 | **FAIL** | BUG-02 |
| TC-16 | Numeric values in name fields are rejected | AC5 | **FAIL** | BUG-02 |
| TC-17 | Invalid Zip/Postal Code format is rejected | AC5 | **FAIL** | BUG-03 |
| TC-18 | Whitespace-only values are treated as empty | AC2, AC5 | **FAIL** | BUG-04 |
| TC-19 | Script input is not executed and is rejected | AC5 | **FAIL** | BUG-02 |
| TC-20 | Minimum-length values are accepted | AC5 | **PASS** |  |
| TC-21 | Very long values are handled | AC5 | **PASS** |  |
| TC-22 | Pressing Enter submits the form | AC3, AC5 | **FAIL** | BUG-05 |
| TC-23 | Valid information opens the overview page | AC3 | **PASS** |  |
| TC-24 | Overview lists all ordered items | AC3 | **PASS** |  |
| TC-25 | Overview shows payment and shipping information | AC3 | **PASS** |  |
| TC-26 | Overview shows correct subtotal, tax and total for two items | AC3 | **PASS** |  |
| TC-27 | Totals are correct for one low-priced item and for all six items | AC3 | **PASS** |  |
| TC-28 | Overview offers Cancel and Finish options | AC3 | **PASS** |  |
| TC-29 | End-to-end purchase completes successfully | AC1–AC4, cart-clear rule | **PASS** |  |
| TC-30 | Checkout is blocked when the cart is empty | AC1, AC2 | **FAIL** | BUG-06 |
| TC-31 | Overview cannot be reached without entering checkout information | AC2, AC3 | **FAIL** | BUG-07 |
| TC-32 | Checkout pages require login | Login rule | **PASS** |  |
| TC-33 | Checkout is inaccessible after logout | Login rule | **PASS** |  |
| TC-34 | Cancel on the information page returns to the cart | AC2, navigation | **PASS** |  |
| TC-35 | Browser back button through the checkout flow | AC2–AC4, navigation | **FAIL** | BUG-08 |
| TC-36 | Cart contents persist across checkout navigation and re-login | AC1, navigation | **PASS** |  |
| TC-37 | Item name links on cart and overview open the product page | AC1, AC3, navigation | **PASS** |  |
| TC-38 | Confirmation page survives a reload without placing a second order | AC4 | **PASS** |  |

## 4. Issues discovered

### BUG-01: Cart page does not show a total price

- **Test case:** TC-03 · **AC:** AC1 · **Severity:** Medium
- **Steps:** Add Backpack and Bike Light, open the cart.
- **Expected:** A total of $39.98 is displayed.
- **Actual:** The cart shows item rows and buttons only; no total or subtotal text exists on the page. Totals first appear on the overview page.
- **Evidence:** [TC-03-cart-no-total.png](screenshots/TC-03-cart-no-total.png)
- **Note:** If the total is only intended on the overview page, AC1 should be amended instead.

### BUG-02: Name fields accept special characters, digits and script tags

- **Test cases:** TC-15, TC-16, TC-19 · **AC:** AC5 · **Severity:** High
- **Steps:** On the information page enter `@#$%` / `!^&*` / `<>?/`, or `123` / `456` / `12345`, or `<script>alert(1)</script>` as First Name, then click Continue.
- **Expected:** A validation error is shown and the user stays on the information page.
- **Actual:** No error; the overview page opens in every case. The script was not executed (no dialog appeared).
- **Evidence:** [TC-15-special-chars-accepted.png](screenshots/TC-15-special-chars-accepted.png), [TC-16-numeric-names-accepted.png](screenshots/TC-16-numeric-names-accepted.png), [TC-19-script-input-accepted.png](screenshots/TC-19-script-input-accepted.png)

### BUG-03: Zip/Postal Code accepts any text

- **Test case:** TC-17 · **AC:** AC5 · **Severity:** Medium
- **Steps:** Enter John / Doe / `ABCDE`, click Continue.
- **Expected:** A postal code validation error.
- **Actual:** Overview page opens with no error.
- **Evidence:** [TC-17-alpha-zip-accepted.png](screenshots/TC-17-alpha-zip-accepted.png)
- **Note:** The story does not define a valid format. Confirm with the product owner whether alphanumeric codes are allowed before raising this.

### BUG-04: Whitespace-only values satisfy the mandatory-field check

- **Test case:** TC-18 · **AC:** AC2, AC5 · **Severity:** High
- **Steps:** Enter a single space in each of the three fields, click Continue.
- **Expected:** "Error: First Name is required".
- **Actual:** Overview page opens with no error.
- **Evidence:** [TC-18-whitespace-accepted.png](screenshots/TC-18-whitespace-accepted.png)

### BUG-05: Pressing Enter in the form cancels checkout

- **Test case:** TC-22 · **AC:** AC3 · **Severity:** Medium
- **Steps:** Fill John / Doe / 12345, press Enter with focus in Zip/Postal Code.
- **Expected:** Overview page opens.
- **Actual:** The browser navigates to `/cart.html` ("Your Cart"), the same as clicking Cancel.
- **Evidence:** [TC-22-enter-key-result.png](screenshots/TC-22-enter-key-result.png)
- **Likely cause (not confirmed):** Cancel is a `<button type="submit">` placed before the Continue `<input type="submit">`, so it may be acting as the form's default button.

### BUG-06: Checkout can be completed with an empty cart

- **Test case:** TC-30 · **AC:** AC1, AC2 · **Severity:** High
- **Steps:** With an empty cart, open the cart, click Checkout, enter valid data, Continue, Finish.
- **Expected:** Checkout is blocked when there are no items.
- **Actual:** Checkout is enabled, the overview shows "Item total: $0 / Tax: $0.00 / Total: $0.00", and Finish confirms the order with "Thank you for your order!".
- **Evidence:** [TC-30-empty-cart.png](screenshots/TC-30-empty-cart.png), [TC-30-empty-cart-overview.png](screenshots/TC-30-empty-cart-overview.png), [TC-30-empty-cart-order-confirmed.png](screenshots/TC-30-empty-cart-order-confirmed.png)

### BUG-07: Checkout information step can be bypassed by URL

- **Test case:** TC-31 · **AC:** AC2, AC3 · **Severity:** High
- **Steps:** Add Backpack, then navigate directly to `/checkout-step-two.html`.
- **Expected:** Redirect to the information page or the cart.
- **Actual:** The overview page opens with the item listed and Finish enabled, without any name or postal code having been entered.
- **Evidence:** [TC-31-overview-by-direct-url.png](screenshots/TC-31-overview-by-direct-url.png)

### BUG-08: Back button after order completion shows a submittable empty order

- **Test case:** TC-35 (step 7) · **AC:** AC4, navigation · **Severity:** Medium
- **Steps:** Complete an order, then click the browser back button.
- **Expected:** The completed order cannot be resubmitted.
- **Actual:** `/checkout-step-two.html` is shown with no items, "Total: $0.00" and Finish enabled.
- **Evidence:** [TC-35-back-after-order-complete.png](screenshots/TC-35-back-after-order-complete.png)

## 5. UI inconsistencies and other observations

These did not fail a test case but are worth recording.

| # | Observation | Seen in |
|---|---|---|
| O1 | Only one required-field error is shown at a time, in field order (First Name, then Last Name, then Postal Code). | TC-09, TC-14 |
| O2 | When a single field is empty, the error styling is applied to all three fields, not just the empty one (TC-10: 3 inputs highlighted, 3 icons; TC-11: 3 inputs highlighted, 3 icons; TC-12: 3 inputs highlighted, 3 icons). The message names the right field, but the highlighting does not. | TC-10, TC-11, TC-12 |
| O3 | The error message stays on screen while the user types a correction; it clears only on the close button, a new submit, or a reload. | Planning exploration |
| O4 | Entered information is not kept: the three fields are empty after the browser back button from the overview, and after Cancel then Checkout. | TC-34, TC-35 |
| O5 | Currency formatting is inconsistent for an empty order: "Item total: $0" beside "Tax: $0.00" and "Total: $0.00". | TC-30, TC-35 |
| O6 | Fields have no maximum length. 300 characters were accepted in each field with no error and no horizontal page overflow. The story sets no limit. | TC-21 |
| O7 | The confirmation page has a "Generate PDF order" button that the story does not mention. It disappears after the page is reloaded. It was not tested. | TC-29, TC-38 |
| O8 | The cart survives logout and login in the same browser (badge still 2). | TC-36 |
| O9 | Navigating directly to `/checkout-complete.html` with an item in the cart shows the confirmation page but leaves the cart badge at 1; only the Finish button clears the cart. | Planning exploration |
| O10 | Console error on most pages: `401` from a POST to `events.backtrace.io/api/unique-events/submit` (third-party error telemetry). No visible effect. | Most test cases |
| O11 | Reloading or directly opening `/cart.html` returns HTTP 404 for the document itself, although the page then renders normally. | TC-02, TC-31, TC-36, TC-38 |
| O12 | Tax is 8% of the item total rounded to two decimals; correct for $7.99, $39.98 and $129.94. | TC-26, TC-27 |

## 6. Element selectors that worked reliably

Every selector below was used across the run without a single lookup failure. All are `data-test` attributes, which are present on every element the checkout flow needs.

| Element | Selector |
|---|---|
| Login | `#user-name`, `#password`, `#login-button` |
| Add / remove product | `[data-test="add-to-cart-<slug>"]`, `[data-test="remove-<slug>"]` |
| Cart icon / badge | `[data-test="shopping-cart-link"]`, `[data-test="shopping-cart-badge"]` |
| Page title | `[data-test="title"]` |
| Item row | `[data-test="inventory-item"]` |
| Row quantity / name / description / price | `[data-test="item-quantity"]`, `[data-test="inventory-item-name"]`, `[data-test="inventory-item-desc"]`, `[data-test="inventory-item-price"]` |
| Cart buttons | `[data-test="continue-shopping"]`, `[data-test="checkout"]` |
| Information fields | `[data-test="firstName"]`, `[data-test="lastName"]`, `[data-test="postalCode"]` |
| Information buttons | `[data-test="continue"]`, `[data-test="cancel"]` |
| Error message / close | `[data-test="error"]`, `[data-test="error-button"]` |
| Payment / shipping | `[data-test="payment-info-value"]`, `[data-test="shipping-info-value"]` |
| Totals | `[data-test="subtotal-label"]`, `[data-test="tax-label"]`, `[data-test="total-label"]` |
| Finish | `[data-test="finish"]` |
| Confirmation | `[data-test="complete-header"]`, `[data-test="complete-text"]`, `[data-test="back-to-products"]` |
| Menu / logout | `#react-burger-menu-btn`, `[data-test="logout-sidebar-link"]` |

Notes for automation:

- **Continue is an `<input type="submit">`**, so its label is in the `value` attribute; text-based lookups need `getByRole('button', { name: 'Continue' })` rather than a text match. Cancel, Checkout and Finish are `<button>` elements.
- **The badge element is removed, not hidden, when the cart is empty**, so assert it has a count of 0 rather than empty text.
- **Product slugs contain special characters** for one item: `add-to-cart-test.allthethings()-t-shirt-(red)`. Use the attribute selector, not an `#id` selector.
- **Error highlighting** can be checked with `input.error` and `.error_icon`; these are class names rather than `data-test` attributes and are less stable.
- **The URL changes without a full page load**, so wait for the page title or an element rather than a load event after each click.

## 7. Detailed step results

### TC-01: Cart displays a single added item with full details — PASS

**Covers:** AC1

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Button changes to "Remove"; badge 1 | button='Remove', badge=1 | PASS |
| 2 | URL /cart.html; title "Your Cart" | /cart.html \| Your Cart | PASS |
| 3 | Qty 1, Sauce Labs Backpack, description starting "carry.allTheThings()", $29.99, Remove button | 1 \| Sauce Labs Backpack \| $29.99 \| desc \| Remove ; desc starts 'carry.allTheThings() w' | PASS |
| 4 | "QTY" and "Description" labels visible | QTY / Description | PASS |

**Screenshots:** [TC-01-cart-single-item.png](screenshots/TC-01-cart-single-item.png)

### TC-02: Cart displays multiple items with correct details — PASS

**Covers:** AC1

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Badge 2 | badge=2 | PASS |
| 2 | Exactly 2 item rows | 2 rows | PASS |
| 3 | Backpack qty 1 $29.99; Bike Light qty 1 $9.99; description and Remove on each | 1 \| Sauce Labs Backpack \| $29.99 \| desc \| Remove ; 1 \| Sauce Labs Bike Light \| $9.99 \| desc \| Remove | PASS |
| 4 | Both items still listed after reload; badge 2 | 2 rows, badge=2 | PASS |

**Screenshots:** [TC-02-cart-two-items.png](screenshots/TC-02-cart-two-items.png)

### TC-03: Cart shows the total price calculation — FAIL

**Covers:** AC1 · **Defect:** BUG-01

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Cart lists both items | 2 rows | PASS |
| 2 | A total of $39.98 is displayed | No total, subtotal or "$39.98" text anywhere in the cart container | **FAIL** |

**Screenshots:** [TC-03-cart-no-total.png](screenshots/TC-03-cart-no-total.png)

### TC-04: Cart offers Continue Shopping and Checkout options — PASS

**Covers:** AC1

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Cart page opens | /cart.html | PASS |
| 2 | "Continue Shopping" and "Checkout" visible and enabled | 'Continue Shopping' enabled=true; 'Checkout' enabled=true | PASS |
| 3 | URL /inventory.html; badge 1; Backpack button reads "Remove" | /inventory.html \| badge=1 \| button='Remove' | PASS |

**Screenshots:** [TC-04-cart-buttons.png](screenshots/TC-04-cart-buttons.png)

### TC-05: Removing an item from the cart updates the list and badge — PASS

**Covers:** AC1

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | 2 rows; badge 2 | 2 rows, badge=2 | PASS |
| 2 | Bike Light gone; 1 row; badge 1 | 1 \| Sauce Labs Backpack \| $29.99 \| desc \| Remove \| badge=1 | PASS |
| 3 | No rows; badge not displayed | 0 rows, badge=(not present) | PASS |

**Screenshots:** [TC-05-cart-emptied.png](screenshots/TC-05-cart-emptied.png)

### TC-06: Cart with all six products — PASS

**Covers:** AC1

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Badge 6 | badge=6 | PASS |
| 2 | 6 rows, qty 1 each, names and prices per product table | 1 Sauce Labs Backpack $29.99 ; 1 Sauce Labs Bike Light $9.99 ; 1 Sauce Labs Bolt T-Shirt $15.99 ; 1 Sauce Labs Fleece Jacket $49.99 ; 1 Sauce Labs Onesie $7.99 ; 1 Test.allTheThings() T-Shirt (Red) $15.99 | PASS |

**Screenshots:** [TC-06-cart-six-items.png](screenshots/TC-06-cart-six-items.png)

### TC-07: Checkout button opens the information page — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Cart page with 1 item | 1 rows | PASS |
| 2 | URL /checkout-step-one.html; title "Checkout: Your Information" | /checkout-step-one.html \| Checkout: Your Information | PASS |

*No screenshot taken for this test case.*

### TC-08: Information page shows the required form elements — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page opens | /checkout-step-one.html | PASS |
| 2 | Three empty inputs: First Name, Last Name, Zip/Postal Code, in order | First Name='', Last Name='', Zip/Postal Code='' | PASS |
| 3 | "Cancel" and "Continue" visible and enabled | Cancel='Cancel' tag=BUTTON; Continue value='Continue' tag=INPUT | PASS |
| 4 | Badge 1; no error shown | badge=1, error=(not present) | PASS |

**Screenshots:** [TC-08-information-page.png](screenshots/TC-08-information-page.png)

### TC-09: All fields empty shows a required-field error — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | URL stays /checkout-step-one.html | /checkout-step-one.html | PASS |
| 3 | "Error: First Name is required" | Error: First Name is required | PASS |
| 4 | All three inputs highlighted with error icon | 3 inputs highlighted, 3 icons | PASS |

**Screenshots:** [TC-09-error-all-empty.png](screenshots/TC-09-error-all-empty.png)

### TC-10: First Name empty shows "First Name is required" — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown in fields | '' / 'Doe' / '12345' | PASS |
| 3 | URL stays /checkout-step-one.html; "Error: First Name is required" | /checkout-step-one.html \| error: Error: First Name is required \| 3 inputs highlighted, 3 icons | PASS |

**Screenshots:** [TC-10-error-first-name.png](screenshots/TC-10-error-first-name.png)

### TC-11: Last Name empty shows "Last Name is required" — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown in fields | 'John' / '' / '12345' | PASS |
| 3 | URL stays /checkout-step-one.html; "Error: Last Name is required" | /checkout-step-one.html \| error: Error: Last Name is required \| 3 inputs highlighted, 3 icons | PASS |

**Screenshots:** [TC-11-error-last-name.png](screenshots/TC-11-error-last-name.png)

### TC-12: Zip/Postal Code empty shows "Postal Code is required" — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown in fields | 'John' / 'Doe' / '' | PASS |
| 3 | URL stays /checkout-step-one.html; "Error: Postal Code is required" | /checkout-step-one.html \| error: Error: Postal Code is required \| 3 inputs highlighted, 3 icons | PASS |

**Screenshots:** [TC-12-error-postal-code.png](screenshots/TC-12-error-postal-code.png)

### TC-13: Error message can be dismissed — PASS

**Covers:** AC2

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Error shown with close (X) button | Error: First Name is required \| close button visible=true | PASS |
| 2 | Error disappears; highlighting and icons removed | error=(not present) \| 0 inputs highlighted, 0 icons | PASS |
| 3 | Still /checkout-step-one.html | /checkout-step-one.html | PASS |

**Screenshots:** [TC-13-error-dismissed.png](screenshots/TC-13-error-dismissed.png)

### TC-14: Correcting the error allows the user to proceed — PASS

**Covers:** AC2, AC5

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | "Error: First Name is required" | Error: First Name is required | PASS |
| 2 | "Error: Last Name is required" | Error: Last Name is required | PASS |
| 3 | "Error: Postal Code is required" | Error: Postal Code is required | PASS |
| 4 | URL /checkout-step-two.html; title "Checkout: Overview" | /checkout-step-two.html \| Checkout: Overview | PASS |

*No screenshot taken for this test case.*

### TC-15: Special characters in name fields are rejected — FAIL

**Covers:** AC5 · **Defect:** BUG-02

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page, empty form | /checkout-step-one.html | PASS |
| 2 | Values shown in fields | first='@#$%' | PASS |
| 3 | Validation error shown; URL stays /checkout-step-one.html | /checkout-step-two.html \| error: (not present) | **FAIL** |

**Screenshots:** [TC-15-special-chars-accepted.png](screenshots/TC-15-special-chars-accepted.png)

### TC-16: Numeric values in name fields are rejected — FAIL

**Covers:** AC5 · **Defect:** BUG-02

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page, empty form | /checkout-step-one.html | PASS |
| 2 | Values shown in fields | first='123' | PASS |
| 3 | Validation error shown; URL stays /checkout-step-one.html | /checkout-step-two.html \| error: (not present) | **FAIL** |

**Screenshots:** [TC-16-numeric-names-accepted.png](screenshots/TC-16-numeric-names-accepted.png)

### TC-17: Invalid Zip/Postal Code format is rejected — FAIL

**Covers:** AC5 · **Defect:** BUG-03

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page, empty form | /checkout-step-one.html | PASS |
| 2 | Values shown in fields | first='John' | PASS |
| 3 | Validation error shown; URL stays /checkout-step-one.html | /checkout-step-two.html \| error: (not present) | **FAIL** |

**Screenshots:** [TC-17-alpha-zip-accepted.png](screenshots/TC-17-alpha-zip-accepted.png)

### TC-18: Whitespace-only values are treated as empty — FAIL

**Covers:** AC2, AC5 · **Defect:** BUG-04

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page, empty form | /checkout-step-one.html | PASS |
| 2 | Values shown in fields | first=' ' | PASS |
| 3 | Validation error shown; URL stays /checkout-step-one.html | /checkout-step-two.html \| error: (not present) | **FAIL** |

**Screenshots:** [TC-18-whitespace-accepted.png](screenshots/TC-18-whitespace-accepted.png)

### TC-19: Script input is not executed and is rejected — FAIL

**Covers:** AC5 · **Defect:** BUG-02

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown as typed | &lt;script&gt;alert(1)&lt;/script&gt; | PASS |
| 3 | No JavaScript dialog appears | no dialog | PASS |
| 4 | Validation error for First Name; URL stays /checkout-step-one.html | /checkout-step-two.html \| error: (not present) | **FAIL** |

**Screenshots:** [TC-19-script-input-accepted.png](screenshots/TC-19-script-input-accepted.png)

### TC-20: Minimum-length values are accepted — PASS

**Covers:** AC5

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown | J / D / 1 | PASS |
| 3 | URL /checkout-step-two.html; no error | /checkout-step-two.html \| error: (not present) | PASS |

*No screenshot taken for this test case.*

### TC-21: Very long values are handled — PASS

**Covers:** AC5

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Input truncated at a max length or accepted in full; layout not broken | first name length kept=300; horizontal page overflow=false | PASS |
| 3 | Length validation error, or overview opens normally | /checkout-step-two.html \| error: (not present) | PASS |

**Screenshots:** [TC-21-long-input.png](screenshots/TC-21-long-input.png)

### TC-22: Pressing Enter submits the form — FAIL

**Covers:** AC3, AC5 · **Defect:** BUG-05

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Form is empty | empty | PASS |
| 2 | Values shown | John / Doe / 12345 | PASS |
| 3 | URL is /checkout-step-two.html | /cart.html \| title=Your Cart | **FAIL** |

**Screenshots:** [TC-22-enter-key-result.png](screenshots/TC-22-enter-key-result.png)

### TC-23: Valid information opens the overview page — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page opens | /checkout-step-one.html | PASS |
| 2 | URL /checkout-step-two.html; title "Checkout: Overview" | /checkout-step-two.html \| Checkout: Overview | PASS |

*No screenshot taken for this test case.*

### TC-24: Overview lists all ordered items — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Overview page opens | /checkout-step-two.html | PASS |
| 2 | 2 rows: Backpack qty 1 $29.99; Bike Light qty 1 $9.99; with descriptions | 1 \| Sauce Labs Backpack \| $29.99 \| desc \| no-button ; 1 \| Sauce Labs Bike Light \| $9.99 \| desc \| no-button | PASS |
| 3 | No "Remove" buttons | no-button, no-button | PASS |

**Screenshots:** [TC-24-overview-two-items.png](screenshots/TC-24-overview-two-items.png)

### TC-25: Overview shows payment and shipping information — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Overview page opens | /checkout-step-two.html | PASS |
| 2 | "Payment Information:" / "SauceCard #31337" | Payment Information: SauceCard #31337 | PASS |
| 3 | "Shipping Information:" / "Free Pony Express Delivery!" | Shipping Information: Free Pony Express Delivery! | PASS |

**Screenshots:** [TC-25-overview-payment-shipping.png](screenshots/TC-25-overview-payment-shipping.png)

### TC-26: Overview shows correct subtotal, tax and total for two items — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Overview page opens | /checkout-step-two.html | PASS |
| 2 | "Item total: $39.98" | Item total: $39.98 | PASS |
| 3 | "Tax: $3.20" | Tax: $3.20 | PASS |
| 4 | "Total: $43.18" | Total: $43.18 | PASS |

*No screenshot taken for this test case.*

### TC-27: Totals are correct for one low-priced item and for all six items — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Item total: $7.99 / Tax: $0.64 / Total: $8.63 | Item total: $7.99 / Tax: $0.64 / Total: $8.63 | PASS |
| 2 | Products page; badge 1 | /inventory.html \| badge=1 | PASS |
| 3 | 6 rows; Item total: $129.94 / Tax: $10.40 / Total: $140.34 | 6 rows \| Item total: $129.94 / Tax: $10.40 / Total: $140.34 | PASS |

**Screenshots:** [TC-27-overview-six-items.png](screenshots/TC-27-overview-six-items.png)

### TC-28: Overview offers Cancel and Finish options — PASS

**Covers:** AC3

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Overview page opens | /checkout-step-two.html | PASS |
| 2 | "Cancel" and "Finish" visible and enabled | 'Cancel' enabled=true; 'Finish' enabled=true | PASS |
| 3 | URL /inventory.html; badge 1; order not placed | /inventory.html \| badge=1 | PASS |

*No screenshot taken for this test case.*

### TC-29: End-to-end purchase completes successfully — PASS

**Covers:** AC1–AC4, cart-clear rule

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Badge 2 | badge=2 | PASS |
| 2 | Both items listed | 2 rows | PASS |
| 3 | Information page opens | /checkout-step-one.html | PASS |
| 4 | Overview shows both items and "Total: $43.18" | 2 rows \| Total: $43.18 | PASS |
| 5 | URL /checkout-complete.html; title "Checkout: Complete!" | /checkout-complete.html \| Checkout: Complete! | PASS |
| 6 | Header "Thank you for your order!" and dispatch text | Thank you for your order! \| Your order has been dispatched, and will arrive just as fast as the pony can get there! | PASS |
| 7 | "Back Home" visible and enabled; no badge | Back Home visible=true \| badge=(not present) \| other buttons: Back Home, Generate PDF order | PASS |
| 8 | URL /inventory.html; no badge; all six show "Add to cart" | /inventory.html \| badge=(not present) \| 6 Add to cart buttons | PASS |
| 9 | Cart is empty | 0 rows | PASS |

**Screenshots:** [TC-29-order-complete.png](screenshots/TC-29-order-complete.png), [TC-29-step1-information-filled.png](screenshots/TC-29-step1-information-filled.png)

### TC-30: Checkout is blocked when the cart is empty — FAIL

**Covers:** AC1, AC2 · **Defect:** BUG-06

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Cart page with no item rows | /cart.html \| 0 rows | PASS |
| 2 | User prevented from starting checkout | Checkout enabled=true; navigated to /checkout-step-one.html, error=(not present) | **FAIL** |
| 3 | Order with no items cannot be confirmed | overview: Item total: $0 / Tax: $0.00 / Total: $0.00; after Finish: /checkout-complete.html \| Thank you for your order! | **FAIL** |

**Screenshots:** [TC-30-empty-cart-order-confirmed.png](screenshots/TC-30-empty-cart-order-confirmed.png), [TC-30-empty-cart-overview.png](screenshots/TC-30-empty-cart-overview.png), [TC-30-empty-cart.png](screenshots/TC-30-empty-cart.png)

### TC-31: Overview cannot be reached without entering checkout information — FAIL

**Covers:** AC2, AC3 · **Defect:** BUG-07

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Badge 1 | badge=1 | PASS |
| 2 | Redirected to information page or cart | /checkout-step-two.html \| title=Checkout: Overview \| 1 rows \| Finish enabled=true | **FAIL** |

**Screenshots:** [TC-31-overview-by-direct-url.png](screenshots/TC-31-overview-by-direct-url.png)

### TC-32: Checkout pages require login — PASS

**Covers:** Login rule

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Login page; error names /cart.html | / \| Epic sadface: You can only access '/cart.html' when you are logged in. | PASS |
| 2 | Login page; error names /checkout-step-one.html | / \| Epic sadface: You can only access '/checkout-step-one.html' when you are logged in. | PASS |
| 3 | Login page; error names /checkout-step-two.html | / \| Epic sadface: You can only access '/checkout-step-two.html' when you are logged in. | PASS |
| 4 | Login page; error names /checkout-complete.html | / \| Epic sadface: You can only access '/checkout-complete.html' when you are logged in. | PASS |

**Screenshots:** [TC-32-unauthenticated-redirect.png](screenshots/TC-32-unauthenticated-redirect.png)

### TC-33: Checkout is inaccessible after logout — PASS

**Covers:** Login rule

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page opens | /checkout-step-one.html | PASS |
| 2 | Login page displayed | / | PASS |
| 3 | Login page with "only access /checkout-step-one.html when logged in" error | / \| error: Epic sadface: You can only access '/checkout-step-one.html' when you are logged in. | PASS |
| 4 | Information page not displayed; remains on login page | / \| login form shown=true \| checkout form shown=false \| error=(not present) | PASS |

**Screenshots:** [TC-33-back-after-logout.png](screenshots/TC-33-back-after-logout.png)

### TC-34: Cancel on the information page returns to the cart — PASS

**Covers:** AC2, navigation

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page opens | /checkout-step-one.html | PASS |
| 2 | Value shown | John | PASS |
| 3 | URL /cart.html; Backpack listed; badge 1 | /cart.html \| 1 rows \| badge=1 | PASS |
| 4 | Information page with all three fields empty | /checkout-step-one.html \| '' / '' / '' | PASS |

*No screenshot taken for this test case.*

### TC-35: Browser back button through the checkout flow — FAIL

**Covers:** AC2–AC4, navigation · **Defect:** BUG-08

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Overview with 2 items | /checkout-step-two.html \| 2 rows | PASS |
| 2 | URL /checkout-step-one.html; fields empty | /checkout-step-one.html \| '' / '' / '' | PASS |
| 3 | URL /cart.html; both items; badge 2 | /cart.html \| 2 rows \| badge=2 | PASS |
| 4 | URL /checkout-step-two.html; both items; "Total: $43.18" | /checkout-step-two.html \| 2 rows \| Total: $43.18 | PASS |
| 5 | Confirmation with "Thank you for your order!" | Thank you for your order! | PASS |
| 6 | URL /checkout-step-two.html | /checkout-step-two.html | PASS |
| 7 | Completed order cannot be resubmitted (Finish unavailable or redirect) | /checkout-step-two.html \| 0 rows \| Item total: $0 / Tax: $0.00 / Total: $0.00 \| Finish enabled=true | **FAIL** |

**Screenshots:** [TC-35-back-after-order-complete.png](screenshots/TC-35-back-after-order-complete.png), [TC-35-back-to-information-fields-cleared.png](screenshots/TC-35-back-to-information-fields-cleared.png)

### TC-36: Cart contents persist across checkout navigation and re-login — PASS

**Covers:** AC1, navigation

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Information page; badge 2 | /checkout-step-one.html \| badge=2 | PASS |
| 2 | Cart page with both items | /cart.html \| 2 rows | PASS |
| 3 | Both items still listed | 2 rows | PASS |
| 4 | Products page; badge 2 | /inventory.html \| badge=2 | PASS |

**Screenshots:** [TC-36-burger-menu-open.png](screenshots/TC-36-burger-menu-open.png)

### TC-37: Item name links on cart and overview open the product page — PASS

**Covers:** AC1, AC3, navigation

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | URL /inventory-item.html?id=4; product details shown | /inventory-item.html?id=4 \| Sauce Labs Backpack | PASS |
| 2 | Cart page with Backpack listed | /cart.html \| 1 rows | PASS |
| 3 | Product detail page opens from overview | /inventory-item.html?id=4 | PASS |
| 4 | Overview with Backpack and totals still shown | /checkout-step-two.html \| 1 rows \| Item total: $29.99 / Tax: $2.40 / Total: $32.39 | PASS |

*No screenshot taken for this test case.*

### TC-38: Confirmation page survives a reload without placing a second order — PASS

**Covers:** AC4

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1 | Confirmation page shown; no badge | /checkout-complete.html \| badge=(not present) \| buttons: Back Home, Generate PDF order | PASS |
| 2 | Confirmation still shown with "Thank you for your order!"; no badge | Thank you for your order! \| badge=(not present) \| buttons: Back Home | PASS |
| 3 | Cart is empty | 0 rows | PASS |

**Screenshots:** [TC-38-complete-after-reload.png](screenshots/TC-38-complete-after-reload.png)

## 8. Screenshot index

| File | Test case |
|---|---|
| [TC-01-cart-single-item.png](screenshots/TC-01-cart-single-item.png) | TC-01 |
| [TC-02-cart-two-items.png](screenshots/TC-02-cart-two-items.png) | TC-02 |
| [TC-03-cart-no-total.png](screenshots/TC-03-cart-no-total.png) | TC-03 |
| [TC-04-cart-buttons.png](screenshots/TC-04-cart-buttons.png) | TC-04 |
| [TC-05-cart-emptied.png](screenshots/TC-05-cart-emptied.png) | TC-05 |
| [TC-06-cart-six-items.png](screenshots/TC-06-cart-six-items.png) | TC-06 |
| [TC-08-information-page.png](screenshots/TC-08-information-page.png) | TC-08 |
| [TC-09-error-all-empty.png](screenshots/TC-09-error-all-empty.png) | TC-09 |
| [TC-10-error-first-name.png](screenshots/TC-10-error-first-name.png) | TC-10 |
| [TC-11-error-last-name.png](screenshots/TC-11-error-last-name.png) | TC-11 |
| [TC-12-error-postal-code.png](screenshots/TC-12-error-postal-code.png) | TC-12 |
| [TC-13-error-dismissed.png](screenshots/TC-13-error-dismissed.png) | TC-13 |
| [TC-15-special-chars-accepted.png](screenshots/TC-15-special-chars-accepted.png) | TC-15 |
| [TC-16-numeric-names-accepted.png](screenshots/TC-16-numeric-names-accepted.png) | TC-16 |
| [TC-17-alpha-zip-accepted.png](screenshots/TC-17-alpha-zip-accepted.png) | TC-17 |
| [TC-18-whitespace-accepted.png](screenshots/TC-18-whitespace-accepted.png) | TC-18 |
| [TC-19-script-input-accepted.png](screenshots/TC-19-script-input-accepted.png) | TC-19 |
| [TC-21-long-input.png](screenshots/TC-21-long-input.png) | TC-21 |
| [TC-22-enter-key-result.png](screenshots/TC-22-enter-key-result.png) | TC-22 |
| [TC-24-overview-two-items.png](screenshots/TC-24-overview-two-items.png) | TC-24 |
| [TC-25-overview-payment-shipping.png](screenshots/TC-25-overview-payment-shipping.png) | TC-25 |
| [TC-27-overview-six-items.png](screenshots/TC-27-overview-six-items.png) | TC-27 |
| [TC-29-order-complete.png](screenshots/TC-29-order-complete.png) | TC-29 |
| [TC-29-step1-information-filled.png](screenshots/TC-29-step1-information-filled.png) | TC-29 |
| [TC-30-empty-cart-order-confirmed.png](screenshots/TC-30-empty-cart-order-confirmed.png) | TC-30 |
| [TC-30-empty-cart-overview.png](screenshots/TC-30-empty-cart-overview.png) | TC-30 |
| [TC-30-empty-cart.png](screenshots/TC-30-empty-cart.png) | TC-30 |
| [TC-31-overview-by-direct-url.png](screenshots/TC-31-overview-by-direct-url.png) | TC-31 |
| [TC-32-unauthenticated-redirect.png](screenshots/TC-32-unauthenticated-redirect.png) | TC-32 |
| [TC-33-back-after-logout.png](screenshots/TC-33-back-after-logout.png) | TC-33 |
| [TC-35-back-after-order-complete.png](screenshots/TC-35-back-after-order-complete.png) | TC-35 |
| [TC-35-back-to-information-fields-cleared.png](screenshots/TC-35-back-to-information-fields-cleared.png) | TC-35 |
| [TC-36-burger-menu-open.png](screenshots/TC-36-burger-menu-open.png) | TC-36 |
| [TC-38-complete-after-reload.png](screenshots/TC-38-complete-after-reload.png) | TC-38 |
