# 📊 DevPulse OpenAPI Contracts

> Централизованное хранилище OpenAPI контрактов для DevPulse — сервиса аналитики активности разработчиков

[![GitHub Actions](https://github.com/devpulse-dev/devpulse-oas/actions/workflows/deploy.yml/badge.svg)](https://github.com/devpulse-dev/devpulse-oas/actions)
[![GitHub Packages](https://img.shields.io/badge/GitHub-Packages-blue)](https://github.com/devpulse-dev/devpulse-oas/packages)
[![Java 25](https://img.shields.io/badge/Java-25-red.svg)](https://openjdk.org/projects/jdk/25/)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0-green.svg)](https://swagger.io/specification/)

## 📁 Структура проекта

```text
devpulse-oas/
├── shared-contract/      # Общие типы и компоненты
├── collection-contract/  # Контракты для управления сбором данных
├── dashboard-contract/    # Контракты для дашборда
├── stats-contract/       # Контракты для статистики
├── users-contract/       # Контракты для пользователей
├── kaiten-contract/      # Контракты для интеграции с Kaiten
├── .github/workflows/    # CI/CD пайплайны
├── LICENSE              # MIT лицензия
└── README.md
```

## 🏗️ Модули

| Модуль | Описание | Версия |
|--------|----------|--------|
| **shared-contract** | Общие схемы (UUID, DateTime, Error), security схемы, типы данных | `1.0.0` |
| **collection-contract** | API для управления сбором данных из Git и Kaiten | `1.0.0` |
| **dashboard-contract** | API для дашборда с пагинацией авторов | `1.0.0` |
| **stats-contract** | API для получения статистики по разработчикам | `1.0.0` |
| **users-contract** | API для работы с профилями пользователей и их коммитами | `1.0.0` |
| **kaiten-contract** | API для интеграции с Kaiten | `1.0.0` |

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
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>dashboard-contract</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>stats-contract</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>users-contract</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>kaiten-contract</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.devpulse</groupId>
        <artifactId>shared-contract</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

### 3. Сборка проекта

```bash
# Сборка конкретного модуля
cd collection-contract
mvn clean install

# Сборка всех модулей (по очереди)
for module in shared-contract collection-contract dashboard-contract stats-contract users-contract kaiten-contract; do
    cd $module
    mvn clean install
    cd ..
done
```

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

### Users API

Профили и коммиты пользователей:

- `GET /api/v2/users/{email}/profile` — получить профиль пользователя (опциональные `from`, `to`)
- `GET /api/v2/users/{email}/commits` — получить коммиты пользователя с пагинацией

### Kaiten API

Интеграция с Kaiten:

- `POST /api/v2/kaiten/sync-users` — синхронизировать пользователей Kaiten

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

- Автоматическая сборка и публикация в GitHub Packages
- Валидация OpenAPI спецификаций
- Тестирование контрактов

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
