# SauceDemo Checkout Process – Test Plan

**User story:** SCRUM-101 – Saucedemo e-commerce Checkout Process
**Source:** `userStorey/sauceDemo_UserStory.md`
**Seed file:** `seed.spec.ts` (logs in and lands on the Products page)
**Explored on:** 2026-09-30, Chromium, against the live site

## 1. Application Overview

| Item | Value |
|---|---|
| Application URL | https://www.saucedemo.com |
| Username | `standard_user` |
| Password | `secret_sauce` |
| Browser | Chrome (Chromium) only |
| Tooling | Playwright |

The checkout flow has four pages:

| Step | Page title | URL |
|---|---|---|
| 1 | Your Cart | `/cart.html` |
| 2 | Checkout: Your Information | `/checkout-step-one.html` |
| 3 | Checkout: Overview | `/checkout-step-two.html` |
| 4 | Checkout: Complete! | `/checkout-complete.html` |

### Scope

In scope: AC1–AC5, the two business rules (login required, cart cleared on confirmation), navigation flow and browser back button behaviour, and UI element validation on the four checkout pages.

Out of scope: login page validation, product sorting, product detail page, the other SauceDemo user accounts (`locked_out_user`, `problem_user`, etc.), the "Generate PDF order" button, cross-browser and mobile testing.

### Assumptions

- Every test starts from a fresh browser context, logged in as `standard_user` on the Products page with an empty cart (the state `seed.spec.ts` produces), unless the test says otherwise.
- Tests are independent and can run in any order.
- The cart is stored per browser context, so a fresh context always means an empty cart.

## 2. Test Data

### Products

| Product | Price | Add button (`data-test`) |
|---|---|---|
| Sauce Labs Backpack | $29.99 | `add-to-cart-sauce-labs-backpack` |
| Sauce Labs Bike Light | $9.99 | `add-to-cart-sauce-labs-bike-light` |
| Sauce Labs Bolt T-Shirt | $15.99 | `add-to-cart-sauce-labs-bolt-t-shirt` |
| Sauce Labs Fleece Jacket | $49.99 | `add-to-cart-sauce-labs-fleece-jacket` |
| Sauce Labs Onesie | $7.99 | `add-to-cart-sauce-labs-onesie` |
| Test.allTheThings() T-Shirt (Red) | $15.99 | `add-to-cart-test.allthethings()-t-shirt-(red)` |

### Price calculations (tax is 8% of the item total, rounded to 2 decimals)

| Cart contents | Item total | Tax | Total |
|---|---|---|---|
| Onesie | $7.99 | $0.64 | $8.63 |
| Backpack + Bike Light | $39.98 | $3.20 | $43.18 |
| All six products | $129.94 | $10.40 | $140.34 |

### Checkout information

| Data set | First Name | Last Name | Zip/Postal Code |
|---|---|---|---|
| Valid | `John` | `Doe` | `12345` |
| Minimum length | `J` | `D` | `1` |
| Long input | `A` × 300 | `B` × 300 | `9` × 300 |
| Special characters | `@#$%` | `!^&*` | `<>?/` |
| Numeric names | `123` | `456` | `12345` |
| Alphabetic zip | `John` | `Doe` | `ABCDE` |
| Whitespace only | one space | one space | one space |
| Script injection | `<script>alert(1)</script>` | `O'Brien-Smith` | `SW1A 1AA` |
| Unicode | `José` | `李` | `〒100` |

### Key locators

| Element | Locator |
|---|---|
| Cart icon / badge | `[data-test="shopping-cart-link"]` / `[data-test="shopping-cart-badge"]` |
| Page title | `[data-test="title"]` |
| Cart row: quantity, name, description, price | `[data-test="item-quantity"]`, `[data-test="inventory-item-name"]`, `[data-test="inventory-item-desc"]`, `[data-test="inventory-item-price"]` |
| Continue Shopping / Checkout | `[data-test="continue-shopping"]` / `[data-test="checkout"]` |
| First Name / Last Name / Zip | `[data-test="firstName"]` / `[data-test="lastName"]` / `[data-test="postalCode"]` |
| Continue / Cancel | `[data-test="continue"]` / `[data-test="cancel"]` |
| Error message / dismiss button | `[data-test="error"]` / `[data-test="error-button"]` |
| Payment / shipping values | `[data-test="payment-info-value"]` / `[data-test="shipping-info-value"]` |
| Item total / tax / total | `[data-test="subtotal-label"]` / `[data-test="tax-label"]` / `[data-test="total-label"]` |
| Finish | `[data-test="finish"]` |
| Confirmation header / text | `[data-test="complete-header"]` / `[data-test="complete-text"]` |
| Back Home | `[data-test="back-to-products"]` |

