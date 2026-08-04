import { type Page, expect } from '@playwright/test';

/**
 * Wait until Horoshop mini-cart widget finished CSRF-valid init.
 * Must be started before (or raced with) navigation that triggers init.
 */
export async function waitForCartWidgetReady(page: Page): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.url().includes('/_widget/ajax_cart/init/') && response.status() === 200,
    { timeout: 20_000 },
  );
  await expect(page.locator('.j-basket-header')).toBeVisible();
}
