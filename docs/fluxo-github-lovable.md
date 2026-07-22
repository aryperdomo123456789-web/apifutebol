# Fluxo GitHub + Lovable

## Objetivo

Estabelecer um fluxo simples para:

- pedir implementacao ao Lovable;
- receber codigo;
- revisar localmente;
- subir para GitHub;
- puxar as atualizacoes para este ambiente.

## Repositorio

- GitHub: `aryperdomo123456789-web/apifutebol`
- branch principal: `main`
- ambiente local: `/www/wwwroot/apifut.vr766.com`

## Sequencia recomendada

### 1. Antes de pedir ao Lovable

- ler a documentacao principal;
- definir a fase atual;
- escolher um unico lote de entregas;
- evitar misturar backfill, live e infra no mesmo pedido.

### 2. Ao pedir ao Lovable

Enviar sempre:

- o objetivo da fase;
- os arquivos de referencia;
- os endpoints esperados;
- as tabelas envolvidas;
- os criterios de aceite;
- o que nao pode ser alterado.

### 3. Ao receber o codigo

- revisar a estrutura;
- validar o schema;
- testar localmente;
- corrigir nomes e contratos;
- preparar commit.

### 4. Ao publicar no GitHub

- `git add .`
- `git commit -m "mensagem objetiva"`
- `git push origin main`

### 5. Ao puxar para este ambiente

- `git pull origin main`
- revisar arquivos novos;
- validar dependencias;
- testar as rotas;
- atualizar a documentacao se necessario.

## Regra operacional

Se o Lovable gerar um bloco grande de codigo, o ideal e:

1. separar por fase;
2. confirmar migrations antes de API;
3. confirmar ingestao antes de live;
4. confirmar logs e healthcheck antes do deploy;
5. manter documentação sincronizada com o código.

## O que evitar

- misturar varios providers no primeiro lote;
- codar sem schema;
- codar sem testes;
- codar sem healthcheck;
- subir segredos para o GitHub;
- alterar o contrato sem registrar na documentacao.

