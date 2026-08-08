import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Міні-кошик у хедері + dialog «Кошик».
 * Пріоритет: getByRole; порожній хедер / суми без a11y — scoped CSS.
 */
export class CartPage extends BasePage {
  readonly basketHeader: Locator;
  readonly quantity: Locator;
  readonly totalSum: Locator;
  readonly cartPopup: Locator;
  readonly checkoutLink: Locator;

  constructor(page: Page) {
    super(page);
    // Порожній стан часто без aria-label «Кошик».
    this.basketHeader = page.locator('.j-basket-header');
    this.quantity = this.basketHeader.locator('.j-basket-quantity');
    this.totalSum = this.basketHeader.locator('.j-basket-total-sum');
    this.cartPopup = page.getByRole('dialog', { name: 'Кошик' });
    this.checkoutLink = this.cartPopup.getByRole('link', { name: 'Оформити замовлення' });
  }

  cartItemByName(name: string): Locator {
    return this.cartPopup.getByRole('row').filter({ hasText: name });
  }

  itemQuantityInput(name: string): Locator {
    return this.cartItemByName(name).getByRole('textbox', { name: 'Кількість' });
  }

  itemIncreaseButton(name: string): Locator {
    return this.cartItemByName(name).getByRole('button', { name: 'Збільшити кількість' });
  }

  itemDecreaseButton(name: string): Locator {
    return this.cartItemByName(name).getByRole('button', { name: 'Зменшити кількість' });
  }

  itemUnitPrice(name: string): Locator {
    return this.cartItemByName(name).locator('.j-cart-product-price');
  }

  itemCost(name: string): Locator {
    return this.cartItemByName(name).locator('.j-cart-product-cost');
  }

  async expectQuantity(expected: number | string): Promise<void> {
    await expect(this.quantity).toHaveText(String(expected));
  }

  async expectTotalSum(expected: string): Promise<void> {
    await expect(this.totalSum).toHaveText(expected);
  }

  async expectItemState(
    name: string,
    quantity: number,
    unitPrice: string,
    lineCost: string,
  ): Promise<void> {
    await expect(this.itemQuantityInput(name)).toHaveValue(String(quantity));
    await expect(this.itemUnitPrice(name)).toHaveText(unitPrice);
    await expect(this.itemCost(name)).toHaveText(lineCost);
    await this.expectQuantity(quantity);
    await this.expectTotalSum(lineCost);
  }

  async increaseItemQuantity(name: string): Promise<void> {
    const input = this.itemQuantityInput(name);
    const current = Number(await input.inputValue());
    await this.itemIncreaseButton(name).click();
    await expect(input).toHaveValue(String(current + 1));
  }

  async decreaseItemQuantity(name: string): Promise<void> {
    const input = this.itemQuantityInput(name);
    const current = Number(await input.inputValue());
    await this.itemDecreaseButton(name).click();
    await expect(input).toHaveValue(String(current - 1));
  }

  async goToCheckout(): Promise<void> {
    await expect(this.checkoutLink).toBeVisible();
    await Promise.all([this.page.waitForURL(/\/checkout\/?/), this.checkoutLink.click()]);
  }
}
