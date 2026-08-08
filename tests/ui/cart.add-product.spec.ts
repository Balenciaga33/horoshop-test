import { annotateKnownIssue, expect, test } from '../../fixtures/ui.fixtures';
import products from '../../data/products.data.json';

const product = products.gentleSkinCleanser;

test.describe('Кошик: додавання товару', () => {
  test(
    'Позитивний сценарій: сторінка товару → кошик → оформлення замовлення',
    { tag: '@p0' },
    async ({ productPage, cartPage, checkoutPage }) => {
      annotateKnownIssue('U1', 'AJAX кошика BAD_CSRF у headless — UI у headed');

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
        await expect(productPage.inCartButton).toBeVisible();
        await expect(productPage.buyButton).toHaveCount(0);
        await cartPage.expectQuantity(product.quantity);
        await cartPage.expectTotalSum(product.price);
        await expect(cartPage.cartPopup).toBeVisible();
        await expect(cartPage.cartItemByName(product.name)).toBeVisible();
        await expect(cartPage.checkoutLink).toBeVisible();
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
    },
  );
});
