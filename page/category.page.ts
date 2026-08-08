import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoryPage extends BasePage {
  readonly title: Locator;
  readonly productCards: Locator;
  /** Chip активного фільтра — без accessible name у DOM. */
  readonly activeFilterChip: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    // Клас відсікає sidebar listitem від карток товарів.
    this.productCards = page.locator('li.catalog-grid__item');
    this.activeFilterChip = page.locator('.filter-current-i__content');
  }

  filterByTitle(title: string): Locator {
    // Sidebar filter: accessible name на кшталт «One size 2».
    return this.page.locator('.j-catalog-sidebar').getByRole('link', {
      name: new RegExp(escapeRegExp(title)),
    });
  }

  productCardByHref(href: string): Locator {
    return this.productCards.filter({
      has: this.page.locator(`a[href="${href}"]`),
    });
  }

  async expectProductCountAtLeast(min: number): Promise<void> {
    await expect.poll(async () => this.productCards.count()).toBeGreaterThanOrEqual(min);
  }

  async expectUrlContains(part: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  async sortBy(label: string): Promise<void> {
    const button = this.page.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(button).toHaveClass(/is-active/);
  }

  async applyFilterByTitle(title: string): Promise<void> {
    await this.filterByTitle(title).click();
  }

  async productPrices(): Promise<number[]> {
    return this.productCards.evaluateAll((items) =>
      items.map((item) => {
        const matches = [...item.textContent!.matchAll(/(\d[\d\s]*)\s*грн/g)].map((match) =>
          Number(match[1].replace(/\s/g, '')),
        );
        return Math.min(...matches);
      }),
    );
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
