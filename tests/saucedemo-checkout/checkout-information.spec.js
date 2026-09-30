// spec: specs/saucedemo-checkout-test-plan.md (section 4.2)
// seed: tests/seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, TITLES, URLS,
  login, addToCart, openCart, startCheckout, fillInformation, expectBadge, attachFailureContext,
} = require('./helpers');

test.describe('Checkout Information Entry (AC2)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addToCart(page, PRODUCTS.backpack);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  // Error styling uses class names; there are no data-test hooks for it
  const highlightedInputs = (page) => page.locator('.checkout_info input.error');
  const errorIcons = (page) => page.locator('.checkout_info .error_icon');

  test('TC-07: Checkout button opens the information page', async ({ page }) => {
    // 1. Add Backpack; open the cart
    await openCart(page);
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);

    // 2. Click "Checkout"
    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(URLS.information);
    await expect(page.getByTestId('title')).toHaveText(TITLES.information);
  });

  test('TC-08: Information page shows the required form elements', async ({ page }) => {
    // 1. Add Backpack; open the cart; click "Checkout"
    await startCheckout(page);

    // 2. Inspect the form
    const placeholders = await page.locator('.checkout_info input[type="text"]')
      .evaluateAll((inputs) => inputs.map((input) => input.getAttribute('placeholder')));
    expect(placeholders).toEqual(['First Name', 'Last Name', 'Zip/Postal Code']);
    await expect(page.getByTestId('firstName')).toBeEmpty();
    await expect(page.getByTestId('lastName')).toBeEmpty();
    await expect(page.getByTestId('postalCode')).toBeEmpty();

    // 3. Inspect the buttons
    await expect(page.getByTestId('cancel')).toHaveText('Cancel');
    await expect(page.getByTestId('cancel')).toBeEnabled();
    // Continue is an <input type="submit">, so its label is the value attribute
    await expect(page.getByTestId('continue')).toHaveValue('Continue');
    await expect(page.getByTestId('continue')).toBeEnabled();

    // 4. Inspect the header
    await expectBadge(page, 1);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-09: All fields empty shows a required-field error', async ({ page }) => {
    // 1. Reach the information page with Backpack in the cart
    await startCheckout(page);

    // 2. Click "Continue" without entering anything
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.information);

    // 3. Inspect the error
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');

    // 4. Inspect the fields
    await expect(highlightedInputs(page)).toHaveCount(3);
    await expect(errorIcons(page)).toHaveCount(3);
  });

  test('TC-10: First Name empty shows "First Name is required"', async ({ page }) => {
    // 1. Reach the information page with Backpack in the cart
    await startCheckout(page);

    // 2. Enter Last Name and Zip; leave First Name empty
    await fillInformation(page, { firstName: '', lastName: 'Doe', postalCode: '12345' });

    // 3. Click "Continue"
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(URLS.information);
  });

  test('TC-11: Last Name empty shows "Last Name is required"', async ({ page }) => {
    // 1. Reach the information page with Backpack in the cart
    await startCheckout(page);

    // 2. Enter First Name and Zip; leave Last Name empty
    await fillInformation(page, { firstName: 'John', lastName: '', postalCode: '12345' });

    // 3. Click "Continue"
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Last Name is required');
    await expect(page).toHaveURL(URLS.information);
  });

  test('TC-12: Zip/Postal Code empty shows "Postal Code is required"', async ({ page }) => {
    // 1. Reach the information page with Backpack in the cart
    await startCheckout(page);

    // 2. Enter First Name and Last Name; leave Zip empty
    await fillInformation(page, { firstName: 'John', lastName: 'Doe', postalCode: '' });

    // 3. Click "Continue"
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(URLS.information);
  });

  test('TC-13: Error message can be dismissed', async ({ page }) => {
    // 1. Reach the information page; click "Continue" with an empty form
    await startCheckout(page);
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
    await expect(page.getByTestId('error-button')).toBeVisible();

    // 2. Click the close button on the error
    await page.getByTestId('error-button').click();
    await expect(page.getByTestId('error')).toHaveCount(0);
    await expect(highlightedInputs(page)).toHaveCount(0);
    await expect(errorIcons(page)).toHaveCount(0);

    // 3. Check the URL
    await expect(page).toHaveURL(URLS.information);
  });

  test('TC-14: Correcting the error allows the user to proceed', async ({ page }) => {
    // 1. Reach the information page; click "Continue" with an empty form
    await startCheckout(page);
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');

    // 2. Enter First Name; click "Continue" (errors are reported one field at a time)
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Last Name is required');

    // 3. Enter Last Name; click "Continue"
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');

    // 4. Enter Zip; click "Continue"
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
  });
});
