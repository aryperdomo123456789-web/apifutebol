# API Mago Pro

Especificação oficial da API central do ecossistema **Gerador Pro / Gerador Mago**.

Este documento descreve o estado atual do projeto, o destino arquitetural desejado e o caminho de evolução para uma API própria, independente do laboratório legado, capaz de sustentar:

- painel administrativo da API
- geração de banners
- geração de vídeos
- geração de artes
- histórico de gerações
- arquivos e mídia
- jobs assíncronos
- métricas e administração
- autenticação e API keys
- especializações em futebol, NBA e UFC

## 1. Objetivo do Produto

A **API Mago Pro** deve ser o motor central do produto.

Ela precisa operar como uma plataforma de backend capaz de atender:

1. o painel administrativo interno da própria API
2. futuras aplicações SaaS externas
3. integrações automáticas com módulos de geração
4. especializações por nicho esportivo e por formato de mídia

O objetivo final não é depender do laboratório legado como sistema principal, mas sim usar o legado apenas como referência de comportamento, navegação e fluxo.

## 2. Estado Atual do Projeto

O backend atual já fornece uma base sólida em NestJS com:

- autenticação por API Key
- painel admin interno
- media pack e assets
- histórico
- ingestão de dados
- métricas
- módulo de saúde
- módulo de fontes
- módulo de partidas
- módulo de estatísticas
- painel Gerador Mago

### 2.1 Módulos já existentes

Arquivos atuais relevantes:

- [src/modules/api-keys/api-keys.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/api-keys/api-keys.controller.ts)
- [src/modules/admin/admin.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/admin/admin.controller.ts)
- [src/modules/media/media.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/media/media.controller.ts)
- [src/modules/history/history.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/history/history.controller.ts)
- [src/modules/metrics/metrics.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/metrics/metrics.controller.ts)
- [src/modules/ingestion/ingestion.module.ts](/www/wwwroot/apifut.vr766.com/src/modules/ingestion/ingestion.module.ts)
- [src/modules/gerador-mago/gerador-mago.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/gerador-mago/gerador-mago.controller.ts)
- [src/modules/gerador-mago/gerador-mago.html.ts](/www/wwwroot/apifut.vr766.com/src/modules/gerador-mago/gerador-mago.html.ts)

### 2.2 O que isso já prova

Hoje a base já consegue:

- gerar e revogar chaves de acesso
- controlar acesso por escopos
- expor painel administrativo da API
- listar histórico e mídia
- medir uso e operar com rate limit
- funcionar atrás do aaPanel, Nginx e PM2

O que ainda falta é transformar isso em uma **API de produto completa**, voltada ao Gerador Pro.

## 3. Direção Estratégica

O nome oficial do backend deve ser:

**API Mago Pro**

Ela será a camada técnica que alimenta o futuro SaaS `geradorpd.vr766.com`.

### 3.1 Papel da API Mago Pro

A API deve ser responsável por:

- autenticação e autorização
- controle de clientes e chaves
- geração de conteúdo
- persistência de mídia
- histórico e rastreabilidade
- operação assíncrona
- observabilidade
- admin interno

### 3.2 Papel do SaaS futuro

O SaaS futuro deve apenas consumir a API:

- painel do cliente
- login web
- consumo de créditos/plano
- visualização de resultados
- chamadas para geração

O SaaS não deve conter a lógica principal de geração.

## 4. Domínios Funcionais

A API Mago Pro deve ser organizada por domínios.

### 4.1 Auth

Responsável por:

- login
- refresh de sessão
- troca de credenciais
- emissão de token
- validação de permissões

### 4.2 API Keys

Responsável por:

- criar chaves
- revogar chaves
- listar uso por chave
- definir escopos
- limitar taxa de uso

Escopos recomendados:

- `read:admin`
- `write:admin`
- `read:media`
- `write:media`
- `read:history`
- `read:public`
- `write:generators`
- `read:metrics`
- `write:metrics`

### 4.3 Admin

Responsável por:

- visão geral da operação
- dados de fontes
- runs de ingestão
- snapshots
- packs de mídia
- chaves
- status geral

### 4.4 Media

Responsável por:

