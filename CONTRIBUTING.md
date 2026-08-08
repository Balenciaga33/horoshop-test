# Внесок у проєкт

Короткі правила розширення Playwright-сьюту для Horoshop.

## Перед початком

1. `npm ci`
2. `npx playwright install chromium`
3. Скопіюйте `.env.example` → `.env` і заповніть credentials
4. Переконайтесь, що працюють smoke-тести: `npm run test:p0:api`

## Як додати тест

1. **Оберіть шар**
   - API — контракт, authz, схема відповіді, ізольовані перевірки
   - UI — видимий користувацький шлях (кошик, каталог, checkout)
2. **Покладіть файл** у відповідну теку:
   - `tests/api/<домен>.spec.ts`
   - `tests/ui/<домен>.spec.ts`
3. **Позначте пріоритет**: `{ tag: '@p0' }` або `{ tag: '@p1' }`  
   (див. [docs/TEST-STRATEGY.md](docs/TEST-STRATEGY.md))
4. **Не дублюйте локатори/HTTP у спеках** — використовуйте:
   - `page/*` для UI
   - `api/clients/*` для API
   - `fixtures/api.fixtures.ts` / `fixtures/ui.fixtures.ts` для wiring відповідного шару
   - UI flow (опційно): `fixtures/checkout.fixtures.ts` → фікстура `onCheckout`, якщо тест починається вже на checkout
5. **Дані** тримайте в `data/*.json` (особливо товари — `products.data.json`)
6. Для API-відповідей оновіть Zod у `api/schemas/`, path у `openapi/horoshop.openapi.json` і рядок у `tests/api/openapi/contract.spec.ts`
7. Якщо фіксуєте quirk продукту — запис у [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) + `annotateKnownIssue('U1'|'A1'|…, '…')` у тесті (див. `fixtures/known-issue.ts`)

## Page Object / API Client

| Тип             | Відповідальність               |
| --------------- | ------------------------------ |
| `BasePage`      | спільна навігація / page       |
| `*Page`         | локатори + дії однієї сторінки |
| `BaseApiClient` | `postJson` / `expectJson`      |
| `*Client`       | конкретні endpoints            |

У page objects допускаються waits/visibility для стабільності. Бізнес-асерти сценарію краще лишати в спеку (або в thin `expect*` методах page, якщо це повторюваний інваріант сторінки).

## Локатори

- Надавайте перевагу вбудованим локаторам Playwright: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`; CSS/`j-*` — лише коли немає accessible name
- Уникайте прив’язки до маркетингового тексту, якщо є стабільніший атрибут
- Для каталогу/пошуку перевіряйте інваріанти (slug/URL, count, excluded item, chip), а не крихкий exact-list усіх SKU

## Команди перед PR

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:p0
```

Повний прогін перед великим мерджем: `npm test`.

CI на PR виконує те саме quality-gate + `@p0` API/UI. У GitHub Secrets мають бути `HOROSHOP_API_LOGIN` / `HOROSHOP_API_PASSWORD` (див. README → CI).

## Naming

- `describe` / `test` — українською, коротко і по суті сценарію
- Файли спеків — англійською з доменом: `cart.add-product.spec.ts`, `catalog.export.spec.ts`
