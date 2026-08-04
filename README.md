# horoshop-test

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
- доступ до магазину та API-користувача

## Швидкий старт

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Заповніть `.env`:

```env
HOROSHOP_BASE_URL=https://shop703343.horoshop.ua
HOROSHOP_LOGIN=owner
HOROSHOP_PASSWORD=<пароль>
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

Приклади точково:

```bash
npx playwright test tests/ui/cart.add-product.spec.ts
npx playwright test tests/api/auth.spec.ts --project=api
```

> **Важливо:** UI-проєкт запускається з `headless: false`. У headless Chromium кошик Horoshop часто відповідає `BAD_CSRF` — див. [KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) (U1).

## Якість коду

| Команда                | Призначення          |
| ---------------------- | -------------------- |
| `npm run lint`         | ESLint               |
| `npm run lint:fix`     | ESLint з автофіксом  |
| `npm run format`       | Prettier (запис)     |
| `npm run format:check` | Prettier (перевірка) |
| `npm run typecheck`    | `tsc --noEmit`       |

## Документація

- [Стратегія тестування](docs/TEST-STRATEGY.md) — пріоритети `@p0`/`@p1`, що куди класти
- [Відомі проблеми / drift](docs/KNOWN-ISSUES.md) — фактична поведінка vs очікування
- [Як додавати тести](CONTRIBUTING.md)
- [Документація Horoshop API](https://horoshop.notion.site/api-doc)

## Цільовий сайт

- Вітрина: https://shop703343.horoshop.ua
- Адмінка: https://shop703343.horoshop.ua/edit/ (не використовується в автотестах напряму)