- assets
- packs
- imagens
- banners
- vídeos
- metadados de arquivo

### 4.5 History

Responsável por:

- histórico por time
- histórico por competição
- snapshots imutáveis
- rastreio de gerações

### 4.6 Metrics

Responsável por:

- métricas Prometheus
- uso de rotas
- contagem de chamadas
- latência
- saúde operacional

### 4.7 Jobs

Responsável por:

- filas assíncronas
- geração demorada
- retry
- status de processamento
- webhooks internos

### 4.8 Generators

Responsável por:

- banners
- vídeos
- artes
- variações
- modelos

### 4.9 Specialties

Responsável por módulos especializados:

- futebol
- NBA
- UFC

## 5. O que a API deve entregar

## 5.1 API de autenticação

Deve suportar:

- login com usuário e senha
- token de sessão
- renovação
- logout
- proteção por escopos

## 5.2 API de geração de banners

Deve suportar:

- banner de futebol
- banner de NBA
- banner de UFC
- banner de filmes
- banner de séries/novelas
- variações por template
- exportação em imagem final

## 5.3 API de geração de vídeo

Deve suportar:

- criação de vídeo a partir de template
- vídeo de divulgação
- parâmetros de layout
- fila de processamento
- retorno de artefato final

## 5.4 API de geração de artes

Deve suportar:

- artes estáticas
- capas
- thumbnails
- logos
- variações por tema

## 5.5 API de histórico de gerações

Deve suportar:

- listar gerações por usuário
- listar gerações por tipo
- filtrar por data
- recuperar artefatos anteriores

## 5.6 API de arquivos e mídia

Deve suportar:

- upload
- referência de URL
- versionamento
- associação com entidade
- reconstrução de pack

## 5.7 API de jobs assíncronos

Deve suportar:

- criação de job
- fila
- status
- erro
- sucesso
- cancelamento

## 5.8 API de métricas e admin

Deve suportar:

- overview operacional
- uso por chave
- saúde
- consumo
- erros
- rate limit

## 5.9 API especializada em futebol

Deve incluir:

- templates de futebol
- banner de partida
- foco em competição, time, mando, visitante, hora e rodada

## 5.10 API especializada em NBA

Deve incluir:

- templates de basquete
- times
- conferência
- placar
- destaque

## 5.11 API especializada em UFC

Deve incluir:

- templates de luta
- card
- peso
- round
- destaque

## 6. Convenções de Resposta

A API deve seguir o padrão já usado no backend atual:

```json
{
  "data": {},
  "meta": {
    "generatedAt": "2026-08-04T00:00:00.000Z",
    "source": "api-mago-pro",
    "version": "v1"
  }
}
```

### 6.1 Regras

- toda resposta pública ou administrativa deve retornar `data` e `meta`
- erros devem ser padronizados
- endpoints de listagem devem paginação quando necessário
- objetos de mídia devem carregar `id`, `url`, `type`, `status`, `created_at`

## 7. Arquitetura Ideal

### 7.1 Camada de entrada

- Nginx
- aaPanel
- PM2
- NestJS

### 7.2 Camada da API

- auth
- api-keys
- admin
- media
- history
- metrics
- generators
- specialties
- jobs

### 7.3 Camada de dados

- MariaDB
- storage para mídia
- histórico persistente
- tabela de jobs
- tabela de chaves

### 7.4 Camada de observabilidade

- métricas
- logs
- health check
- auditoria

## 8. Modelo de Dados Recomendado

### 8.1 `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `active`
- `created_at`
- `updated_at`

### 8.2 `api_keys`

- `id`
- `prefix`
- `name`
- `owner`
- `scopes`
- `active`
- `rate_limit_per_minute`
- `rate_limit_per_day`
- `expires_at`
- `revoked_at`
- `last_used_at`
- `created_at`

### 8.3 `jobs`

- `id`
- `type`
- `status`
- `payload`
- `result`
- `error`
- `started_at`
- `finished_at`

### 8.4 `media_assets`

- `id`
- `entity_kind`
- `entity_id`
- `kind`
- `url`
- `width`
- `height`
- `format`
- `license`
- `credit`
- `metadata`
- `created_at`

