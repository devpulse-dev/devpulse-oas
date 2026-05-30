# DevPulse API types для фронтенда

Фронт потребляет **один** npm-пакет — `@devpulse-dev/api-types`. В нём уже лежат
сгенерённые TypeScript-типы на весь `/api/v2` (все эндпоинты + общие схемы).
**Кодогенерации на стороне фронта не нужно** — типы готовы к импорту.

> Почему один пакет, а не 6 по числу Maven-модулей: фронт — одно приложение,
> говорящее со всем API сразу. Доменные спеки ссылаются на общие схемы через
> `$ref`, который резолвится только когда `shared.yaml` рядом. Поэтому склейку и
> генерацию делаем один раз при публикации (см. `api-types/scripts/build-types.mjs`),
> а наружу отдаём самодостаточный набор типов.

---

## 1. Доступ к GitHub Packages

Пакет лежит в GitHub Packages (npm registry), нужен токен с правом `read:packages`.

`.npmrc` в корне фронт-проекта:

```ini
# ТОЛЬКО scope @devpulse-dev уходит в GitHub Packages.
# НЕ добавляйте глобальный `registry=` — иначе react/axios/... начнут 404-ить.
@devpulse-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Токен — через переменную окружения (не коммитим):

```bash
export GITHUB_TOKEN=ghp_xxx   # classic PAT с read:packages
```

В CI фронта используйте `secrets.GITHUB_TOKEN` (если фронт в той же org) или
отдельный PAT.

## 2. Установка

```bash
npm install -D @devpulse-dev/api-types
```

Это dev-зависимость: пакет содержит только `.d.ts` + `openapi.json`, в рантайм-бандл
ничего не утекает (типы стираются при компиляции).

## 3. Использование типов

Пакет экспортирует стандартные для `openapi-typescript` неймспейсы
`components`, `paths`, `operations`.

```typescript
import type { components, paths } from '@devpulse-dev/api-types';

// Схемы — самое нужное:
type AuthorSummary = components['schemas']['AuthorSummary'];
type DashboardResponse = components['schemas']['DashboardResponse'];
type ActivityScore = components['schemas']['ActivityScore'];
type KaitenCard = components['schemas']['KaitenCard'];
type UserProfileResponse = components['schemas']['UserProfileResponse'];
```

Удобно завести барель-алиасы у себя (`src/shared/api/schema.ts`):

```typescript
import type { components } from '@devpulse-dev/api-types';

export type Schemas = components['schemas'];
export type AuthorSummary = Schemas['AuthorSummary'];
export type DashboardResponse = Schemas['DashboardResponse'];
export type Commit = Schemas['Commit'];
export type KaitenCard = Schemas['KaitenCard'];
// ...
```

### Типобезопасный запрос/ответ по path

```typescript
import type { paths } from '@devpulse-dev/api-types';

type GetDashboard = paths['/dashboard']['get'];
type DashboardQuery = GetDashboard['parameters']['query'];          // { from?, to?, page?, size? }
type DashboardBody  = GetDashboard['responses']['200']['content']['application/json'];
```

> Пути в типах — **без** префикса `/api/v2` (он в `servers`, не в `paths`).
> Базовый URL задаёт axios-клиент: `baseURL: '/api/v2'`.

### Пример с axios

```typescript
import axios from 'axios';
import type { components } from '@devpulse-dev/api-types';

type DashboardResponse = components['schemas']['DashboardResponse'];

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v2' });

export async function getDashboard(params: { from?: string; to?: string; page?: number; size?: number }) {
  const { data } = await api.get<DashboardResponse>('/dashboard', { params });
  return data;
}
```

## 4. Рантайм-спека (опционально)

Если нужен сам OpenAPI-документ (MSW-моки, рантайм-валидация, Swagger UI):

```typescript
import spec from '@devpulse-dev/api-types/openapi.json' with { type: 'json' };
```

Это самодостаточный bundled-спек (shared-схемы уже инлайн, внешних `$ref` нет).

## 5. Миграция существующих типов

В UI ручные типы (`entities/*/model/types.ts`) заменяются на импорт из пакета.
Поведение, которое **остаётся ручным** даже после перехода на генерённые типы:

- `extractCardId` (`entities/commit/lib/task-id.ts`) — это defense-in-depth поверх
  `commit.taskNumber`, а не дубликат. Бэк парсит card id корректно, но фронт держит
  свой fallback на нестандартный формат сообщения. Не удалять при виде готового
  `taskNumber` в типах.

## Версионирование

`@devpulse-dev/api-types` версионируется в lockstep с Maven-контрактами
(`1.x` ↔ контракты `1.x`). Pin как обычно:

```json
{ "devDependencies": { "@devpulse-dev/api-types": "^1.0.0" } }
```

## Troubleshooting

| Симптом | Причина / фикс |
|---|---|
| `401 Unauthorized` при install | Нет/протух `GITHUB_TOKEN`, либо нет права `read:packages`. |
| `404 Not Found` на `@devpulse-dev/api-types` | Пакет ещё не опубликован, либо опечатка в scope в `.npmrc`. |
| `react`/`axios` дают `404` | В `.npmrc` затесался глобальный `registry=https://npm.pkg.github.com` — уберите, оставьте только scoped-строку. |
| Типы не обновились после релиза | Бампнут ли `version`? Переустановите: `npm install @devpulse-dev/api-types@latest`. |
