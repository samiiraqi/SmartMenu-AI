#!/bin/bash

echo "💾 Setting up database backup system..."

# Create backup directory
mkdir -p backups/database

# Create backup script
cat > scripts/backup_databases.sh << 'EOF'
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
EOF

chmod +x scripts/backup_databases.sh

# Create restore script
cat > scripts/restore_database.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./restore_database.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh backups/database/
    exit 1
fi

BACKUP_FILE=$1
DB_NAME=$(basename $BACKUP_FILE | cut -d'_' -f1-3)

echo "⚠️  WARNING: This will restore $DB_NAME from backup!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "🔄 Restoring database..."
gunzip -c $BACKUP_FILE | docker exec -i smartmenu-postgres psql -U smartmenu_user $DB_NAME

echo "✅ Database restored successfully!"
EOF

chmod +x scripts/restore_database.sh

# Create cron job for daily backups
echo "📅 Setting up daily backup cron job..."

cat > scripts/install_backup_cron.sh << 'EOF'
#!/bin/bash

BACKUP_SCRIPT="$(pwd)/scripts/backup_databases.sh"

# Add cron job for 2 AM daily
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> /var/log/smartmenu_backup.log 2>&1") | crontab -

echo "✅ Cron job installed! Backups will run daily at 2 AM"
echo "📝 Logs: /var/log/smartmenu_backup.log"
EOF

chmod +x scripts/install_backup_cron.sh

echo ""
echo "✅ Database backup system created!"
echo ""
echo "📋 Available commands:"
echo "  - Run backup now:        ./scripts/backup_databases.sh"
echo "  - Restore from backup:   ./scripts/restore_database.sh <file>"
echo "  - Install daily cron:    ./scripts/install_backup_cron.sh"
echo ""
echo "💾 Backups saved to: backups/database/"
echo "🗑️  Auto-delete after: 30 days"
