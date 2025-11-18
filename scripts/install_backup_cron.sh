#!/bin/bash

BACKUP_SCRIPT="$(pwd)/scripts/backup_databases.sh"

# Add cron job for 2 AM daily
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT >> /var/log/smartmenu_backup.log 2>&1") | crontab -

echo "✅ Cron job installed! Backups will run daily at 2 AM"
echo "📝 Logs: /var/log/smartmenu_backup.log"
