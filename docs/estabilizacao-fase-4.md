# Fase 4 — Estabilização

Este documento consolida o fechamento da Fase 4 (API Keys, painel administrativo e camada de mídia) e descreve o fluxo oficial de bootstrap em produção no aaPanel.

## O que foi estabilizado

- **Script npm `key:bootstrap`** adicionado ao `package.json`. Executa `scripts/bootstrap-admin-key.ts` com `ts-node` e a mesma configuração de paths dos outros scripts CLI. O script bypassa a API HTTP e insere direto via `DataSource`, então não depende do guard nem de nenhuma chave pré-existente.
- **`ApiKeysService.countInWindow`** reescrito para uma única query (`createQueryBuilder` com `api_key_id` + `created_at >= from`). A versão anterior encadeava um `count` descartado antes do query real.
- **Guard `ApiKeyGuard`** confirmado como global via `ApiKeysModule` e mantém o contrato:
  - `@Public()` → libera qualquer rota.
  - `@RequireScopes(...)` → exige `X-API-Key` (ou `Authorization: Bearer ...`) e os escopos declarados.
  - Rotas cujo path contém `/admin` ou `/media` exigem chave, mesmo sem decorator.
  - Rate limit por IP: **120 req/min**, aplicado antes de tudo.
- **Contratos de resposta** dos endpoints Fase 3 (`/v1/live`, `/v1/today`, `/v1/matches/:id`, etc.) continuam com o envelope `{ data, meta }` — nenhuma quebra.

## Bootstrap da primeira chave (nome `magoadm`)

No servidor (aaPanel / VPS), depois de rodar migrations e seeds:

```bash
git pull
npm install
npm run migration:run
npm run seed:sources

# gera a chave administrativa "magoadm" (idempotente — reexecutar reativa se estiver revogada)
BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap
```

A saída no console mostra a chave em texto **uma única vez**, no formato:

```
API key bootstrap gerada para "magoadm": fut_XXXXXXXX.<secret>
```

Copie e guarde em cofre. A chave nasce com todos os escopos:

- `read:public`, `read:matches`, `read:media`, `read:admin`, `write:admin`

E limites: **120 req/min** e **10.000 req/dia**.

## Uso da chave

Header em todas as chamadas protegidas:

```
X-API-Key: fut_XXXXXXXX.<secret>
```

Endpoints com escopo obrigatório:

| Endpoint                              | Escopo         |
|---------------------------------------|----------------|
| `GET /v1/admin/api-keys`              | `write:admin`  |
| `POST /v1/admin/api-keys`             | `write:admin`  |
| `DELETE /v1/admin/api-keys/:id`       | `write:admin`  |
| `GET /v1/admin/stats`                 | `read:admin`   |
| `GET /v1/admin/ui`                    | público (HTML) |
| `POST /v1/media/assets`               | `write:admin`  |
| `GET /v1/media/pack/:matchId`         | `read:media`   |

## Painel administrativo

1. Rodar `npm run start:prod` (ou `start:dev`) e apontar o Nginx para a porta do serviço.
2. Abrir `http://SEU_HOST/v1/admin/ui`.
3. Colar a chave `magoadm` no campo do topo. O painel salva no `localStorage` do navegador e injeta em todas as chamadas.
4. Abas: **Chaves**, **Sources**, **Runs**, **Mídia**.

## Camada de mídia

- `POST /v1/media/assets` grava um asset (`kind` = `logo | banner | overlay | thumbnail`, `url`, `team_id?`, `competition_id?`).
- `POST /v1/media/pack/:matchId/rebuild` monta o pack agregando logos dos times, banner da competição e overlays, gera um `version_hash` (SHA-256 do conteúdo) e persiste.
- `GET /v1/media/pack/:matchId` retorna o pack cacheado (rebuild só ocorre quando ausente ou quando o `version_hash` muda).

## O que não mudou (por design)

- Stack: **NestJS 10 + MariaDB + TypeORM**.
- `DB_SYNCHRONIZE` permanece `false`. Alterações de schema só via migration.
- Nenhum segredo hardcoded. Config vem do `.env` validado por `class-validator`.
- Histórico de dados continua imutável (snapshots + raw payloads).

## Próxima fase (sugerida)

- Endpoints de histórico agregado (`/v1/history/season/:id`, `/v1/history/team/:id`).
- Adapters restantes (API-Football, ESPN) e parser HTML real de `futebolnatv`.
- Dashboard com métricas de ingestão (últimos runs, reconciliações, latência por source).
- Rotação/expiração automática de API keys inativas.
