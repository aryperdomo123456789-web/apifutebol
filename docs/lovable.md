# Lovable como gerador de codigo

Este projeto usa o **Lovable apenas como gerador de codigo**, nao como runtime.

## Regras

- O Lovable escreve arquivos direto no repositorio GitHub (`aryperdomo123456789-web/apifutebol`) via conector GitHub.
- O Lovable **nao executa** o backend. Nao ha preview, nem SSR, nem edge functions em uso.
- Toda validacao (build, migrations, testes, endpoints) acontece no **VPS/aaPanel**, apos `git pull`.
- O Lovable **nao** deve introduzir:
  - TanStack Start, React, Vite, Cloudflare Workers
  - Supabase, PostgreSQL, edge runtime
  - Bibliotecas incompativeis com Node.js/NestJS puro

## Fluxo padrao

1. Usuario descreve a fase desejada.
2. Lovable gera/altera arquivos NestJS e commita no `main`.
3. Usuario faz `git pull` no VPS.
4. Usuario roda `npm install`, `npm run build`, `npm run migration:run`, reinicia o servico.
5. Usuario valida endpoints e reporta problemas na proxima iteracao.

## Convencoes de commit

- Um commit por fase quando possivel.
- Mensagem no formato: `feat(faseN): descricao curta`.
- Arquivos gerados devem ser autoexplicativos - comentarios em portugues.
