// spec: specs/saucedemo-checkout-test-plan.md (section 4.1)
// seed: seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, TITLES, URLS,
  login, addToCart, openCart, expectItemRow, expectBadge, knownDefect, attachFailureContext,
} = require('./helpers');

test.describe('Cart Review (AC1)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  test('TC-01: Cart displays a single added item with full details', async ({ page }) => {
    // 1. On the Products page, click "Add to cart" for Sauce Labs Backpack
    await addToCart(page, PRODUCTS.backpack);
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');
    await expectBadge(page, 1);

    // 2. Click the cart icon
    await openCart(page);
    await expect(page).toHaveURL(URLS.cart);
    await expect(page.getByTestId('title')).toHaveText(TITLES.cart);

    // 3. Inspect the cart row
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(1);
    await expectItemRow(rows.first(), PRODUCTS.backpack);
    await expect(rows.first().getByTestId('inventory-item-desc')).toContainText('carry.allTheThings()');
    await expect(rows.first().getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');

    // 4. Inspect the column headers
    await expect(page.getByTestId('cart-quantity-label')).toHaveText('QTY');
    await expect(page.getByTestId('cart-desc-label')).toHaveText('Description');
  });

  test('TC-02: Cart displays multiple items with correct details', async ({ page }) => {
    // 1. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await expectBadge(page, 2);

    // 2. Click the cart icon
    await openCart(page);
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(2);

    // 3. Inspect each row
    await expectItemRow(rows.nth(0), PRODUCTS.backpack);
    await expectItemRow(rows.nth(1), PRODUCTS.bikeLight);
    await expect(rows.nth(0).getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(rows.nth(1).getByRole('button', { name: 'Remove' })).toBeVisible();

    // 4. Reload the page
    await page.reload();
    await expect(rows).toHaveCount(2);
    await expectBadge(page, 2);
  });

  // DEFECT BUG-01: fails against the live site; assertion kept as AC1 requires
  test('TC-03: Cart shows the total price calculation', knownDefect('BUG-01', 'Cart page does not show a total price'), async ({ page }) => {
    // 1. Add Backpack and Bike Light; open the cart
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await openCart(page);
    await expect(page.getByTestId('inventory-item')).toHaveCount(2);

    // 2. Look for a total price on the cart page ($29.99 + $9.99)
    await expect(page.getByTestId('cart-contents-container')).toContainText('$39.98');
  });

  test('TC-04: Cart offers Continue Shopping and Checkout options', async ({ page }) => {
    // 1. Add Backpack; open the cart
    await addToCart(page, PRODUCTS.backpack);
    await openCart(page);

    // 2. Inspect the footer of the cart
    const continueShopping = page.getByTestId('continue-shopping');
    const checkout = page.getByTestId('checkout');
    await expect(continueShopping).toHaveText('Continue Shopping');
    await expect(continueShopping).toBeEnabled();
    await expect(checkout).toHaveText('Checkout');
    await expect(checkout).toBeEnabled();

    // 3. Click "Continue Shopping"
    await continueShopping.click();
    await expect(page).toHaveURL(URLS.inventory);
    await expectBadge(page, 1);
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');
  });

  test('TC-05: Removing an item from the cart updates the list and badge', async ({ page }) => {
    // 1. Add both items; open the cart
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await openCart(page);
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(2);
    await expectBadge(page, 2);

    // 2. Click "Remove" on Sauce Labs Bike Light
    await page.getByTestId('remove-sauce-labs-bike-light').click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByTestId('inventory-item-name')).toHaveText(PRODUCTS.backpack.name);
    await expectBadge(page, 1);

    // 3. Click "Remove" on Sauce Labs Backpack
    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(rows).toHaveCount(0);
    await expectBadge(page, 0);
  });

  test('TC-06: Cart with all six products', async ({ page }) => {
    // 1. Add all six products from the Products page
    await addToCart(page, ...ALL_PRODUCTS);
    await expectBadge(page, 6);

    // 2. Open the cart
    await openCart(page);
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(6);
    for (const [index, product] of ALL_PRODUCTS.entries()) {
      await expectItemRow(rows.nth(index), product);
    }
  });
});
