# API FUT - Guia Final de Produto e Producao

Data: 2026-07-23

> Este guia descreve a **visao de produto** e o **roadmap** por fase. O contrato tecnico oficial e o modelo de dados vivem em [`api-futebol-producao.md`](./api-futebol-producao.md), que sempre prevalece em caso de divergencia.

## 1. Visao do produto

A `API FUT` e uma plataforma profissional de futebol e midia capaz de atender tres frentes:

- dados esportivos em tempo real e historicos;
- consumo por ferramentas de analise estatistica;
- consumo por geradores de banners, thumbnails, overlays e videos.

O produto final nao e apenas uma API de partidas. E um ecossistema com:

- ingestao multi-fonte;
- memoria persistente em MariaDB;
- snapshots e auditoria;
- API Key para consumo controlado;
- painel web administrativo;
- camada de media/asset para suporte visual;
- documentacao para integracao externa.

## 2. Stack oficial

- NestJS 10
- MariaDB 10.6+
- TypeORM 0.3.x
- pino / nestjs-pino
- @nestjs/terminus
- @nestjs/schedule
- class-validator
- VPS / aaPanel
- GitHub como fonte de verdade

## 3. Arquitetura de alto nivel

### 3.1 Camadas

- `API publica`
- `Painel administrativo`
- `Ingestao de fontes`
- `Normalizacao`
- `Reconciliacao`
- `Persistencia historica`
- `Cache`
- `Camada de midia`
- `Observabilidade`
- `Seguranca e API Keys`

### 3.2 Fluxo geral

1. coletar dados de fontes externas;
2. armazenar payload bruto;
3. normalizar entidades;
4. reconciliar conflitos por prioridade;
5. atualizar estado consolidado;
6. gerar snapshot;
7. publicar resposta JSON estavel;
8. registrar metricas, logs e uso por chave;
9. servir midia e assets quando disponiveis.

## 4. Contrato da API publica

### 4.1 Padrao de resposta

```json
{
  "data": {},
  "meta": {
    "generatedAt": "2026-07-22T18:10:00Z",
    "source": "futebol_na_tv",
    "version": "v1"
  }
}
```

### 4.2 Regras obrigatorias

- datas em ISO 8601;
- timezone explicito;
- arrays vazios em vez de `null` quando aplicavel;
- campos estaveis;
- erros de fonte nao quebram o schema;
- a versao da API e fixa em `/api/v1`.

### 4.3 Endpoints publicos principais (validado)

Todos exigem `X-API-Key`.

Partidas:
- `GET /api/v1/live`
- `GET /api/v1/today`
- `GET /api/v1/yesterday`
- `GET /api/v1/tomorrow`
- `GET /api/v1/calendar?date=YYYY-MM-DD`
- `GET /api/v1/matches/:id`
- `GET /api/v1/matches/:id/events`
- `GET /api/v1/matches/:id/broadcasts`
- `GET /api/v1/matches/:id/media`

Historico e stats:
- `GET /api/v1/history/matches`
- `GET /api/v1/history/matches/:id/snapshot`
- `GET /api/v1/stats/matches/:id`
- `GET /api/v1/stats/teams/:teamId`
- `GET /api/v1/stats/competitions/:competitionId/top-scorers`

Catalogo:
- `GET /api/v1/competitions`
- `GET /api/v1/teams`
- `GET /api/v1/channels`

Admin (chave admin):
- `GET /api/v1/admin/ui`
- `GET /api/v1/admin/overview`
- `POST|GET|DELETE /api/v1/api-keys`

Planejado (nao entregue): `/competitions/:id`, `/teams/:id`, `/search?q=`.

## 5. Fontes de dados

### 5.1 Editoriais e agenda
- [Futebol na TV](https://www.futebolnatv.com.br/) - agenda, canais, horario. **validado**

### 5.2 Historicas
- [TheSportsDB](https://www.thesportsdb.com/) - **validado**
- [football-data.co.uk](https://www.football-data.co.uk/) - **planejado**
- [openfootball](https://openfootball.github.io/) - **planejado**

### 5.3 Ao vivo / estruturadas
- [API-Football](https://www.api-football.com/) - **validado**
- [Sportmonks](https://www.sportmonks.com/football-api/) - **planejado**

## 6. Memoria eterna

Combinacao de:

- `matches` como estado consolidado;
- `match_events` como trilha de eventos;
- `match_status_history` como historico de status;
- `snapshots` e `match_snapshots` como estados imutaveis;
- `raw_payloads` como prova bruta;
- `reconciliation_logs` como auditoria de conflito;
- `ingestion_runs` como rastreio operacional.

## 7. Camada de midia (validada)

A API fornece material visual para geradores externos:

- logos de times, competicoes e canais;
- banners de partida;
- thumbnails;
- overlays;
- backgrounds;
- media pack por jogo (`GET /matches/:id/media`);
- referencia de clips de video quando houver origem/licenca valida.

Regras:

- imagens e logos servidos como assets versionados;
- videos completos so existem quando a fonte permitir legalmente;
- a API guarda origem e licenca de cada asset;
- o media pack acompanha a partida em todo o ciclo.

## 8. API Key e painel web (validado)

- criacao, revogacao e expiracao de chaves;
- escopos por recurso;
- rate limit por chave e por IP;
- logs de uso em `api_key_usage`;
- painel HTML em `GET /api/v1/admin/ui`;
- overview operacional em `GET /api/v1/admin/overview`;
- bootstrap inicial via `scripts/bootstrap-admin-key.ts` (nome `magoadm`).

## 9. Roadmap por fase

### Fase 1 (validado)
- base NestJS; MariaDB; healthcheck; logging; configuracao.

### Fase 2 (validado)
- schema completo; entidades; migration inicial; seed de sources.

### Fase 3 (validado)
- ingestao multi-fonte; normalizacao; reconciliacao; endpoints publicos basicos.

### Fase 4 (validado)
- parser editorial do Futebol na TV; ampliacao dos adapters; snapshots imutaveis; historico; estatisticas; evolucao do cache.

### Fase 5 (validado)
- API Keys; painel web; rate limit; scopes; auditoria de uso.

### Fase 6 (validado)
- camada de midia; media pack; assets para banners e thumbnails; referencia de video.

### Fase 7 (em execucao)
- hardening de producao (PM2 + Nginx + TLS + backup);
- observabilidade (metricas, latencia, alertas);
- testes finais de smoke, restauracao e reboot;
- documentacao final do consumidor.

## 10. Criterios de aceite do produto final

- build sem erro;
- API publica versionada em `/api/v1`;
- ingestao funcionando;
- reconciliacao ativa;
- snapshots persistentes;
- API Key operacional;
- painel administrativo funcional;
- media pack disponivel;
- documentacao publicada;
- fluxo GitHub -> aaPanel validado.

## 11. Referencias internas

- [Contrato principal](./api-futebol-producao.md) **(fonte de verdade)**
- [Plano operacional](./plano-producao-final.md)
- [Schema](./schema.md)
- [API Keys e Painel](./api-keys-e-painel.md)
- [Fase 4 detalhada](./fase-4-api-keys-painel-media.md)
- [Camada de midia](./midia-e-media-pack.md)
- [Estabilizacao Fase 4](./estabilizacao-fase-4.md)
- [Roadmap 10/10](./roadmap-10-de-10.md)
- [Guia Lovable](./lovable.md)
- [Fluxo GitHub + Lovable](./fluxo-github-lovable.md)
- [README do projeto](../README.md)
