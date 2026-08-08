import { type Page, expect } from '@playwright/test';

/**
 * Чекаємо, доки міні-кошик Horoshop завершить init з валідним CSRF.
 * Треба стартувати до навігації (або паралельно з нею), яка тригерить init.
 *
 * Порожній кошик часто без accessible name «Кошик» — тому видимість через `.j-basket-header`.
 */
export async function waitForCartWidgetReady(page: Page): Promise<void> {
  await page.waitForResponse(
    (response) => response.url().includes('/_widget/ajax_cart/init/') && response.status() === 200,
    { timeout: 20_000 },
  );
  await expect(page.locator('.j-basket-header')).toBeVisible();
}
