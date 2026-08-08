import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly title: Locator;
  /** Область товарів у замовленні (унікальний регіон без a11y-імені). */
  readonly orderList: Locator;
  readonly totalSum: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly cityInput: Locator;
  readonly emailInput: Locator;
  /** Прихований id міста після autocomplete — без a11y-імені. */
  readonly cityIdInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { name: 'Оформлення замовлення', level: 1 });
    this.orderList = page.locator('ul.order-list');
    this.totalSum = page.locator('.j-total-sum');
    // На сторінці кілька полів «Телефон»/«Е-пошта» (callback, login) — звужуємо через id.
    this.nameInput = page.getByRole('textbox', { name: 'ПІБ' });
    this.phoneInput = page
      .getByRole('textbox', { name: 'Телефон' })
      .and(page.locator('#checkout-phone'));
    this.cityInput = page.getByRole('combobox', { name: 'Місто' });
    this.emailInput = page
      .getByRole('textbox', { name: 'Е-пошта' })
      .and(page.locator('#checkout-email'));
    this.cityIdInput = page.locator('input[name="Recipient[delivery_city_id]"]');
    this.submitButton = page.getByRole('button', { name: 'Оформити замовлення' });
  }

  productItem(name: string): Locator {
    return this.orderList.getByRole('listitem').filter({ hasText: name });
  }

  productQuantity(name: string): Locator {
    return this.productItem(name).getByRole('textbox', { name: 'Кількість' });
  }

  productPrice(name: string): Locator {
    return this.productItem(name).locator('.j-cart-product-price');
  }

  productRemoveButton(name: string): Locator {
    return this.productItem(name).getByRole('link', { name: 'Видалити' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\/?/);
    await expect(this.title).toBeVisible();
  }

  async expectProduct(name: string, quantity: number | string, totalPrice: string): Promise<void> {
    const item = this.productItem(name);
    await expect(item).toBeVisible();
    await expect(this.productQuantity(name)).toHaveValue(String(quantity));
    await expect(this.totalSum).toHaveText(totalPrice);
  }

  async expectProductWithUnitPrice(
    name: string,
    quantity: number | string,
    unitPrice: string,
    totalPrice: string,
  ): Promise<void> {
    await this.expectProduct(name, quantity, totalPrice);
    await expect(this.productPrice(name)).toHaveText(unitPrice);
  }

  async increaseItemQuantity(name: string): Promise<void> {
    const input = this.productQuantity(name);
    const current = Number(await input.inputValue());
    await this.productItem(name).getByRole('button', { name: 'Збільшити кількість' }).click();
    await expect(input).toHaveValue(String(current + 1));
  }

  async removeProduct(name: string): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.productRemoveButton(name).click();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async fillName(value: string): Promise<void> {
    await this.nameInput.fill(value);
  }

  async fillPhoneMasked(value: string): Promise<void> {
    await this.phoneInput.fill(value);
  }

  async typePhoneDigits(digits: string): Promise<void> {
    await this.phoneInput.click();
    await this.phoneInput.fill('');
    await this.phoneInput.pressSequentially(digits, { delay: 20 });
  }

  async selectCity(query: string): Promise<void> {
    await this.cityInput.fill(query);
    // jQuery UI autocomplete — без стабільних a11y-ролей у списку підказок.
    await this.page.locator('.ui-menu-item, .ui-autocomplete li').first().click();
    await expect(this.cityIdInput).not.toHaveValue('');
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailInput.fill(value);
    await this.emailInput.blur();
  }

  async fillRecipient(data: {
    name: string;
    phoneMasked: string;
    cityQuery: string;
    email: string;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.fillPhoneMasked(data.phoneMasked);
    await this.selectCity(data.cityQuery);
    await this.fillEmail(data.email);
  }

  async expectEmailInvalid(): Promise<void> {
    await expect
      .poll(async () => this.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity()))
      .toBe(false);
    await expect
      .poll(async () =>
        this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage.length),
      )
      .toBeGreaterThan(0);
  }

  async expectStillOnCheckout(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\/?/);
  }

  async submitOrder(): Promise<void> {
    await this.submitButton.click();
  }
}
