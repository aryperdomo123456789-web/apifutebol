# API FUT 24/7

Backend NestJS + MariaDB para uma API de futebol 24/7 com jogos ao vivo, agenda, historico de temporadas, eventos de partida, canais/transmissoes e memoria persistente.

> **Status:** Fase 1 concluida - base tecnica (NestJS, config, MariaDB, healthcheck, logging).

---

## Stack oficial

- **NestJS 10** (Node.js 20+)
- **MariaDB 10.6+** via TypeORM
- **pino / nestjs-pino** - logging estruturado
- **@nestjs/terminus** - healthchecks
- **class-validator** - validacao de DTOs e variaveis de ambiente
- Execucao em **VPS / aaPanel**
- **GitHub** como fonte de verdade (codigo gerado no Lovable, executado fora)

## Documentacao principal

- [Plano de producao](/www/wwwroot/apifut.vr766.com/docs/api-futebol-producao.md)
- [Guia final do produto](/www/wwwroot/apifut.vr766.com/docs/guia-final.md)
- [API Keys e painel](/www/wwwroot/apifut.vr766.com/docs/api-keys-e-painel.md)
- [Camada de mídia](/www/wwwroot/apifut.vr766.com/docs/midia-e-media-pack.md)
- [Prompt mestre final](/www/wwwroot/apifut.vr766.com/docs/prompt-mestre-final-lovable.md)
- [Guia para o Lovable](/www/wwwroot/apifut.vr766.com/docs/lovable.md)
- [Fluxo GitHub + Lovable](/www/wwwroot/apifut.vr766.com/docs/fluxo-github-lovable.md)
- [Indice de documentacao](/www/wwwroot/apifut.vr766.com/docs/README.md)

---

## Estrutura de pastas

```
.
|-- src/
|   |-- main.ts                     # Bootstrap Nest
|   |-- app.module.ts               # Modulo raiz
|   |-- config/
|   |   |-- configuration.ts        # Config centralizada (app, log, db, sources)
|   |   `-- env.validation.ts       # Validacao das variaveis de ambiente
|   |-- common/
|   |   `-- logger/
|   |       `-- logger.module.ts    # pino + request-id + redacao
|   |-- database/
|   |   |-- database.module.ts      # TypeORM (MariaDB)
|   |   |-- data-source.ts          # DataSource CLI (migrations)
|   |   `-- migrations/             # (Fase 2)
|   `-- modules/
|       `-- health/
|           |-- health.module.ts
|           `-- health.controller.ts
|-- docs/
|   |-- api-futebol-producao.md
|   |-- lovable.md
|   `-- fluxo-github-lovable.md
|-- database/                       # scripts SQL manuais (opcional)
|-- scripts/                        # utilitarios operacionais
|-- test/                           # testes e2e (fases futuras)
|-- .env.example
|-- nest-cli.json
|-- tsconfig.json
|-- tsconfig.build.json
`-- package.json
```

---

## Requisitos

- Node.js **>= 20.11**
- npm **>= 10** (ou pnpm/yarn equivalentes)
- MariaDB **>= 10.6** rodando local ou acessivel via rede

---

## Execucao local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env
# edite .env com credenciais reais do MariaDB

# 3. Criar o banco (uma vez)
mysql -u root -p -e "CREATE DATABASE apifutebol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'apifut'@'%' IDENTIFIED BY 'change-me'; GRANT ALL ON apifutebol.* TO 'apifut'@'%'; FLUSH PRIVILEGES;"

# 4. Rodar em desenvolvimento (watch + pino-pretty)
npm run start:dev

# 5. Rodar em producao
npm run build
npm run start:prod
```

A API sobe em `http://0.0.0.0:3000/api/v1`.

### Endpoints da Fase 1

| Metodo | Rota                       | Descricao                                     |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/api/v1/health`           | Healthcheck completo (app + MariaDB + memoria)|
| GET    | `/api/v1/health/liveness`  | Liveness simples (sem tocar dependencias)     |

Exemplo:

```bash
curl http://localhost:3000/api/v1/health
```

---

## Migrations (preparado para Fase 2)

```bash
# Gerar nova migration a partir das entidades
npm run migration:generate -- src/database/migrations/NomeDaMigration

# Aplicar migrations pendentes
npm run migration:run

# Reverter a ultima
npm run migration:revert
```

---

## Variaveis de ambiente

Veja `.env.example`. Regras:

- **Nunca** comitar `.env`.
- **Nunca** ativar `DB_SYNCHRONIZE=true` em qualquer ambiente. Schema evolui apenas por migrations.
- Credenciais de fontes externas (Sportmonks, API-Football, TheSportsDB) sao adicionadas nas fases 4-6.

---

## Fluxo Lovable -> GitHub -> aaPanel

1. Lovable gera/atualiza arquivos e faz commit direto no repositorio GitHub.
2. No VPS/aaPanel: `git pull` traz as mudancas.
3. `npm install && npm run build && pm2 restart apifutebol` (ou equivalente).
4. Detalhes em [`docs/fluxo-github-lovable.md`](docs/fluxo-github-lovable.md).

---

## Roadmap por fases

- [x] **Fase 1** - Base do projeto (Nest, config, MariaDB, healthcheck, logging).
- [ ] **Fase 2** - Schema completo (teams, competitions, seasons, matches, events, snapshots, raw_payloads, ingestion_runs, reconciliation_logs).
- [ ] **Fase 3** - API publica basica (`/matches/live`, `/today`, `/yesterday`, `/tomorrow`, detalhes, eventos, broadcasts, competitions, teams, channels, calendar).
- [ ] **Fase 4** - Ingestao e normalizacao (Futebol na TV + fallback).
- [ ] **Fase 5** - API Keys, painel web e controle de acesso.
- [ ] **Fase 6** - Camada de mídia, media pack e assets para banners/videos.
- [ ] **Fase 7** - Historico, snapshots imutaveis + reconciliacao + hardening final.
