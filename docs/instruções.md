# Especificacao Tecnica de Producao - API Completa de Futebol 24/7

Data: 2026-07-22

## 1. Objetivo

Definir, de forma profissional e executavel, a arquitetura de uma API completa de futebol capaz de operar 24 horas por dia, 7 dias por semana, com suporte a:

- jogos ao vivo em tempo real;
- dados recentes do dia, de ontem e de amanha;
- historico antigo e consolidado;
- resultados, eventos, transmissao, canais e detalhes de partida;
- armazenamento automatico e continuo;
- consultas rapidas para front-end, apps e integracoes externas.

Este documento foi elaborado a partir do estudo da logica atual existente no WebPlayer e da leitura da estrutura publica do site `Futebol na TV`, que hoje serve como referencia visual e editorial para a aba de esportes.

## 2. Contexto atual estudado

A implementacao atual da aba de esportes no WebPlayer nao e uma API propria de futebol. Ela funciona como uma camada de leitura e normalizacao sobre paginas HTML publicas.

### 2.1 O que existe hoje

- busca a pagina `https://www.futebolnatv.com.br/jogos-hoje`;
- faz cache curto da resposta;
- extrai jogos, destaques, artigos curtos, competicoes, canais e imagens;
- transforma o HTML em cards estruturados para exibir no WebPlayer;
- aplica fallback para manter a interface funcional quando a fonte falha;
- usa cache local de imagens para times, ligas e paises;
- exibe a agenda em layout responsivo.

### 2.2 Arquivos estudados na base local

- [sportsschedule.php](/www/wwwroot/webplayer.goldvips.site/sportsschedule.php)
- [includes/api_helpers.php](/www/wwwroot/webplayer.goldvips.site/includes/api_helpers.php)
- [includes/site_head.php](/www/wwwroot/webplayer.goldvips.site/includes/site_head.php)
- [includes/catalog_refresh.php](/www/wwwroot/webplayer.goldvips.site/includes/catalog_refresh.php)

### 2.3 Estrutura tecnica ja identificada

O sistema atual ja possui componentes uteis para uma futura API real:

- cache em disco;
- cache por escopo de sessao/servidor;
- limitacao de taxa;
- log de latencia;
- fetch com fallback automatico;
- normalizacao de texto;
- armazenamento de imagens em cache;
- refresh manual com bypass.

## 3. Diagnostico tecnico da solucao atual

O modelo atual e funcional para leitura visual, mas ainda nao atende o nivel de robustez esperado de uma API esportiva completa.

### 3.1 Pontos fortes

- baixa complexidade operacional;
- interface leve;
- resposta rapida quando o cache esta aquecido;
- extracao util de dados de agenda e transmissao;
- fallback resiliente em caso de falha do site fonte;
- boa experiencia mobile.

### 3.2 Limitacoes

- dependencia de HTML publico de terceiros;
- fragilidade se o site fonte alterar classes, IDs ou estrutura;
- ausencia de banco proprio com historico temporal;
- nao existe contrato oficial de API;
- nao ha versionamento de eventos e snapshots;
- o dado ao vivo nao e sustentado por pipeline formal 24/7.

## 4. Visao da API final

A API final precisa deixar de ser apenas uma leitura de pagina e passar a ser uma plataforma de dados esportivos.

### 4.1 Principios de arquitetura

- dado primeiro, interface depois;
- fonte externa como entrada, nao como dependencia unica;
- persistencia historica obrigatoria;
- atualizacao incremental;
- cache curto para tempo real e cache longo para historico;
- publicacao via JSON estavel;
- observabilidade completa;
- tolerancia a falhas e reconcilicao automatica.

### 4.2 Objetivo operacional

A API deve conseguir responder, com consistencia:

- quais jogos estao acontecendo agora;
- quais jogos aconteceram ontem;
- quais jogos estao previstos para hoje e amanha;
- quais canais transmitem cada partida;
- qual e o historico de resultados;
- qual e a evolucao de uma partida ao longo do tempo;
- quais competicoes, times e canais estao envolvidos.

## 5. Escopo funcional da API

### 5.1 Dados obrigatorios

- partidas;
- competicoes;
- times;
- canais;
- transmissoes;
- eventos da partida;
- escalacoes;
- estatisticas;
- placar;
- historico de alteracoes;
- snapshots temporais;
- origem do dado;
- logs de ingestao.

### 5.2 Janelas temporais suportadas

- `live`: em andamento;
- `today`: jogos do dia;
- `yesterday`: jogos encerrados do dia anterior;
- `tomorrow`: agenda futura imediata;
- `historical`: dados antigos consolidados;
- `season`: recorte por temporada;
- `competition`: recorte por competicao;
- `team`: recorte por time.

## 6. Modelo de dados recomendado

### 6.1 Entidades principais

