import type { APIResponse } from '@playwright/test';
import { BaseApiClient } from './base.client';

export type AuthCredentials = {
  login: string;
  password: string;
};

/**
 * Horoshop Auth API — POST /api/auth/
 * @see https://horoshop.notion.site/api-doc
 */
export class AuthClient extends BaseApiClient {
  async auth(credentials: AuthCredentials): Promise<APIResponse> {
    return this.postJson('/api/auth/', credentials);
  }
}
