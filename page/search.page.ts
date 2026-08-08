import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  readonly title: Locator;
  readonly productCards: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.productCards = page.locator('li.catalog-grid__item');
    this.searchInput = page.getByRole('textbox', { name: 'пошук товарів' });
  }

  productCardByHref(href: string): Locator {
    return this.productCards.filter({
      has: this.page.locator(`a[href="${href}"]`),
    });
  }

  async open(query: string): Promise<void> {
    const params = new URLSearchParams({ q: query });
    await this.goto(`/katalog/search/?${params.toString()}`);
  }

  async openProduct(href: string): Promise<void> {
    const productLink = this.productCardByHref(href).getByRole('link').first();
    await Promise.all([
      this.page.waitForURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
      productLink.click(),
    ]);
  }
}
