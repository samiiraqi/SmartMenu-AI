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
