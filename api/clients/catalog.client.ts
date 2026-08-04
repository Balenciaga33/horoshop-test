import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Horoshop Catalog API — POST /api/catalog/export/
 * @see https://horoshop.notion.site/api-doc
 */
export class CatalogClient {
  constructor(private readonly request: APIRequestContext) {}

  async export(token: string): Promise<APIResponse> {
    return this.request.post('/api/catalog/export/', {
      data: { token },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async exportWithoutToken(): Promise<APIResponse> {
    return this.request.post('/api/catalog/export/', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async expectJson(response: APIResponse): Promise<unknown> {
    const body = await response.json();
    expect(body).toBeTruthy();
    return body;
  }
}
