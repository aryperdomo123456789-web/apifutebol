#!/usr/bin/env bash
# Testa se o backup mais recente do MariaDB restaura em base temporária.
# Requer: mariadb-client, gunzip. Roda no próprio VPS.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/apifut}"
TMP_DB="${TMP_DB:-apifut_restore_test}"
DB_USER="${DB_USER:-root}"
DB_HOST="${DB_HOST:-127.0.0.1}"

LATEST=$(ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -n1 || true)
if [[ -z "$LATEST" ]]; then
  echo "[restore-test] Nenhum backup encontrado em $BACKUP_DIR" >&2
  exit 1
fi

echo "[restore-test] Usando backup: $LATEST"
mariadb -h "$DB_HOST" -u "$DB_USER" -e "DROP DATABASE IF EXISTS \`$TMP_DB\`; CREATE DATABASE \`$TMP_DB\`;"
gunzip -c "$LATEST" | mariadb -h "$DB_HOST" -u "$DB_USER" "$TMP_DB"

COUNT=$(mariadb -h "$DB_HOST" -u "$DB_USER" -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TMP_DB';")
mariadb -h "$DB_HOST" -u "$DB_USER" -e "DROP DATABASE \`$TMP_DB\`;"

if [[ "$COUNT" -lt 5 ]]; then
  echo "[restore-test] FALHA: apenas $COUNT tabelas restauradas" >&2
  exit 2
fi
echo "[restore-test] OK — $COUNT tabelas restauradas com sucesso"