### 8.5 `history_entries`

- `id`
- `entity_kind`
- `entity_id`
- `payload`
- `created_at`

### 8.6 `metrics_snapshots`

- `id`
- `route`
- `count`
- `latency_ms`
- `created_at`

## 9. Painel Administrativo da API

O painel admin da API deve permanecer separado do SaaS.

### 9.1 Funções do painel

- criar chave
- revogar chave
- ver consumo por chave
- ver fontes
- ver runs
- ver snapshots
- ver packs
- ver jobs
- ver mídia

### 9.2 Endpoints já existentes como base

- `/api/v1/admin/overview`
- `/api/v1/admin/sources`
- `/api/v1/admin/runs`
- `/api/v1/admin/snapshots`
- `/api/v1/admin/ui`
- `/api/v1/admin/api-keys`
- `/api/v1/admin/api-keys/:id`
- `/api/v1/admin/api-keys/:id/usage`

Esses endpoints já mostram que a base atual está preparada para evoluir em direção à API Mago Pro.

## 10. Portal Gerador Mago Como Referência

O portal atual em `gerador-mago` é útil como mapa de experiência.

Ele já valida:

- organização por cards
- navegação lateral
- módulos do legado
- leitura do `mago_extraction.json`
- abertura dos módulos antigos

Isso deve ser usado apenas como referência visual e estrutural para os módulos futuros da API Mago Pro.

## 11. Especializações de Esporte

### 11.1 Futebol

Deve continuar sendo o núcleo mais completo:

- banner de partida
- divisões
- campeonato
- time mandante
- time visitante
- escudo
- placar
- horário
- estilo do template

### 11.2 NBA

Deve ter estrutura própria:

- time mandante
- time visitante
- placar
- conferência
- rodadas
- tema visual

### 11.3 UFC

Deve ter estrutura própria:

- atleta A
- atleta B
- card
- peso
- evento
- round

## 12. Jobs Assíncronos

Gerar mídia e vídeo não deve travar request web.

### 12.1 Fluxo recomendado

1. cliente envia payload
2. API cria um job
3. worker processa
4. API salva histórico
5. API salva mídia
6. API responde com status e URL final

### 12.2 Estados do job

- `queued`
- `running`
- `done`
- `failed`
- `cancelled`

## 13. Segurança

### 13.1 Regras obrigatórias

- não commitar segredos em GitHub
- `.env` de produção deve ficar na VPS
- chaves admin devem ter escopo mínimo necessário
- rotas administrativas devem exigir guard
- rotas públicas devem ser explícitas

### 13.2 Rate limit

- por IP
- por chave
- por rota sensível

### 13.3 Auditoria

- criar registro de criação de chave
- registrar revogação
- registrar alterações administrativas
- registrar falhas críticas

## 14. Roadmap Recomendado

### Fase 1

- consolidar auth
- consolidar API keys
- consolidar admin
- consolidar métricas

### Fase 2

- criar jobs
- criar mídia
- criar histórico de gerações

### Fase 3

- implementar generators base
- banner
- vídeo
- arte

### Fase 4

- implementar specialty football
- implementar specialty NBA
- implementar specialty UFC

### Fase 5

- estabilizar observabilidade
- documentação final
- preparar SaaS futuro

## 15. Critérios de Pronto

A API Mago Pro só deve ser considerada pronta quando:

- conseguir autenticar usuários e chaves
- gerar banners e mídias sem depender do lab legado
- registrar histórico
- salvar e listar mídia
- operar jobs assíncronos
- expor métricas
- ter painel admin funcional
- suportar futebol, NBA e UFC como especializações
- servir como base direta para o futuro SaaS `geradorpd.vr766.com`

## 16. Conclusão

A **API Mago Pro** é a evolução natural do projeto atual.

Ela transforma a antiga ideia de “API de futebol” em uma plataforma completa para o ecossistema Gerador Pro:

- backend próprio
- painel administrativo próprio
- geração de conteúdo
- histórico e mídia
- módulos esportivos
- especializações por nicho
- base pronta para SaaS

O laboratório legado deixa de ser o produto final e passa a ser apenas uma referência de transição.
