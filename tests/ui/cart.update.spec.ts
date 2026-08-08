import { annotateKnownIssue, expect, test } from '../../fixtures/ui.fixtures';
import products from '../../data/products.data.json';
import { formatUah } from '../../helper/price.helper';

const product = products.gentleSkinCleanser;
const unitPrice = product.price;
const totalFor = (quantity: number) => formatUah(product.unitPriceValue * quantity);

test.describe('Кошик: оновлення', () => {
  test(
    'Зміна кількості та видалення з перерахунком суми',
    { tag: '@p1' },
    async ({ page, productPage, cartPage, checkoutPage }) => {
      annotateKnownIssue('U1', 'AJAX кошика BAD_CSRF у headless — UI у headed');
      annotateKnownIssue('U2', 'Remove у popup нестабільний — видаляємо на checkout');

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
        await checkoutPage.expectProductWithUnitPrice(product.name, 2, unitPrice, totalFor(2));
      });

      await test.step('Видалити товар і перевірити порожній кошик', async () => {
        await checkoutPage.removeProduct(product.name);
        await expect(page).not.toHaveURL(/\/checkout\/?/);
        await expect(cartPage.quantity).toHaveText('0');
      });
    },
  );
});
