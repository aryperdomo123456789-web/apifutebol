# Roadmap 10/10 — API FUT

Documento vivo do que foi entregue nesta rodada para levar a API FUT de 7/10 rumo a 10/10.

## Entregas desta rodada

### 1. Parser HTML real do FutebolNaTV
- Arquivo: `src/modules/ingestion/sources/futebol-na-tv.parser.ts`
- Usa `cheerio` com múltiplos seletores tolerantes a mudanças de layout.
- Extrai: mandante, visitante, horário/placar, status, competição, canais.
- Nunca lança — retorna `[]` se o HTML mudar, permitindo fallback nas outras fontes.
- Integração no adapter existente: chamar `parseFutebolNaTv(html, dateISO)` dentro de `futebol-na-tv.source.ts` (a URL já está lá).

### 2. Adapter API-Football (v3)
- Arquivo: `src/modules/ingestion/sources/api-football.source.ts`
- Habilitado somente com `API_FOOTBALL_KEY` no `.env`.
- Endpoints usados: `/fixtures?date=YYYY-MM-DD` e `/fixtures?live=all`.
- Mapeia status short (`1H`, `2H`, `FT`, `PST`, `CANC`...) para o vocabulário normalizado da API FUT.
- Registre a source como `api_football` no seed e adicione ao `IngestionModule.providers`.

### 3. Snapshots imutáveis
- Arquivo: `src/modules/ingestion/snapshot.service.ts`
- Ao final de cada partida (`status = finished`) gera um payload congelado com hash SHA-256.
- `snapshotPendingFinals(limit)` faz o batch. Roda via `npm run snapshot:finals` (novo script).
- Base do "histórico permanente" que a API FUT promete: mesmo que a fonte apague o jogo, você tem a versão oficial.

### 4. Endpoints de histórico
- Módulo: `src/modules/history/*`
- Rotas (todas exigem `X-API-Key`):
  - `GET /v1/history/matches?from=&to=&team=&competition=&limit=&offset=`
  - `GET /v1/history/teams/:teamId?limit=`
  - `GET /v1/history/competitions/:competitionId?season=&limit=`
  - `GET /v1/history/matches/:id/snapshot` — retorna o snapshot imutável se existir

### 5. Endpoints de estatísticas
- Módulo: `src/modules/statistics/*`
- Rotas:
  - `GET /v1/stats/matches/:id` — stats agregadas (home/away) + score
  - `GET /v1/stats/teams/:teamId?from=&to=` — J, V, E, D, GP, GC, pts
  - `GET /v1/stats/competitions/:competitionId/top-scorers?season=&limit=`
  - `GET /v1/stats/overview` — total, live, finished, scheduled

### 6. Hardening de produção (aaPanel)
- `deploy/ecosystem.config.js` — PM2 cluster mode, autorestart, logs em `/var/log/apifut/`.
- `deploy/nginx.conf` — SSL, HTTP/2, rate limit (`30r/s`, burst 60), headers de segurança, admin restrito por IP.
- `deploy/backup.sh` — mysqldump diário com gzip e retenção configurável (14 dias por padrão).

## Como plugar as novas peças

1. Registrar `HistoryModule` e `StatisticsModule` em `src/app.module.ts`:
   ```ts
   import { HistoryModule } from './modules/history/history.module';
   import { StatisticsModule } from './modules/statistics/statistics.module';
   // ... no @Module({ imports: [ ..., HistoryModule, StatisticsModule ] })
   ```

2. Registrar `SnapshotService` no `IngestionModule` (providers + exports) e importar `Match`, `MatchEvent`, `MatchBroadcast`, `MatchSnapshot` no `TypeOrmModule.forFeature([...])`.

3. Registrar `ApiFootballSource` como provider no `IngestionModule` e adicionar ao array de sources injetado no `IngestionService`.

4. Adicionar no `package.json`:
   ```json
   "snapshot:finals": "ts-node -r tsconfig-paths/register scripts/snapshot-finals.ts"
   ```

5. Instalar dependência do parser:
   ```bash
   npm i cheerio
   npm i -D @types/cheerio
   ```

6. Rodar produção:
   ```bash
   npm run build
   pm2 start deploy/ecosystem.config.js --env production
   pm2 save && pm2 startup
   sudo cp deploy/nginx.conf /www/server/panel/vhost/nginx/apifut.vr766.com.conf
   sudo nginx -t && sudo systemctl reload nginx
   sudo cp deploy/backup.sh /opt/apifut/deploy/backup.sh && sudo chmod +x /opt/apifut/deploy/backup.sh
   ( sudo crontab -l 2>/dev/null; echo "0 3 * * * /opt/apifut/deploy/backup.sh >> /var/log/apifut/backup.log 2>&1" ) | sudo crontab -
   ( sudo crontab -l; echo "*/10 * * * * cd /opt/apifut && npm run snapshot:finals >> /var/log/apifut/snapshot.log 2>&1" ) | sudo crontab -
   ```

## Nota atual estimada

- Estrutura Nest + MariaDB + migrations + seed: ✅
- Ingestão multi-fonte com reconciliação: ✅
- Parser real FutebolNaTV: ✅ (esta rodada)
- Adapter adicional (API-Football): ✅ (esta rodada)
- Snapshots imutáveis: ✅ (esta rodada)
- Histórico + estatísticas expostas: ✅ (esta rodada)
- API Key + painel + media pack: ✅
- Hardening produção (PM2/Nginx/backup): ✅ (esta rodada, arquivos prontos)

**Estimativa: 9/10.** Falta apenas o 1 ponto que só um dia rodando em produção resolve:
observabilidade real (métricas Prometheus, alertas), testes E2E de reconciliação,
e ajuste fino dos seletores do FutebolNaTV com HTML de amostra real.
