import { test as uiTest } from './ui.fixtures';
import products from '../data/products.data.json';
import type { CheckoutPage } from '../page/checkout.page';

const product = products.gentleSkinCleanser;

type CheckoutFlowFixtures = {
  /**
   * Setup: PDP → add to cart → checkout (форма вже завантажена).
   * Значення фікстури — той самий CheckoutPage після підготовки.
   */
  onCheckout: CheckoutPage;
};

/**
 * UI-фікстури + flow «вже на checkout з товаром у кошику».
 * Імпортуйте звідси лише спеки валідації/форми checkout.
 */
export const test = uiTest.extend<CheckoutFlowFixtures>({
  onCheckout: async ({ productPage, cartPage, checkoutPage }, use) => {
    await productPage.open(product.slug);
    await productPage.addToCart();
    await cartPage.goToCheckout();
    await checkoutPage.expectLoaded();
    await use(checkoutPage);
  },
});

export { expect } from './ui.fixtures';
