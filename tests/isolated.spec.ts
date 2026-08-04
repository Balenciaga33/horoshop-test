import { expect, test } from '../fixtures/base.fixtures';

/**
 * regular describe:
 * each test is isolated — fresh page/context via fixtures.
 * Can run in parallel; one failure does not block the others.
 */
test.describe('Isolated: each test gets a fresh page', () => {
  test('opens home in its own page', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveURL(/./);
  });

  test('opens home again in a separate page', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveURL(/./);
  });
});