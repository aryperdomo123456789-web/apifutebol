# API FUT 24/7

API de futebol production-ready: jogos ao vivo, agenda, historico imutavel, eventos, transmissoes, midia e stats.

## Stack
- NestJS 10 + TypeORM 0.3 + MariaDB 10.6+
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

Painel admin: `http://SEU_HOST:3000/api/v1/admin/ui` (cola a chave `fut_...` gerada).

## Endpoints publicos (todos exigem `X-API-Key`)
- `GET /api/v1/live` — partidas ao vivo agora
- `GET /api/v1/today` `?tz=America/Sao_Paulo` — jogos de hoje
- `GET /api/v1/yesterday` — jogos de ontem
- `GET /api/v1/tomorrow` — jogos de amanha
- `GET /api/v1/calendar?date=YYYY-MM-DD`
- `GET /api/v1/matches/:id` — detalhes + eventos + broadcasts
- `GET /api/v1/matches/:id/media` — media pack versionado
- `GET /api/v1/history/matches?team=&competition=&from=&to=` — historico
- `GET /api/v1/history/matches/:id/snapshot` — snapshot imutavel
- `GET /api/v1/stats/matches/:id` — stats agregadas
- `GET /api/v1/stats/teams/:teamId?from=&to=` — stats de time
- `GET /api/v1/stats/competitions/:competitionId/top-scorers?season=&limit=`
- `GET /api/v1/competitions` `GET /api/v1/teams` `GET /api/v1/channels`

## Documentacao
- `docs/api-futebol-producao.md` — arquitetura completa
- `docs/schema.md` — modelo de dados
- `docs/estabilizacao-fase-4.md` — bootstrap `magoadm`
- `docs/plano-producao-final.md` — plano detalhado do que falta para fechar 10/10
- `docs/roadmap-10-de-10.md` — integracao final e deploy prod
- `docs/lovable.md` `docs/fluxo-github-lovable.md` — fluxo de dev
