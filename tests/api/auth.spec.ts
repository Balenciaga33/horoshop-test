import { annotateKnownIssue, expect, test } from '../../fixtures/api.fixtures';
import { requireApiCredentials } from '../../api/config';
import { authErrorSchema, authSuccessSchema, parseSchema } from '../../api/schemas/api.schemas';

test.describe('API: авторизація', () => {
  test(
    'Успішний POST /api/auth/ повертає OK і токен (32 символи)',
    { tag: '@p0' },
    async ({ authClient }) => {
      annotateKnownIssue('A1', 'Бізнес-результат у body.status — HTTP лишається 200');

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
      annotateKnownIssue('A1', 'Бізнес-помилки також повертають HTTP 200');

      const { login } = requireApiCredentials();

      const response = await authClient.auth({
        login,
        password: 'definitely-wrong-password',
      });

      await test.step('HTTP 200 + Zod-схема помилки (бізнес-статус ERROR)', async () => {
        // Horoshop повертає HTTP 200 навіть для невалідних credentials; результат у status/message.
        expect(response.status()).toBe(200);
        const body = await authClient.expectJson(response);
        const parsed = parseSchema(authErrorSchema, body, 'auth error');
        expect(parsed.response.message.length).toBeGreaterThan(0);
      });
    },
  );
});