## 3. Findings From Exploration

These behaviours were observed on the live site and conflict with the user story. The affected test cases are written to the acceptance criteria, so they are expected to fail and should be logged as bugs.

| # | Observation | Conflicts with | Test case |
|---|---|---|---|
| F1 | The cart page shows no total price; totals appear only on the overview page. | AC1 | TC-03 |
| F2 | Special characters, numeric names, alphabetic zip, script tags and whitespace-only values are all accepted with no validation error. Only empty fields are rejected. | AC5 | TC-15 to TC-19 |
| F3 | With an empty form, only "Error: First Name is required" is shown; one error at a time, in field order. | AC2 (wording "which field is required" is met, but only for the first empty field) | TC-09 |
| F4 | Pressing Enter in the Zip/Postal Code field with valid data navigates to the cart page instead of the overview page. | AC3 | TC-22 |
| F5 | A logged-in user can open `/checkout-step-two.html` directly and click Finish without ever entering checkout information. | AC2 / AC3 | TC-31 |
| F6 | Checkout can be completed with an empty cart; the order is confirmed with a $0.00 total. | AC1 / AC2 precondition "with items" | TC-30 |
| F7 | After completing an order, the browser back button returns to an overview page with no items and a $0.00 total, with Finish still enabled. | Navigation note | TC-35 |
| F8 | Fields have no `maxlength`; 300-character values are accepted. | AC5 (boundary) | TC-21 |

## 4. Test Scenarios

### 4.1 Cart Review (AC1)

#### TC-01: Cart displays a single added item with full details

**Covers:** AC1
**Type:** Happy path
**Test data:** Sauce Labs Backpack ($29.99)

| # | Step | Expected result |
|---|---|---|
| 1 | On the Products page, click "Add to cart" for Sauce Labs Backpack. | Button changes to "Remove"; cart badge shows `1`. |
| 2 | Click the cart icon. | URL is `/cart.html`; page title is "Your Cart". |
| 3 | Inspect the cart row. | Quantity `1`, name "Sauce Labs Backpack", a non-empty description starting "carry.allTheThings()", price `$29.99`, and a "Remove" button are shown. |
| 4 | Inspect the column headers. | "QTY" and "Description" labels are visible. |

#### TC-02: Cart displays multiple items with correct details

**Covers:** AC1
**Type:** Happy path
**Test data:** Backpack ($29.99), Bike Light ($9.99)

| # | Step | Expected result |
|---|---|---|
| 1 | Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart. | Cart badge shows `2`. |
| 2 | Click the cart icon. | Cart page opens with exactly 2 item rows. |
| 3 | Inspect each row. | Row 1: Backpack, qty `1`, `$29.99`. Row 2: Bike Light, qty `1`, `$9.99`. Each has a description and a "Remove" button. |
| 4 | Reload the page. | Both items are still listed; badge still shows `2`. |

#### TC-03: Cart shows the total price calculation

**Covers:** AC1
**Type:** Happy path — **expected to fail (F1)**
**Test data:** Backpack + Bike Light; expected total $39.98

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack and Bike Light; open the cart. | Cart page lists both items. |
| 2 | Look for a total price on the cart page. | A total of `$39.98` is displayed. *Observed: no total is shown on this page.* |

#### TC-04: Cart offers Continue Shopping and Checkout options

**Covers:** AC1
**Type:** UI element validation
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart. | Cart page opens. |
| 2 | Inspect the footer of the cart. | "Continue Shopping" and "Checkout" buttons are visible and enabled. |
| 3 | Click "Continue Shopping". | URL is `/inventory.html`; badge still shows `1`; Backpack button still reads "Remove". |

#### TC-05: Removing an item from the cart updates the list and badge

**Covers:** AC1
**Type:** Edge case
**Test data:** Backpack, Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Add both items; open the cart. | 2 rows; badge `2`. |
| 2 | Click "Remove" on Sauce Labs Bike Light. | Bike Light row disappears; 1 row remains; badge shows `1`. |
| 3 | Click "Remove" on Sauce Labs Backpack. | No item rows remain; the badge is no longer displayed. |

#### TC-06: Cart with all six products

**Covers:** AC1
**Type:** Boundary
**Test data:** All six products

