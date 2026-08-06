# horoshop-test

[![CI](https://github.com/Balenciaga33/horoshop-test/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Balenciaga33/horoshop-test/actions/workflows/ci.yml?query=branch%3Amain)

Автоматизовані UI- та API-тести для демо-магазину [Horoshop](https://shop703343.horoshop.ua) на **Playwright** + **TypeScript**.

Фреймворк зібрано з розрахунком на подальше розширення: Page Object Model, API-клієнти, Zod-схеми, локальний OpenAPI-контракт, фікстури, пріоритетні теги та явна фіксація drift продукту.

## Структура проєкту

```text
horoshop-test/
├── api/                      # API-шар
│   ├── clients/              # AuthClient, CatalogClient → BaseApiClient
│   ├── schemas/              # Zod-схеми відповідей
│   └── config.ts             # baseURL + credentials з .env
├── data/                     # Тестові дані (товари, каталог, checkout)
├── docs/                     # Стратегія тестів і відомі проблеми
│   ├── TEST-STRATEGY.md
│   └── KNOWN-ISSUES.md
├── fixtures/                 # Playwright fixtures (pages, API clients, token)
├── helper/                   # Допоміжні утиліти (ціна, cart init, OpenAPI)
├── openapi/                  # Локальний контракт Horoshop API
├── page/                     # Page Object Model (UI)
├── tests/
│   ├── api/                  # API-тести (project: api)
│   │   └── openapi/          # Contract smoke по локальному OpenAPI
│   └── ui/                   # UI-тести (project: ui)
├── playwright.config.ts
├── eslint.config.mjs
├── .env.example
└── package.json
```

| Шар            | Призначення                                                |
| -------------- | ---------------------------------------------------------- |
| `page/`        | UI-локатори та дії (POM)                                   |
| `api/clients/` | HTTP-виклики Horoshop API                                  |
| `api/schemas/` | Валідація JSON через Zod                                   |
| `data/`        | Стабільні дані сценаріїв (slug, ціна, email-кейси)         |
| `fixtures/`    | Зв’язка тестів із pages/clients                            |
| `openapi/`     | Документований контракт (у магазину немає `/api/doc.json`) |
| `docs/`        | Стратегія покриття + known issues / drift                  |

## Вимоги

- Node.js 20+ (рекомендовано LTS)
- npm
- доступ до credentials власника магазину (для API `/auth`)

## Швидкий старт

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Заповніть `.env`:

```env
HOROSHOP_BASE_URL=https://shop703343.horoshop.ua
HOROSHOP_LOGIN=<login>
HOROSHOP_PASSWORD=<password>
```

## Запуск тестів

| Команда               | Що робить                                       |
| --------------------- | ----------------------------------------------- |
| `npm test`            | Увесь набір (UI + API)                          |
| `npm run test:ui`     | Лише UI (`tests/ui/`)                           |
| `npm run test:api`    | Лише API (`tests/api/`)                         |
| `npm run test:p0`     | Smoke / blocker-тести з тегом `@p0`             |
| `npm run test:p0:ui`  | `@p0` лише UI                                   |
| `npm run test:p0:api` | `@p0` лише API                                  |
| `npm run test:headed` | UI у headed-режимі (для UI це дефолт у конфігу) |
| `npm run report`      | HTML-звіт Playwright                            |

> **Важливо:** UI-проєкт запускається з `headless: false`. У headless Chromium кошик Horoshop часто відповідає `BAD_CSRF` — див. [KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) (U1).

## Якість коду

| Команда                | Призначення          |
| ---------------------- | -------------------- |
| `npm run lint`         | ESLint               |
| `npm run lint:fix`     | ESLint з автофіксом  |
| `npm run format`       | Prettier (запис)     |
| `npm run format:check` | Prettier (перевірка) |
| `npm run typecheck`    | `tsc --noEmit`       |

## CI (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| Job       | Що робить                                                                |
| --------- | ------------------------------------------------------------------------ |
| `quality` | `lint` → `format:check` → `typecheck`                                    |
| `api`     | Playwright API після `quality` (`@p0` на PR / full на push); без browser |
| `ui`      | UI після `api` (fail-fast): install Chromium + headed/`xvfb-run` (U1)    |

### Secrets / Variables (репозиторій GitHub)

| Назва               | Тип      | Обов’язково | Призначення                             |
| ------------------- | -------- | ----------- | --------------------------------------- |
| `HOROSHOP_LOGIN`    | secret   | так         | логін                                   |
| `HOROSHOP_PASSWORD` | secret   | так         | пароль                                  |
| `HOROSHOP_BASE_URL` | variable | ні          | дефолт `https://shop703343.horoshop.ua` |

Звіти Playwright заливаються як artifacts (`playwright-report-api` / `playwright-report-ui`).

## Документація

- [Стратегія тестування](docs/TEST-STRATEGY.md) — пріоритети `@p0`/`@p1`, що куди класти
- [Відомі проблеми / drift](docs/KNOWN-ISSUES.md) — фактична поведінка vs очікування
- [Як додавати тести](CONTRIBUTING.md)
- [Документація Horoshop API](https://horoshop.notion.site/api-doc)

## Цільовий сайт

- Вітрина: https://shop703343.horoshop.ua
