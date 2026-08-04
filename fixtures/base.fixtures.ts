import { test as base } from '@playwright/test';
import { HomePage } from '../page/home.page';
import { ProductPage } from '../page/product.page';
import { CartPage } from '../page/cart.page';
import { CheckoutPage } from '../page/checkout.page';
import { CategoryPage } from '../page/category.page';
import { SearchPage } from '../page/search.page';

type Fixtures = {
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  categoryPage: CategoryPage;
  searchPage: SearchPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
});

export { expect } from '@playwright/test';