| # | Step | Expected result |
|---|---|---|
| 1 | Add all six products from the Products page. | Badge shows `6`. |
| 2 | Open the cart. | 6 rows are listed, each with quantity `1` and the name and price from the Products table above. |

### 4.2 Checkout Information Entry (AC2)

#### TC-07: Checkout button opens the information page

**Covers:** AC2
**Type:** Happy path
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart. | Cart page with 1 item. |
| 2 | Click "Checkout". | URL is `/checkout-step-one.html`; title is "Checkout: Your Information". |

#### TC-08: Information page shows the required form elements

**Covers:** AC2
**Type:** UI element validation
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart; click "Checkout". | Information page opens. |
| 2 | Inspect the form. | Three empty text inputs with placeholders "First Name", "Last Name", "Zip/Postal Code", in that order. |
| 3 | Inspect the buttons. | "Cancel" and "Continue" are visible and enabled. |
| 4 | Inspect the header. | Cart badge shows `1`; no error message is displayed. |

#### TC-09: All fields empty shows a required-field error

**Covers:** AC2
**Type:** Negative
**Test data:** All fields empty

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Click "Continue" without entering anything. | URL stays `/checkout-step-one.html`. |
| 3 | Inspect the error. | Message "Error: First Name is required" is shown. |
| 4 | Inspect the fields. | All three inputs are highlighted in the error style with an error icon. |

#### TC-10: First Name empty shows "First Name is required"

**Covers:** AC2
**Type:** Negative
**Test data:** First Name empty, Last Name `Doe`, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter Last Name `Doe` and Zip `12345`; leave First Name empty. | Values are shown in the fields. |
| 3 | Click "Continue". | URL stays `/checkout-step-one.html`; error "Error: First Name is required" is shown. |

#### TC-11: Last Name empty shows "Last Name is required"

**Covers:** AC2
**Type:** Negative
**Test data:** First Name `John`, Last Name empty, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `John` and Zip `12345`; leave Last Name empty. | Values are shown in the fields. |
| 3 | Click "Continue". | URL stays `/checkout-step-one.html`; error "Error: Last Name is required" is shown. |

#### TC-12: Zip/Postal Code empty shows "Postal Code is required"

**Covers:** AC2
**Type:** Negative
**Test data:** First Name `John`, Last Name `Doe`, Zip empty

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `John` and Last Name `Doe`; leave Zip empty. | Values are shown in the fields. |
| 3 | Click "Continue". | URL stays `/checkout-step-one.html`; error "Error: Postal Code is required" is shown. |

#### TC-13: Error message can be dismissed

**Covers:** AC2
**Type:** UI element validation
**Test data:** All fields empty

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page; click "Continue" with an empty form. | Error "Error: First Name is required" is shown with a close (X) button. |
| 2 | Click the close button on the error. | Error message disappears; field error highlighting and icons are removed. |
| 3 | Check the URL. | Still `/checkout-step-one.html`. |

#### TC-14: Correcting the error allows the user to proceed

**Covers:** AC2, AC5
**Type:** Negative → recovery
**Test data:** Valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page; click "Continue" with an empty form. | Error "Error: First Name is required". |
| 2 | Enter First Name `John`; click "Continue". | Error changes to "Error: Last Name is required". |
| 3 | Enter Last Name `Doe`; click "Continue". | Error changes to "Error: Postal Code is required". |
| 4 | Enter Zip `12345`; click "Continue". | URL is `/checkout-step-two.html`; title is "Checkout: Overview". |

### 4.3 Error Handling and Input Validation (AC5)

TC-15 to TC-19 are written to AC5 and are **expected to fail (F2)**: the site accepts each of these inputs and proceeds to the overview page.

#### TC-15: Special characters in name fields are rejected

**Covers:** AC5
**Type:** Negative — expected to fail
**Test data:** Special characters data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `@#$%`, Last Name `!^&*`, Zip `<>?/`. | Values are shown in the fields. |
| 3 | Click "Continue". | A validation error is shown and the URL stays `/checkout-step-one.html`. *Observed: navigates to the overview page with no error.* |

#### TC-16: Numeric values in name fields are rejected

**Covers:** AC5
**Type:** Negative — expected to fail
**Test data:** Numeric names data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `123`, Last Name `456`, Zip `12345`. | Values are shown in the fields. |
| 3 | Click "Continue". | A validation error is shown for the name fields; URL stays `/checkout-step-one.html`. *Observed: proceeds.* |

#### TC-17: Invalid Zip/Postal Code format is rejected

