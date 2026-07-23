# API FUT 24/7

Plataforma completa de futebol e midia, production-ready: jogos ao vivo, agenda, historico imutavel, eventos, transmissoes, media pack e estatisticas.

## Stack
- NestJS 10 + TypeORM 0.3 + MariaDB 10.6+
- pino/nestjs-pino, @nestjs/terminus, @nestjs/schedule
- Cache TTL in-memory com stale-on-error
- Autenticacao via API Key (`X-API-Key`) com rate limit por IP
- Snapshots SHA-256 imutaveis para partidas finalizadas
- Deploy: PM2 + Nginx (SSL + rate limit) + backup diario do MariaDB

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

## Endpoints publicos (todos exigem `X-API-Key`)

### Partidas
- `GET /api/v1/live` — partidas ao vivo agora
- `GET /api/v1/today` — jogos de hoje
- `GET /api/v1/yesterday` — jogos de ontem
- `GET /api/v1/tomorrow` — jogos de amanha
- `GET /api/v1/calendar?date=YYYY-MM-DD`
- `GET /api/v1/matches/:id` — detalhes da partida
- `GET /api/v1/matches/:id/events` — eventos
- `GET /api/v1/matches/:id/broadcasts` — transmissoes
- `GET /api/v1/matches/:id/media` — media pack versionado

### Historico e stats
- `GET /api/v1/history/matches?team=&competition=&from=&to=`
- `GET /api/v1/history/matches/:id/snapshot` — snapshot imutavel
- `GET /api/v1/stats/matches/:id`
- `GET /api/v1/stats/teams/:teamId?from=&to=`
- `GET /api/v1/stats/competitions/:competitionId/top-scorers?season=&limit=`

### Catalogo
- `GET /api/v1/competitions`
- `GET /api/v1/teams`
- `GET /api/v1/channels`

### Health
- `GET /api/v1/health`
- `GET /api/v1/health/liveness`

### Admin (chave admin)
- `GET /api/v1/admin/ui` — painel HTML
- `GET /api/v1/admin/overview`
- `POST /api/v1/api-keys`, `GET /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id`

## Documentacao
- [`docs/api-futebol-producao.md`](docs/api-futebol-producao.md) — **contrato principal (fonte de verdade)**
- [`docs/plano-producao-final.md`](docs/plano-producao-final.md) — plano operacional derivado
- [`docs/schema.md`](docs/schema.md) — modelo de dados
- [`docs/midia-e-media-pack.md`](docs/midia-e-media-pack.md) — camada de midia
- [`docs/api-keys-e-painel.md`](docs/api-keys-e-painel.md) — chaves e painel
- [`docs/fase-4-api-keys-painel-media.md`](docs/fase-4-api-keys-painel-media.md)
- [`docs/estabilizacao-fase-4.md`](docs/estabilizacao-fase-4.md) — bootstrap `magoadm`
- [`docs/roadmap-10-de-10.md`](docs/roadmap-10-de-10.md) — hardening final
- [`docs/guia-final.md`](docs/guia-final.md) — visao de produto
- [`docs/lovable.md`](docs/lovable.md), [`docs/fluxo-github-lovable.md`](docs/fluxo-github-lovable.md) — fluxo de dev
