import { annotateKnownIssue, expect, test } from '../../fixtures/base.fixtures';
import products from '../../data/products.data.json';
import {
  authorizationErrorSchema,
  catalogExportSuccessSchema,
  parseSchema,
  unauthorizedErrorSchema,
} from '../../api/schemas/api.schemas';

const knownProduct = products.gentleSkinCleanser;
const knownSlug = knownProduct.slug.replace(/^\/|\/$/g, '');

test.describe('API: каталог', () => {
  test(
    'POST /api/catalog/export/ з токеном повертає products',
    { tag: '@p0' },
    async ({ catalogClient, apiToken }) => {
      const response = await catalogClient.export(apiToken);
      expect(response.status()).toBe(200);
      const body = await catalogClient.expectJson(response);
      const parsed = parseSchema(catalogExportSuccessSchema, body, 'catalog export');

      await test.step('Список products не порожній', async () => {
        expect(parsed.response.products.length).toBeGreaterThan(0);
      });

      await test.step('Каталог містить відомий UI-товар з очікуваною ціною', async () => {
        const match = parsed.response.products.find((item) => item.slug === knownSlug);

        expect(match, `product slug "${knownSlug}" not found in catalog export`).toBeTruthy();
        expect(match!.title.ua).toBe(knownProduct.name);
        expect(match!.price).toBe(knownProduct.unitPriceValue);
      });
    },
  );

  test(
    'POST /api/catalog/export/ без токена повертає AUTHORIZATION_ERROR',
    { tag: '@p0' },
    async ({ catalogClient }) => {
      annotateKnownIssue('A2', 'Відсутній токен → AUTHORIZATION_ERROR (не UNAUTHORIZED)');
      const response = await catalogClient.exportWithoutToken();

      await test.step('HTTP 200 + Zod-схема AUTHORIZATION_ERROR', async () => {
        expect(response.status()).toBe(200);
        const body = await catalogClient.expectJson(response);
        const parsed = parseSchema(authorizationErrorSchema, body, 'catalog export no token');
        expect(parsed.response.message.length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'POST /api/catalog/export/ з невалідним токеном повертає UNAUTHORIZED',
    { tag: '@p1' },
    async ({ catalogClient }) => {
      annotateKnownIssue('A2', 'Битий токен → UNAUTHORIZED (не AUTHORIZATION_ERROR)');
      const response = await catalogClient.export('00000000000000000000000000000000');

      await test.step('HTTP 200 + Zod-схема UNAUTHORIZED', async () => {
        // Missing token → AUTHORIZATION_ERROR; wrong token → UNAUTHORIZED.
        expect(response.status()).toBe(200);
        const body = await catalogClient.expectJson(response);
        const parsed = parseSchema(unauthorizedErrorSchema, body, 'catalog export bad token');
        expect(parsed.response.message.length).toBeGreaterThan(0);
      });
    },
  );
});
