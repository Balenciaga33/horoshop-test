import { expect, test } from '../../fixtures/base.fixtures';
import products from '../../data/products.data.json';

const product = products.gentleSkinCleanser;

test.describe('Кошик: додавання товару', () => {
  test('Позитивний сценарій: сторінка товару → кошик → оформлення замовлення', async ({
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('Відкрити сторінку товару', async () => {
      await productPage.open(product.slug);
      await productPage.expectLoaded(product.name);
      await expect(productPage.price).toContainText(product.price);
      await expect(productPage.buyButton).toBeVisible();
    });

    await test.step('Додати товар до кошика', async () => {
      await productPage.addToCart();
    });

    await test.step('Перевірити вікно кошика', async () => {
      await productPage.expectInCartState();
      await cartPage.expectQuantity(product.quantity);
      await cartPage.expectTotalSum(product.price);
      await cartPage.expectProductInCart(product.name);
    });

    await test.step('Перейти до оформлення і перевірити товар', async () => {
      await cartPage.goToCheckout();
      await checkoutPage.expectLoaded();
      await checkoutPage.expectProductWithUnitPrice(
        product.name,
        product.quantity,
        product.price,
        product.price,
      );
    });
  });
});
