import { expect, test as base } from '@playwright/test';
import { requireApiCredentials } from '../api/config';
import { AuthClient } from '../api/clients/auth.client';
import { CatalogClient } from '../api/clients/catalog.client';
import { authSuccessSchema, parseSchema } from '../api/schemas/api.schemas';
import { HomePage } from '../page/home.page';
import { ProductPage } from '../page/product.page';
import { CartPage } from '../page/cart.page';
import { CheckoutPage } from '../page/checkout.page';
import { CategoryPage } from '../page/category.page';
import { SearchPage } from '../page/search.page';

type Fixtures = {
  authClient: AuthClient;
  catalogClient: CatalogClient;
  apiToken: string;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  categoryPage: CategoryPage;
  searchPage: SearchPage;
};

export const test = base.extend<Fixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  catalogClient: async ({ request }, use) => {
    await use(new CatalogClient(request));
  },
  apiToken: async ({ authClient }, use) => {
    const response = await authClient.auth(requireApiCredentials());
    expect(response.status()).toBe(200);
    const body = parseSchema(
      authSuccessSchema,
      await authClient.expectJson(response),
      'auth for apiToken',
    );
    await use(body.response.token);
  },
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

export { expect };
