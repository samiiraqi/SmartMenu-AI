#!/bin/bash

BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "🔄 Starting database backup at $(date)"

# Backup each database
databases=("smartmenu_db" "smartmenu_orders_db" "smartmenu_users_db" "smartmenu_payments_db" "smartmenu_notifications_db" "smartmenu_chatbot_db")

for db in "${databases[@]}"; do
    echo "📦 Backing up $db..."
    docker exec smartmenu-postgres pg_dump -U smartmenu_user $db > $BACKUP_DIR/${db}_${TIMESTAMP}.sql
    
    # Compress backup
    gzip $BACKUP_DIR/${db}_${TIMESTAMP}.sql
    echo "✅ Backup created: ${db}_${TIMESTAMP}.sql.gz"
done

# Remove old backups (older than retention period)
echo "🗑️  Removing backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed at $(date)"
echo ""
