import { annotateKnownIssue, expect, test } from '../../../fixtures/api.fixtures';
import {
  assertOperationExists,
  documentedBusinessStatusEnum,
  documentedStatusCodes,
  loadOpenApiDoc,
} from '../../../helper/openapi.helper';

/**
 * Smoke по локальному OpenAPI (у магазину немає /api/doc.json).
 * Гарантує: критичні операції, які покриває test suite, задокументовані в контракті.
 */
test.describe('API OpenAPI contract smoke', () => {
  const criticalOperations = [
    {
      name: 'auth',
      path: '/api/auth/',
      method: 'post',
      documentedHttp: '200',
    },
    {
      name: 'catalog export',
      path: '/api/catalog/export/',
      method: 'post',
      documentedHttp: '200',
      documentedBusinessStatuses: ['OK', 'AUTHORIZATION_ERROR', 'UNAUTHORIZED', 'ERROR'] as const,
    },
  ] as const;

  test('критичні paths існують із очікуваними HTTP-кодами', { tag: '@p0' }, async () => {
    annotateKnownIssue('A2', 'Немає live /api/doc.json — перевіряємо локальний OpenAPI');

    const doc = loadOpenApiDoc();

    for (const op of criticalOperations) {
      assertOperationExists(doc, op.path, op.method);
      const codes = documentedStatusCodes(doc, op.path, op.method);
      expect(codes, `${op.name} має документувати HTTP ${op.documentedHttp}`).toContain(
        op.documentedHttp,
      );
    }
  });

  test('catalog/export документує бізнес-статуси authz', { tag: '@p0' }, async () => {
    annotateKnownIssue('A2', 'Немає live /api/doc.json — перевіряємо локальний OpenAPI');

    const doc = loadOpenApiDoc();
    const statuses = documentedBusinessStatusEnum(doc, '/api/catalog/export/', 'post');

    expect(statuses, 'catalog export status enum missing in OpenAPI').toBeTruthy();
    for (const status of ['OK', 'AUTHORIZATION_ERROR', 'UNAUTHORIZED', 'ERROR'] as const) {
      expect(statuses, `OpenAPI missing business status ${status}`).toContain(status);
    }
  });
});
