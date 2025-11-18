#!/bin/bash

echo "🔐 Generating Production Secrets..."
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Generate secrets for each service
MENU_SECRET=$(generate_secret)
ORDER_SECRET=$(generate_secret)
CHATBOT_SECRET=$(generate_secret)
USER_SECRET=$(generate_secret)
PAYMENT_SECRET=$(generate_secret)
NOTIFICATION_SECRET=$(generate_secret)
ANALYTICS_SECRET=$(generate_secret)

# Generate strong database password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")

echo "📋 PRODUCTION SECRETS GENERATED"
echo "================================"
echo ""
echo "⚠️  SAVE THESE SECURELY - THEY WON'T BE SHOWN AGAIN!"
echo ""
echo "# Database"
echo "POSTGRES_PASSWORD=$DB_PASSWORD"
echo ""
echo "# Menu Service"
echo "MENU_SECRET_KEY=$MENU_SECRET"
echo ""
echo "# Order Service"
echo "ORDER_SECRET_KEY=$ORDER_SECRET"
echo ""
echo "# Chatbot Service"
echo "CHATBOT_SECRET_KEY=$CHATBOT_SECRET"
echo ""
echo "# User Service"
echo "USER_SECRET_KEY=$USER_SECRET"
echo ""
echo "# Payment Service"
echo "PAYMENT_SECRET_KEY=$PAYMENT_SECRET"
echo ""
echo "# Notification Service"
echo "NOTIFICATION_SECRET_KEY=$NOTIFICATION_SECRET"
echo ""
echo "# Analytics Service"
echo "ANALYTICS_SECRET_KEY=$ANALYTICS_SECRET"
echo ""
echo "================================"
echo ""
echo "💾 Creating .env.production files..."
echo ""

# Create production env files
mkdir -p config/production

# Menu Service
cat > config/production/menu-service.env << EOF
APP_NAME=Menu Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_db
SECRET_KEY=${MENU_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
EOF

# Order Service
cat > config/production/order-service.env << EOF
APP_NAME=Order Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_orders_db
SECRET_KEY=${ORDER_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
MENU_SERVICE_URL=http://menu-service:8001
EOF

# User Service
cat > config/production/user-service.env << EOF
APP_NAME=User Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_users_db
SECRET_KEY=${USER_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=True
PASSWORD_REQUIRE_LOWERCASE=True
PASSWORD_REQUIRE_NUMBERS=True
EOF

# Payment Service
cat > config/production/payment-service.env << EOF
APP_NAME=Payment Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_payments_db
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
ORDER_SERVICE_URL=http://order-service:8002
USER_SERVICE_URL=http://user-service:8004
PAYMENT_CURRENCY=USD
PAYMENT_PROVIDER=stripe_simulation
EOF

# Notification Service
cat > config/production/notification-service.env << EOF
APP_NAME=Notification Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_notifications_db
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
EMAIL_FROM=noreply@smartmenu.com
SMS_FROM=+1234567890
EOF

# Chatbot Service
cat > config/production/chatbot-service.env << EOF
APP_NAME=Chatbot Service
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://smartmenu_user:${DB_PASSWORD}@postgres:5432/smartmenu_chatbot_db
SECRET_KEY=${CHATBOT_SECRET}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
MENU_SERVICE_URL=http://menu-service:8001
ORDER_SERVICE_URL=http://order-service:8002
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-3.5-turbo
MAX_TOKENS=500
TEMPERATURE=0.7
MAX_CONVERSATION_HISTORY=10
CONVERSATION_TIMEOUT_MINUTES=30
EOF

# Analytics Service
cat > config/production/analytics-service.env << EOF
APP_NAME=Analytics Service
APP_VERSION=1.0.0
DEBUG=False
ALLOWED_ORIGINS=https://yourdomain.com
API_PREFIX=/api/v1
MENU_SERVICE_URL=http://menu-service:8001
ORDER_SERVICE_URL=http://order-service:8002
PAYMENT_SERVICE_URL=http://payment-service:8005
EOF

echo "✅ Production environment files created in config/production/"
echo ""
echo "⚠️  IMPORTANT: Update 'yourdomain.com' with your actual domain!"
echo "⚠️  IMPORTANT: Add your real OpenAI API key in chatbot-service.env"
echo ""
echo "🔒 These files are NOT committed to git (in .gitignore)"
