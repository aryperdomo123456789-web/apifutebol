# API FUT

API de futebol 24/7 com memoria historica persistente, ingestao multipla de fontes, snapshots e suporte a analise esportiva.

## Objetivo

Construir uma plataforma de dados de futebol para:

- jogos ao vivo;
- agenda de hoje, ontem e amanha;
- historico de temporadas;
- eventos, canais e transmissao;
- consultas rapidas para front-end e analytics.

## Documentacao Principal

- [Plano de producao](/www/wwwroot/apifut.vr766.com/docs/api-futebol-producao.md)
- [Guia para o Lovable](/www/wwwroot/apifut.vr766.com/docs/lovable.md)
- [Fluxo GitHub + Lovable](/www/wwwroot/apifut.vr766.com/docs/fluxo-github-lovable.md)
- [Indice de documentacao](/www/wwwroot/apifut.vr766.com/docs/README.md)

## Estrutura do projeto

- `docs/` - documentacao tecnica, operacional e de producao
- `src/` - codigo-fonte da API
- `database/` - migracoes, seeds e scripts de schema
- `scripts/` - rotinas operacionais e utilitarios
- `test/` - testes automatizados

## Fontes planejadas

- Futebol na TV para agenda e canais
- TheSportsDB para eventos e calendarios
- football-data.co.uk para historico
- openfootball para datasets abertos
- Sportmonks ou API-Football para live e eventos estruturados

## Fluxo de trabalho

1. ler a documentacao de producao
2. pedir ao Lovable para implementar o escopo por fases
3. receber o codigo gerado
4. revisar, ajustar e testar localmente
5. commit e push para este repositório
6. continuar o ciclo ate o deploy final

## Primeira entrega

1. documentacao de producao
2. estrutura base do repositório
3. configuracao de git e deploy key
4. organizacao do fluxo para Lovable e GitHub
