# API FUT 24/7 - Documento de producao

Este documento consolida o contrato tecnico da API. Ele deve ser atualizado junto com o codigo, a cada fase.

Este e o documento principal e a fonte de verdade do projeto.
O plano tatico e operacional de fechamento vive em [plano-producao-final.md](/www/wwwroot/apifut.vr766.com/docs/plano-producao-final.md), mas ele nunca substitui este contrato.

---

## 1. Visao geral

API publica de futebol 24/7 com:

- jogos ao vivo
- jogos de hoje, ontem e amanha
- historico de temporadas antigas
- eventos de partida (gols, cartoes, substituicoes, VAR, etc.)
- canais e transmissoes
- snapshots temporais imutaveis
- memoria persistente em MariaDB
- consumo por front-end, analise estatistica e integracoes externas

## 2. Principios

- **Nao apagar historico.** Toda mudanca gera nova versao/snapshot.
- **Nao sobrescrever eventos sem versao.**
- **Nao expor segredos.** Tudo em `.env`, nunca no codigo.
- **Nao depender de uma unica fonte.** Toda entidade guarda `source_id`.
- **Nao quebrar contrato JSON sem versionamento.** Prefixo `/api/v1`.
- **ISO 8601** para todas as datas (`2025-04-12T20:30:00Z`).
- **Arrays vazios** em vez de `null` quando aplicavel.
- **Log estruturado** para toda ingestao, erro e reconciliacao.

## 3. Stack

- NestJS 10 + TypeScript
- MariaDB 10.6+ via TypeORM
- pino/nestjs-pino para logging
- @nestjs/terminus para healthcheck
- class-validator para DTOs e env
- Executado em VPS (aaPanel), pm2 ou systemd

## 4. Estrutura modular

```
src/
  config/          # Configuracao e validacao de env
  common/          # Filtros, interceptors, logger, utils
  database/        # DataSource, DatabaseModule, migrations
  modules/
    health/        # Healthcheck (Fase 1)
    matches/       # (Fase 3)
    competitions/  # (Fase 3)
    teams/         # (Fase 3)
    channels/      # (Fase 3)
    calendar/      # (Fase 3)
    ingestion/     # (Fase 4-6)
    snapshots/     # (Fase 5)
```

## 5. Contrato de rotas (planejado)

Todas sob prefixo `/api/v1`.

### Fase 1 (implementado)

- `GET /health` - health completo (app + MariaDB + memoria)
- `GET /health/liveness` - liveness simples

### Fase 3 (planejado)

- `GET /matches/live`
- `GET /matches/today`
- `GET /matches/yesterday`
- `GET /matches/tomorrow`
- `GET /matches/:id`
- `GET /matches/:id/events`
- `GET /matches/:id/broadcasts`
- `GET /competitions`
- `GET /teams`
- `GET /channels`
- `GET /calendar/day?date=YYYY-MM-DD`

## 6. Fontes de dados

| Fonte             | Papel                           | Fase |
| ----------------- | ------------------------------- | ---- |
| Futebol na TV     | Agenda + canais (editorial BR)  | 4    |
| TheSportsDB       | Historico publico + metadados   | 5    |
| football-data.co.uk | Historico tabular             | 5    |
| openfootball      | Datasets historicos open source | 5    |
| Sportmonks        | Live + eventos (provider pago)  | 6    |
| API-Football      | Alternativa live                | 6    |

Regra: em caso de conflito, prevalece a fonte configurada com prioridade mais alta na tabela `sources`.

## 7. Modelo de dados (Fase 2)

Tabelas principais previstas:

- `sources`, `ingestion_runs`, `reconciliation_logs`, `raw_payloads`, `snapshots`
- `competitions`, `seasons`, `teams`
- `matches`, `match_events`, `match_status_history`, `match_broadcasts`, `match_lineups`, `match_statistics`

Toda tabela relevante carrega: `source_id`, `external_id`, `created_at`, `updated_at`, versao/hash do payload.

## 8. Snapshots (Fase 5)

Cada mudanca material em uma partida gera:

- um registro em `snapshots` (imutavel) com o estado completo em JSON
- um registro em `raw_payloads` com o payload original da fonte
- um registro em `reconciliation_logs` descrevendo o diff aplicado

O estado atual continua sendo lido nas tabelas normalizadas; snapshots servem para auditoria e replay.

## 9. Observabilidade

- Logs pino JSON (stdout) com `request-id`, `app`, `env`.
- Redacao automatica de `Authorization`, `cookie`, `x-api-key`, `password`, `token`, `apiKey`.
- Healthcheck em `/api/v1/health`.
- Metricas Prometheus previstas para fase posterior.

## 10. O que NAO fazer

- Nao rodar `DB_SYNCHRONIZE=true`. Nunca.
- Nao commitar `.env`.
- Nao chamar fontes externas sem registrar `ingestion_runs`.
- Nao apagar linhas de `matches`, `match_events` ou `snapshots` (soft-delete quando necessario).
