# API FUT - Guia Final de Produto e Producao

Data: 2026-07-22

## 1. Visao do produto

A `API FUT` deve evoluir para uma plataforma profissional de futebol capaz de atender tres frentes ao mesmo tempo:

- dados esportivos em tempo real e historicos;
- consumo por ferramentas de analise estatistica;
- consumo por geradores de banners, thumbnails, overlays e videos.

O produto final nao e apenas uma API de partidas. Ele e um ecossistema com:

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

- `API pública`
- `Painel administrativo`
- `Ingestão de fontes`
- `Normalização`
- `Reconciliação`
- `Persistência histórica`
- `Cache`
- `Camada de mídia`
- `Observabilidade`
- `Segurança e API Keys`

### 3.2 Fluxo geral

1. coletar dados de fontes externas;
2. armazenar payload bruto;
3. normalizar entidades;
4. reconciliar conflitos por prioridade;
5. atualizar estado consolidado;
6. gerar snapshot;
7. publicar resposta JSON estável;
8. registrar métricas, logs e uso por chave;
9. servir mídia e assets quando disponíveis.

## 4. Contrato da API pública

### 4.1 Padrão de resposta

Toda resposta deve seguir envelope:

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

### 4.2 Regras obrigatórias

- datas em ISO 8601;
- timezone explícito;
- arrays vazios em vez de `null` quando aplicável;
- campos estáveis;
- erros de fonte não quebram o schema;
- a versão da API é fixa em `/api/v1`.

### 4.3 Endpoints públicos principais

- `GET /api/v1/live`
- `GET /api/v1/today`
- `GET /api/v1/yesterday`
- `GET /api/v1/tomorrow`
- `GET /api/v1/matches/:id`
- `GET /api/v1/matches/:id/events`
- `GET /api/v1/matches/:id/broadcasts`
- `GET /api/v1/competitions`
- `GET /api/v1/competitions/:id`
- `GET /api/v1/teams`
- `GET /api/v1/teams/:id`
- `GET /api/v1/channels`
- `GET /api/v1/calendar?date=YYYY-MM-DD`
- `GET /api/v1/search?q=`

## 5. Fontes de dados

### 5.1 Fontes editoriais e de agenda

- [Futebol na TV](https://www.futebolnatv.com.br/)

Uso:

- agenda;
- canais;
- horário;
- referência editorial.

### 5.2 Fontes históricas

- [TheSportsDB](https://www.thesportsdb.com/)
- [football-data.co.uk](https://www.football-data.co.uk/)
- [openfootball](https://openfootball.github.io/)

Uso:

- backfill;
- temporadas antigas;
- catalogação;
- histórico consolidado.

### 5.3 Fontes ao vivo / estruturadas

- [Sportmonks](https://www.sportmonks.com/football-api/)
- [API-Football](https://www.api-football.com/)

Uso:

- live;
- eventos;
- lineups;
- estatísticas;
- eventos estruturados.

## 6. Memoria eterna

A memoria eterna da API nao depende de uma unica tabela. Ela depende da combinacao de:

- `matches` como estado consolidado;
- `match_events` como trilha de eventos;
- `match_status_history` como historico de status;
- `snapshots` como estados imutaveis;
- `raw_payloads` como prova bruta;
- `reconciliation_logs` como auditoria de conflito;
- `ingestion_runs` como rastreio operacional.

## 7. Camada de media

A API deve evoluir para fornecer tambem material visual para geradores externos:

- logos de times;
- logos de competicoes;
- logos de canais;
- banners de partida;
- thumbnails;
- overlays;
- backgrounds;
- media packs por jogo;
- referencia de clips de video quando houver origem/licenca valida.

Importante:

- imagens e logos podem ser servidas como assets;
- videos completos so podem existir quando a fonte permitir legalmente;
- a API deve guardar origem e licenca de cada asset;
- o media pack deve acompanhar a partida.

## 8. API Key e painel web

O produto final deve oferecer:

- criacao de chaves de acesso;
- revogacao de chaves;
- expiracao;
- escopos por recurso;
- rate limit por chave;
- logs de uso;
- painel para administracao;
- monitoramento da ingestao e da saude do sistema.

## 9. Roadmap de conclusao

### Fase 1

- base NestJS;
- MariaDB;
- healthcheck;
- logging;
- configuracao.

### Fase 2

- schema completo;
- entidades;
- migration inicial;
- seed de sources.

### Fase 3

- ingestao multi-fonte;
- normalizacao;
- reconcilacao;
- endpoints publicos basicos.

### Fase 4

- parser editorial do Futebol na TV;
- ampliacao dos adapters;
- snapshots imutaveis;
- historico e estatisticas;
- evolucao do cache.

### Fase 5

- API Keys;
- painel web;
- rate limit;
- scopes;
- auditoria de uso.

### Fase 6

- camada de media;
- media pack;
- assets para banners e thumbnails;
- referencia de video;
- integracao com geradores externos.

### Fase 7

- hardening de producao;
- observabilidade;
- backup;
- testes de restauraçao;
- documentação final do consumidor.

## 10. Critérios de aceite do produto final

- build sem erro;
- API pública versionada;
- ingestão funcionando;
- reconciliação ativa;
- snapshots persistentes;
- API Key operacional;
- painel administrativo funcional;
- media pack disponível;
- documentação publicada;
- fluxo GitHub -> aaPanel validado.

## 11. Referencias internas

- [README do projeto](/www/wwwroot/apifut.vr766.com/README.md)
- [Guia para o Lovable](/www/wwwroot/apifut.vr766.com/docs/lovable.md)
- [Fluxo GitHub + Lovable](/www/wwwroot/apifut.vr766.com/docs/fluxo-github-lovable.md)
- [Schema](/www/wwwroot/apifut.vr766.com/docs/schema.md)
- [API Keys e Painel](/www/wwwroot/apifut.vr766.com/docs/api-keys-e-painel.md)
- [Camada de Mídia](/www/wwwroot/apifut.vr766.com/docs/midia-e-media-pack.md)
- [Prompt Mestre Final](/www/wwwroot/apifut.vr766.com/docs/prompt-mestre-final-lovable.md)

