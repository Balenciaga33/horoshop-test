import { expect, test } from '../../fixtures/base.fixtures';
import catalog from '../../data/catalog.data.json';
import products from '../../data/products.data.json';

const category = catalog.womensFashion;
const expectedProductHrefs = category.expectedProductKeys.map(
  (key) => products[key as keyof typeof products].slug,
);
const excludedProductHref = products[category.excludedProductKey as keyof typeof products].slug;

test.describe('Каталог: навігація та фільтри', () => {
  test('Жіночий одяг: меню → сортування → фільтр розміру', async ({
    homePage,
    categoryPage,
  }) => {
    await test.step('Відкрити категорію через меню', async () => {
      await homePage.openCategoryFromMenu(category.parentHref, category.href);
      await categoryPage.expectLoaded(category.heading);
      await categoryPage.expectProductCountAtLeast(1);
    });

    const productCountBeforeFilter = await categoryPage.productCards.count();

    await test.step('Застосувати сортування «спочатку дешевше»', async () => {
      await categoryPage.sortBy(category.sortCheaperLabel);
      await categoryPage.expectUrlContains(category.sortCheaperUrlPart);
      await categoryPage.expectPricesAscending();
      await expect(categoryPage.productCards).toHaveCount(productCountBeforeFilter);
    });

    await test.step('Застосувати фільтр One size і перевірити інваріант вибірки', async () => {
      await categoryPage.applyFilterByTitle(category.sizeFilterTitle);
      await categoryPage.expectUrlContains(category.sizeFilterUrlPart);
      await categoryPage.expectHeading(category.filteredHeading);
      await categoryPage.expectActiveFilterChip(category.sizeFilterTitle);
      await categoryPage.expectExactProductHrefs(expectedProductHrefs);
      await categoryPage.expectProductAbsent(excludedProductHref);
      expect(expectedProductHrefs.length).toBeLessThan(productCountBeforeFilter);
    });
  });
});
