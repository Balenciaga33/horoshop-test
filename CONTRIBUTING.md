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
   - `fixtures/base.fixtures.ts` для wiring
5. **Дані** тримайте в `data/*.json` (особливо товари — `products.data.json`)
6. Для API-відповідей оновіть Zod у `api/schemas/`, path у `openapi/horoshop.openapi.json` і рядок у `tests/api/openapi/contract.spec.ts`

## Page Object / API Client

| Тип             | Відповідальність               |
| --------------- | ------------------------------ |
| `BasePage`      | спільна навігація / page       |
| `*Page`         | локатори + дії однієї сторінки |
| `BaseApiClient` | `postJson` / `expectJson`      |
| `*Client`       | конкретні endpoints            |

У page objects допускаються waits/visibility для стабільності. Бізнес-асерти сценарію краще лишати в спеку (або в thin `expect*` методах page, якщо це повторюваний інваріант сторінки).

## Локатори

- Надавайте перевагу стабільним селекторам: `href`, `id`, класи `j-*`, ролі
- Уникайте прив’язки до маркетингового тексту, якщо є стабільніший атрибут
- Для каталогу/пошуку перевіряйте slug/URL і точний набір товарів, а не лише «щось відобразилось»

## Команди перед PR

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:p0
```

Повний прогін перед великим мерджем: `npm test`.

CI на PR ганяє те саме quality-gate + `@p0` API/UI. Переконайтесь, що в GitHub Secrets задані `HOROSHOP_LOGIN` / `HOROSHOP_PASSWORD` (див. README → CI).

## Naming

- `describe` / `test` — українською, коротко і по суті сценарію
- Файли спеків — англійською з доменом: `cart.add-product.spec.ts`, `catalog.export.spec.ts`
