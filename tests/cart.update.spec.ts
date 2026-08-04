import { test } from '../fixtures/base.fixtures';
import products from '../data/products.data.json';
import { formatUah } from '../helper/price.helper';

const product = products.gentleSkinCleanser;
const unitPrice = product.price;
const totalFor = (quantity: number) => formatUah(product.unitPriceValue * quantity);

test.describe('Кошик: оновлення', () => {
  test('Зміна кількості та видалення з перерахунком суми', async ({
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('Додати товар до кошика', async () => {
      await productPage.open(product.slug);
      await productPage.addToCart();
      await cartPage.expectItemState(product.name, 1, unitPrice, totalFor(1));
    });

    await test.step('Збільшити кількість і перевірити перерахунок', async () => {
      await cartPage.increaseItemQuantity(product.name);
      await cartPage.expectItemState(product.name, 2, unitPrice, totalFor(2));
    });

    await test.step('Зменшити кількість і перевірити перерахунок', async () => {
      await cartPage.decreaseItemQuantity(product.name);
      await cartPage.expectItemState(product.name, 1, unitPrice, totalFor(1));
    });

    await test.step('Знову збільшити і перейти на оформлення', async () => {
      await cartPage.increaseItemQuantity(product.name);
      await cartPage.expectItemState(product.name, 2, unitPrice, totalFor(2));
      await cartPage.goToCheckout();
      await checkoutPage.expectLoaded();
      await checkoutPage.expectProductWithUnitPrice(product.name, 2, unitPrice, totalFor(2));
    });

    await test.step('Видалити товар і перевірити порожній кошик', async () => {
      await checkoutPage.removeProduct(product.name);
      await checkoutPage.expectLeftCheckout();
      await cartPage.expectEmptyHeader();
    });
  });
});
