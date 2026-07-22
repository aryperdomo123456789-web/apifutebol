# Prompt Mestre Final para o Lovable

Este prompt foi escrito para finalizar a `API FUT` em ritmo de producao.

```text
Quero que você finalize a API FUT rumo à produção.

Base obrigatória do repositório:
- README.md
- docs/guia-final.md
- docs/api-keys-e-painel.md
- docs/midia-e-media-pack.md
- docs/api-futebol-producao.md
- docs/schema.md
- docs/lovable.md
- docs/fluxo-github-lovable.md

Contexto:
- Fase 1 pronta: NestJS + MariaDB + healthcheck + logging
- Fase 2 pronta: schema completo + entidades + migration inicial
- Fase 3 em andamento: ingestão multi-fonte, normalização, reconciliação e endpoints públicos
- O projeto deve continuar em NestJS + MariaDB
- GitHub é a fonte de verdade
- aaPanel/VPS é o ambiente de execução e teste

OBJETIVO
Transformar a API FUT em uma API profissional de futebol e mídia, pronta para consumo por:
- sistemas de análise estatística
- ferramentas de automação
- geradores de banners
- geradores de thumbnails
- geradores de vídeos e overlays

ESCOPO OBRIGATÓRIO
1. Corrigir os erros restantes de build e integração da Fase 3
2. Fechar ingestão multi-fonte com isolamento por fonte
3. Fechar normalização e reconciliação
4. Implementar API Key para consumo público
5. Criar painel web administrativo
6. Criar camada de mídia e media pack por partida
7. Documentar tudo de forma profissional
8. Manter o build passando

STACK OBRIGATÓRIA
- NestJS
- TypeScript
- MariaDB
- TypeORM
- pino
- terminus
- schedule
- não trocar stack
- não usar Postgres
- não usar DB_SYNCHRONIZE=true

API PÚBLICA
Manter e finalizar:
- GET /api/v1/live
- GET /api/v1/today
- GET /api/v1/yesterday
- GET /api/v1/tomorrow
- GET /api/v1/matches/:id
- GET /api/v1/matches/:id/events
- GET /api/v1/matches/:id/broadcasts
- GET /api/v1/competitions
- GET /api/v1/competitions/:id
- GET /api/v1/teams
- GET /api/v1/teams/:id
- GET /api/v1/channels
- GET /api/v1/calendar?date=YYYY-MM-DD
- GET /api/v1/search?q=

API KEY E SEGURANÇA
Implementar:
- geração de API key
- revogação
- expiração
- escopos
- rate limit por chave e IP
- logs de uso
- proteção dos endpoints públicos

PAINEL WEB
Criar painel para:
- login admin
- criar e revogar chaves
- ver uso por chave
- ver saude da API
- ver ingestion runs
- ver snapshots
- ver fontes
- ver media packs
- acompanhar consumo

CAMADA DE MIDIA
Criar suporte para:
- logos de times
- logos de competicoes
- logos de canais
- banners
- thumbnails
- backgrounds
- overlays
- media pack de partida
- referencia de video/clipe quando houver licenca

REGRAS OBRIGATÓRIAS
- nao apagar historico
- nao sobrescrever eventos sem versao
- nao hardcodar segredo
- nao inventar contrato diferente do documentado
- nao quebrar o schema atual
- nao remover healthcheck
- nao remover logging estruturado
- manter envelope JSON padronizado
- manter datas em ISO 8601
- manter arrays vazios em vez de null quando aplicavel

CRITERIOS DE ACEITE
Entrega pronta apenas se:
- o projeto compilar sem erro
- a Fase 3 fechar funcionalmente
- API Key estiver operando
- painel administrativo estiver funcional
- media pack estiver implementado
- documentação estiver atualizada
- build continuar passando
- nada da Fase 1 e 2 for quebrado

ENTREGAVEIS ESPERADOS
Quero receber:
- correcoes de build
- codigo das novas camadas
- controllers e services
- middleware/guards de API key
- painel web
- camada de media
- endpoints documentados
- resumo dos arquivos criados
- instrucoes para rodar no aaPanel
- proximo plano de conclusao

COMECE corrigindo o que estiver quebrado na Fase 3.
Depois implemente API Key.
Depois implemente o painel.
Depois implemente a camada de mídia.
```