| Entidade | Finalidade |
|---|---|
| `teams` | cadastro padrao de times |
| `competitions` | ligas, copas e fases |
| `matches` | partida principal |
| `match_events` | gols, cartoes, substituicoes, VAR, etc |
| `match_status_history` | historico de status da partida |
| `match_broadcasts` | canais e plataformas de transmissao |
| `match_lineups` | escalacoes e banco de reservas |
| `match_statistics` | estatisticas agregadas e ao vivo |
| `sources` | origem do dado |
| `ingestion_runs` | execucao de jobs de captura |
| `snapshots` | estado temporal versionado |

### 6.2 Estrutura sugerida para `matches`

Campos minimos:

- `id`;
- `external_id`;
- `competition_id`;
- `home_team_id`;
- `away_team_id`;
- `kickoff_at_utc`;
- `kickoff_at_local`;
- `timezone`;
- `status`;
- `period`;
- `home_score`;
- `away_score`;
- `venue`;
- `round_name`;
- `country_code`;
- `source_id`;
- `created_at`;
- `updated_at`.

### 6.3 Estrutura sugerida para `match_events`

Campos minimos:

- `id`;
- `match_id`;
- `event_type`;
- `minute`;
- `second`;
- `period`;
- `team_id`;
- `player_id`;
- `related_player_id`;
- `description`;
- `payload_json`;
- `source_id`;
- `created_at`.

Tipos de evento comuns:

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

### 6.4 Estrutura sugerida para `snapshots`

Cada snapshot deve guardar:

- identificacao da partida;
- placar naquele instante;
- status;
- eventos ja conhecidos;
- transmissao;
- data de captura;
- origem da captura;
- hash do conteudo;
- versao do snapshot.

O snapshot e essencial para:

- auditabilidade;
- rollback conceitual;
- comparacao entre estados;
- debug de inconsistencias;
- recomposicao de historico.

## 7. Fluxo 24/7 de ingestao

### 7.1 Ciclo de atualizacao recomendado

- a cada 30 a 60 segundos para jogos ao vivo;
- a cada 5 minutos para agenda do dia;
- a cada 15 a 30 minutos para a agenda de amanha;
- a cada 6 a 12 horas para jogos encerrados;
- a cada 24 horas para consolidacao e limpeza;
- sempre que houver alteracao relevante em status ou placar.

### 7.2 Pipeline ideal

1. coletar a fonte;
2. validar a resposta;
3. normalizar campos;
4. comparar com o estado anterior;
5. identificar delta;
6. atualizar tabela principal;
7. registrar eventos;
8. gerar snapshot;
9. publicar cache da API;
10. registrar latencia, erro e volume.

### 7.3 Regras de permanencia

- dado alterado nao deve apagar o historico;
- dado ao vivo deve gerar eventos incrementais;
- dado encerrado pode ser congelado com correcao posterior apenas via nova versao;
- toda mudanca relevante deve ser audivel.

## 8. Estrategia de fontes

### 8.1 Fontes primarias

As fontes primarias devem ser divididas em tres grupos:

- agenda editorial publica;
- detalhe de partida;
- provider esportivo com formato estruturado.

### 8.2 Fonte de referencia atual

O site `Futebol na TV` pode seguir como referencia de leitura visual e editorial, mas nao deve ser a unica base do sistema.

### 8.3 Regra de confiabilidade

Se uma fonte quebrar:

- a API deve continuar respondendo com ultimo dado valido;
- o status deve marcar a origem como degradada;
- um job de reconciliacao deve tentar recuperar o feed;
- o historico nunca deve ser perdido por falha de leitura.

## 9. Endpoints recomendados

### 9.1 Publicos

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

### 9.2 Operacionais

- `POST /api/v1/admin/ingest/run`
- `POST /api/v1/admin/ingest/force-refresh`
- `GET /api/v1/admin/ingest/status`
- `GET /api/v1/admin/health`
- `GET /api/v1/admin/metrics`
- `GET /api/v1/admin/snapshots`
- `GET /api/v1/admin/reconciliation`

## 10. Contrato de resposta

### 10.1 Estrutura base de partida

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

### 10.2 Regras do contrato

- campos obrigatorios devem manter nome estavel;
- datas devem vir em ISO 8601;
- horarios locais precisam indicar timezone;
- listas vazias devem retornar array vazio, nunca `null`;
- erro de fonte nao deve quebrar o schema;
- a API deve ser versionada desde o inicio.

## 11. Cache e persistencia

### 11.1 Politica de cache

O desenho ideal combina tres niveis:

- cache curtissimo para live;
- cache curto para agenda do dia;
- cache medio para pagina de detalhe;
- cache longo para historico;
- invalidacao manual para operacao assistida.

### 11.2 O que a base atual ja faz

