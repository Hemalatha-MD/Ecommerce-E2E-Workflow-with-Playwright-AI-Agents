// spec: specs/saucedemo-checkout-test-plan.md (section 4.6)
// seed: seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, TITLES, URLS,
  login, addToCart, startCheckout, expectBadge, knownDefect, attachFailureContext,
} = require('./helpers');

const loginRequiredError = (path) => `Epic sadface: You can only access '${path}' when you are logged in.`;

test.describe('Business Rules and Access Control', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  test.describe('logged-in user', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await addToCart(page, PRODUCTS.backpack);
    });

    // DEFECT BUG-07: fails against the live site; assertion kept as AC2/AC3 require
    test('TC-31: Overview cannot be reached without entering checkout information', knownDefect('BUG-07', 'Checkout information step can be bypassed by URL'), async ({ page }) => {
      // 1. Add Backpack to the cart
      await expectBadge(page, 1);

      // 2. Navigate directly to the overview URL - must redirect to the information page or cart
      await page.goto('/checkout-step-two.html');
      await expect(page, 'the information step must not be skippable').not.toHaveURL(URLS.overview);
    });

    test('TC-33: Checkout is inaccessible after logout', async ({ page }) => {
      // 1. Add Backpack; open the cart; click "Checkout"
      await startCheckout(page);
      await expect(page.getByTestId('title')).toHaveText(TITLES.information);

      // 2. Open the burger menu and click "Logout"
      await page.getByRole('button', { name: 'Open Menu' }).click();
      await page.getByTestId('logout-sidebar-link').click();
      await expect(page.locator('#login-button')).toBeVisible();

      // 3. Navigate directly to the information page
      await page.goto('/checkout-step-one.html');
      await expect(page.getByTestId('error')).toHaveText(loginRequiredError('/checkout-step-one.html'));
      await expect(page.locator('#login-button')).toBeVisible();

      // 4. Click the browser back button
      await page.goBack();
      await expect(page.locator('#login-button')).toBeVisible();
      await expect(page.getByTestId('firstName')).toHaveCount(0);
    });
  });

  test.describe('logged-out user', () => {
    // No login here: the seed state is deliberately not used for this scenario
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#login-button')).toBeVisible();
    });

    test('TC-32: Checkout pages require login', async ({ page }) => {
      const protectedPaths = ['/cart.html', '/checkout-step-one.html', '/checkout-step-two.html', '/checkout-complete.html'];

      // 1-4. Navigate directly to each checkout URL
      for (const path of protectedPaths) {
        await test.step(`open ${path} while logged out`, async () => {
          await page.goto(path);
          await expect(page.getByTestId('error')).toHaveText(loginRequiredError(path));
          await expect(page).toHaveURL('/');
          await expect(page.locator('#login-button')).toBeVisible();
        });
      }
    });
  });
});