**Covers:** AC5
**Type:** Negative — expected to fail
**Test data:** Alphabetic zip data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `John`, Last Name `Doe`, Zip `ABCDE`. | Values are shown in the fields. |
| 3 | Click "Continue". | A validation error is shown for the postal code; URL stays `/checkout-step-one.html`. *Observed: proceeds.* |

The story does not define a valid postal code format. Confirm with the product owner whether alphanumeric codes (for example UK `SW1A 1AA`) should be accepted before logging this as a bug.

#### TC-18: Whitespace-only values are treated as empty

**Covers:** AC2, AC5
**Type:** Negative — expected to fail
**Test data:** Whitespace only data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter a single space in each of the three fields. | Fields contain one space each. |
| 3 | Click "Continue". | Error "Error: First Name is required" is shown; URL stays `/checkout-step-one.html`. *Observed: proceeds.* |

#### TC-19: Script input is not executed and is rejected

**Covers:** AC5
**Type:** Negative / security — expected to fail on the validation step
**Test data:** Script injection data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `<script>alert(1)</script>`, Last Name `O'Brien-Smith`, Zip `SW1A 1AA`. | Values are shown in the fields as typed. |
| 3 | Click "Continue". | No JavaScript dialog appears. |
| 4 | Check the result. | A validation error is shown for First Name; URL stays `/checkout-step-one.html`. *Observed: proceeds with no dialog.* |

#### TC-20: Minimum-length values are accepted

**Covers:** AC5
**Type:** Boundary
**Test data:** Minimum length data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter First Name `J`, Last Name `D`, Zip `1`. | Values are shown in the fields. |
| 3 | Click "Continue". | URL is `/checkout-step-two.html`; no error. |

#### TC-21: Very long values are handled

**Covers:** AC5
**Type:** Boundary
**Test data:** Long input data set (300 characters per field)

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter 300 characters in each field. | Input is either truncated at a defined maximum length or accepted in full; the page layout is not broken. |
| 3 | Click "Continue". | Either a length validation error is shown, or the overview page opens normally. *Observed: accepted in full, no maximum length (F8).* |

The story defines no maximum length. Record the observed behaviour and confirm the intended limit with the product owner.

#### TC-22: Pressing Enter submits the form

**Covers:** AC3, AC5
**Type:** Edge case — **expected to fail (F4)**
**Test data:** Valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the information page with Backpack in the cart. | Form is empty. |
| 2 | Enter `John`, `Doe`, `12345`. | Values are shown in the fields. |
| 3 | With focus in the Zip/Postal Code field, press Enter. | URL is `/checkout-step-two.html`. *Observed: navigates to `/cart.html`, as if Cancel were clicked.* |

### 4.4 Order Overview (AC3)

#### TC-23: Valid information opens the overview page

**Covers:** AC3
**Type:** Happy path
**Test data:** Backpack; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart; click "Checkout". | Information page opens. |
| 2 | Enter `John`, `Doe`, `12345`; click "Continue". | URL is `/checkout-step-two.html`; title is "Checkout: Overview". |

#### TC-24: Overview lists all ordered items

**Covers:** AC3
**Type:** Happy path
**Test data:** Backpack + Bike Light; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack and Bike Light; proceed through the information page with valid data. | Overview page opens. |
| 2 | Inspect the item list. | 2 rows: Backpack qty `1` `$29.99`; Bike Light qty `1` `$9.99`; each with its description. |
| 3 | Inspect the rows for actions. | No "Remove" buttons are shown on the overview page. |

#### TC-25: Overview shows payment and shipping information

**Covers:** AC3
**Type:** UI element validation
**Test data:** Backpack; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the overview page with Backpack in the cart. | Overview page opens. |
| 2 | Inspect the payment section. | Label "Payment Information:" with value "SauceCard #31337". |
| 3 | Inspect the shipping section. | Label "Shipping Information:" with value "Free Pony Express Delivery!". |

#### TC-26: Overview shows correct subtotal, tax and total for two items

**Covers:** AC3
**Type:** Happy path
**Test data:** Backpack + Bike Light; expected $39.98 / $3.20 / $43.18

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the overview page with Backpack and Bike Light in the cart. | Overview page opens. |
| 2 | Inspect the "Price Total" section. | "Item total: $39.98". |
| 3 | Inspect the tax line. | "Tax: $3.20". |
| 4 | Inspect the total line. | "Total: $43.18", equal to item total plus tax. |

#### TC-27: Totals are correct for one low-priced item and for all six items

