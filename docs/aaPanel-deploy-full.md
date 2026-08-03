# Guia Especialista: Deploy API FUT no aaPanel (Produção 24/7)

Este guia consolida todos os passos necessários para colocar a **API FUT** em produção usando aaPanel em uma VPS, garantindo estabilidade, monitoramento e segurança.

---

## 1. Pré-requisitos no aaPanel

1.  **Sistemas Instalados (App Store):**
    *   **Nginx** (qualquer versão recente).
    *   **MariaDB 10.6+** (importante para suporte a JSON e sequências).
    *   **Node.js Version Manager** (Instalar Node.js v20 LTS).
    *   **PM2 Manager** (para gestão de processos).

2.  **Banco de Dados:**
    *   Crie um banco chamado `apifut`.
    *   Anote o usuário e a senha.

---

## 2. Preparação do Ambiente na VPS

Acesse sua VPS via SSH e siga os comandos:

```bash
# Navegue para o diretório de sites (padrão aaPanel)
cd /www/wwwroot/

# Clone o repositório
git clone https://github.com/aryperdomo123456789-web/apifutebol.git
cd apifutebol

# Instale as dependências
npm install
```

---

## 3. Configuração do Arquivo .env

Crie o arquivo `.env` na raiz do projeto:

```bash
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=apifut
DB_SYNCHRONIZE=false

# Ingestão (Chaves das Fontes)
THESPORTSDB_API_KEY=1
API_FOOTBALL_KEY=sua_chave_aqui

# Cache
CACHE_TTL=60
```

---

## 4. Inicialização do Banco e Primeira Chave

```bash
# 1. Rodar as migrações para criar as tabelas
npm run migration:run

# 2. Popular as fontes de dados iniciais
npm run seed:sources

# 3. Gerar a primeira chave administrativa (MUITO IMPORTANTE)
BOOTSTRAP_API_KEY_NAME=magoadm BOOTSTRAP_API_KEY_OWNER=admin npm run key:bootstrap
```
*Anote a chave `fut_...` gerada no console. Você precisará dela para acessar o painel.*

---

## 5. Build e Deploy com PM2

```bash
# Gerar o bundle de produção
npm run build

# Iniciar com PM2 usando o arquivo de ecossistema
pm2 start deploy/ecosystem.config.js --env production

# Salvar para iniciar no boot da VPS
pm2 save
pm2 startup
```

---

## 6. Configuração do Nginx (aaPanel)

No painel do aaPanel, vá em **Website > Add Site** (use o domínio da sua API).
Depois, em **Config**, cole/ajuste o conteúdo baseado em `deploy/nginx.conf`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Rate Limiting básico
        limit_req zone=one burst=10 nodelay;
-� 
    # Proteção da rota de métricas
    location = /metrics {
        allow 127.0.0.1;
        # allow SEU_IP_MONITORAMENTO;
        deny all;
        proxy_pass http://127.0.0.1:3000?metrics;
    }
}
```

---

## 7. Rotinas de Manutenção (Crontab)

Configure no menu **Cron** do aaPanel:

1.  **Backup Diário (03:00):**
    ```bash
    bash /www/wwwroot/apifutebol/deploy/backup.sh
    ```

2.  **Snapshot de Jogos Finalizados (A cada 10 min):**
    ```bash
    cd /www/wwwroot/apifutebol && npm run snapshot:finals
    ```

3.  **Smoke Test (Opcional - a cada 5 min):**
    ```bash
    cd /www/wwwroot/apifutebol && npm run smoke
    ```

---

## 8. Acesso ao Painel Admin

Abra no navegador: `https://api.seudominio.com/v1/admin/ui`
1. Use a chave gerada no passo 4.
2. Monitore os logs em tempo real: `pm2 logs apifut`.

---
*Documentação gerada para a API FUT v1.0 - Hardening 10/10*
