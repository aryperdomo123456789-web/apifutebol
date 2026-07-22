# API FUT 24/7 - Documentacao de Producao

Data: 2026-07-22

## 1. Proposito

Este documento descreve, de forma executavel e profissional, a especificacao completa da `API FUT`, uma API de futebol 24/7 para:

- agenda de jogos de hoje, ontem e amanha;
- jogos ao vivo;
- eventos de partida;
- transmissao e canais;
- resultados e historico;
- snapshots temporais;
- memoria persistente por temporada, competicao, time e partida;
- consulta rapida por front-end, apps e sistemas analiticos.

O objetivo e orientar a construcao da API de forma que ela possa ser produzida por um builder como o Lovable, com criterios claros de arquitetura, dados, ingestao, observabilidade, seguranca e entrega.

## 2. Resultado Esperado

A solucao final deve operar como uma plataforma de dados esportivos, e nao como um simples scraper.

Ela precisa:

- manter dados atuais sempre acessiveis;
- preservar o historico integral;
- reconciliar informacoes vindas de multiplas fontes;
- continuar respondendo mesmo quando uma fonte externa falhar;
- publicar JSON estavel e versionado;
- suportar crescimento sem reescrever a arquitetura.

## 3. Contexto Atual

A implementacao existente no WebPlayer funciona como camada de leitura e normalizacao sobre paginas HTML publicas, especialmente o site `Futebol na TV`.

O comportamento atual, em alto nivel, inclui:

- leitura de agenda publica;
- extração de jogos, canais, destaques e competicoes;
- cache curto;
- fallback automatico;
- renderizacao responsiva;
- cache local de imagens e assets.

Isso e util como ponto de partida, mas ainda nao atende um fluxo de producao 24/7 com memoria historica propria.

## 4. Principios de Arquitetura

### 4.1 Regras-base

- dado primeiro, interface depois;
- fonte externa e entrada, nao verdade absoluta;
- persistencia historica e obrigatoria;
- cada alteracao relevante deve gerar trilha;
- snapshots sao imutaveis;
- o contrato da API nao deve quebrar entre versoes;
- live e cache curto; historico e cache longo.

### 4.2 Objetivo tecnico

A API precisa responder com consistencia:

- quais jogos estao ao vivo agora;
- quais jogos ocorreram ontem;
- quais jogos estao agendados para hoje e amanha;
- quais canais transmitem cada partida;
- qual e o historico de uma partida ao longo do tempo;
- quais competicoes, times e temporadas estao envolvidos;
- qual foi a origem de cada dado.

## 5. Fontes de Dados Recomendadas

O desenho correto e multifuente. Abaixo estao as fontes recomendadas para cada tipo de dado.

### 5.1 Agenda editorial e transmissao

