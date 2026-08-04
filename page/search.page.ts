import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  readonly title: Locator;
  readonly productCards: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.productCards = page.locator('li.catalog-grid__item');
    this.searchInput = page.locator('input.j-search-input');
  }

  productCardByHref(href: string): Locator {
    return this.productCards.filter({
      has: this.page.locator(`a.catalogCard-image[href="${href}"]`),
    });
  }

  async open(query: string): Promise<void> {
    const params = new URLSearchParams({ q: query });
    await this.goto(`/katalog/search/?${params.toString()}`);
  }

  async expectLoaded(query: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/katalog\/search\//);
    await expect(this.page).toHaveURL(
      new RegExp(`q=${encodeURIComponent(query).replace(/%20/g, '[+ ]')}`),
    );
    await expect(this.title).toContainText('Результати пошуку');
    await expect(this.title).toContainText(query);
    await expect(this.searchInput).toHaveValue(query);
    await expect(this.productCards.first()).toBeVisible();
  }

  async expectProductInResults(href: string): Promise<void> {
    await expect(this.productCardByHref(href)).toHaveCount(1);
  }

  async expectFirstProductHref(href: string): Promise<void> {
    await expect(this.productCards.first().locator('a.catalogCard-image')).toHaveAttribute(
      'href',
      href,
    );
  }

  async openProduct(href: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
      this.productCardByHref(href).locator('a.catalogCard-image').click(),
    ]);
  }
}
