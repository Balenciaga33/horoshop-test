import { z } from 'zod';
import { expect } from '@playwright/test';

/** Токен auth Horoshop — hex-рядок 32 символи (за API docs). */
export const authTokenSchema = z.string().regex(/^[a-f0-9]{32}$/i);

export const authSuccessSchema = z.object({
  status: z.literal('OK'),
  response: z.object({
    token: authTokenSchema,
  }),
});

export const authErrorSchema = z.object({
  status: z.literal('ERROR'),
  response: z.object({
    message: z.string().min(1),
  }),
});

/** Основні поля товару для тестів; API повертає значно більше. */
export const catalogProductSchema = z.object({
  article: z.string().min(1),
  slug: z.string().min(1),
  price: z.number(),
  title: z.object({
    ua: z.string(),
  }),
  link: z.string().url(),
});

export const catalogExportSuccessSchema = z.object({
  status: z.literal('OK'),
  response: z.object({
    products: z.array(catalogProductSchema).min(1),
  }),
});

/** Відсутній токен на захищених ендпоінтах. */
export const authorizationErrorSchema = z.object({
  status: z.literal('AUTHORIZATION_ERROR'),
  response: z.object({
    message: z.string().min(1),
  }),
});

/** Токен передано, але він невалідний / неправильний. */
export const unauthorizedErrorSchema = z.object({
  status: z.literal('UNAUTHORIZED'),
  response: z.object({
    message: z.string().min(1),
  }),
});

export function parseSchema<T>(schema: z.ZodType<T>, payload: unknown, label: string): T {
  const result = schema.safeParse(payload);
  expect(result.success, `${label} schema mismatch: ${formatZodError(result)}`).toBeTruthy();
  if (!result.success) {
    throw new Error(`${label} schema mismatch`);
  }
  return result.data;
}

function formatZodError(result: { success: true } | { success: false; error: z.ZodError }): string {
  if (result.success) {
    return '';
  }
  return result.error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}
