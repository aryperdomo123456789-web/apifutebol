# API FUT 24/7 - Documento de producao

Este documento consolida o contrato tecnico da API FUT. Ele e o **documento principal** e a **fonte de verdade** do projeto e deve ser atualizado junto com o codigo, a cada fase entregue.

O plano tatico e operacional de fechamento vive em [`plano-producao-final.md`](./plano-producao-final.md), mas nunca substitui este contrato. Se houver divergencia, este documento prevalece.

Classificacao dos itens ao longo do texto:
- **validado**: existe no codigo e no repo `main` atual.
- **planejado**: previsto mas ainda nao entregue.

---

## 1. Visao geral

API publica de futebol 24/7 e plataforma de midia, com:

- jogos ao vivo, de hoje, de ontem e de amanha
- calendario por data
- historico de temporadas com snapshots imutaveis
- eventos de partida (gols, cartoes, substituicoes, VAR etc.)
- lineups, estatisticas e reconciliacao multi-fonte
- canais e transmissoes
- **camada de midia**: logos, banners, thumbnails, overlays, backgrounds, media pack por jogo e referencias de video/stream sob licenca
- **API Key** obrigatoria em endpoints publicos, com rate limit e auditoria
- **painel administrativo** web (HTML servido pela propria API) para operacao
- memoria persistente em MariaDB
- consumo por front-end, analise estatistica, geradores de banners/thumbnails e integracoes externas

## 2. Principios

- **Nao apagar historico.** Toda mudanca material gera nova versao/snapshot.
- **Nao sobrescrever eventos sem versao.**
- **Nao expor segredos.** Tudo em `.env`, nunca no codigo.
- **Nao depender de uma unica fonte.** Toda entidade guarda `source_id`.
- **Contrato JSON versionado.** Prefixo fixo `/api/v1`.
- **ISO 8601** para toda data (`2025-04-12T20:30:00Z`).
- **Arrays vazios** em vez de `null` quando aplicavel.
- **Log estruturado** para toda ingestao, erro e reconciliacao.
- **Nao rodar `DB_SYNCHRONIZE=true`.** Migrations sao a unica forma de evoluir schema.
- **Ativos de midia guardam origem e licenca.** Video/stream sob licenca so quando a fonte permitir.

## 3. Stack

- NestJS 10 + TypeScript
- MariaDB 10.6+ via TypeORM 0.3
- pino/nestjs-pino para logging estruturado
- @nestjs/terminus para healthcheck
- @nestjs/schedule para cron/ingestao
- class-validator para DTOs e env
- Cache TTL in-memory com stale-on-error
- Deploy: VPS (aaPanel) + PM2 + Nginx (SSL + rate limit) + backup diario do MariaDB
- GitHub como fonte de verdade do codigo

## 4. Estrutura modular

```
src/
  config/          # Configuracao e validacao de env
  common/          # Filtros, interceptors, logger, cache, http, utils, dto
  database/        # DataSource, DatabaseModule, migrations
  modules/
    health/        # Healthcheck (validado)
    sources/       # Cadastro de fontes (validado)
    ingestion/     # Ingestao, normalizacao, reconciliacao, snapshots (validado)
    matches/       # Jogos, eventos, broadcasts (validado)
    competitions/  # Competicoes (validado)
    teams/         # Times (validado)
    channels/      # Canais (validado)
    api-keys/      # Chaves publicas, guard e rate limit (validado)
    admin/         # Painel HTML + endpoints admin (validado)
    history/       # Historico e snapshot por partida (validado)
    statistics/    # Stats agregadas (validado)
    media/         # Assets, media pack por jogo (validado)
```

## 5. Contrato de rotas

Todas sob prefixo `/api/v1`. Rotas publicas exigem `X-API-Key`. Rotas de admin exigem chave com escopo/role admin.

### 5.1 Health (validado)

- `GET /health` - health completo (app + MariaDB + memoria)
- `GET /health/liveness` - liveness simples

### 5.2 Partidas (validado)

- `GET /live` - jogos ao vivo agora
- `GET /today` - jogos de hoje
- `GET /yesterday` - jogos de ontem
- `GET /tomorrow` - jogos de amanha
- `GET /calendar?date=YYYY-MM-DD` - jogos de um dia especifico
- `GET /matches/:id` - detalhes da partida
- `GET /matches/:id/events` - eventos da partida
- `GET /matches/:id/broadcasts` - transmissoes da partida
- `GET /matches/:id/media` - media pack versionado da partida

### 5.3 Catalogo (validado)

- `GET /competitions`
- `GET /teams`
- `GET /channels`

### 5.4 Historico (validado)

- `GET /history/matches?team=&competition=&from=&to=` - listagem historica
- `GET /history/matches/:id/snapshot` - snapshot imutavel final

### 5.5 Estatisticas (validado)

- `GET /stats/matches/:id`
- `GET /stats/teams/:teamId?from=&to=`
- `GET /stats/competitions/:competitionId/top-scorers?season=&limit=`

### 5.6 API Keys (validado, requer admin)

- `POST /api-keys` - criar
- `GET /api-keys` - listar
- `DELETE /api-keys/:id` - revogar
- Guard global aplica `X-API-Key` em todas as rotas publicas, com rate limit por IP.

### 5.7 Painel admin (validado, requer admin)

