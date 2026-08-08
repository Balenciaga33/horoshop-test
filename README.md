# Horoshop UI & API Tests

[![CI](https://github.com/Balenciaga33/horoshop-test/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Balenciaga33/horoshop-test/actions/workflows/ci.yml?query=branch%3Amain)

Автоматизовані UI- та API-тести для демо-магазину Horoshop на **Playwright** + **TypeScript**.

Цільова вітрина: [shop703343.horoshop.ua](https://shop703343.horoshop.ua).

Фреймворк розрахований на розширення: Page Object Model, API-клієнти, Zod-схеми, локальний OpenAPI-контракт, фікстури, пріоритетні теги та фіксація drift продукту.

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
├── fixtures/                 # api / ui / checkout / known-issue
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
| `fixtures/`    | `api` / `ui` / `checkout` fixtures + `annotateKnownIssue`  |
| `openapi/`     | Документований контракт (у магазину немає `/api/doc.json`) |
| `docs/`        | Стратегія покриття + known issues / drift                  |

## Вимоги

- Node.js 24 (рекомендовано LTS)
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
HOROSHOP_API_LOGIN=<login>
HOROSHOP_API_PASSWORD=<password>
```

`HOROSHOP_BASE_URL` — для UI і API. `HOROSHOP_API_*` — лише для API `/auth` (ті самі credentials, що в CMS).

## Запуск тестів

| Команда               | Що робить                           |
| --------------------- | ----------------------------------- |
| `npm test`            | Увесь набір (UI + API)              |
| `npm run test:ui`     | Лише UI (`tests/ui/`)               |
| `npm run test:api`    | Лише API (`tests/api/`)             |
| `npm run test:p0`     | Smoke / blocker-тести з тегом `@p0` |
| `npm run test:p0:ui`  | `@p0` лише UI                       |
| `npm run test:p0:api` | `@p0` лише API                      |
| `npm run report`      | HTML-звіт Playwright                |

> **Важливо:** UI у `playwright.config` з `headless: false` (BAD_CSRF у headless — [KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) U1). У CI — `xvfb-run` для віртуального дисплея.

**Паралельність:** локально — `fullyParallel` + кілька workers (за замовчуванням Playwright); у CI — **1 worker** (послідовно), щоб стабілізувати headed UI і не впиратися в rate limit API.

## Якість коду

| Команда                | Призначення          |
| ---------------------- | -------------------- |
| `npm run lint`         | ESLint               |
| `npm run lint:fix`     | ESLint з автофіксом  |
| `npm run format`       | Prettier (запис)     |
| `npm run format:check` | Prettier (перевірка) |
| `npm run typecheck`    | `tsc --noEmit`       |

## CI (GitHub Actions)

Історія прогонів: [GitHub Actions](https://github.com/Balenciaga33/horoshop-test/actions)  
Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

| Job       | Що робить                                                                  |
| --------- | -------------------------------------------------------------------------- |
| `quality` | `lint` → `format:check` → `typecheck`                                      |
| `api`     | Playwright API після `quality` (`@p0` на PR / full на push); без browser   |
| `ui`      | UI після `api` (fail-fast): Chromium + `headless: false` / `xvfb-run` (U1) |

### Secrets / Variables (репозиторій GitHub)

| Назва                   | Тип      | Обов’язково | Призначення                             |
| ----------------------- | -------- | ----------- | --------------------------------------- |
| `HOROSHOP_API_LOGIN`    | secret   | так         | логін для API `/auth` (CMS)             |
| `HOROSHOP_API_PASSWORD` | secret   | так         | пароль для API `/auth`                  |
| `HOROSHOP_BASE_URL`     | variable | ні          | дефолт `https://shop703343.horoshop.ua` |

Звіти Playwright заливаються як artifacts (`playwright-report-api` / `playwright-report-ui`).

## Документація

- [Стратегія тестування](docs/TEST-STRATEGY.md) — пріоритети `@p0`/`@p1`, що куди класти
- [Відомі проблеми / drift](docs/KNOWN-ISSUES.md) — фактична поведінка vs очікування
- [Як додавати тести](CONTRIBUTING.md)
- [Документація Horoshop API](https://horoshop.notion.site/api-doc)
