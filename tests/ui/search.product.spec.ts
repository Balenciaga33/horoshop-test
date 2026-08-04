import { expect, test } from '../../fixtures/base.fixtures';
import products from '../../data/products.data.json';
import searchData from '../../data/search.data.json';

const product = products[searchData.exactName.productKey as keyof typeof products];

test.describe('Пошук товарів', () => {
  test('Пошук → результати → відкриття товару', async ({
    page,
    homePage,
    searchPage,
    productPage,
  }) => {
    await test.step('Виконати пошук з хедера', async () => {
      await homePage.open();
      await homePage.searchFor(product.name);
    });

    await test.step('Перевірити сторінку результатів', async () => {
      await searchPage.expectLoaded(product.name);
      await searchPage.expectProductInResults(product.slug);
      await searchPage.expectFirstProductHref(product.slug);
    });

    await test.step('Відкрити товар із результатів', async () => {
      await searchPage.openProduct(product.slug);
      await productPage.expectLoaded(product.name);
      await expect(page).toHaveURL(new RegExp(product.slug.replace(/\//g, '\\/')));
    });
  });
});