**Covers:** AC3
**Type:** Boundary
**Test data:** Onesie ($7.99 / $0.64 / $8.63); all six ($129.94 / $10.40 / $140.34)

| # | Step | Expected result |
|---|---|---|
| 1 | Add Sauce Labs Onesie only; reach the overview page with valid data. | "Item total: $7.99", "Tax: $0.64", "Total: $8.63". |
| 2 | Click "Cancel". | Products page opens; badge shows `1`. |
| 3 | Add the remaining five products; reach the overview page with valid data. | 6 rows listed; "Item total: $129.94", "Tax: $10.40", "Total: $140.34". |

#### TC-28: Overview offers Cancel and Finish options

**Covers:** AC3
**Type:** UI element validation
**Test data:** Backpack; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Reach the overview page with Backpack in the cart. | Overview page opens. |
| 2 | Inspect the buttons. | "Cancel" and "Finish" are visible and enabled. |
| 3 | Click "Cancel". | URL is `/inventory.html`; badge still shows `1`; the order is not placed. |

### 4.5 Order Completion (AC4)

#### TC-29: End-to-end purchase completes successfully

**Covers:** AC1, AC2, AC3, AC4, business rule "order confirmation clears the cart"
**Type:** Happy path
**Test data:** Backpack + Bike Light; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack and Bike Light. | Badge shows `2`. |
| 2 | Open the cart. | Both items listed. |
| 3 | Click "Checkout". | Information page opens. |
| 4 | Enter `John`, `Doe`, `12345`; click "Continue". | Overview page shows both items and "Total: $43.18". |
| 5 | Click "Finish". | URL is `/checkout-complete.html`; title is "Checkout: Complete!". |
| 6 | Inspect the confirmation. | Header "Thank you for your order!" and text "Your order has been dispatched, and will arrive just as fast as the pony can get there!" are shown. |
| 7 | Inspect the page controls. | "Back Home" button is visible and enabled; the cart badge is not displayed. |
| 8 | Click "Back Home". | URL is `/inventory.html`; no badge; all six products show "Add to cart". |
| 9 | Open the cart. | The cart is empty. |

#### TC-30: Checkout is blocked when the cart is empty

**Covers:** AC1, AC2 (precondition "with items in my cart")
**Type:** Negative — **expected to fail (F6)**
**Test data:** Empty cart; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | From the Products page with an empty cart, click the cart icon. | Cart page opens with no item rows. |
| 2 | Click "Checkout". | The user is prevented from starting checkout (button disabled or a message shown). *Observed: information page opens.* |
| 3 | If checkout proceeds, enter valid data, click "Continue", then "Finish". | An order with no items cannot be confirmed. *Observed: overview shows "Total: $0.00" and the order is confirmed.* |

### 4.6 Business Rules and Access Control

#### TC-31: Overview cannot be reached without entering checkout information

**Covers:** AC2, AC3
**Type:** Negative — **expected to fail (F5)**
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack to the cart. | Badge shows `1`. |
| 2 | Navigate directly to `https://www.saucedemo.com/checkout-step-two.html`. | The user is redirected to the information page or the cart. *Observed: overview page opens with the item and an enabled Finish button.* |

#### TC-32: Checkout pages require login

