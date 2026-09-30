// Shared test data and flow helpers for the SauceDemo checkout suites.
// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts
const { expect } = require('@playwright/test');

const USER = { username: 'standard_user', password: 'secret_sauce' };

const PRODUCTS = {
  backpack: { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' },
  boltTShirt: { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  fleeceJacket: { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  onesie: { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: '$7.99' },
  redTShirt: { slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
};
const ALL_PRODUCTS = Object.values(PRODUCTS);

const VALID_INFO = { firstName: 'John', lastName: 'Doe', postalCode: '12345' };

const TITLES = {
  cart: 'Your Cart',
  information: 'Checkout: Your Information',
  overview: 'Checkout: Overview',
  complete: 'Checkout: Complete!',
};

const URLS = {
  inventory: /\/inventory\.html$/,
  cart: /\/cart\.html$/,
  information: /\/checkout-step-one\.html$/,
  overview: /\/checkout-step-two\.html$/,
  complete: /\/checkout-complete\.html$/,
};

/** Same steps as tests/seed.spec.ts: log in and land on the Products page. */
async function login(page) {
  await page.goto('/');
  await page.locator('#user-name').fill(USER.username);
  await page.locator('#password').fill(USER.password);
  await page.locator('#login-button').click();
  await expect(page).toHaveURL(URLS.inventory);
}

/** Adds products from the Products page and waits for each button to flip to "Remove". */
async function addToCart(page, ...products) {
  for (const product of products) {
    await page.getByTestId(`add-to-cart-${product.slug}`).click();
    await expect(page.getByTestId(`remove-${product.slug}`)).toBeVisible();
  }
}

// The app is a single-page app: the URL changes before the new page renders,
// so each navigation helper waits for the page title instead of a load event.
async function openCart(page) {
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('title')).toHaveText(TITLES.cart);
}

async function startCheckout(page) {
  await openCart(page);
  await page.getByTestId('checkout').click();
  await expect(page.getByTestId('title')).toHaveText(TITLES.information);
}

async function fillInformation(page, { firstName, lastName, postalCode }) {
  await page.getByTestId('firstName').fill(firstName);
  await page.getByTestId('lastName').fill(lastName);
  await page.getByTestId('postalCode').fill(postalCode);
}

async function goToOverview(page, info = VALID_INFO) {
  await startCheckout(page);
  await fillInformation(page, info);
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('title')).toHaveText(TITLES.overview);
}

/** Asserts one cart/overview row shows quantity 1 plus the product's name, description and price. */
async function expectItemRow(row, product) {
  await expect(row.getByTestId('item-quantity')).toHaveText('1');
  await expect(row.getByTestId('inventory-item-name')).toHaveText(product.name);
  await expect(row.getByTestId('inventory-item-desc')).not.toBeEmpty();
  await expect(row.getByTestId('inventory-item-price')).toHaveText(product.price);
}

/** The badge element is removed from the DOM, not hidden, when the cart is empty. */
async function expectBadge(page, count) {
  const badge = page.getByTestId('shopping-cart-badge');
  if (count === 0) await expect(badge).toHaveCount(0);
  else await expect(badge).toHaveText(String(count));
}

/**
 * Test details for a scenario that fails because the application does not meet
 * the acceptance criteria. The assertion is left as written in the test plan;
 * the tag lets the run be filtered with --grep @defect / --grep-invert @defect.
 */
function knownDefect(id, description) {
  return { tag: '@defect', annotation: { type: 'issue', description: `${id}: ${description}` } };
}

/** afterEach hook body: records where a failed test ended up. */
async function attachFailureContext(page, testInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('final-url', { body: page.url(), contentType: 'text/plain' });
  }
}

module.exports = {
  USER, PRODUCTS, ALL_PRODUCTS, VALID_INFO, TITLES, URLS,
  login, addToCart, openCart, startCheckout, fillInformation, goToOverview,
  expectItemRow, expectBadge, knownDefect, attachFailureContext,
};
