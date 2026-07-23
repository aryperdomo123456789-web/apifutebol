# Checklist de Produção — API FUT

Este é o checklist final antes de considerar a API `10/10` estável em produção.
Marque cada item somente após validação real no VPS.

## 1. Build e migrations

- [ ] `npm ci` sem erros
- [ ] `npm run build` sem erros TypeScript
- [ ] `npm run migration:run` aplicado (14 tabelas + snapshots + api_keys)
- [ ] `npm run seed:sources` executado
- [ ] `npm run key:bootstrap -- --name magoadm` executado — chave admin salva em local seguro

## 2. Processo (PM2)

- [ ] `pm2 start deploy/ecosystem.config.js`
- [ ] `pm2 save && pm2 startup` (autostart no boot)
- [ ] Logs em `/var/log/apifut/` com rotação (`logrotate`)

## 3. Nginx + TLS

- [ ] `deploy/nginx.conf` copiado para `/etc/nginx/sites-available/apifut`
- [ ] SSL emitido (Let's Encrypt / aaPanel)
- [ ] Rate limiting ativo (zona configurada)
- [ ] `/metrics` restrito à rede interna (ver `docs/observabilidade.md`)

## 4. Cron

- [ ] `deploy/crontab.example` instalado como usuário da aplicação
- [ ] `snapshot:finals` rodando a cada 30 min
- [ ] `backup.sh` diário às 03:15
- [ ] `restore-test.sh` semanal validando o backup mais recente
- [ ] `smoke` a cada 5 min integrado a alerta (Healthchecks.io ou Uptime Kuma)

## 5. Observabilidade

- [ ] `/health` respondendo 200
- [ ] `/metrics` acessível pelo Prometheus interno
- [ ] Alertas do `docs/observabilidade.md` aplicados
- [ ] Dashboard mínimo no Grafana (RPS, p95, erros 5xx, falhas de ingestão)

## 6. Backup e recuperação

- [ ] Backup diário em `/var/backups/apifut/*.sql.gz`
- [ ] Cópia off-site (S3 / rsync remoto) — recomendo `rclone`
- [ ] Restauração testada pelo cron semanal (log em `/var/log/apifut/restore-test.log`)
- [ ] RPO documentado (24h) e RTO (< 30 min)

## 7. Segurança

- [ ] `.env` fora do repositório (permissões `600`)
- [ ] Todas as rotas públicas exigem `x-api-key` (exceto `/health`, `/metrics` interno, admin UI)
- [ ] Painel admin `/api/v1/admin/ui` atrás de auth básica no Nginx OU IP allowlist
- [ ] Chave `magoadm` NUNCA versionada nem enviada por chat
- [ ] Rate limit ativo por IP e por API key

## 8. Aceitação funcional

- [ ] `npm run smoke` retorna exit 0 em produção
- [ ] `/api/v1/matches/live` responde com dados reais
- [ ] `/api/v1/matches?date=YYYY-MM-DD` traz agenda do dia
- [ ] `/api/v1/history/matches?team=...` retorna partidas anteriores
- [ ] `/api/v1/statistics/teams/:id` responde
- [ ] `/api/v1/media/matches/:id/pack` retorna media pack
- [ ] Painel admin lista sources, keys, runs e reconciliation logs

Quando todos os itens estiverem marcados, considere a API pronta para uso público.
