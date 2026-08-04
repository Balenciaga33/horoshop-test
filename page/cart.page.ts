import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Mini-cart in header + cart popup (Horoshop basket widget).
 * Prefer stable attributes (href, j-* classes, ids) over UI copy.
 */
export class CartPage extends BasePage {
  readonly basketHeader: Locator;
  readonly quantity: Locator;
  readonly totalSum: Locator;
  readonly cartPopup: Locator;
  readonly cartPopupTitle: Locator;
  readonly checkoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.basketHeader = page.locator('.j-basket-header');
    this.quantity = page.locator('.j-basket-quantity');
    this.totalSum = page.locator('.j-basket-total-sum');
    this.cartPopup = page.locator('.popup.__cart');
    this.cartPopupTitle = this.cartPopup.locator('#cart-title');
    this.checkoutLink = this.cartPopup.locator('a[href="/checkout/"]');
  }

  cartItemByName(name: string): Locator {
    return this.cartPopup.locator('tr.cart-item').filter({ hasText: name });
  }

  itemQuantityInput(name: string): Locator {
    return this.cartItemByName(name).locator('input.j-quantity-p');
  }

  itemIncreaseButton(name: string): Locator {
    return this.cartItemByName(name).locator('button.j-increase-p');
  }

  itemDecreaseButton(name: string): Locator {
    return this.cartItemByName(name).locator('button.j-decrease-p');
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

  async expectProductInCart(name: string): Promise<void> {
    await expect(this.cartPopup).toBeVisible();
    await expect(this.cartPopupTitle).toBeVisible();
    await expect(this.cartItemByName(name)).toBeVisible();
    await expect(this.checkoutLink).toBeVisible();
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

  async expectEmptyHeader(): Promise<void> {
    await expect(this.quantity).toHaveText('0');
  }
}
