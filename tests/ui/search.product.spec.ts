import { expect, test } from '../../fixtures/ui.fixtures';
import products from '../../data/products.data.json';
import searchData from '../../data/search.data.json';

const product = products[searchData.exactName.productKey as keyof typeof products];

test.describe('Пошук товарів', () => {
  test(
    'Пошук → результати → відкриття товару',
    { tag: '@p0' },
    async ({ page, homePage, searchPage, productPage }) => {
      await test.step('Виконати пошук з хедера', async () => {
        await homePage.open();
        await homePage.searchFor(product.name);
      });

      await test.step('Перевірити сторінку результатів', async () => {
        await expect(page).toHaveURL(/\/katalog\/search\//);
        await expect(page).toHaveURL(
          new RegExp(`q=${encodeURIComponent(product.name).replace(/%20/g, '[+ ]')}`),
        );
        await expect(searchPage.title).toContainText('Результати пошуку');
        await expect(searchPage.title).toContainText(product.name);
        await expect(searchPage.searchInput).toHaveValue(product.name);
        await expect(searchPage.productCards.first()).toBeVisible();
        await expect(searchPage.productCardByHref(product.slug)).toHaveCount(1);
      });

      await test.step('Відкрити товар із результатів', async () => {
        await searchPage.openProduct(product.slug);
        await productPage.expectLoaded(product.name);
        await expect(page).toHaveURL(new RegExp(product.slug.replace(/\//g, '\\/')));
      });
    },
  );
});
