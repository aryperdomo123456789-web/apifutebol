# Gerador Mago - Portal Próprio do Lab Legado

Este documento registra o avanço realizado para transformar o laboratório legado em um painel próprio,
com identidade **Gerador Mago**, dentro da API FUT.

## Objetivo

Criar um portal administrativo visual, responsivo e persistente que reflita as funções reais mapeadas no
lab legado, sem depender do site original como produto principal.

## URLs de acesso

- Portal principal: `https://apifut.vr766.com/api/v1/gerador-mago`
- Versão HTML direta: `https://apifut.vr766.com/api/v1/gerador-mago/ui`
- Resumo do portal: `https://apifut.vr766.com/api/v1/gerador-mago/summary`
- Menu do portal: `https://apifut.vr766.com/api/v1/gerador-mago/menu`
- Rotas mapeadas: `https://apifut.vr766.com/api/v1/gerador-mago/routes`

## O que foi entregue

### 1. Nova interface do painel

Foi criado um dashboard com:

- sidebar com a marca GeradorPro/ Gerador Mago
- cards grandes para os módulos principais
- cabeçalho com saudação dinâmica
- bloco de resumo com rotas, módulos, state e extração
- painel lateral de detalhes do módulo selecionado
- tabela de rotas do lab

Arquivos principais:

- [gerador-mago.html.ts](/www/wwwroot/apifut.vr766.com/src/modules/gerador-mago/gerador-mago.html.ts)
- [gerador-mago.controller.ts](/www/wwwroot/apifut.vr766.com/src/modules/gerador-mago/gerador-mago.controller.ts)
- [gerador-mago.module.ts](/www/wwwroot/apifut.vr766.com/src/modules/gerador-mago/gerador-mago.module.ts)

### 2. Ligação com o lab legado

O painel lê os arquivos já gerados pelo laboratório:

- `labs/mago-lab/map.json`
- `labs/mago-lab/state.json`
- `labs/mago-lab/mago_extraction.json`
- `labs/mago-lab/mago_network.json`

O dashboard usa essas fontes para montar:

- menu lateral por seção
- cards de módulos
- link da rota original de cada módulo
- status dos arquivos do laboratório

### 3. Atualização do app NestJS

O módulo novo foi registrado no app principal:

- [app.module.ts](/www/wwwroot/apifut.vr766.com/src/app.module.ts)

Também foi criado um atalho no painel administrativo existente:

- [admin.html.ts](/www/wwwroot/apifut.vr766.com/src/modules/admin/admin.html.ts)

### 4. Laboratório local

O laboratório `labs/mago-lab/` recebeu suporte operacional para facilitar uso e manutenção:

- `run.sh` para executar os comandos do lab
- `requirements.txt` com as dependências Python
- `.gitignore` local para não versionar artefatos temporários

Arquivos:

- [run.sh](/www/wwwroot/apifut.vr766.com/labs/mago-lab/run.sh)
- [requirements.txt](/www/wwwroot/apifut.vr766.com/labs/mago-lab/requirements.txt)
- [.gitignore](/www/wwwroot/apifut.vr766.com/labs/mago-lab/.gitignore)

## Mapa funcional do portal

O painel atual já expõe módulos do lab como:

- Dashboard
- Configurar WhatsApp
- Gerar Express
- Gerar Vídeo
- Gerar Futebol
- Gerar Banner Filme
- Séries/Novelas
- Logo
- Meu Telegram
- App G Pro Player
- App G Pro Reels
- Link de Indicação
- Todos esportes
- Bolão Copa

## Status de operação

- Build NestJS validado com sucesso
- Processo `apifut` reiniciado em PM2
- Portal respondendo em produção
- Rota base do portal validada

## Observações de segurança

- Credenciais reais de produção não devem ser commitadas no GitHub.
- O arquivo `.env` e segredos locais devem permanecer somente na VPS.
- Documentação pública deve usar placeholders quando citar banco, senha ou tokens.

## Próximos passos sugeridos

1. Adicionar autenticação própria no portal.
2. Criar telas internas para cada módulo do lab.
3. Permitir executar ações do lab direto pelo dashboard.
4. Evoluir o portal para navegação mais próxima do painel legado, mantendo identidade própria.