Em [includes/api_helpers.php](/www/wwwroot/webplayer.goldvips.site/includes/api_helpers.php#L25), a estrutura ja suporta:

- cache simples e scoped;
- leitura de texto e JSON;
- log de latencia;
- rate limit;
- fetch com fallback.

### 11.3 O que a API final precisa acrescentar

- TTL por tipo de recurso;
- invalidaçao por evento;
- revalidacao assincrona;
- fila de consolidacao;
- persistencia historica imutavel;
- snapshots por match e por jornada.

## 12. Operacao 24/7

### 12.1 Jobs minimos

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

### 12.2 Metricas obrigatorias

- numero de jogos ingeridos;
- numero de jogos ativos;
- latencia media por fonte;
- taxa de erro por fonte;
- tempo de resposta da API;
- delta de alteracoes por ciclo;
- volume de snapshots por dia;
- taxa de fallback para cache;
- taxa de reconcilicao bem sucedida.

### 12.3 Healthcheck

O healthcheck precisa avaliar:

- banco disponivel;
- fila de jobs disponivel;
- ultima ingestao recente;
- ultima reconciliacao;
- disponibilidade da fonte principal;
- integridade de cache;
- espaco em disco;
- atraso do pipeline.

## 13. Seguranca

### 13.1 Controles recomendados

- autenticacao para endpoints administrativos;
- separacao entre leitura publica e operacao interna;
- rate limit por IP, token e sessao;
- auditoria de alteracoes;
- headers de seguranca;
- protecao contra abuso de coleta.

### 13.2 Boas praticas

- nao expor segredos em resposta;
- nao confiar na fonte externa como verdade absoluta;
- validar campos antes de persistir;
- sanitizar texto e URLs;
- bloquear corrupcao de snapshot por dado inconsistente.

## 14. Observabilidade

### 14.1 Logs essenciais

- inicio e fim de cada job;
- duracao da coleta;
- duracao do parse;
- quantidade de registros processados;
- quantidade de registros alterados;
- falhas por origem;
- fallback para cache;
- diferenca entre snapshot anterior e atual.

### 14.2 Auditoria minima

- quem disparou refresh;
- quando o refresh aconteceu;
- qual fonte foi consultada;
- qual versao da payload foi publicada;
- qual foi a mudanca entre estados.

## 15. Relacao com a implementacao atual do WebPlayer

### 15.1 O que deve ser reaproveitado conceitualmente

- normalizacao de texto;
- cache curto com fallback;
- cache de imagens;
- segregacao por sessao/usuario;
- refresh manual;
- layout de cards;
- resiliencia visual.

### 15.2 O que nao deve ser mantido como dependencia principal

- parsing direto e exclusivo de HTML de terceiros;
- dependenca unificada em `jogos-hoje`;
- ausencia de modelo persistente;
- ausencia de eventos e snapshots;
- ausencia de contrato JSON estavel.

### 15.3 Leitura tecnica da pagina atual

Hoje o arquivo [sportsschedule.php](/www/wwwroot/webplayer.goldvips.site/sportsschedule.php#L340) ja realiza:

- parse de destaques;
- parse de jogos;
- parse de artigos;
- deduplicacao;
- contagem de competicoes e canais;
- renderizacao responsiva.

Isso demonstra que o front ja foi preparado para consumir um feed estruturado. O proximo passo tecnico e substituir a fonte HTML por uma API propria com a mesma semantica.

## 16. Riscos do modelo de scraping como solucao final

### 16.1 Risco tecnico

Mudancas no HTML da fonte podem quebrar o parser sem aviso.

### 16.2 Risco operacional

Se a fonte estiver lenta, toda a cadeia de leitura pode atrasar.

### 16.3 Risco de historico

Sem persistencia propria, o sistema perde o estado anterior da partida.

### 16.4 Risco de escalabilidade

Scraping puro nao escala bem para volume alto, multiplas consultas e baixa latencia constante.

## 17. Requisitos de producao

Para considerar a API pronta para producao, ela deve atender a todos os itens abaixo:

- responder jogos ao vivo com atualizacao frequente;
- manter dados antigos pesquisaveis;
- preservar historico de eventos;
- registrar snapshots;
- tolerar falha temporaria de fontes;
- manter cache eficiente;
- ter endpoints estaveis;
- ter operacao monitorada;
- suportar integracao com front-end e apps externos;
- ter desenho claro de observabilidade e recuperacao.

## 18. Conclusao executiva

A base atual do WebPlayer ja fornece um bom ponto de partida para a experiencia visual de esportes, mas a API final de futebol precisa ser tratada como um sistema de dados esportivos completo.

Em termos de engenharia, a evolucao correta e:

1. separar a ingestao da apresentacao;
2. persistir historico de forma estruturada;
3. criar snapshots e eventos;
4. publicar JSON estavel;
5. operar com jobs recorrentes 24/7;
6. manter cache, fallback e observabilidade;
7. tratar a fonte externa apenas como entrada auxiliar.

Esse e o caminho para ter:

- dados antigos e novos;
- consulta por jogo, time e competicao;
- resultados e eventos ao vivo;
- transmissao e canais;
- estabilidade operacional de longo prazo.

## 19. Proximos artefatos recomendados

Se necessario, o proximo documento tecnico pode detalhar:

1. o schema SQL completo do banco;
2. o contrato de cada endpoint;
3. a fila de jobs e periodicidade;
4. a estrategia de indices e busca;
5. o plano de deploy e rollback;
6. o desenho da integracao com front-end.

