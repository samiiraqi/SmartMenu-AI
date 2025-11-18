#!/bin/bash

echo "🔧 Fixing Dockerfiles to include .env files..."

services=("menu-service" "order-service" "user-service" "payment-service" "notification-service" "chatbot-service")

for service in "${services[@]}"; do
    echo "📝 Updating $service Dockerfile..."
    
    # Check if Dockerfile exists
    if [ -f "services/$service/Dockerfile" ]; then
        # Add .env copy before CMD
        sed -i '/^CMD/i # Copy environment file\nCOPY .env .env' services/$service/Dockerfile
        echo "✅ Updated $service"
    fi
done

echo ""
echo "✅ All Dockerfiles updated!"
echo "🔄 Now rebuild with: docker compose build"