- [Futebol na TV](https://www.futebolnatv.com.br/)

Papel:

- agenda de jogos;
- canais e plataformas;
- horario de inicio;
- paginas por partida;
- referencia editorial para a experiencia atual do WebPlayer.

Uso recomendado:

- como fonte de leitura e normalizacao;
- nao como unica dependencia do sistema;
- sem replicar integralmente textos editoriais;
- com cache e reconstrucao controlada.

### 5.2 Historico aberto e temporadas antigas

- [football-data.co.uk](https://www.football-data.co.uk/)
- [openfootball](https://openfootball.github.io/)
- [TheSportsDB](https://www.thesportsdb.com/)
- [TheSportsDB API Guide](https://www.thesportsdb.com/docs_api_guide)

Papel:

- backfill historico;
- temporadas antigas;
- datasets publicos;
- consolidacao de resultados;
- enriquecimento de catalogo.

### 5.3 Live, fixtures, eventos e lineups

- [Sportmonks Football API](https://www.sportmonks.com/football-api/)
- [Sportmonks Fixtures](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/livescores-and-fixtures/fixtures)
- [Sportmonks Events](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/includes/events)
- [API-Football](https://www.api-football.com/)
- [API-Football Docs](https://www.api-sports.io/documentation/football/v3)

Papel:

- jogos ao vivo;
- eventos;
- estatisticas;
- lineups;
- dados estruturados para produção.

### 5.4 Regra de escolha de fonte

Se houver conflito entre fontes:

1. priorizar a fonte especializada para dado ao vivo;
2. priorizar a fonte com maior completude historica para backfill;
3. usar o `Futebol na TV` como referencia editorial para canais e agenda;
4. registrar divergencias em `reconciliation_logs`;
5. nunca perder o historico original.

## 6. Arquitetura Proposta

### 6.1 Stack recomendada

- `NestJS` para a API principal;
- `MariaDB` para persistencia;
- `Redis` opcional para cache e filas;
- `Nginx` ou `Caddy` como reverse proxy;
- `Docker` para ambientes reproduciveis;
- `Cron` ou worker de fila para ingestao;
- logs estruturados em JSON;
- observabilidade com alertas e metricas.

### 6.2 Componentes da solucao

- API publica;
- API administrativa;
- Ingestor de fontes;
- Normalizador;
- Motor de snapshots;
- Persistencia historica;
- Cache multi-TTL;
- Reconciliacao automatica;
- Monitoramento;
- Backfill de temporadas;
- Rebuild de indices de busca.

### 6.3 Fluxo macro

1. coletar fonte;
2. validar resposta;
3. normalizar entidades;
4. deduplicar;
5. comparar com estado anterior;
6. calcular delta;
7. persistir estado atual;
8. gravar eventos;
9. gerar snapshot;
10. publicar cache;
11. registrar logs e metricas.

## 7. Modelo de Dados

### 7.1 Tabelas principais

- `teams`
- `competitions`
- `seasons`
- `matches`
- `match_events`
- `match_status_history`
- `match_broadcasts`
- `match_lineups`
- `match_statistics`
- `sources`
- `ingestion_runs`
- `snapshots`
- `raw_payloads`
- `reconciliation_logs`
- `admin_audit_logs`

### 7.2 Entidade `matches`

Campos minimos:

- `id`
- `external_id`
- `source_id`
- `competition_id`
- `season_id`
- `home_team_id`
- `away_team_id`
- `kickoff_at_utc`
- `kickoff_at_local`
- `timezone`
- `status`
- `period`
- `home_score`
- `away_score`
- `venue`
- `round_name`
- `country_code`
- `created_at`
- `updated_at`

### 7.3 Entidade `match_events`

Campos minimos:

- `id`
- `match_id`
- `source_event_id`
- `event_type`
- `minute`
- `second`
- `period`
- `team_id`
- `player_id`
- `related_player_id`
- `description`
- `payload_json`
- `source_id`
- `created_at`

Tipos de evento:

- gol;
- cartao amarelo;
- cartao vermelho;
- substituicao;
- penalti;
- gol anulado;
- VAR;
- inicio de partida;
- intervalo;
- fim de partida.

### 7.4 Entidade `snapshots`

Cada snapshot deve guardar:

- identificacao da partida;
- placar no instante da captura;
- status;
- eventos conhecidos;
- transmissao;
- data da captura;
- origem;
- hash do conteudo;
- versao do snapshot.

### 7.5 Regras de integridade

- nenhum evento relevante pode ser apagado sem trilha;
- snapshots sao append-only;
- `external_id` deve ser unico por fonte;
- todo registro de live precisa de `source_id`;
- toda correcao posterior gera nova versao;
- a tabela principal guarda o estado atual consolidado.

## 8. Contrato de API

### 8.1 Endpoints publicos

- `GET /api/v1/matches/live`
- `GET /api/v1/matches/today`
- `GET /api/v1/matches/yesterday`
- `GET /api/v1/matches/tomorrow`
- `GET /api/v1/matches/{id}`
- `GET /api/v1/matches/{id}/events`
- `GET /api/v1/matches/{id}/broadcasts`
- `GET /api/v1/competitions`
- `GET /api/v1/competitions/{id}/matches`
- `GET /api/v1/teams`
- `GET /api/v1/teams/{id}`
- `GET /api/v1/teams/{id}/matches`
- `GET /api/v1/channels`
- `GET /api/v1/search?q=`
- `GET /api/v1/calendar/day?date=YYYY-MM-DD`

### 8.2 Endpoints operacionais

- `POST /api/v1/admin/ingest/run`
- `POST /api/v1/admin/ingest/force-refresh`
- `GET /api/v1/admin/ingest/status`
- `GET /api/v1/admin/health`
- `GET /api/v1/admin/metrics`
- `GET /api/v1/admin/snapshots`
- `GET /api/v1/admin/reconciliation`

### 8.3 Regras do contrato

- datas em ISO 8601;
- timezone explicito;
- listas vazias sempre retornam `[]`;
- erros de fonte nao quebram o schema;
- a API deve ser versionada desde o inicio;
- campos obrigatorios precisam permanecer estaveis.

### 8.4 Exemplo de resposta

```json
{
  "id": "match_123",
  "competition": {
    "id": "comp_45",
    "name": "Brasileirao Serie A"
  },
  "home_team": {
    "id": "team_1",
    "name": "Internacional"
  },
  "away_team": {
    "id": "team_2",
    "name": "Cruzeiro"
  },
  "kickoff_at": "2026-07-22T21:30:00-03:00",
  "status": "scheduled",
  "score": {
    "home": 0,
    "away": 0
  },
  "broadcasts": [
    {
      "name": "GLOBO",
      "type": "tv"
    },
    {
      "name": "PREMIERE 3",
      "type": "stream"
    }
  ],
  "source": "futebolnatv",
  "updated_at": "2026-07-22T18:10:00Z"
}
```

## 9. Ingestao 24/7

### 9.1 Frequencia recomendada

- live: a cada 30 a 60 segundos;
- hoje: a cada 5 minutos;
- amanha: a cada 15 a 30 minutos;
- jogos encerrados: a cada 6 a 12 horas;
- consolidacao diaria: 1 vez por dia;
- backfill historico: em lote.

### 9.2 Jobs minimos

- `ingest_today`
- `ingest_live`
- `ingest_yesterday`
- `ingest_tomorrow`
- `sync_match_details`
- `sync_match_events`
- `sync_broadcasts`
- `sync_competitions`
- `sync_teams`
- `rebuild_search_indexes`
- `reconcile_source_diffs`
- `cleanup_cache`
- `archive_snapshots`

### 9.3 Regras operacionais

- cada job precisa de `run_id`;
- cada job precisa gravar inicio, fim e duracao;
- toda falha precisa gerar evento de log;
- a API deve continuar respondendo com o ultimo dado valido;
- a reconciliacao deve tentar recuperar a consistencia automaticamente.

## 10. Cache e Persistencia

### 10.1 Politica de cache

- live: cache curtissimo;
- hoje: cache curto;
- detalhe da partida: cache medio;
- historico: cache longo;
- admin: sem cache ou TTL minimo.

### 10.2 Estrutura de persistencia

Recomendacao:

- tabela principal para estado consolidado;
- tabela de eventos para append-only;
- tabela de snapshots para auditoria temporal;
- tabela de payload bruto para debug e reconstrucao;
- tabela de runs para rastreabilidade;
- tabelas auxiliares para busca e reconciliacao.

### 10.3 O que nunca deve acontecer

- sobrescrever historico sem versao;
- perder eventos ao reconciliar;
- salvar null onde vazio resolve melhor sem motivo;
- depender da resposta de uma unica fonte;
- impedir a API de responder por falha temporaria da fonte.

## 11. Observabilidade

### 11.1 Metricas obrigatorias

- numero de jogos ingeridos;
- numero de jogos ativos;
- latencia media por fonte;
- taxa de erro por fonte;
- tempo de resposta da API;
- volume de deltas por ciclo;
- snapshots por dia;
- taxa de fallback para cache;
- taxa de reconciliacao bem sucedida;
- atraso do pipeline.

### 11.2 Logs essenciais

- inicio e fim do job;
- duracao da coleta;
- duracao do parse;
- registros processados;
- registros alterados;
- falhas por origem;
- fallback para cache;
- diff entre snapshots.

### 11.3 Healthcheck

O healthcheck precisa validar:

- banco disponivel;
- fila ou cron disponivel;
- ultima ingestao recente;
- ultima reconciliacao;
- disponibilidade da fonte principal;
- integridade do cache;
- espaco em disco;
- atraso do pipeline.

## 12. Seguranca

### 12.1 Controles essenciais

- autenticacao para endpoints administrativos;
- rate limit por IP, token e sessao;
- separacao entre leitura publica e operacao interna;
- headers de seguranca;
- auditoria de alteracoes;
- protecao contra abuso de coleta.

### 12.2 Boas praticas

- nao expor segredos em resposta;
- validar campos antes de persistir;
- sanitizar texto e URLs;
- tratar fonte externa como dado nao confiavel;
- bloquear snapshot inconsistente;
- manter credenciais fora do codigo.

### 12.3 Credenciais

Se houver credenciais de banco, API ou painel, elas devem ficar em:

- `.env`;
- secrets manager;
- variaveis de ambiente do servidor;
- vault, se disponivel.

Nao versionar credenciais no repositorio.

## 13. Deploy e Infraestrutura

### 13.1 Ambiente assumido

- dominio principal: `apifut.vr766.com`
- banco: MariaDB
- aplicacao: NestJS
- reverse proxy: Nginx ou Caddy
- TLS: Let’s Encrypt
- deploy: container ou processo gerenciado

### 13.2 Variaveis de ambiente minimas

- `APP_ENV`
- `APP_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_SSL`
- `CACHE_TTL_LIVE`
- `CACHE_TTL_TODAY`
- `CACHE_TTL_DETAIL`
- `SOURCE_FUTEBOLNATV_ENABLED`
- `SOURCE_THESPORTSDB_ENABLED`
- `SOURCE_OPENFOOTBALL_ENABLED`
- `SOURCE_SPORTMONKS_ENABLED`
- `SOURCE_APIFOOTBALL_ENABLED`
- `ADMIN_TOKEN`
- `LOG_LEVEL`

## 14. Plano de Implementacao para Lovable

### Fase 0 - Fundacao

- [ ] criar projeto NestJS;
- [ ] configurar variaveis de ambiente;
- [ ] criar conexao com MariaDB;
- [ ] criar healthcheck;
- [ ] configurar logging estruturado;
- [ ] definir migracoes iniciais;
- [ ] montar pipeline de build e deploy.

### Fase 1 - Agenda e transmissao

- [ ] coletar jogos do `Futebol na TV`;
- [ ] extrair jogos de hoje, ontem e amanha;
- [ ] mapear canais;
- [ ] normalizar times e competicoes;
- [ ] salvar no banco;
- [ ] publicar endpoints basicos.

### Fase 2 - Historico

- [ ] importar `openfootball`;
- [ ] importar `football-data.co.uk`;
- [ ] importar temporadas da `TheSportsDB`;
- [ ] montar chaves unificadas;
- [ ] gerar snapshots historicos;
- [ ] publicar consultas por temporada, time e competicao.

### Fase 3 - Live e eventos

- [ ] integrar `Sportmonks` ou `API-Football`;
- [ ] sincronizar eventos;
- [ ] sincronizar lineups e estatisticas;
- [ ] montar reconciliacao por delta;
- [ ] publicar endpoint live.

### Fase 4 - Operacao 24/7

- [ ] agendar jobs;
- [ ] configurar alertas;
- [ ] habilitar backups;
- [ ] validar restore;
- [ ] monitorar latencia;
- [ ] rodar go-live assistido.

## 15. Checklist de Producao

### 15.1 Arquitetura

- [ ] fonte principal definida por tipo de dado;
- [ ] fallback por fonte ativo;
- [ ] banco com chaves e indices;
- [ ] snapshots imutaveis;
- [ ] trilha de auditoria;
- [ ] versionamento de API;
- [ ] cache por recurso;
- [ ] estrategia de reconciliacao.

### 15.2 Banco de Dados

- [ ] tabelas criadas;
- [ ] indices em `kickoff_at_utc`, `status`, `competition_id`, `season_id`, `home_team_id`, `away_team_id`;
- [ ] unique keys para IDs externos;
- [ ] backup automatico;
- [ ] restore testado;
- [ ] retenção definida;
- [ ] migrations versionadas;
- [ ] privilégio minimo aplicado.

### 15.3 Ingestao

- [ ] coleta automatica funcionando;
- [ ] parser tolerante a HTML quebrado;
- [ ] deduplicacao ativa;
- [ ] delta gerado por mudanca;
- [ ] erro de fonte nao derruba a API;
- [ ] historico preservado;
- [ ] logs completos.

### 15.4 API Publica

- [ ] respostas padronizadas;
- [ ] datas em ISO 8601;
- [ ] arrays vazios sem `null`;
- [ ] paginação disponivel;
- [ ] filtros documentados;
- [ ] erros consistentes;
- [ ] CORS ajustado ao consumo.

### 15.5 Seguranca

- [ ] admin protegido;
- [ ] rate limit ligado;
- [ ] headers de seguranca ativos;
- [ ] segredos fora do codigo;
- [ ] sanitizacao aplicada;
- [ ] logs sem dado sensivel;
- [ ] acesso ao banco restrito.

### 15.6 Operacao

- [ ] healthcheck publico;
- [ ] metricas publicadas;
- [ ] alertas de falha de ingestao;
- [ ] alerta de atraso do pipeline;
- [ ] backup diario;
- [ ] teste de restauracao;
- [ ] reconciliacao automatica.

## 16. Riscos e Mitigacoes

### 16.1 Risco: HTML mudar

Mitigacao:

- usar parser tolerante;
- isolar a fonte editorial como camada de entrada;
- manter normalizacao e fallback.

### 16.2 Risco: fonte lenta ou indisponivel

Mitigacao:

- cache do ultimo dado valido;
- reconciliação automatica;
- fila de reprocessamento;
- monitoramento de uptime.

### 16.3 Risco: perda de historico

Mitigacao:

- snapshots append-only;
- eventos imutaveis;
- backups frequentes;
- restauracao testada.

### 16.4 Risco: baixa escalabilidade

Mitigacao:

- cache por janela temporal;
- jobs assicronos;
- indice adequado;
- separacao de leitura e escrita.

## 17. Regras de Aceite

O projeto pode ser considerado pronto para producao quando:

- a API responder com o schema versionado;
- os dados de hoje, ontem e amanha estiverem consistentes;
- o live estiver com polling e reconciliacao;
- o historico estiver preservado;
- snapshots estiverem ativos;
- o healthcheck estiver funcional;
- os jobs estiverem automatizados;
- o backup e restore estiverem testados;
- a documentacao estiver publicada;
- os segredos estiverem fora do repositorio.

## 18. Referencias Oficiais

- [Futebol na TV](https://www.futebolnatv.com.br/)
- [Futebol na TV - Jogos de hoje](https://www.futebolnatv.com.br/jogos-hoje)
- [Futebol na TV - Jogos de amanha](https://www.futebolnatv.com.br/jogos-amanha)
- [Futebol na TV - Canais](https://www.futebolnatv.com.br/canais)
- [football-data.co.uk](https://www.football-data.co.uk/)
- [football-data.org API](https://www.football-data.org/documentation/api)
- [TheSportsDB](https://www.thesportsdb.com/)
- [TheSportsDB API Guide](https://www.thesportsdb.com/docs_api_guide)
- [TheSportsDB API Data](https://www.thesportsdb.com/docs_api_data)
- [openfootball](https://openfootball.github.io/)
- [openfootball GitHub](https://github.com/openfootball)
- [Sportmonks Football API](https://www.sportmonks.com/football-api/)
- [Sportmonks Fixtures Docs](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/livescores-and-fixtures/fixtures)
- [Sportmonks Events Docs](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/includes/events)
- [Sportmonks Livescores Docs](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/livescores-and-fixtures/livescores)
- [API-Football](https://www.api-football.com/)
- [API-Football Docs](https://www.api-sports.io/documentation/football/v3)

## 19. Nota de Implementacao

Este documento foi escrito para servir como base de producao, especificacao tecnica e guia de implementacao. Ele pode ser usado para:

- abrir issues;
- criar schema SQL;
- montar as rotas NestJS;
- definir jobs;
- planejar backfill;
- orientar o Lovable na construcao;
- alinhar front-end, back-end e ingestao.

