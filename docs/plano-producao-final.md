# Plano de Producao Final - API FUT

Data: 2026-07-23

Este documento consolida o estado atual do projeto e o que ainda falta para considerar a API FUT realmente pronta para producao 10/10 no aaPanel.

Ele e um documento derivado do plano principal em [api-futebol-producao.md](/www/wwwroot/apifut.vr766.com/docs/api-futebol-producao.md).
Se houver qualquer divergencia, o documento principal define a meta final, os principios e o contrato tecnico.

## 1. Resumo executivo

A API ja possui:

- build passando
- migrations aplicadas
- seed de fontes funcionando
- chave administrativa bootstrapada
- painel admin servindo HTML
- rotas publicas e de historico respondendo
- snapshots imutaveis funcionando
- schema principal persistido em MariaDB

O que ainda impede fechar o projeto como "100% pronto" nao e mais o backend base. O que falta agora e acabamento de producao:

- validacao final no aaPanel com PM2 e Nginx no dominio real
- cron de snapshots e backup em producao
- observabilidade e operacao
- ajuste fino da documentacao para bater 100% com as rotas reais
- testes finais de smoke, regressao e restauracao

## 1.1 Fonte de verdade

O documento principal [api-futebol-producao.md](/www/wwwroot/apifut.vr766.com/docs/api-futebol-producao.md) define:

- a meta final do projeto
- os principios tecnicos
- o contrato de rotas
- o modelo de dados
- as restricoes de arquitetura

Este plano existe para:

- listar o que falta para cumprir a meta final
- ordenar a execucao no aaPanel
- explicitar riscos e criterios de aceite
- manter o fechamento alinhado ao documento principal

## 2. Estado atual validado

### 2.1 Backend

- NestJS sobe com prefixo real `/api/v1`
- `GET /api/v1/health` responde com MariaDB e memoria ok
- `GET /api/v1/health/liveness` responde
- `GET /api/v1/live` responde
- `GET /api/v1/admin/ui` responde HTML
- `GET /api/v1/admin/overview` responde com `X-API-Key`
- `GET /api/v1/history/matches/:id/snapshot` responde snapshot

### 2.2 Banco

- `migrations:run` funciona no MariaDB do aaPanel
- `seed:sources` funciona
- `key:bootstrap` funciona
- tabelas principais presentes:
  - `sources`
  - `competitions`
  - `seasons`
  - `teams`
  - `matches`
  - `match_events`
  - `match_lineups`
  - `match_statistics`
  - `match_broadcasts`
  - `snapshots`
  - `match_snapshots`
  - `api_keys`
  - `api_key_usage`
  - `media_assets`
  - `media_packs`

### 2.3 Ingestao e historico

- `SnapshotService` cria snapshots finais
- `snapshot:finals` executa com sucesso
- `HistoryModule` e `StatisticsModule` estao integrados
- `ApiFootballSource` e o parser de FutebolNaTV estao alinhados aos contratos atuais

## 3. O que falta para fechar 10/10

### 3.1 Producoes real no aaPanel

Falta validar no ambiente definitivo:

- `pm2 start deploy/ecosystem.config.js`
- reload/restart real no processo de producao
- logs persistindo em `/var/log/apifut/`
- Nginx apontando para o processo correto
- dominio real servindo `https`
- headers de seguranca e rate limit ativos

### 3.2 Rotinas automatizadas

Falta garantir em producao:

- cron do `npm run snapshot:finals`
- cron do backup diario
- rotacao/retencao de logs
- verificacao de restauracao do backup

### 3.3 Observabilidade

Ainda falta fechar:

- metricas de ingestao
- contagem de falhas por fonte
- latencia por rota
- alertas basicos de disponibilidade
- dashboard operacional resumido

### 3.4 Documentacao

A documentacao precisa ficar 100% consistente com o estado atual:

- corrigir qualquer referencia antiga a `/v1` para `/api/v1`
- alinhar nomes de endpoints com as rotas reais
- separar o que e "validado" do que e "planejado"
- deixar claro o fluxo oficial de deploy no aaPanel

