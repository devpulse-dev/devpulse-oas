# 📊 DevPulse OpenAPI Contracts

> Централизованное хранилище OpenAPI контрактов для DevPulse — сервиса аналитики активности разработчиков

[![GitHub Actions](https://github.com/devpulse-dev/devpulse-oas/actions/workflows/deploy.yml/badge.svg)](https://github.com/devpulse-dev/devpulse-oas/actions)
[![GitHub Packages](https://img.shields.io/badge/GitHub-Packages-blue)](https://github.com/devpulse-dev/devpulse-oas/packages)
[![Java 25](https://img.shields.io/badge/Java-25-red.svg)](https://openjdk.org/projects/jdk/25/)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0-green.svg)](https://swagger.io/specification/)
[![npm](https://img.shields.io/badge/npm-@devpulse--dev-blue.svg)](https://github.com/devpulse-dev/devpulse-oas/packages)

## 📁 Структура проекта

```text
devpulse-oas/
├── shared-contract/      # Общие типы и компоненты
├── collection-contract/  # Контракты для управления сбором данных
├── dashboard-contract/    # Контракты для дашборда
├── stats-contract/       # Контракты для статистики
├── users-contract/       # Контракты для пользователей
├── kaiten-contract/      # Контракты для интеграции с Kaiten
├── auth-contract/        # Контракты аутентификации/авторизации (GitLab, RBAC)
├── .github/workflows/    # CI/CD пайплайны
├── LICENSE              # MIT лицензия
└── README.md
```

## 🏗️ Дистрибуция

Один источник правды (YAML-спеки) публикуется в двух форматах:

- **Backend** — 7 Maven JAR с YAML внутри (по модулю на bounded context). Бэк
  генерит Spring-интерфейсы через `openapi-generator-maven-plugin`.
- **Frontend** — один npm-пакет `@devpulse-dev/api-types` с готовыми `.d.ts` на
  весь `/api/v2`. Кодогенерации на стороне фронта не требуется. См. [`FRONTEND.md`](FRONTEND.md).

### Maven-модули (backend)

| Модуль | Maven Artifact | Описание | Версия |
|--------|----------------|----------|--------|
| **shared-contract** | `com.devpulse:shared-contract` | Общие схемы (UUID, DateTime, Error, UserProfile, AuthorSummary, ReviewAuthor, Team…), security схемы | `3.8.0` |
| **collection-contract** | `com.devpulse:collection-contract` | API для управления сбором данных из Git и Kaiten | `3.8.0` |
| **dashboard-contract** | `com.devpulse:dashboard-contract` | API для дашборда с пагинацией авторов | `3.8.0` |
| **stats-contract** | `com.devpulse:stats-contract` | Статистика (daily/weekly/summary/reviews) + performance review + дефекты по приоритету, вмерженные MR, простановка AI-Agent | `3.8.0` |
| **users-contract** | `com.devpulse:users-contract` | Профили, коммиты, список пользователей, команды и лиды | `3.8.0` |
| **kaiten-contract** | `com.devpulse:kaiten-contract` | API для интеграции с Kaiten | `3.8.0` |
| **auth-contract** | `com.devpulse:auth-contract` | Аутентификация (GitLab PAT + OAuth2), текущий пользователь, RBAC-роли | `3.8.0` |

> Версии — lockstep: все модули публикуются одной версией (единый `<revision>` в корневом `pom.xml`).

### npm-пакет (frontend)

| Пакет | Содержимое | Версия |
|-------|------------|--------|
| **`@devpulse-dev/api-types`** | TypeScript-типы (`components`/`paths`/`operations`) + bundled `openapi.json` на весь API | `3.8.0` |

## 🚀 Быстрый старт

### 1. Клонирование проекта

```bash
git clone https://github.com/devpulse-dev/devpulse-oas.git
cd devpulse-oas
```

### 2. Использование в проектах

Добавьте в ваш [`pom.xml`](pom.xml):

```xml
<repositories>
    <repository>
        <id>github</id>
        <name>GitHub Packages</name>
        <url>https://maven.pkg.github.com/devpulse-dev/devpulse-oas</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>collection-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>dashboard-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>stats-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>users-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>kaiten-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>shared-contract</artifactId>
        <version>3.8.0</version>
    </dependency>
</dependencies>
```

### 2.1 Использование в React + TypeScript проектах

Фронтенд ставит один пакет с готовыми типами:

```bash
npm install -D @devpulse-dev/api-types
```

`.npmrc` (только scoped-registry — глобальный `registry=` НЕ добавлять):

```ini
@devpulse-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```typescript
import type { components } from '@devpulse-dev/api-types';
type DashboardResponse = components['schemas']['DashboardResponse'];
```

Подробная документация для фронтенда: [`FRONTEND.md`](FRONTEND.md)

### 3. Сборка проекта

Корневой `pom.xml` — parent + aggregator, реактор сам ставит `shared-contract` первым.

```bash
# Сборка всех модулей (parent + 7)
mvn clean install

# Один модуль + его зависимости
mvn -pl dashboard-contract -am clean install

# npm-пакет с TS-типами для фронта
cd api-types && npm install && npm run build
```

### Версионирование (lockstep)

Единый источник версии — свойство `<revision>` в корневом [`pom.xml`](pom.xml).
Меняешь его → едут все 7 Maven-артефактов **и** npm `@devpulse-dev/api-types`
(его версия деривится из `<revision>` скриптом `api-types/scripts/build-types.mjs`).

Semver: additive = minor, breaking = major, доки = patch. Релиз:
правишь `<revision>` → `mvn clean install` + `cd api-types && npm run build` →
коммит → запуск deploy-workflow.

### 4. Деплой через GitHub Actions

Проект использует GitHub Actions для деплоя в GitHub Packages. Вы можете запустить деплой:

1. Перейдите в раздел **Actions** в репозитории
2. Выберите workflow **🚀 Deploy Contracts**
3. Нажмите **Run workflow**
4. Выберите модуль для деплоя:
   - `all` — все модули
   - `shared-contract` — только общие компоненты
   - `collection-contract` — API управления сбором
   - `dashboard-contract` — API дашборда
   - `stats-contract` — API статистики
   - `users-contract` — API пользователей
   - `kaiten-contract` — API интеграции с Kaiten
   - `auth-contract` — API аутентификации/авторизации

## 📚 Документация API

### Collection API

Управление сбором данных из Git и Kaiten:

- `POST /api/v2/collection/runs` — запустить сбор данных (опциональный параметр `since`)
- `GET /api/v2/collection/runs/{id}` — получить статус прогона сбора

### Dashboard API

Дашборд с активностью разработчиков (новый paginated API):

- `GET /api/v2/dashboard` — получить данные дашборда с пагинацией
  - Параметры: `from`, `to` (опционально), `page` (default 0), `size` (default 20, max 500)
  - Возвращает: paginated список авторов, отсортированный по не-мердж коммитам
  - **Изменения в v2:** Убраны `topN` и `outsiderN`, добавлена пагинация

### Stats API

Статистика по разработчикам:

- `GET /api/v2/stats/daily` — получить дневную статистику
- `GET /api/v2/stats/weekly` — получить недельную статистику (ISO-недели)
- `GET /api/v2/stats/summary` — получить сводку за период
- `GET /api/v2/stats/reviews` — ревью-метрики (given/received, time-to-merge) из GitLab
- `GET /api/v2/performance/review` — досье к performance review по одному человеку
  - Параметры: `email`, `from`, `to`, `compareToPrevious` (дельты к предыдущему периоду)
  - Возвращает `PerformanceReview`: метрики код/ревью/задачи с дельтами, разбивка дефект/разработка, highlights
- `POST /api/v2/stats/defects` — уникальные дефекты команды по приоритету за 1..10 периодов
  - Тело: `{ team, periods: [{ from, to }] }`; дефекты live из Kaiten, дедуп по id карточки, попадание в период по `createdAt`
  - Возвращает разбивку по приоритету + `aiAgentCount` на период и плоский список дефектов (`DefectItem`: участники, ссылка, AI-флаг, дата)
- `POST /api/v2/stats/defects/ai-agent` — проставить карточкам флаг «AI-Agent» (Kaiten property `id_6064=true`)
  - Тело: `{ cardIds: [...] }`; set-only, идемпотентно; **только ADMIN/TEAMLEAD**
- `GET /api/v2/stats/merged-mrs` — вмерженные MR по команде за период (`from`, `to`, `team`)
  - Считаются MR с `merged_at ∈ периода` в dev-ветки; разбивки по авторам и репозиториям + `total`

### Users API

Профили, коммиты и команды:

- `GET /api/v2/users` — список пользователей (опц. `?team=` — фильтр по команде)
- `GET /api/v2/users/{email}/profile` — получить профиль пользователя (опциональные `from`, `to`)
- `GET /api/v2/users/{email}/commits` — получить коммиты пользователя с пагинацией
- `PUT /api/v2/users/{email}/team` — назначить/снять команду (`{ team: string|null }`)

### Teams API

Команды и их лиды (тег `Teams` в `users-contract`):

- `GET /api/v2/teams` — список команд `{ name, lead, members }`
- `PUT /api/v2/teams/lead` — назначить/снять лида (`{ team, email: string|null }`)

> `team` и `isLead` присутствуют во всех DTO с информацией о разработчике
> (`UserProfile`, `AuthorSummary`, `ReviewAuthor`).

### Kaiten API

Интеграция с Kaiten:

- `POST /api/v2/kaiten/sync-users` — синхронизировать пользователей Kaiten

### Auth API

Аутентификация и авторизация (GitLab, RBAC — см. ADR-13):

- `POST /api/v2/auth/login` — вход по GitLab PAT (personal access token)
- `GET /api/v2/auth/me` — текущий пользователь (email, роль, команда)
- `POST /api/v2/auth/logout` — выход (сброс сессии)
- `GET /api/v2/auth/config` — публичная конфигурация логина (доступен ли вход через OAuth2)

> Роли: `ADMIN` / `TEAMLEAD` (elevated) / `MEMBER`. Аналитические разделы (когорты, простановка
> AI-Agent, управление командами) — только для elevated; MEMBER видит perf-review только по себе.
> OAuth2-вход (`/oauth2/**`, `/login/oauth2/**`) обрабатывает Spring Security на корне, не под `/api/v2`.

## 🔧 Структура модуля

```text
collection-contract/
├── pom.xml                          # Конфигурация Maven
└── src/main/resources/openapi/
    └── collection-api.yaml         # REST API спецификация
```

## 📖 OpenAPI Спецификации

Все спецификации следуют стандарту OpenAPI 3.0.3 и включают:

- Полное описание эндпоинтов
- Схемы запросов и ответов
- Примеры использования
- RFC 7807 Problem Details для ошибок
- Общие компоненты из [`shared-contract`](shared-contract/src/main/resources/openapi/shared.yaml)

## 🔄 CI/CD

GitHub Actions workflow в [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- Автоматическая сборка и публикация в GitHub Packages (Maven JAR + npm)
- Валидация OpenAPI спецификаций
- Тестирование контрактов
- Публикация контрактов в двух форматах:
  - **Maven JAR** (7 модулей) — для Java бэкенда
  - **npm `@devpulse-dev/api-types`** (один пакет, готовые `.d.ts`) — для React + TypeScript фронтенда

npm-пакет (re)публикуется при каждом запуске workflow и идемпотентен: если такая
версия уже в registry — шаг пропускает `npm publish` (нужен bump `version` в
[`api-types/package.json`](api-types/package.json)).

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для вашей фичи (`git checkout -b feature/AmazingFeature`)
3. Commit ваши изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT — см. файл LICENSE для деталей

## 📞 Контакты

- GitHub: [devpulse-dev](https://github.com/devpulse-dev)
- Issues: [GitHub Issues](https://github.com/devpulse-dev/devpulse-oas/issues)
