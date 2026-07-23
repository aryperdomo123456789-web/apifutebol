# Observabilidade

## Endpoints expostos

| Rota        | Formato                | Auth | Uso                                         |
| ----------- | ---------------------- | ---- | ------------------------------------------- |
| `/health`   | JSON (Terminus)        | não  | uptime checks (Nginx, Uptime Kuma)          |
| `/metrics`  | Prometheus text/plain  | não* | scrape do Prometheus                         |

\* Proteja `/metrics` no Nginx com `allow` restrito à rede do Prometheus, ex:

```nginx
location = /metrics {
  allow 10.0.0.0/8;
  allow 127.0.0.1;
  deny all;
  proxy_pass http://127.0.0.1:3000/metrics;
}
```

## Métricas publicadas

Prefixo padrão `apifut_` (mais as default do `prom-client`: CPU, memória, event loop).

- `apifut_http_requests_total{method,route,status}` — contador de requests HTTP.
- `apifut_http_request_duration_seconds{method,route,status}` — histograma de latência.
- `apifut_ingestion_runs_total{source,cycle,outcome}` — execuções de ingestão (chamar `metrics.ingestionRunsTotal.inc(...)` no `IngestionService`).
- `apifut_ingestion_failures_total{source,cycle,reason}` — falhas por fonte.
- `apifut_ingestion_duration_seconds{source,cycle}` — duração de cada ciclo.

## Alertas recomendados (Prometheus/Alertmanager)

```yaml
groups:
  - name: apifut
    rules:
      - alert: ApifutHighErrorRate
        expr: sum(rate(apifut_http_requests_total{status=~"5.."}[5m]))
              / sum(rate(apifut_http_requests_total[5m])) > 0.02
        for: 10m
        labels: { severity: page }
      - alert: ApifutIngestionFailures
        expr: increase(apifut_ingestion_failures_total[15m]) > 3
        for: 5m
        labels: { severity: warn }
      - alert: ApifutLatencyP95
        expr: histogram_quantile(0.95,
              sum by (le,route) (rate(apifut_http_request_duration_seconds_bucket[5m]))) > 1
        for: 10m
        labels: { severity: warn }
      - alert: ApifutDown
        expr: up{job="apifut"} == 0
        for: 2m
        labels: { severity: page }
```

## Smoke test contínuo

`npm run smoke` executa checks HTTP contra os endpoints principais. Retorna exit code `!= 0` em falha — integre no cron (`deploy/crontab.example`) ou em Healthchecks.io/UptimeKuma.

Variáveis:
- `BASE_URL` — URL pública (ex: `https://apifut.vr766.com`)
- `API_KEY` — chave admin/monitor com acesso mínimo às rotas listadas
- `API_PREFIX` — default `/api/v1`
