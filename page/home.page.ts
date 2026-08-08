import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly catalogNav: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.catalogNav = page.getByRole('navigation', { name: 'Каталог' });
    this.searchInput = page.getByRole('textbox', { name: 'пошук товарів' });
    this.searchButton = page.getByRole('button', { name: 'пошук товарів' });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  /**
   * Пункт каталогу верхнього рівня видимий; підкатегорія з’являється на hover.
   * Підменю часто `visibility:hidden` до hover — клікаємо по href у межах nav.
   */
  async openCategoryFromMenu(
    parentName: string,
    categoryName: string,
    categoryHref: string,
  ): Promise<void> {
    await this.open();
    await this.catalogNav.getByRole('link', { name: parentName, exact: true }).hover();
    await this.catalogNav
      .locator(`a[href="${categoryHref}"]`)
      .filter({ hasText: categoryName })
      .click();
  }

  /** Пошук у хедері згорнутий, доки не натиснути кнопку пошуку. */
  async searchFor(query: string): Promise<void> {
    await this.searchButton.click();
    await this.searchInput.fill(query);
    await Promise.all([this.page.waitForURL(/\/katalog\/search\//), this.searchButton.click()]);
  }
}
