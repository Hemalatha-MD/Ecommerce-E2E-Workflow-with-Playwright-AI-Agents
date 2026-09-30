// spec: specs/saucedemo-checkout-test-plan.md (section 4.7)
// seed: seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  USER, PRODUCTS, TITLES, URLS,
  login, addToCart, openCart, startCheckout, goToOverview, expectBadge, knownDefect, attachFailureContext,
} = require('./helpers');

test.describe('Navigation Flow and Back Button', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  async function expectInformationFormEmpty(page) {
    await expect(page.getByTestId('firstName')).toBeEmpty();
    await expect(page.getByTestId('lastName')).toBeEmpty();
    await expect(page.getByTestId('postalCode')).toBeEmpty();
  }

  test('TC-34: Cancel on the information page returns to the cart', async ({ page }) => {
    // 1. Add Backpack; open the cart; click "Checkout"
    await addToCart(page, PRODUCTS.backpack);
    await startCheckout(page);

    // 2. Enter First Name
    await page.getByTestId('firstName').fill('John');
    await expect(page.getByTestId('firstName')).toHaveValue('John');

    // 3. Click "Cancel"
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(URLS.cart);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(PRODUCTS.backpack.name);
    await expectBadge(page, 1);

    // 4. Click "Checkout" again - entered information is not kept
    await page.getByTestId('checkout').click();
    await expect(page.getByTestId('title')).toHaveText(TITLES.information);
    await expectInformationFormEmpty(page);
  });

  // DEFECT BUG-08: steps 1-6 pass, step 7 fails against the live site; assertion kept
  test('TC-35: Browser back button through the checkout flow', knownDefect('BUG-08', 'Back button after order completion shows a submittable empty order'), async ({ page }) => {
    const rows = page.getByTestId('inventory-item');

    // 1. Add both items and proceed to the overview page
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await goToOverview(page);
    await expect(rows).toHaveCount(2);

    // 2. Click the browser back button
    await page.goBack();
    await expect(page).toHaveURL(URLS.information);
    await expect(page.getByTestId('title')).toHaveText(TITLES.information);
    await expectInformationFormEmpty(page);

    // 3. Click the browser back button again
    await page.goBack();
    await expect(page).toHaveURL(URLS.cart);
    await expect(rows).toHaveCount(2);
    await expectBadge(page, 2);

    // 4. Click the browser forward button twice
    await page.goForward();
    await expect(page).toHaveURL(URLS.information);
    await page.goForward();
    await expect(page).toHaveURL(URLS.overview);
    await expect(rows).toHaveCount(2);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $43.18');

    // 5. Click "Finish"
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');

    // 6. Click the browser back button
    await page.goBack();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('title')).toHaveText(TITLES.overview);

    // 7. The completed order must not be resubmittable: no enabled Finish button
    await expect(page.locator('[data-test="finish"]:enabled'),
      'Finish must be unavailable after the order is complete').toHaveCount(0);
  });

  test('TC-36: Cart contents persist across checkout navigation and re-login', async ({ page }) => {
    const rows = page.getByTestId('inventory-item');

    // 1. Add both items; open the cart; click "Checkout"
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await startCheckout(page);
    await expectBadge(page, 2);

    // 2. Click the cart icon in the header
    await openCart(page);
    await expect(rows).toHaveCount(2);

    // 3. Reload the page
    await page.reload();
    await expect(rows).toHaveCount(2);

    // 4. Log out and log in again as the same user
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('logout-sidebar-link').click();
    await page.locator('#user-name').fill(USER.username);
    await page.locator('#password').fill(USER.password);
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expectBadge(page, 2);
  });

  test('TC-37: Item name links on cart and overview open the product page', async ({ page }) => {
    const productPage = /\/inventory-item\.html\?id=4$/;

    // 1. Add Backpack; open the cart; click the item name
    await addToCart(page, PRODUCTS.backpack);
    await openCart(page);
    await page.getByTestId('inventory-item-name').click();
    await expect(page).toHaveURL(productPage);
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    await expect(page.getByTestId('inventory-item-name')).toHaveText(PRODUCTS.backpack.name);

    // 2. Click the browser back button
    await page.goBack();
    await expect(page).toHaveURL(URLS.cart);
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);

    // 3. Proceed to the overview page; click the item name
    await goToOverview(page);
    await page.getByTestId('inventory-item-name').click();
    await expect(page).toHaveURL(productPage);

    // 4. Click the browser back button
    await page.goBack();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $32.39');
  });

  test('TC-38: Confirmation page survives a reload without placing a second order', async ({ page }) => {
    // 1. Complete an order for Backpack
    await addToCart(page, PRODUCTS.backpack);
    await goToOverview(page);
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('title')).toHaveText(TITLES.complete);
    await expectBadge(page, 0);

    // 2. Reload the page
    await page.reload();
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
    await expectBadge(page, 0);

    // 3. Click "Back Home"; open the cart
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(URLS.inventory);
    await openCart(page);
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  });
});
