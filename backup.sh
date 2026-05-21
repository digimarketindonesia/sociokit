#!/bin/bash

# Database Backup Script
# Usage: ./backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sociotools_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U sociotools sociotools > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Remove backups older than 7 days
find $BACKUP_DIR -name "sociotools_*.sql.gz" -mtime +7 -delete

echo "🧹 Cleaned up old backups (>7 days)"
echo "📊 Current backups:"
ls -lh $BACKUP_DIR
