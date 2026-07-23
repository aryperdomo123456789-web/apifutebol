# Plano de Producao Final - API FUT

Data: 2026-07-23 (revisao)

Este documento consolida o estado atual do projeto e o que ainda falta para considerar a API FUT 10/10 no aaPanel. Ele e um **plano derivado** do contrato principal em [`api-futebol-producao.md`](./api-futebol-producao.md). Se houver divergencia, o contrato principal prevalece.

## 1. Resumo executivo

A API ja possui:

- build passando
- migrations aplicadas
- seed de fontes funcionando
- chave administrativa bootstrapada (`magoadm`)
- painel admin servindo HTML
- rotas publicas, historico, stats, media pack e snapshots funcionando
- schema principal persistido em MariaDB (`matches`, `match_events`, `match_snapshots`, `api_keys`, `api_key_usage`, `media_assets`, `media_packs` etc.)
- **observabilidade base**: `/metrics` Prometheus + `MetricsInterceptor` global + contadores dedicados (`apifut_http_*`, `apifut_ingestion_*`)
- `npm run smoke` cobrindo health, metrics, live, calendar, competitions e admin

O que ainda impede fechar como "100% pronto" nao e mais o backend base. E acabamento de producao:

- validacao final no aaPanel com PM2 e Nginx no dominio real
- cron de snapshots, backup e restore-test em producao
- instrumentar `IngestionService` com `metrics.ingestionRunsTotal` / `ingestionFailuresTotal` / `ingestionDuration`
- alertas Prometheus/Alertmanager conforme [`observabilidade.md`](./observabilidade.md)
- testes finais de smoke, regressao e restauracao

## 2. Estado atual validado

### 2.1 Backend
- NestJS sobe com prefixo real `/api/v1`
- `GET /api/v1/health` responde com MariaDB e memoria ok
- `GET /api/v1/health/liveness` responde
- `GET /api/v1/live` responde
- `GET /api/v1/admin/ui` responde HTML
- `GET /api/v1/admin/overview` responde com `X-API-Key`
- `GET /api/v1/history/matches/:id/snapshot` responde snapshot
- `GET /api/v1/media/match/:id/pack` responde media pack
- `GET /metrics` responde formato Prometheus

### 2.2 Banco
- `migration:run` funciona no MariaDB do aaPanel
- `seed:sources` funciona
- `key:bootstrap` funciona

### 2.3 Ingestao e historico
- `SnapshotService` cria snapshots finais
- `snapshot:finals` executa com sucesso
- `HistoryModule` e `StatisticsModule` integrados
- `ApiFootballSource` e o parser de FutebolNaTV alinhados aos contratos atuais

## 3. O que falta para fechar 10/10

### 3.1 Producao real no aaPanel
- `pm2 start deploy/ecosystem.config.js`
- reload/restart real no processo de producao
- logs persistindo em `/var/log/apifut/`
- Nginx apontando para o processo correto
- dominio real servindo `https`
- headers de seguranca e rate limit ativos
- `location = /metrics` restrito a rede do Prometheus (ver `docs/observabilidade.md`)

### 3.2 Rotinas automatizadas (`deploy/crontab.example`)
- cron do `npm run snapshot:finals`
- cron do backup diario (`deploy/backup.sh`)
- restore-test semanal (`deploy/restore-test.sh`)
- rotacao/retencao de logs
- smoke a cada 5 min alimentando Uptime Kuma / Healthchecks.io

### 3.3 Observabilidade (fechar loop)
- instrumentar `IngestionService` com os contadores ja registrados no `MetricsService`
- publicar alertas do `docs/observabilidade.md` no Alertmanager
- dashboard operacional resumido (Grafana ou painel proprio)

### 3.4 Documentacao
- contrato principal `api-futebol-producao.md` como referencia unica (feito)
- README alinhado as rotas reais (feito)
- separar "validado" de "planejado" em todo texto (feito)
- deixar claro o fluxo oficial de deploy no aaPanel (feito nesta revisao)

### 3.5 Testes finais
- `npm run smoke` em producao
- validacao do painel com chave em navegador
- validacao de snapshot por partida finalizada
- validacao do endpoint de media pack
- teste de reboot do processo com PM2
- teste de restauracao de banco (`deploy/restore-test.sh`)

