# API Keys e Painel Administrativo

Data: 2026-07-22

## 1. Objetivo

Esta camada existe para transformar a `API FUT` em um produto profissional consumível por terceiros.

O consumo da API deve ser controlado por:

- chaves de API;
- escopos;
- rate limit;
- auditoria;
- painel administrativo.

## 2. Requisitos de API Key

Cada chave deve possuir:

- identificador unico;
- secret seguro;
- status ativo ou revogado;
- data de expiracao opcional;
- escopos de acesso;
- limite de requisições por janela;
- historico de uso;
- vinculo com cliente ou integracao.

## 3. Modelo recomendado

Entidades sugeridas:

- `api_clients`
- `api_keys`
- `api_key_scopes`
- `api_key_usage_logs`
- `api_key_revocations`
- `admin_users`
- `admin_sessions`
- `audit_logs`

## 4. Escopos sugeridos

- `matches.read`
- `competitions.read`
- `teams.read`
- `channels.read`
- `calendar.read`
- `media.read`
- `admin.read`
- `admin.write`

## 5. Painel administrativo

### 5.1 Funcoes obrigatorias

- login de admin;
- criar chave;
- listar chaves;
- revogar chave;
- renovar chave;
- definir escopos;
- definir expiracao;
- visualizar uso;
- visualizar erros;
- visualizar ingestion runs;
- visualizar snapshots;
- visualizar saude da API.

### 5.2 Fluxo de uso

1. admin entra no painel;
2. cria um cliente;
3. gera uma chave;
4. define escopos;
5. configura limite;
6. copia a chave uma vez;
7. integra na ferramenta externa;
8. acompanha uso no painel.

## 6. Endpoints de administracao

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/clients`
- `POST /api/v1/admin/keys`
- `GET /api/v1/admin/keys`
- `GET /api/v1/admin/keys/:id`
- `PATCH /api/v1/admin/keys/:id/revoke`
- `PATCH /api/v1/admin/keys/:id/rotate`
- `GET /api/v1/admin/usage`
- `GET /api/v1/admin/health`
- `GET /api/v1/admin/ingestion-runs`
- `GET /api/v1/admin/snapshots`

## 7. Protecao de endpoints publicos

Todos os endpoints publicos devem aceitar:

- `x-api-key`
- ou `Authorization: Bearer <token>`

Regras:

- chave ausente -> 401;
- chave invalida -> 401;
- chave revogada -> 403;
- escopo insuficiente -> 403;
- limite excedido -> 429;
- chave expirada -> 403;
- uso sempre auditado.

## 8. Rate limit

O rate limit deve ser aplicado por:

- chave;
- IP;
- rota;
- janela temporal.

Sugestao:

- live: limite mais restrito;
- today/tomorrow: limite moderado;
- search/calendar: limite moderado;
- media: limite moderado;
- admin: limite ainda mais restrito.

## 9. Auditoria

Registrar:

- criacao de chave;
- revogacao;
- rotacao;
- login de admin;
- falhas de autenticacao;
- excesso de rate;
- alteracao de escopos;
- chamadas por chave.

## 10. Painel web recomendado

### 10.1 Telas

- dashboard principal;
- chaves de API;
- clientes;
- uso e consumo;
- ingestao e jobs;
- snapshots;
- fontes;
- saude do sistema;
- documentos para desenvolvedores.

### 10.2 Indicadores

- chamadas por chave;
- chamadas por rota;
- erros por chave;
- uso por periodo;
- status das fontes;
- ultima ingestao;
- ultima reconciliacao;
- latencia media;
- cache hit ratio.

## 11. Experiencia para o consumidor final

A API deve parecer um produto profissional:

- contrato previsivel;
- doc publica clara;
- chaves controladas;
- exemplos de resposta;
- pagina de status;
- limites transparentes;
- integração simples para analise estatistica.

## 12. Critérios de aceite

- chave cria e revoga;
- uso aparece no painel;
- escopos funcionam;
- rate limit funciona;
- endpoints exigem autenticacao;
- logs de uso existem;
- documentação mostra como integrar;
- build e execução continuam funcionando.

