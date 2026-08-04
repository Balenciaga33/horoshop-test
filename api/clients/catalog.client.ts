import type { APIResponse } from '@playwright/test';
import { BaseApiClient } from './base.client';

/**
 * Horoshop Catalog API — POST /api/catalog/export/
 * @see https://horoshop.notion.site/api-doc
 */
export class CatalogClient extends BaseApiClient {
  async export(token: string): Promise<APIResponse> {
    return this.postJson('/api/catalog/export/', { token });
  }

  async exportWithoutToken(): Promise<APIResponse> {
    return this.postJson('/api/catalog/export/');
  }
}