## 4. Plano de fechamento

### Fase A - Fechamento operacional
Objetivo: aplicacao operando como servico real no aaPanel.

1. publicar o codigo final no `main`
2. `git pull` no servidor
3. `npm install`
4. `npm run migration:run`
5. `npm run seed:sources`
6. `BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap`
7. `npm run build`
8. `pm2 start deploy/ecosystem.config.js`
9. testar `health`, `live`, `admin/ui`, `history`, `stats`, `metrics`

### Fase B - Hardening
1. Nginx / reverse proxy
2. TLS / HTTPS
3. rate limit no proxy
4. headers de seguranca
5. `location = /metrics` restrito por IP
6. restart automatico do PM2

### Fase C - Rotinas automaticas
1. `crontab deploy/crontab.example`
2. verificar `/var/log/apifut/` populando
3. rodar `deploy/restore-test.sh` manualmente uma vez
4. registrar smoke em Uptime Kuma / Healthchecks.io

### Fase D - Observabilidade final
1. instrumentar `IngestionService`
2. subir Prometheus + Alertmanager
3. importar alertas de `docs/observabilidade.md`
4. dashboard operacional simples

### Fase E - Documentacao e QA final
1. revisar README
2. revisar contrato principal
3. revisar doc do painel admin
4. revisar doc de media pack
5. revisar doc de schema
6. revisar doc de deploy
7. fechar checklist final de aceite (`docs/producao-checklist.md`)

## 5. Checklist final de producao

### Backend
- [x] build passa
- [x] migrations aplicam
- [x] seed de fontes aplica
- [x] bootstrap de chave aplica
- [x] app sobe em `/api/v1`
- [x] health responde
- [x] painel admin responde
- [x] history responde
- [x] stats responde
- [x] media pack responde
- [x] snapshots finais funcionam
- [x] `/metrics` responde

### Infra
- [ ] PM2 em producao real validado
- [ ] Nginx/TLS validado no dominio real
- [ ] `/metrics` protegido no Nginx
- [ ] logs persistentes configurados
- [ ] cron de snapshots em producao
- [ ] backup diario em producao
- [ ] restore-test semanal validado

### Operacao
- [ ] IngestionService instrumentado com metricas
- [ ] alertas Prometheus ativos
- [ ] testes de reboot executados
- [ ] restauracao de backup testada
- [ ] smoke test em producao concluido

### Documentacao
- [x] contrato principal reflete escopo real (media, api-keys, painel, historico, stats, metrics)
- [x] README alinhado com rotas reais
- [x] docs com `/api/v1` padronizado
- [ ] doc de deploy final revisada com ambiente real
- [ ] doc de aceite final fechada

## 6. Sequencia recomendada de deploy

```bash
git pull origin main
npm install
npm run migration:run
npm run seed:sources
BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap
npm run build
pm2 start deploy/ecosystem.config.js
```

Depois:

```bash
curl -s http://127.0.0.1:3000/api/v1/health
curl -s http://127.0.0.1:3000/api/v1/live -H "X-API-Key: $KEY"
curl -s http://127.0.0.1:3000/api/v1/admin/ui | head
curl -s http://127.0.0.1:3000/metrics | head
BASE_URL=https://apifut.vr766.com API_KEY=$KEY npm run smoke
```

## 7. Riscos restantes

- divergencia entre documento e rota real (mitigado nesta revisao)
- regressao de schema em futura migration
- falha de cron em ambiente novo
- falta de instrumentacao do IngestionService (sem visibilidade de falhas por fonte)
- erro de permissao no Nginx ou PM2

## 8. Definicao de pronto

Este projeto pode ser considerado 10/10 quando:

- a API sobe no aaPanel sem erro
- o dominio responde em HTTPS
- o painel admin funciona com a chave bootstrap
- snapshots, backup e restore-test rodam automaticos
- IngestionService alimenta as metricas Prometheus
- os docs refletem exatamente o comportamento real
- existe rotina de operacao e recuperacao

## 9. Proximo passo recomendado

1. deploy real no aaPanel (Fase A)
2. hardening Nginx/TLS (Fase B)
3. cron + backup + restore-test (Fase C)
4. instrumentar IngestionService + alertas (Fase D)
5. revisar documentacao final (Fase E)
