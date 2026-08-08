import { expect, test } from '../../fixtures/ui.fixtures';
import catalog from '../../data/catalog.data.json';
import products from '../../data/products.data.json';

const category = catalog.womensFashion;
const excludedProductHref = products[category.excludedProductKey as keyof typeof products].slug;

test.describe('Каталог: навігація та фільтри', () => {
  test(
    'Жіночий одяг: меню → сортування → фільтр розміру',
    { tag: '@p0' },
    async ({ homePage, categoryPage }) => {
      await test.step('Відкрити категорію через меню', async () => {
        await homePage.openCategoryFromMenu(
          category.parentName,
          category.categoryName,
          category.categoryHref,
        );
        await expect(categoryPage.title).toContainText(category.heading);
        await expect(categoryPage.productCards.first()).toBeVisible();
        await categoryPage.expectProductCountAtLeast(1);
      });

      const productCountBeforeFilter = await categoryPage.productCards.count();

      await test.step('Застосувати сортування «спочатку дешевше»', async () => {
        await categoryPage.sortBy(category.sortCheaperLabel);
        await categoryPage.expectUrlContains(category.sortCheaperUrlPart);
        const prices = await categoryPage.productPrices();
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
        await expect(categoryPage.productCards).toHaveCount(productCountBeforeFilter);
      });

      await test.step('Застосувати фільтр One size і перевірити інваріанти вибірки', async () => {
        await categoryPage.applyFilterByTitle(category.sizeFilterTitle);
        await categoryPage.expectUrlContains(category.sizeFilterUrlPart);
        await expect(categoryPage.title).toHaveText(category.filteredHeading);
        await expect(categoryPage.activeFilterChip).toContainText(category.sizeFilterTitle);
        await categoryPage.expectProductCountAtLeast(1);
        await expect
          .poll(async () => categoryPage.productCards.count())
          .toBeLessThan(productCountBeforeFilter);
        await expect(categoryPage.productCardByHref(excludedProductHref)).toHaveCount(0);
      });
    },
  );
});
