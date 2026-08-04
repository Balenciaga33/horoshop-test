import { expect, test } from '../fixtures/base.fixtures';

/**
 * one test + test.step:
 * one page for the whole scenario (like a normal test);
 * steps only structure the report — they are not separate tests.
 */
test('Steps: one test, one page, structured report', async ({ homePage, page }) => {
  await test.step('open home', async () => {
    await homePage.open();
    await expect(page).toHaveURL(/./);
  });

  await test.step('assert heading is visible', async () => {
    await expect(homePage.heading).toBeVisible();
  });

  await test.step('reload and assert URL again', async () => {
    await homePage.open();
    await expect(page).toHaveURL(/./);
  });
});
