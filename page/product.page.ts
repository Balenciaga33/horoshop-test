import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { waitForCartWidgetReady } from '../helper/cart.helper';

export class ProductPage extends BasePage {
  readonly title: Locator;
  readonly price: Locator;
  readonly buyButton: Locator;
  readonly inCartButton: Locator;
  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.price = page.locator('.product-price').first();
    this.buyButton = page.locator('button.j-buy-button-add');
    this.inCartButton = page.locator('button.j-buy-button-remove');
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

  async expectInCartState(): Promise<void> {
    await expect(this.inCartButton).toBeVisible();
    await expect(this.buyButton).toHaveCount(0);
  }
}
