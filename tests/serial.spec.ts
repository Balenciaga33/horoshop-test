import { type Page } from '@playwright/test';
import { expect, test } from '../fixtures/base.fixtures';

/**
 * serial + shared page:
 * tests run strictly one after another on the same page.
 * State is kept between tests; if the first fails, the rest are skipped.
 *
 * browser is worker-scoped (one per worker) — its fixture does NOT create a new browser per test.
 * page is test-scoped by default → a new one per test; so we override it with a single
 * sharedPage from beforeAll. homePage still comes from the fixture and uses that page.
 */
test.describe.serial('Serial: same page across tests (shared state)', () => {
  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  // override page only; the fixture runs again per test but returns the same sharedPage
  test.use({
    page: async ({}, use) => {
      await use(sharedPage);
    },
  });

  test('opens home and checks URL', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveURL(/./);
  });

  test('continues on the same page without reopen', async ({ homePage }) => {
    await expect(homePage.heading).toBeVisible();
  });
});
