# Fluxo GitHub -> aaPanel

## Setup inicial no VPS (uma vez)

```bash
# Requisitos: Node 20+, npm 10+, MariaDB 10.6+, git, pm2 (opcional)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm i -g pm2

# Clonar o repositorio
cd /www/wwwroot
git clone https://github.com/aryperdomo123456789-web/apifutebol.git
cd apifutebol

# Configurar .env
cp .env.example .env
nano .env   # ajustar DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE

# Criar banco e usuario no MariaDB
mysql -u root -p <<'SQL'
CREATE DATABASE apifutebol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'apifut'@'%' IDENTIFIED BY 'TROQUE_ESTA_SENHA';
GRANT ALL ON apifutebol.* TO 'apifut'@'%';
FLUSH PRIVILEGES;
SQL

# Instalar dependencias e buildar
npm install
npm run build

# (Fase 2 em diante) Aplicar migrations
npm run migration:run

# Subir com pm2
pm2 start dist/main.js --name apifutebol
pm2 save
pm2 startup
```

## Deploy incremental (a cada nova fase)

```bash
cd /www/wwwroot/apifutebol
git pull origin main
npm install            # se package.json mudou
npm run build
npm run migration:run  # se migrations foram adicionadas
pm2 restart apifutebol
pm2 logs apifutebol --lines 100
```

## Verificacao apos deploy

```bash
curl -s http://localhost:3000/api/v1/health | jq
curl -s http://localhost:3000/api/v1/health/liveness | jq
```

## Proxy reverso (aaPanel / nginx)

Exemplo minimo de bloco `location`:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Request-Id $request_id;
}
```

## Troubleshooting

- **Erro de conexao MariaDB no boot**: verifique `DB_HOST`, `DB_PORT`, firewall e se o usuario tem grant no host correto (`'apifut'@'%'` vs `'apifut'@'localhost'`).
- **`/health` retorna 503**: pino imprime a causa (banco fora, heap acima do limite). Ajuste os thresholds em `health.controller.ts` se necessario.
- **`APP_PORT` em uso**: outro processo Node esta ocupando a porta. `lsof -i :3000` para identificar.
