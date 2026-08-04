import { z } from 'zod';
import { expect } from '@playwright/test';

/** Horoshop auth token is a 32-char hex string (per API docs). */
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

/** Core product fields used by tests; API returns many more. */
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

/** Missing token on protected endpoints. */
export const authorizationErrorSchema = z.object({
  status: z.literal('AUTHORIZATION_ERROR'),
  response: z.object({
    message: z.string().min(1),
  }),
});

/** Present but invalid / incorrect token. */
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

function formatZodError(result: z.SafeParseReturnType<unknown, unknown>): string {
  if (result.success) {
    return '';
  }
  return result.error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}
