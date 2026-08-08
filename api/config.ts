import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const apiConfig = {
  baseURL: process.env.HOROSHOP_BASE_URL ?? 'https://shop703343.horoshop.ua',
  login: process.env.HOROSHOP_API_LOGIN ?? '',
  password: process.env.HOROSHOP_API_PASSWORD ?? '',
} as const;

export function requireApiCredentials(): { login: string; password: string } {
  if (!apiConfig.login || !apiConfig.password) {
    throw new Error(
      'Missing HOROSHOP_API_LOGIN / HOROSHOP_API_PASSWORD. Copy .env.example to .env and fill credentials.',
    );
  }
  return { login: apiConfig.login, password: apiConfig.password };
}
