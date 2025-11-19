#!/bin/bash

echo "🚀 SmartMenu AI - Production Deployment Script"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Don't run as root!"
   exit 1
fi

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed!"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Stop existing services
echo "🛑 Stopping existing services..."
docker compose down

# Pull latest code (if using git)
read -p "Pull latest code from git? (y/n): " pull_code
if [ "$pull_code" = "y" ]; then
    git pull origin main
fi

# Build images
echo "🔨 Building Docker images..."
docker compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo ""
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}"

# Test API
echo ""
echo "🧪 Testing API Gateway..."
if curl -s http://localhost/health > /dev/null; then
    echo "✅ API Gateway is healthy!"
else
    echo "❌ API Gateway health check failed!"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test all endpoints"
echo "2. Run database migrations if needed"
echo "3. Monitor logs: docker compose logs -f"
echo "4. Set up SSL certificate"
echo "5. Configure monitoring"
