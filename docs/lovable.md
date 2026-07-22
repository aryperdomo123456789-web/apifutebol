# Guia para o Lovable

## Papel do Lovable

O Lovable deve atuar como executor de implementacao a partir desta documentacao. A meta e gerar a base funcional da `API FUT` com foco em producao, sem quebrar o contrato de dados e sem remover memoria historica.

## O que deve ser lido antes de codar

1. [Plano de producao](/www/wwwroot/apifut.vr766.com/docs/api-futebol-producao.md)
2. [Fluxo GitHub + Lovable](/www/wwwroot/apifut.vr766.com/docs/fluxo-github-lovable.md)
3. [README do projeto](/www/wwwroot/apifut.vr766.com/README.md)

## Objetivo de implementacao

Entregar uma API de futebol 24/7 com:

- ingestao multi-fonte;
- memoria historica persistente;
- snapshots imutaveis;
- resposta JSON estavel;
- jobs automatizados;
- endpoints publicos e administrativos;
- healthcheck e observabilidade.

## Ordem de construcao recomendada

### Fase 1

- criar a base do projeto NestJS;
- configurar conexao MariaDB;
- implementar configuracao via `.env`;
- criar healthcheck;
- criar logs estruturados;
- criar estrutura modular.

### Fase 2

- criar schema inicial do banco;
- modelar `teams`, `competitions`, `seasons`, `matches`, `match_events`, `snapshots` e `ingestion_runs`;
- implementar migrations;
- garantir chaves externas e indices.

### Fase 3

- implementar ingestao da agenda do Futebol na TV;
- implementar normalizacao de dados;
- persistir dados consolidados;
- publicar endpoints de agenda e detalhes.

### Fase 4

- integrar fontes historicas;
- implementar backfill por temporada;
- armazenar payload bruto;
- gerar snapshots;
- criar reconciliacao.

### Fase 5

- integrar provider live;
- implementar eventos e lineups;
- criar polling e delta engine;
- expor endpoints live.

## Regras obrigatorias

- nunca apagar historico;
- nunca expor segredos;
- nunca quebrar o schema sem versao nova;
- nunca depender de uma fonte unica;
- sempre salvar `source_id`;
- sempre salvar `updated_at`;
- sempre registrar erros de ingestao.

## Padroes de resposta

- datas em ISO 8601;
- listas vazias como `[]`;
- campos estaveis;
- respostas com `status` coerente;
- erros previsiveis e documentados;
- nada de `null` onde a API puder devolver uma lista vazia.

## Checklist de aceite

- [ ] API sobe localmente
- [ ] MariaDB conecta
- [ ] healthcheck responde
- [ ] schema inicial criado
- [ ] ingestao basica funciona
- [ ] endpoint de matches existe
- [ ] snapshot gravado
- [ ] logs aparecem
- [ ] commit e push funcionam

## Resultado esperado

Ao final, o Lovable deve devolver:

- codigo fonte organizado;
- migrations e schema;
- rotas publicas e administrativas;
- scripts de ingestao;
- documentacao tecnica atualizada;
- instrucoes para continuar o desenvolvimento neste repositorio.