- `GET /admin/ui` - painel HTML
- `GET /admin/overview` - visao operacional (health, chaves, ingestao)

### 5.8 Planejado (fora do escopo entregue)

- `GET /competitions/:id`
- `GET /teams/:id`
- metricas Prometheus dedicadas
- exposicao publica de `ingestion_runs` e `reconciliation_logs`

## 6. Fontes de dados

| Fonte              | Papel                                         | Estado     |
| ------------------ | --------------------------------------------- | ---------- |
| Futebol na TV      | Agenda + canais (editorial BR)                | validado   |
| TheSportsDB        | Historico publico + metadados                 | validado   |
| API-Football       | Live + eventos estruturados                   | validado   |
| football-data.co.uk | Historico tabular                            | planejado  |
| openfootball       | Datasets historicos open source              | planejado  |
| Sportmonks         | Live + eventos (provider pago)               | planejado  |

Regra: em caso de conflito, prevalece a fonte com maior prioridade configurada na tabela `sources`, registrado em `reconciliation_logs`.

## 7. Modelo de dados

Tabelas principais persistidas em MariaDB (detalhe em [`schema.md`](./schema.md)):

- `sources`, `ingestion_runs`, `reconciliation_logs`, `raw_payloads`, `snapshots`
- `competitions`, `seasons`, `teams`
- `matches`, `match_events`, `match_status_history`, `match_broadcasts`, `match_lineups`, `match_statistics`, `match_snapshots`
- `api_keys`, `api_key_usage`
- `media_assets`, `media_packs`

Toda tabela relevante carrega: `source_id`, `external_id`, `created_at`, `updated_at`, versao/hash do payload quando aplicavel.

## 8. Snapshots

Cada mudanca material em uma partida gera:

- registro em `snapshots` ou `match_snapshots` (imutavel) com o estado completo em JSON e hash SHA-256
- registro em `raw_payloads` com o payload original da fonte
- registro em `reconciliation_logs` descrevendo o diff aplicado

O estado atual continua sendo lido nas tabelas normalizadas; snapshots servem para auditoria, historico oficial pos-partida e replay.

## 9. Camada de midia

A API entrega, alem dos dados, uma camada de midia usada por geradores externos (banners, thumbnails, overlays, front-ends):

- logos de times, competicoes e canais
- banners de partida
- thumbnails
- overlays e backgrounds
- media pack por jogo (`GET /matches/:id/media`) versionado
- referencia de clips/streams de video quando houver origem/licenca valida

Regras obrigatorias:

- todo asset guarda `source`, `license`, `checksum`, `version`
- video/stream so e servido quando a licenca da fonte permitir
- media pack acompanha a partida durante todo o ciclo pre/durante/pos jogo
- assets nunca substituem o estado normalizado; sao complementares

Detalhe operacional em [`midia-e-media-pack.md`](./midia-e-media-pack.md).

## 10. API Keys e painel admin

- toda rota publica exige `X-API-Key`
- chaves geradas com prefixo `fut_` + hash SHA-256 persistido
- rate limit por IP e por chave
- auditoria em `api_key_usage`
- painel `GET /admin/ui` serve HTML e consome `GET /admin/overview` com a mesma chave admin
- bootstrap inicial via `scripts/bootstrap-admin-key.ts` (nome padrao `magoadm`)

Detalhe operacional em [`api-keys-e-painel.md`](./api-keys-e-painel.md) e [`fase-4-api-keys-painel-media.md`](./fase-4-api-keys-painel-media.md).

## 11. Observabilidade

- Logs pino JSON (stdout) com `request-id`, `app`, `env`
- Redacao automatica de `Authorization`, `cookie`, `x-api-key`, `password`, `token`, `apiKey`
- Healthcheck em `GET /api/v1/health`
- Metricas Prometheus **planejadas** para fase de hardening

## 12. O que NAO fazer

- Nao rodar `DB_SYNCHRONIZE=true`. Nunca.
- Nao commitar `.env`.
- Nao chamar fontes externas sem registrar `ingestion_runs`.
- Nao apagar linhas de `matches`, `match_events`, `snapshots` ou `match_snapshots` (soft-delete quando necessario).
- Nao servir video/stream sem licenca validada.
- Nao remover `X-API-Key` de rotas publicas.
- Nao criar documento paralelo competindo com este contrato.

## 13. Referencias internas

- [`plano-producao-final.md`](./plano-producao-final.md) - plano operacional derivado
- [`guia-final.md`](./guia-final.md) - visao de produto e roadmap
- [`schema.md`](./schema.md) - modelo de dados
- [`midia-e-media-pack.md`](./midia-e-media-pack.md) - camada de midia
- [`api-keys-e-painel.md`](./api-keys-e-painel.md) - chaves e painel
- [`fase-4-api-keys-painel-media.md`](./fase-4-api-keys-painel-media.md) - fase 4 detalhada
- [`estabilizacao-fase-4.md`](./estabilizacao-fase-4.md) - estabilizacao
- [`roadmap-10-de-10.md`](./roadmap-10-de-10.md) - hardening final
- [`lovable.md`](./lovable.md) e [`fluxo-github-lovable.md`](./fluxo-github-lovable.md) - fluxo de dev
- [`../README.md`](../README.md) - guia rapido de operacao
