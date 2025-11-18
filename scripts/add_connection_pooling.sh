#!/bin/bash

echo "💾 Adding database connection pooling configuration..."

# Update database.py files for all services
services=("menu-service" "order-service" "user-service" "payment-service" "notification-service" "chatbot-service")

for service in "${services[@]}"; do
    if [ -f "services/$service/app/config/database.py" ]; then
        echo "📝 Updating $service..."
        
        # Backup original
        cp services/$service/app/config/database.py services/$service/app/config/database.py.backup
        
        # Add pool settings
        cat > services/$service/app/config/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,              # Number of connections to maintain
    max_overflow=20,           # Max additional connections
    pool_timeout=30,           # Timeout to get connection (seconds)
    pool_recycle=3600,        # Recycle connections after 1 hour
    pool_pre_ping=True,        # Verify connections before use
    echo=settings.DEBUG,       # Log SQL queries in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF
        echo "✅ Updated $service"
    fi
done

echo ""
echo "✅ Connection pooling added to all services!"
echo ""
echo "📊 Pool Configuration:"
echo "  - Pool size: 10 connections"
echo "  - Max overflow: 20 additional connections"
echo "  - Connection timeout: 30 seconds"
echo "  - Connection recycle: 1 hour"
echo "  - Pre-ping: Enabled (verify before use)"
