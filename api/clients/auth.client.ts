import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export type AuthCredentials = {
  login: string;
  password: string;
};

/**
 * Horoshop Auth API — POST /api/auth/
 * @see https://horoshop.notion.site/api-doc
 */
export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async auth(credentials: AuthCredentials): Promise<APIResponse> {
    return this.request.post('/api/auth/', {
      data: credentials,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async expectJson(response: APIResponse): Promise<unknown> {
    const body = await response.json();
    expect(body).toBeTruthy();
    return body;
  }
}
