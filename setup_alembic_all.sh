#!/bin/bash

echo "🚀 Setting up Alembic for all services..."

# Function to setup Alembic for a service
setup_alembic() {
    SERVICE_NAME=$1
    SERVICE_PATH=$2
    MODEL_IMPORTS=$3
    
    echo ""
    echo "📦 Setting up Alembic for $SERVICE_NAME..."
    
    cd "$SERVICE_PATH"
    
    # Activate venv and install alembic
    source venv/bin/activate
    pip install -q alembic
    
    # Initialize alembic if not exists
    if [ ! -d "alembic" ]; then
        alembic init alembic
    fi
    
    # Update alembic.ini
    sed -i 's/^sqlalchemy.url = .*/# sqlalchemy.url = driver:\/\/user:pass@localhost\/dbname/' alembic.ini
    
    # Create env.py content
    cat > alembic/env.py << EOF
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

from app.config.database import Base
from app.config.settings import settings
$MODEL_IMPORTS

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF
    
    # Create initial migration
    alembic revision --autogenerate -m "Initial migration for $SERVICE_NAME" 2>/dev/null || echo "Migration already exists"
    
    # Apply migration
    alembic upgrade head
    
    # Add alembic to requirements if not present
    if ! grep -q "alembic" requirements.txt; then
        echo "alembic==1.13.0" >> requirements.txt
    fi
    
    deactivate
    
    echo "✅ $SERVICE_NAME Alembic setup complete!"
}

# Setup Alembic for each service
cd ~/projects/SmartMenu-AI

# Order Service
setup_alembic "Order Service" \
    "services/order-service" \
    "from app.models.order import Order, OrderItem  # noqa: F401"

# User Service
setup_alembic "User Service" \
    "services/user-service" \
    "from app.models.user import User  # noqa: F401"

# Payment Service
setup_alembic "Payment Service" \
    "services/payment-service" \
    "from app.models.payment import Payment  # noqa: F401"

# Notification Service
setup_alembic "Notification Service" \
    "services/notification-service" \
    "from app.models.notification import Notification  # noqa: F401"

# Chatbot Service
setup_alembic "Chatbot Service" \
    "services/chatbot-service" \
    "from app.models.conversation import Conversation  # noqa: F401"

echo ""
echo "🎉 ALL SERVICES ALEMBIC SETUP COMPLETE!"
echo "✅ Order Service"
echo "✅ User Service"
echo "✅ Payment Service"
echo "✅ Notification Service"
echo "✅ Chatbot Service"