**Covers:** Business rule "users must be logged in to access checkout"
**Type:** Negative
**Starting state:** Fresh browser context, **not** logged in (do not use the seed)
**Test data:** URLs `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate directly to `/cart.html`. | Redirected to the login page (`/`); error "Epic sadface: You can only access '/cart.html' when you are logged in." |
| 2 | Navigate directly to `/checkout-step-one.html`. | Login page; error names `/checkout-step-one.html`. |
| 3 | Navigate directly to `/checkout-step-two.html`. | Login page; error names `/checkout-step-two.html`. |
| 4 | Navigate directly to `/checkout-complete.html`. | Login page; error names `/checkout-complete.html`. |

#### TC-33: Checkout is inaccessible after logout

**Covers:** Business rule "users must be logged in to access checkout"
**Type:** Negative
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart; click "Checkout". | Information page opens. |
| 2 | Open the burger menu and click "Logout". | Login page is displayed. |
| 3 | Navigate directly to `/checkout-step-one.html`. | Login page with error "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." |
| 4 | Click the browser back button. | The information page is not displayed; the user remains on the login page. |

### 4.7 Navigation Flow and Back Button

#### TC-34: Cancel on the information page returns to the cart

**Covers:** AC2, navigation
**Type:** Navigation
**Test data:** Backpack

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart; click "Checkout". | Information page opens. |
| 2 | Enter First Name `John`. | Value is shown. |
| 3 | Click "Cancel". | URL is `/cart.html`; Backpack is still listed; badge shows `1`. |
| 4 | Click "Checkout" again. | Information page opens with all three fields empty. |

#### TC-35: Browser back button through the checkout flow

**Covers:** AC2, AC3, AC4, navigation
**Type:** Navigation — step 7 **expected to fail (F7)**
**Test data:** Backpack + Bike Light; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Add both items; open the cart; click "Checkout"; enter valid data; click "Continue". | Overview page opens with 2 items. |
| 2 | Click the browser back button. | URL is `/checkout-step-one.html`; the three fields are empty. |
| 3 | Click the browser back button again. | URL is `/cart.html`; both items are listed; badge shows `2`. |
| 4 | Click the browser forward button twice. | URL is `/checkout-step-two.html`; both items and "Total: $43.18" are shown. |
| 5 | Click "Finish". | Confirmation page with "Thank you for your order!". |
| 6 | Click the browser back button. | URL is `/checkout-step-two.html`. |
| 7 | Inspect the page. | The completed order cannot be resubmitted: Finish is unavailable or the user is redirected. *Observed: overview shows no items, "Total: $0.00", and Finish is enabled.* |

#### TC-36: Cart contents persist across checkout navigation and re-login

**Covers:** AC1, navigation
**Type:** Edge case
**Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Add both items; open the cart; click "Checkout". | Information page; badge `2`. |
| 2 | Click the cart icon in the header. | Cart page with both items. |
| 3 | Reload the page. | Both items still listed. |
| 4 | Open the burger menu; click "Logout"; log in again as `standard_user`. | Products page; badge shows `2`. |

#### TC-37: Item name links on cart and overview open the product page

**Covers:** AC1, AC3, navigation
**Type:** UI element validation
**Test data:** Backpack; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Add Backpack; open the cart; click the item name "Sauce Labs Backpack". | URL is `/inventory-item.html?id=4`; product details are shown. |
| 2 | Click the browser back button. | Cart page with Backpack still listed. |
| 3 | Proceed to the overview page with valid data; click the item name. | Product detail page opens. |
| 4 | Click the browser back button. | Overview page with Backpack and totals still shown. |

#### TC-38: Confirmation page survives a reload without placing a second order

**Covers:** AC4
**Type:** Edge case
**Test data:** Backpack; valid data set

| # | Step | Expected result |
|---|---|---|
| 1 | Complete an order for Backpack. | Confirmation page is shown; no badge. |
| 2 | Reload the page. | Confirmation page is still shown with "Thank you for your order!"; no badge. |
| 3 | Click "Back Home"; open the cart. | Cart is empty. |

## 5. Traceability Matrix

| Requirement | Test cases |
|---|---|
| AC1 – Cart Review | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-29, TC-30, TC-36, TC-37 |
| AC2 – Checkout Information Entry | TC-07, TC-08, TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-18, TC-30, TC-31, TC-34, TC-35 |
| AC3 – Order Overview | TC-22, TC-23, TC-24, TC-25, TC-26, TC-27, TC-28, TC-29, TC-31, TC-35, TC-37 |
| AC4 – Order Completion | TC-29, TC-35, TC-38 |
| AC5 – Error Handling | TC-14, TC-15, TC-16, TC-17, TC-18, TC-19, TC-20, TC-21, TC-22 |
| Rule: login required | TC-32, TC-33 |
| Rule: confirmation clears cart | TC-29, TC-38 |
| Navigation and back button | TC-34, TC-35, TC-36, TC-37 |

## 6. Test Cases Expected to Fail

| Test case | Finding | Suggested action |
|---|---|---|
| TC-03 | F1 – no total on cart page | Log bug, or amend AC1 if the total is only intended on the overview page. |
| TC-15, TC-16, TC-19 | F2 – no content validation on name fields | Log bug against AC5. |
| TC-17 | F2 – no postal code format validation | Confirm the required format, then log bug. |
| TC-18 | F2 – whitespace-only accepted | Log bug against AC2/AC5. |
| TC-22 | F4 – Enter key cancels instead of continuing | Log bug. |
| TC-30 | F6 – empty cart can be checked out | Log bug. |
| TC-31 | F5 – information step can be bypassed by URL | Log bug. |
| TC-35 (step 7) | F7 – stale overview after order completion | Log bug. |
