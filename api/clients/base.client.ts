import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Shared HTTP helpers for Horoshop JSON API clients.
 */
export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected postJson(path: string, data: Record<string, unknown> = {}): Promise<APIResponse> {
    return this.request.post(path, {
      data,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async expectJson(response: APIResponse): Promise<unknown> {
    const body = await response.json();
    expect(body).toBeTruthy();
    return body;
  }
}
