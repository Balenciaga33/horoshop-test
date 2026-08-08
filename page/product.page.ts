import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { waitForCartWidgetReady } from '../helper/cart.helper';

export class ProductPage extends BasePage {
  readonly title: Locator;
  /** Немає accessible name у DOM — лишаємо стабільний клас ціни. */
  readonly price: Locator;
  readonly buyButton: Locator;
  readonly inCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.price = page.locator('.product-price').first();
    this.buyButton = page.getByRole('button', { name: 'Купити' });
    this.inCartButton = page.getByRole('button', { name: 'В кошику' });
  }

  async open(slug: string): Promise<void> {
    await Promise.all([waitForCartWidgetReady(this.page), this.goto(slug)]);
  }

  async expectLoaded(productName: string): Promise<void> {
    await expect(this.title).toHaveText(productName);
  }

  async addToCart(): Promise<void> {
    await expect(this.buyButton).toBeVisible();
    await this.buyButton.click();
    await expect(this.inCartButton).toBeVisible();
  }
}
