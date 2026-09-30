// spec: specs/saucedemo-checkout-test-plan.md (section 4.4)
// seed: tests/seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, VALID_INFO, TITLES, URLS,
  login, addToCart, startCheckout, fillInformation, goToOverview,
  expectItemRow, expectBadge, attachFailureContext,
} = require('./helpers');

test.describe('Order Overview (AC3)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  /** Tax is 8% of the item total, rounded to two decimals. */
  async function expectTotals(page, { itemTotal, tax, total }) {
    await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: ${itemTotal}`);
    await expect(page.getByTestId('tax-label')).toHaveText(`Tax: ${tax}`);
    await expect(page.getByTestId('total-label')).toHaveText(`Total: ${total}`);
  }

  test('TC-23: Valid information opens the overview page', async ({ page }) => {
    // 1. Add Backpack; open the cart; click "Checkout"
    await addToCart(page, PRODUCTS.backpack);
    await startCheckout(page);

    // 2. Enter valid information; click "Continue"
    await fillInformation(page, VALID_INFO);
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
  });

  test('TC-24: Overview lists all ordered items', async ({ page }) => {
    // 1. Add Backpack and Bike Light; proceed through the information page
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await goToOverview(page);

    // 2. Inspect the item list
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(2);
    await expectItemRow(rows.nth(0), PRODUCTS.backpack);
    await expectItemRow(rows.nth(1), PRODUCTS.bikeLight);

    // 3. Inspect the rows for actions. The item title link has role="button",
    //    so the Remove button must be matched by name, not by role alone.
    await expect(rows.getByRole('button', { name: 'Remove' })).toHaveCount(0);
  });

  test('TC-25: Overview shows payment and shipping information', async ({ page }) => {
    // 1. Reach the overview page with Backpack in the cart
    await addToCart(page, PRODUCTS.backpack);
    await goToOverview(page);

    // 2. Inspect the payment section
    await expect(page.getByTestId('payment-info-label')).toHaveText('Payment Information:');
    await expect(page.getByTestId('payment-info-value')).toHaveText('SauceCard #31337');

    // 3. Inspect the shipping section
    await expect(page.getByTestId('shipping-info-label')).toHaveText('Shipping Information:');
    await expect(page.getByTestId('shipping-info-value')).toHaveText('Free Pony Express Delivery!');
  });

  test('TC-26: Overview shows correct subtotal, tax and total for two items', async ({ page }) => {
    // 1. Reach the overview page with Backpack and Bike Light in the cart
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await goToOverview(page);

    // 2-4. Inspect item total, tax and total
    await expect(page.getByTestId('total-info-label')).toHaveText('Price Total');
    await expectTotals(page, { itemTotal: '$39.98', tax: '$3.20', total: '$43.18' });
  });

  test('TC-27: Totals are correct for one low-priced item and for all six items', async ({ page }) => {
    // 1. Add Sauce Labs Onesie only; reach the overview page
    await addToCart(page, PRODUCTS.onesie);
    await goToOverview(page);
    await expectTotals(page, { itemTotal: '$7.99', tax: '$0.64', total: '$8.63' });

    // 2. Click "Cancel"
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expectBadge(page, 1);

    // 3. Add the remaining five products; reach the overview page
    await addToCart(page, ...ALL_PRODUCTS.filter((product) => product !== PRODUCTS.onesie));
    await goToOverview(page);
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
    await expectTotals(page, { itemTotal: '$129.94', tax: '$10.40', total: '$140.34' });
  });

  test('TC-28: Overview offers Cancel and Finish options', async ({ page }) => {
    // 1. Reach the overview page with Backpack in the cart
    await addToCart(page, PRODUCTS.backpack);
    await goToOverview(page);

    // 2. Inspect the buttons
    await expect(page.getByTestId('cancel')).toHaveText('Cancel');
    await expect(page.getByTestId('cancel')).toBeEnabled();
    await expect(page.getByTestId('finish')).toHaveText('Finish');
    await expect(page.getByTestId('finish')).toBeEnabled();

    // 3. Click "Cancel" - returns to Products without placing the order
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expectBadge(page, 1);
  });
});
