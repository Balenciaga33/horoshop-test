import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoryPage extends BasePage {
  readonly title: Locator;
  readonly productCards: Locator;
  readonly sidebar: Locator;
  readonly sortButtons: Locator;
  readonly activeSortButton: Locator;
  readonly activeFilterChip: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.productCards = page.locator('li.catalog-grid__item');
    this.sidebar = page.locator('.j-catalog-sidebar');
    this.sortButtons = page.locator('button.j-catalog-sorting-button');
    this.activeSortButton = page.locator('button.j-catalog-sorting-button.is-active');
    this.activeFilterChip = page.locator('.filter-current-i__content');
  }

  sortButton(label: string): Locator {
    return this.sortButtons.filter({ hasText: label });
  }

  filterByTitle(title: string): Locator {
    return this.sidebar.locator('a.filter-check').filter({
      has: this.page.locator('.j-filter-title', { hasText: new RegExp(`^${title}$`) }),
    });
  }

  productCardByHref(href: string): Locator {
    return this.productCards.filter({
      has: this.page.locator(`a.catalogCard-image[href="${href}"]`),
    });
  }

  async expectLoaded(heading: string): Promise<void> {
    await expect(this.title).toContainText(heading);
    await expect(this.productCards.first()).toBeVisible();
  }

  async expectProductCountAtLeast(min: number): Promise<void> {
    await expect.poll(async () => this.productCards.count()).toBeGreaterThanOrEqual(min);
  }

  async expectHeading(text: string): Promise<void> {
    await expect(this.title).toHaveText(text);
  }

  async expectActiveFilterChip(label: string): Promise<void> {
    await expect(this.activeFilterChip).toContainText(label);
  }

  async productHrefs(): Promise<string[]> {
    const hrefs = await this.productCards.locator('a.catalogCard-image').evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    );
    return [...new Set(hrefs)].sort();
  }

  async expectExactProductHrefs(expectedHrefs: string[]): Promise<void> {
    const expected = [...expectedHrefs].sort();
    await expect.poll(async () => this.productHrefs()).toEqual(expected);
  }

  async expectProductAbsent(href: string): Promise<void> {
    await expect(this.productCardByHref(href)).toHaveCount(0);
  }

  async sortBy(label: string): Promise<void> {
    await this.sortButton(label).click();
    await expect(this.activeSortButton).toHaveText(label);
  }

  async expectUrlContains(part: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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

  async expectPricesAscending(): Promise<void> {
    const prices = await this.productPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  }
}
