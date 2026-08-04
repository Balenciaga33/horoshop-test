import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly catalogNav: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.catalogNav = page.getByRole('navigation', { name: 'Каталог' });
    this.searchInput = page.locator('input.j-search-input');
    this.searchButton = page.locator('button.j-search-button');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  /**
   * Top-level catalog item is visible; subcategory appears on hover.
   */
  async openCategoryFromMenu(parentHref: string, categoryHref: string): Promise<void> {
    await this.open();
    await this.catalogNav.locator(`a[href="${parentHref}"]`).hover();
    await this.catalogNav.locator(`a[href="${categoryHref}"]`).click();
  }

  /** Header search is collapsed until the search button is clicked. */
  async searchFor(query: string): Promise<void> {
    await this.searchButton.click();
    await this.searchInput.fill(query);
    await Promise.all([this.page.waitForURL(/\/katalog\/search\//), this.searchButton.click()]);
  }
}
