# API FUT 24/7

Plataforma completa de futebol e midia, production-ready: jogos ao vivo, agenda, historico imutavel, eventos, transmissoes, media pack, estatisticas, observabilidade Prometheus e painel admin HTML.

## Stack
- NestJS 10 + TypeORM 0.3 + MariaDB 10.6+
- pino/nestjs-pino, @nestjs/terminus, @nestjs/schedule
- prom-client (metricas Prometheus expostas em `/metrics`)
- Cache TTL in-memory com stale-on-error
- API Key (`X-API-Key`) com rate limit por IP e por chave
- Snapshots SHA-256 imutaveis para partidas finalizadas
- Deploy: PM2 + Nginx (SSL + rate limit) + backup diario do MariaDB + cron de snapshots e restore-test

## Setup no aaPanel
```bash
git pull
npm install
cp .env.example .env      # editar credenciais
npm run migration:run
npm run seed:sources
BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap
npm run build
pm2 start deploy/ecosystem.config.js
```

Painel admin: `http://SEU_HOST:3000/api/v1/admin/ui` (cola a chave `fut_...` gerada no bootstrap).

## Endpoints publicos (todos exigem `X-API-Key`, exceto Health, `/metrics` e `/admin/ui`)

### Partidas
- `GET /api/v1/live`
- `GET /api/v1/today`
- `GET /api/v1/yesterday`
- `GET /api/v1/tomorrow`
- `GET /api/v1/calendar?date=YYYY-MM-DD`
- `GET /api/v1/matches/:id`
- `GET /api/v1/matches/:id/events`
- `GET /api/v1/matches/:id/broadcasts`

### Historico e stats
- `GET /api/v1/history/matches?team=&competition=&from=&to=&limit=&offset=`
- `GET /api/v1/history/teams/:teamId?limit=`
- `GET /api/v1/history/competitions/:competitionId?season=&limit=`
- `GET /api/v1/history/matches/:id/snapshot` — snapshot imutavel
- `GET /api/v1/stats/matches/:id`
- `GET /api/v1/stats/teams/:teamId?from=&to=`
- `GET /api/v1/stats/competitions/:competitionId/top-scorers?season=&limit=`
- `GET /api/v1/stats/overview`

### Media (X-API-Key com escopo `read:media`)
- `GET /api/v1/media/assets?entity_kind=&entity_id=`
- `GET /api/v1/media/match/:id/pack` — media pack versionado da partida
- `GET /api/v1/media/packs` (admin)
- `POST /api/v1/media/assets` (admin)
- `DELETE /api/v1/media/assets/:id` (admin)
- `POST /api/v1/media/match/:id/pack/rebuild` (admin)

### Catalogo
- `GET /api/v1/competitions`
- `GET /api/v1/teams`
- `GET /api/v1/channels`

### Health e observabilidade
- `GET /api/v1/health`
- `GET /api/v1/health/liveness`
- `GET /metrics` — Prometheus (proteger no Nginx por IP)

### Admin (chave com escopo `read:admin` / `write:admin`)
- `GET /api/v1/admin/ui` — painel HTML (publico)
- `GET /api/v1/admin/overview`
- `GET /api/v1/admin/sources`
- `GET /api/v1/admin/runs`
- `GET /api/v1/admin/snapshots`
- `POST /api/v1/admin/api-keys`
- `GET /api/v1/admin/api-keys`
- `DELETE /api/v1/admin/api-keys/:id`
- `GET /api/v1/admin/api-keys/:id/usage`

## Operacao
- `npm run smoke` — checagem HTTP dos endpoints principais (usa `BASE_URL` e `API_KEY`)
- `deploy/crontab.example` — snapshots, backup diario, restore-test semanal, smoke a cada 5 min
- `deploy/backup.sh` / `deploy/restore-test.sh` — backup/restauracao MariaDB

## Documentacao
- [`docs/api-futebol-producao.md`](docs/api-futebol-producao.md) — **contrato principal (fonte de verdade)**
- [`docs/plano-producao-final.md`](docs/plano-producao-final.md) — plano operacional derivado
- [`docs/producao-checklist.md`](docs/producao-checklist.md) — checklist final
- [`docs/observabilidade.md`](docs/observabilidade.md) — metricas, alertas, smoke
- [`docs/schema.md`](docs/schema.md) — modelo de dados
- [`docs/midia-e-media-pack.md`](docs/midia-e-media-pack.md) — camada de midia
- [`docs/api-keys-e-painel.md`](docs/api-keys-e-painel.md) — chaves e painel
- [`docs/fase-4-api-keys-painel-media.md`](docs/fase-4-api-keys-painel-media.md)
- [`docs/estabilizacao-fase-4.md`](docs/estabilizacao-fase-4.md) — bootstrap `magoadm`
- [`docs/roadmap-10-de-10.md`](docs/roadmap-10-de-10.md) — hardening final
- [`docs/guia-final.md`](docs/guia-final.md) — visao de produto
- [`docs/lovable.md`](docs/lovable.md), [`docs/fluxo-github-lovable.md`](docs/fluxo-github-lovable.md) — fluxo de dev
