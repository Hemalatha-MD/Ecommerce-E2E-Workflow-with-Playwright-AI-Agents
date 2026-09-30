// spec: specs/saucedemo-checkout-test-plan.md (section 4.5)
// seed: seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, VALID_INFO, TITLES, URLS,
  login, addToCart, openCart, fillInformation, expectBadge, knownDefect, attachFailureContext,
} = require('./helpers');

test.describe('Order Completion (AC4)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  test('TC-29: End-to-end purchase completes successfully', async ({ page }) => {
    // 1. Add Backpack and Bike Light
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await expectBadge(page, 2);

    // 2. Open the cart
    await openCart(page);
    const rows = page.getByTestId('inventory-item');
    await expect(rows).toHaveCount(2);

    // 3. Click "Checkout"
    await page.getByTestId('checkout').click();
    await expect(page.getByTestId('title')).toHaveText(TITLES.information);

    // 4. Enter valid information; click "Continue"
    await fillInformation(page, VALID_INFO);
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
    await expect(rows).toHaveCount(2);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $43.18');

    // 5. Click "Finish"
    await page.getByTestId('finish').click();
    await expect(page).toHaveURL(URLS.complete);
    await expect(page.getByTestId('title')).toHaveText(TITLES.complete);

    // 6. Inspect the confirmation
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
    await expect(page.getByTestId('complete-text')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!');

    // 7. Inspect the page controls
    await expect(page.getByTestId('back-to-products')).toHaveText('Back Home');
    await expect(page.getByTestId('back-to-products')).toBeEnabled();
    await expectBadge(page, 0);

    // 8. Click "Back Home"
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expectBadge(page, 0);
    await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(6);

    // 9. Open the cart
    await openCart(page);
    await expect(rows).toHaveCount(0);
  });

  // DEFECT BUG-06: fails against the live site; assertions kept as the story requires
  test('TC-30: Checkout is blocked when the cart is empty', knownDefect('BUG-06', 'Checkout can be completed with an empty cart'), async ({ page }) => {
    // 1. From the Products page with an empty cart, click the cart icon
    await openCart(page);
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);

    // 2. Click "Checkout" - the user must not be able to start checkout.
    //    Soft assertion so step 3 is still evaluated if this one fails.
    await page.getByTestId('checkout').click();
    await expect.soft(page, 'checkout must not start with an empty cart').toHaveURL(URLS.cart);

    // 3. If checkout proceeds, an order with no items must not be confirmable
    if (URLS.information.test(page.url())) {
      await fillInformation(page, VALID_INFO);
      await page.getByTestId('continue').click();
      await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
      await page.getByTestId('finish').click();
      await expect(page, 'an empty order must not be confirmed').not.toHaveURL(URLS.complete);
    }
  });
});
