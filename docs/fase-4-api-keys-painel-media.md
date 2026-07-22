# Fase 4 — API Keys, Painel Admin e Media Pack

Documento operacional da Fase 4. Complementa `guia-final.md`,
`api-keys-e-painel.md`, `midia-e-media-pack.md`.

## O que entrou

### 1. API Key
- Módulo `src/modules/api-keys/`
  - Entidades: `api_keys`, `api_key_usage`
  - `ApiKeysService`: `create`, `revoke`, `list`, `findByRaw`, `usageSummary`
  - `ApiKeyGuard` global (registrado via `APP_GUARD`):
    - Autentica via header `x-api-key` ou `Authorization: Bearer …`
    - Valida `active`, `revoked_at`, `expires_at`
    - Rate limit em memória: por chave (RPM configurável) e por IP (120 rpm)
    - Escopos por rota via `@RequireScopes('read:public', 'read:media', ...)`
    - Rotas anotadas com `@Public()` ignoram a exigência de chave (healthcheck e painel HTML)
  - `ApiKeyUsageInterceptor` global (via `APP_INTERCEPTOR`): registra cada request autenticado em `api_key_usage`
- Endpoints administrativos (`write:admin`):
  - `GET  /api/v1/admin/api-keys`
  - `POST /api/v1/admin/api-keys` → body `{ name, scopes[], owner?, rate_limit_per_minute?, expires_at? }`
  - `DELETE /api/v1/admin/api-keys/:id`
  - `GET  /api/v1/admin/api-keys/:id/usage`

### 2. Camada de mídia
- Módulo `src/modules/media/`
  - Entidades: `media_assets` (logo/banner/thumbnail/background/overlay/clip/video por time, competição, canal, partida), `media_packs` (pacote agregado por partida com hash de versão para invalidação em geradores externos)
  - Endpoints:
    - `GET  /api/v1/media/assets?entity_kind=&entity_id=` — `read:media`
    - `POST /api/v1/media/assets` — `write:admin`
    - `DELETE /api/v1/media/assets/:id` — `write:admin`
    - `GET  /api/v1/media/match/:id/pack` — `read:media`
    - `POST /api/v1/media/match/:id/pack/rebuild` — `write:admin`
    - `GET  /api/v1/media/packs` — `read:admin`

### 3. Painel administrativo
- Servido pelo próprio Nest em `GET /api/v1/admin/ui` (rota pública para o HTML; toda chamada de dados exige API Key).
- Funcionalidades:
  - Login por API Key (armazenada em `localStorage`)
  - Dashboard de contagens (chaves, fontes, runs, snapshots, packs)
  - CRUD de API Keys (criar, revogar, ver uso por chave)
  - Listagem de fontes, últimos 100 ingestion runs, últimos media packs

### 4. Migration
- `src/database/migrations/1737100000000-Phase4ApiKeysMedia.ts`
  Cria as 4 novas tabelas em InnoDB/utf8mb4 sem tocar no schema existente.

## Rodando no aaPanel/VPS

```bash
git pull
npm ci
npm run typeorm -- migration:run   # aplica Phase4ApiKeysMedia
# opcional: seed já roda uma vez
npm run seed:sources || true
npm run build
pm2 restart apifut || npm run start:prod
```

## Bootstrap de uma API Key admin

Como o guard bloqueia `write:admin`, gere a primeira chave direto via script
node/typeorm ou insert SQL controlado. Exemplo com um script one-shot:

```ts
// scripts/bootstrap-admin-key.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { createHash, randomBytes } from 'crypto';

async function main() {
  const ds: DataSource = await AppDataSource.initialize();
  const prefix = 'fut_' + randomBytes(4).toString('hex');
  const secret = randomBytes(24).toString('hex');
  const raw = `${prefix}.${secret}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  await ds.query(
    'INSERT INTO api_keys (prefix, hash, name, scopes, active) VALUES (?, ?, ?, ?, 1)',
    [prefix, hash, 'bootstrap-admin',
     JSON.stringify(['read:public','read:matches','read:media','read:admin','write:admin'])],
  );
  console.log('API KEY (guarde):', raw);
  await ds.destroy();
}
main().catch(err => { console.error(err); process.exit(1); });
```

Rode com `npx ts-node scripts/bootstrap-admin-key.ts`, guarde a chave e
use no painel `/api/v1/admin/ui`.

## Contrato Media Pack

`GET /api/v1/media/match/:id/pack`

```json
{
  "data": {
    "match_id": "1",
    "version_hash": "abc123…",
    "updated_at": "2026-07-22T15:00:00.000Z",
    "match":       { "id":"1", "starts_at":"…", "status":"…", "score":{ "home":0, "away":0 } },
    "competition": { "id":"…", "name":"…", "logo":"…", "banner":"…" },
    "home":        { "id":"…", "name":"…", "short_name":"…", "logo":"…" },
    "away":        { "id":"…", "name":"…", "short_name":"…", "logo":"…" },
    "backgrounds": ["https://…"],
    "overlays":    ["https://…"],
    "broadcasts":  [{ "channel":"…", "logo":null, "url":"…" }]
  },
  "meta": { "generatedAt":"…", "source":"media", "version":"v1" }
}
```

O `version_hash` muda quando qualquer asset relevante muda, permitindo
que geradores de banner/thumbnail/video externos invalidem cache com
segurança.

## Próximo plano

- Fase 5: histórico e estatísticas (endpoints `/history`, snapshots imutáveis versionados)
- Fase 6: parsers restantes (futebolnatv HTML) + integração API-Football como fonte premium
- Endurecimento: rate limit persistente (Redis) e assinatura HMAC opcional
