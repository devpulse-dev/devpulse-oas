#!/usr/bin/env node
/**
 * Собирает единый набор TypeScript-типов для всего DevPulse API из 6 OpenAPI-спек.
 *
 * Зачем merge, а не «сгенерить каждый спек отдельно»:
 *   доменные спеки (collection/dashboard/stats/users/kaiten) ссылаются на общие
 *   схемы через внешний `$ref: 'shared.yaml#/components/...'`. Эти рефы резолвятся
 *   только пока shared.yaml лежит соседним файлом — что верно ЗДЕСЬ, в репозитории,
 *   но НЕ верно у потребителя, если публиковать сырой YAML по отдельным пакетам.
 *   Поэтому склейку делаем один раз на этапе публикации:
 *     1) сливаем paths всех доменов + components всех спек в один документ;
 *     2) переписываем внешние рефы `shared.yaml#/components/...` → внутренние `#/components/...`;
 *     3) гоним openapi-typescript по самодостаточному документу.
 *
 * Результат (в dist/):
 *   - index.d.ts     — типы (paths / components / operations) для импорта во фронт;
 *   - openapi.json   — самодостаточный bundled-спек (для runtime: моки, валидация).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import openapiTS, { astToString } from 'openapi-typescript';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..'); // repo root (api-types/scripts → ../../)
const dist = resolve(here, '..', 'dist');
const pkgPath = resolve(here, '..', 'package.json');

const specPath = (module, file) =>
  resolve(root, `${module}-contract/src/main/resources/openapi/${file}`);
const readYaml = (p) => load(readFileSync(p, 'utf8'));

// ЕДИНЫЙ источник версии — <revision> в parent-pom (lockstep, Approach A).
// npm-версия деривится отсюда, чтобы не было двух правд (pom vs package.json).
const parentPom = readFileSync(resolve(root, 'pom.xml'), 'utf8');
const revisionMatch = parentPom.match(/<revision>\s*([^<\s]+)\s*<\/revision>/);
if (!revisionMatch) {
  console.error('✗ не нашёл <revision> в parent pom.xml — версия не определена');
  process.exit(1);
}
const version = revisionMatch[1];

// Синхронизируем package.json version с pom <revision>, чтобы npm publish взял верный номер.
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.version !== version) {
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`↻ package.json version → ${version} (из parent pom <revision>)`);
}

const shared = readYaml(specPath('shared', 'shared.yaml'));
const domains = [
  ['collection', 'collection-api.yaml'],
  ['dashboard', 'dashboard-api.yaml'],
  ['stats', 'stats-api.yaml'],
  ['users', 'users-api.yaml'],
  ['kaiten', 'kaiten-api.yaml'],
  ['auth', 'auth-api.yaml'],
].map(([module, file]) => readYaml(specPath(module, file)));

const COMPONENT_KEYS = ['schemas', 'parameters', 'responses', 'securitySchemes'];

const merged = {
  openapi: '3.0.3',
  info: {
    title: 'DevPulse API',
    version,
    description: 'Aggregated DevPulse /api/v2 contract — generated, do not edit by hand.',
  },
  servers: [
    { url: 'https://api.devpulse.dev/api/v2', description: 'production' },
    { url: 'http://localhost:8080/api/v2', description: 'local dev' },
  ],
  // Аутентификация — снаружи контракта (gateway/SSO), как во всех доменных спеках.
  security: [],
  paths: {},
  components: Object.fromEntries(COMPONENT_KEYS.map((k) => [k, {}])),
};

// shared-компоненты — основа; доменные спеки добавляют свои локальные сверху.
for (const key of COMPONENT_KEYS) Object.assign(merged.components[key], shared.components?.[key] ?? {});
for (const domain of domains) {
  Object.assign(merged.paths, domain.paths ?? {});
  for (const key of COMPONENT_KEYS) Object.assign(merged.components[key], domain.components?.[key] ?? {});
}

// Внешние рефы на shared делаем внутренними — документ становится самодостаточным.
// Единственный внешний паттерн в спеках — `shared.yaml#/components/...` (проверено grep'ом).
const bundled = JSON.parse(
  JSON.stringify(merged).replaceAll('shared.yaml#/components/', '#/components/'),
);

const remainingExternalRefs = JSON.stringify(bundled).match(/"\$ref":"[^"]*\.yaml#/g);
if (remainingExternalRefs) {
  console.error('✗ остались внешние $ref после склейки:', [...new Set(remainingExternalRefs)]);
  process.exit(1);
}

mkdirSync(dist, { recursive: true });
writeFileSync(resolve(dist, 'openapi.json'), JSON.stringify(bundled, null, 2) + '\n');

const ast = await openapiTS(bundled);
writeFileSync(resolve(dist, 'index.d.ts'), astToString(ast));

const schemaCount = Object.keys(bundled.components.schemas).length;
const pathCount = Object.keys(bundled.paths).length;
console.log(
  `✓ DevPulse API v${version}: ${pathCount} paths, ${schemaCount} schemas → dist/index.d.ts + dist/openapi.json`,
);
