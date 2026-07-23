#!/usr/bin/env bash
# Backup diário do MariaDB (API FUT). Rode via cron:
#   0 3 * * * /opt/apifut/deploy/backup.sh >> /var/log/apifut/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/apifut}"
KEEP_DAYS="${KEEP_DAYS:-14}"
DB_NAME="${DB_NAME:-apifut}"
DB_USER="${DB_USER:-apifut}"
DB_PASS="${DB_PASS:-}"
DB_HOST="${DB_HOST:-127.0.0.1}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/apifut-$STAMP.sql.gz"

echo "[$(date -Is)] dumping $DB_NAME -> $FILE"
mysqldump \
  --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASS" \
  --single-transaction --quick --routines --triggers --events \
  --default-character-set=utf8mb4 "$DB_NAME" | gzip -9 > "$FILE"

echo "[$(date -Is)] size=$(du -h "$FILE" | cut -f1)"

# retenção
find "$BACKUP_DIR" -name 'apifut-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
echo "[$(date -Is)] done. retention=${KEEP_DAYS}d"
