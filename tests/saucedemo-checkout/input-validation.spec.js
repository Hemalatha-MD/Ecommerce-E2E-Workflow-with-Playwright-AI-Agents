// spec: specs/saucedemo-checkout-test-plan.md (section 4.3)
// seed: tests/seed.spec.ts
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, VALID_INFO, TITLES, URLS,
  login, addToCart, startCheckout, fillInformation, knownDefect, attachFailureContext,
} = require('./helpers');

test.describe('Error Handling and Input Validation (AC5)', () => {
  test.beforeEach(async ({ page }) => {
    // Every scenario starts on the empty information form with Backpack in the cart
    await login(page);
    await addToCart(page, PRODUCTS.backpack);
    await startCheckout(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await attachFailureContext(page, testInfo);
  });

  /** AC5: invalid data must show a validation error and keep the user on the information page. */
  async function expectRejected(page) {
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page).toHaveURL(URLS.information);
  }

  // TC-15 to TC-19 and TC-22 are DEFECTS: they fail against the live site because it
  // only checks for empty fields. The assertions are kept as AC5 requires.
  const BUG_02 = knownDefect('BUG-02', 'Name fields accept special characters, digits and script tags');

  test('TC-15: Special characters in name fields are rejected', BUG_02, async ({ page }) => {
    // 2. Enter special characters in all three fields
    await fillInformation(page, { firstName: '@#$%', lastName: '!^&*', postalCode: '<>?/' });
    await expect(page.getByTestId('firstName')).toHaveValue('@#$%');

    // 3. Click "Continue"
    await expectRejected(page);
  });

  test('TC-16: Numeric values in name fields are rejected', BUG_02, async ({ page }) => {
    // 2. Enter digits in the name fields
    await fillInformation(page, { firstName: '123', lastName: '456', postalCode: '12345' });
    await expect(page.getByTestId('firstName')).toHaveValue('123');

    // 3. Click "Continue"
    await expectRejected(page);
  });

  test('TC-17: Invalid Zip/Postal Code format is rejected', knownDefect('BUG-03', 'Zip/Postal Code accepts any text'), async ({ page }) => {
    // 2. Enter letters in the Zip/Postal Code field
    await fillInformation(page, { firstName: 'John', lastName: 'Doe', postalCode: 'ABCDE' });
    await expect(page.getByTestId('postalCode')).toHaveValue('ABCDE');

    // 3. Click "Continue"
    await expectRejected(page);
  });

  test('TC-18: Whitespace-only values are treated as empty', knownDefect('BUG-04', 'Whitespace-only values satisfy the mandatory-field check'), async ({ page }) => {
    // 2. Enter a single space in each of the three fields
    await fillInformation(page, { firstName: ' ', lastName: ' ', postalCode: ' ' });
    await expect(page.getByTestId('firstName')).toHaveValue(' ');

    // 3. Click "Continue"
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
    await expect(page).toHaveURL(URLS.information);
  });

  test('TC-19: Script input is not executed and is rejected', BUG_02, async ({ page }) => {
    // Fail the dialog check if the script input ever triggers an alert
    const dialogs = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    // 2. Enter a script tag as First Name
    await fillInformation(page, { firstName: '<script>alert(1)</script>', lastName: "O'Brien-Smith", postalCode: 'SW1A 1AA' });
    await expect(page.getByTestId('firstName')).toHaveValue('<script>alert(1)</script>');

    // 3. Click "Continue"; 4. Check the result
    await expectRejected(page);
    expect(dialogs, 'no JavaScript dialog should appear').toEqual([]);
  });

  test('TC-20: Minimum-length values are accepted', async ({ page }) => {
    // 2. Enter one character in each field
    await fillInformation(page, { firstName: 'J', lastName: 'D', postalCode: '1' });

    // 3. Click "Continue"
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-21: Very long values are handled', async ({ page }) => {
    // 2. Enter 300 characters in each field
    await fillInformation(page, { firstName: 'A'.repeat(300), lastName: 'B'.repeat(300), postalCode: '9'.repeat(300) });
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow, 'long input must not break the page layout').toBe(false);

    // 3. Click "Continue" - the story sets no maximum length, so either a
    //    validation error or a normally rendered overview page is acceptable
    await page.getByTestId('continue').click();
    const overviewTitle = page.getByTestId('title').filter({ hasText: TITLES.overview });
    await expect(page.getByTestId('error').or(overviewTitle)).toBeVisible();
  });

  test('TC-22: Pressing Enter submits the form', knownDefect('BUG-05', 'Pressing Enter in the form cancels checkout'), async ({ page }) => {
    // 2. Enter valid information
    await fillInformation(page, VALID_INFO);

    // 3. With focus in the Zip/Postal Code field, press Enter
    await page.getByTestId('postalCode').press('Enter');
    await expect(page).toHaveURL(URLS.overview);
  });
});
