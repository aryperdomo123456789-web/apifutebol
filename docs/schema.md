# Schema — API FUT (Fase 2)

Banco: **MariaDB 10.5+**, charset `utf8mb4`, collation `utf8mb4_unicode_ci`, engine `InnoDB`.

Todas as tabelas de domínio vindas de fonte externa possuem:

- `source_id` (FK → `sources.id`)
- `external_id` (id cru da fonte)
- `UNIQUE (source_id, external_id)`
- `created_at` / `updated_at` com precisão de microssegundos

## Entidades

### Núcleo
- **sources** — catálogo de fontes com `priority` (menor = mais confiável)
- **competitions** — competição/torneio
- **seasons** — temporadas (com `start_date`/`end_date` e `is_current`)
- **teams** — clubes/seleções

### Partida
- **matches** — partida + placar full/HT/FT/ET/PEN, status, minuto, sede
- **match_events** — gols, cartões, subs, VAR... *(append-only, `revised_of` para correções)*
- **match_status_history** — série temporal de transições de status/placar *(append-only)*
- **match_broadcasts** — canais e streams por partida
- **match_lineups** — escalação por (match, team, source), formação, banco
- **match_statistics** — stats agregadas por (match, team, source)

### Memória / Auditoria
- **ingestion_runs** — 1 linha por execução de worker/job
- **snapshots** — snapshot IMUTÁVEL por entidade (dedup por `content_hash`)
- **raw_payloads** — corpo bruto original das respostas de fonte
- **reconciliation_logs** — trilha de conflitos, overrides e merges

## Regras de integridade

1. **Nunca `DELETE` em snapshots/eventos.** Correção vira nova linha.
2. **`synchronize: false`** em qualquer ambiente. Só migration muda schema.
3. **UNIQUE (source_id, external_id)** em toda entidade externa.
4. **FKs com `ON DELETE RESTRICT`** para `sources` — nunca perder ancoragem histórica.
5. **FKs de partida para competition/season/team** usam `SET NULL` — a partida sobrevive mesmo se metadados forem re-mapeados.

## ERD (resumo)

```text
sources ─┬─< competitions ─< seasons
         ├─< teams
         ├─< matches ─┬─< match_events
         │           ├─< match_status_history
         │           ├─< match_broadcasts
         │           ├─< match_lineups
         │           └─< match_statistics
         ├─< ingestion_runs ─┬─< snapshots
         │                   ├─< raw_payloads
         │                   └─< reconciliation_logs
         └─< snapshots / raw_payloads / recon_logs (via source_id)
```

## Seed inicial de `sources`

Executado dentro da migration `InitialSchema1737000000000` (e também disponível via `npm run seed:sources` para re-upsert):

| slug                  | kind     | priority |
| --------------------- | -------- | -------- |
| futebol_na_tv         | scrape   | 10       |
| sportmonks            | api      | 20       |
| api_football          | api      | 25       |
| thesportsdb           | api      | 30       |
| openfootball          | dataset  | 60       |
| football_data_co_uk   | dataset  | 70       |

## Comandos

```bash
# Gerar migration a partir das mudanças nas entidades
npm run migration:generate --name=NomeDaMudanca

# Aplicar migrations pendentes
npm run migration:run

# Reverter a última migration
npm run migration:revert

# Re-seed idempotente de sources
npm run seed:sources
```
