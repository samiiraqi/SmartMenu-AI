#!/bin/bash

echo "🚨 EMERGENCY ROLLBACK - Restoring working state..."

# 1. Restore database.py backups
echo "1. Restoring database.py files..."
services=("menu-service" "order-service" "user-service" "payment-service" "notification-service" "chatbot-service")

for service in "${services[@]}"; do
    if [ -f "services/$service/app/config/database.py.backup" ]; then
        cp services/$service/app/config/database.py.backup services/$service/app/config/database.py
        echo "✅ Restored $service database.py"
    fi
done

# 2. Restore nginx.conf backup
echo "2. Restoring nginx.conf..."
if [ -f "nginx/nginx.conf.backup" ]; then
    cp nginx/nginx.conf.backup nginx/nginx.conf
    echo "✅ Restored nginx.conf"
fi

# 3. Delete all .env files in services (they're causing issues)
echo "3. Cleaning up .env files..."
for service in "${services[@]}"; do
    rm -f services/$service/.env
    echo "✅ Removed $service/.env"
done

# 4. Rebuild and restart
echo "4. Rebuilding services..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo ""
echo "✅ ROLLBACK COMPLETE!"
echo "⏳ Waiting 20 seconds for services to start..."
sleep 20

echo ""
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "🧪 Testing API Gateway..."
curl http://localhost/health
echo ""
curl http://localhost/api/menu/ | head -20
