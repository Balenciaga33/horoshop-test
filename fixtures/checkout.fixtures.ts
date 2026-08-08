import { test as uiTest } from './ui.fixtures';
import products from '../data/products.data.json';
import type { CheckoutPage } from '../page/checkout.page';
import { annotateKnownIssue } from './known-issue';

const product = products.gentleSkinCleanser;

type CheckoutFlowFixtures = {
  /**
   * Setup: PDP → add to cart → checkout (форма вже на сторінці).
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
    annotateKnownIssue('U1', 'AJAX кошика BAD_CSRF у headless — UI у headed');
    await productPage.open(product.slug);
    await productPage.addToCart();
    await cartPage.goToCheckout();
    await use(checkoutPage);
  },
});

export { expect } from './ui.fixtures';