### 3.5 Testes finais

Ainda faltam:

- smoke test em producao
- validacao de painel com chave em navegador
- validacao de snapshot por partida finalizada
- validacao do endpoint de media pack
- teste de reboot do processo com PM2
- teste de restauracao de banco a partir do backup

## 4. Plano de fechamento

### Fase A - Fechamento operacional

Objetivo: deixar a aplicacao operando como servico real no aaPanel.

Passos:

1. publicar o codigo final no `main`
2. rodar `git pull` no servidor
3. rodar `npm install`
4. rodar `npm run migration:run`
5. rodar `npm run seed:sources`
6. rodar `BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap`
7. rodar `npm run build`
8. subir com `pm2 start deploy/ecosystem.config.js`
9. testar `health`, `live`, `admin/ui`, `history`, `stats`

Critério de aceite:

- app responde no dominio real
- logs persistem
- nenhuma rota critica falha

### Fase B - Hardening de producao

Objetivo: blindar o deploy.

Passos:

1. validar Nginx/reverse proxy
2. validar TLS/HTTPS
3. validar rate limit no proxy
4. validar headers de seguranca
5. validar permissao de IP no painel, se aplicavel
6. validar restart automatico do PM2

Critério de aceite:

- reinicio nao derruba o servico
- `health` continua ok
- rotas protegidas continuam protegidas

### Fase C - Rotinas automaticas

Objetivo: tornar o projeto autossustentavel.

Passos:

1. habilitar cron de snapshots
2. habilitar backup diario
3. testar restauracao do backup
4. registrar saida dos jobs em log proprio

Critério de aceite:

- snapshots continuam sendo gerados
- backup existe e pode ser restaurado

### Fase D - Observabilidade

Objetivo: saber se a API realmente esta saudavel em producao.

Passos:

1. definir metricas minimas
2. contar ingestao por fonte
3. contar erros por job
4. medir latencia de rotas principais
5. expor uma visao operacional simples

Critério de aceite:

- e possivel identificar falha por fonte, rota ou job

### Fase E - Documentacao e QA final

Objetivo: deixar o repositorio pronto para manutencao.

Passos:

1. revisar README
2. revisar docs de API
3. revisar doc do painel admin
4. revisar doc de media pack
5. revisar doc de schema
6. revisar doc de deploy
7. fechar checklist final de aceite

Critério de aceite:

- qualquer pessoa do time consegue subir, validar e operar sem depender de explicacao extra

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
- [x] snapshots finais funcionam

### Infra

- [ ] PM2 em producao real validado
- [ ] Nginx/TLS validado no dominio real
- [ ] logs persistentes configurados
- [ ] cron de snapshots em producao
- [ ] backup diario em producao

### Operacao

- [ ] observabilidade minima definida
- [ ] testes de reboot executados
- [ ] restauracao de backup testada
- [ ] smoke test em producao concluido

### Documentacao

- [ ] README alinhado com rotas reais
- [ ] docs com `/api/v1` padronizado
- [ ] doc de deploy final revisada
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
curl -s http://127.0.0.1:3000/api/v1/live
curl -s http://127.0.0.1:3000/api/v1/admin/ui
```

## 7. Riscos restantes

- divergencia entre documento e rota real
- regressao de schema em future migration
- falha de cron em ambiente novo
- falta de observabilidade no primeiro incidente
- erro de permissao no Nginx ou PM2

## 8. Definicao de pronto

Este projeto pode ser considerado 10/10 quando:

- a API sobe no aaPanel sem erro
- o dominio responde em HTTPS
- o painel admin funciona com a chave bootstrap
- snapshots e backup rodam de forma automatica
- os docs refletem exatamente o comportamento real
- existe rotina de operacao e recuperacao

## 9. Proximo passo recomendado

1. publicar este plano no GitHub
2. seguir a checklist de infra
3. fazer smoke test em producao
4. fechar observabilidade
5. revisar a documentacao final
