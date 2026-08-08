import { expect, test as base } from '@playwright/test';
import { AuthClient } from '../api/clients/auth.client';
import { CatalogClient } from '../api/clients/catalog.client';
import { requireApiCredentials } from '../api/config';
import { authSuccessSchema, parseSchema } from '../api/schemas/api.schemas';

type ApiFixtures = {
  authClient: AuthClient;
  catalogClient: CatalogClient;
  apiToken: string;
};

export const test = base.extend<ApiFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  catalogClient: async ({ request }, use) => {
    await use(new CatalogClient(request));
  },
  apiToken: async ({ authClient }, use) => {
    const response = await authClient.auth(requireApiCredentials());
    expect(response.status()).toBe(200);
    const body = parseSchema(
      authSuccessSchema,
      await authClient.expectJson(response),
      'auth for apiToken',
    );
    await use(body.response.token);
  },
});

export { expect };
export { annotateKnownIssue } from './known-issue';
