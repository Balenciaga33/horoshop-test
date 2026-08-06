# Стратегія тестування

Мета сьюту — стабільно ловити регресії критичних шляхів магазину Horoshop (UI + API), не перетворюючись на крихкий UI-snapshot фреймворк.

## Проєкти Playwright

| Project | Шлях         | Команда            | Фокус                                     |
| ------- | ------------ | ------------------ | ----------------------------------------- |
| `api`   | `tests/api/` | `npm run test:api` | Auth, catalog export, authz, Zod/OpenAPI  |
| `ui`    | `tests/ui/`  | `npm run test:ui`  | Кошик, каталог, пошук, валідація checkout |

API і UI навмисно розділені: різний runtime (без браузера vs headed Chromium) і різна швидкість фідбеку.

## Пріоритети (теги)

| Тег   | Значення                                                           | Коли запускати             |
| ----- | ------------------------------------------------------------------ | -------------------------- |
| `@p0` | Blocker / smoke: happy path + критичний authz                      | PR / швидкий gate          |
| `@p1` | Важливе покриття: edge cases, глибша валідація                     | Повний прогін (`npm test`) |

Команди: `npm run test:p0`, `npm run test:p0:api`, `npm run test:p0:ui`.

### Поточний розподіл (орієнтир)

**@p0**

- API: успішний auth, невалідний auth, catalog export з токеном, catalog без токена, OpenAPI contract smoke
- UI: додавання в кошик → checkout, каталог (меню/сорт/фільтр), пошук, порожній checkout (disabled submit)

**@p1**

- API: битий токен (`UNAUTHORIZED`)
- UI: зміна кількості/видалення на checkout, невалідні email/телефон, recovery email, порожнє ПІБ

## Що вважаємо «хорошим» асертом

1. **Інваріанти**, а не випадковий UI-шум: slug, ціна, qty, `status` API, наявність/відсутність товарів у наборі
2. **Негативні контроли** там, де є ризик false-positive (товар, якого не має бути після фільтра)
3. **Zod** для форми API-відповіді; OpenAPI — як локальний контрактний якір
4. Реальні quirks магазину (headless CSRF, remove у popup тощо) — у [KNOWN-ISSUES.md](KNOWN-ISSUES.md)

## Піраміда в межах цього репо

```text
        UI journeys (менше, дорожчі)
       /                            \
  API contract + authz (швидші)
 /                                  \
Дані + helpers + OpenAPI/Zod
```

## Quality gates

На PR і push CI автоматично виконує:

1. `npm run lint`
2. `npm run format:check`
3. `npm run typecheck`
4. `@p0` API + UI (`test:p0:api` / `test:p0:ui`)

Локально ті самі команди — для швидкої перевірки до push. Повний `npm test` — на push у `main`/`master`, через `workflow_dispatch`, або локально перед великими змінами.

## CI

GitHub Actions (`.github/workflows/ci.yml`):

1. **quality** — lint / format / typecheck (без secrets)
2. **api** — після quality; на PR лише `@p0`, на push/`workflow_dispatch` — усі API
3. **ui** — після **api** (fail-fast); headed Chromium через `xvfb-run` (див. KNOWN-ISSUES **U1**)

Ручний запуск: GitHub → **Actions → CI → Run workflow**.

Secrets: `HOROSHOP_LOGIN`, `HOROSHOP_PASSWORD`. Опційний variable: `HOROSHOP_BASE_URL`.

## Зовнішні обмеження магазину

- Токен API живе **~600 секунд** (див. Notion docs)
- Rate limit API (~100 req/год на токен) — не запускати важкий export у щільному циклі локально без потреби
- Успішне оформлення реального замовлення в UI-валідації **не робимо** (не смітимо адмінку)
