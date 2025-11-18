#!/bin/bash

echo "🚀 SMARTMENU AI - PRODUCTION PREPARATION"
echo "========================================"
echo ""

read -p "This will prepare your system for production. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1/5: Generating production secrets..."
./scripts/generate_production_secrets.sh

echo ""
echo "Step 2/5: Adding rate limiting..."
./scripts/add_rate_limiting.sh

echo ""
echo "Step 3/5: Setting up database backups..."
./scripts/setup_database_backups.sh

echo ""
echo "Step 4/5: Adding connection pooling..."
./scripts/add_connection_pooling.sh

echo ""
echo "Step 5/5: Creating production docker-compose..."

cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # Use production environment files from config/production/
  # Update all service definitions to use .env.production files
  
  # Example for menu-service:
  menu-service:
    build: ./services/menu-service
    env_file:
      - ./config/production/menu-service.env
    depends_on:
      - postgres
    networks:
      - smartmenu-network
    restart: always
    
  # ... (add other services similarly)

networks:
  smartmenu-network:
    driver: bridge

volumes:
  postgres_data:
EOF

echo ""
echo "🎉 PRODUCTION PREPARATION COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. ✅ Review generated secrets in config/production/"
echo "2. ✅ Update 'yourdomain.com' in all .env files"
echo "3. ✅ Add your OpenAI API key to chatbot-service.env"
echo "4. ✅ Test backup: ./scripts/backup_databases.sh"
echo "5. ✅ Install backup cron: ./scripts/install_backup_cron.sh"
echo ""
echo "🔒 MANUAL TASKS REQUIRED:"
echo ""
echo "1. SSL/HTTPS Setup:"
echo "   - Get SSL certificate (Let's Encrypt)"
echo "   - Update nginx config for HTTPS"
echo ""
echo "2. Monitoring Setup:"
echo "   - Sign up for error tracking (Sentry.io)"
echo "   - Set up uptime monitoring (UptimeRobot)"
echo ""
echo "3. Deploy to production server"
echo ""
echo "📚 See PRODUCTION.md for detailed instructions"
