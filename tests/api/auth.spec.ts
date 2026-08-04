import { expect, test } from '../../fixtures/base.fixtures';
import { requireApiCredentials } from '../../api/config';
import { authErrorSchema, authSuccessSchema, parseSchema } from '../../api/schemas/api.schemas';

test.describe('API: авторизація', () => {
  test(
    'Успішний POST /api/auth/ повертає OK і токен (32 символи)',
    { tag: '@p0' },
    async ({ authClient }) => {
      const credentials = requireApiCredentials();
      const response = await authClient.auth(credentials);

      await test.step('HTTP 200 + Zod-схема успішної відповіді', async () => {
        expect(response.status()).toBe(200);
        const body = await authClient.expectJson(response);
        const parsed = parseSchema(authSuccessSchema, body, 'auth success');
        expect(parsed.response.token).toHaveLength(32);
      });
    },
  );

  test(
    'Невалідний POST /api/auth/ повертає ERROR і message',
    { tag: '@p0' },
    async ({ authClient }) => {
      const { login } = requireApiCredentials();

      const response = await authClient.auth({
        login,
        password: 'definitely-wrong-password',
      });

      await test.step('HTTP 200 + Zod-схема помилки (бізнес-статус ERROR)', async () => {
        // Horoshop returns HTTP 200 even for bad credentials; result is in status/message.
        expect(response.status()).toBe(200);
        const body = await authClient.expectJson(response);
        const parsed = parseSchema(authErrorSchema, body, 'auth error');
        expect(parsed.response.message.length).toBeGreaterThan(0);
      });
    },
  );
});
