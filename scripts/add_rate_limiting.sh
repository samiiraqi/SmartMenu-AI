#!/bin/bash

echo "🛡️ Adding rate limiting to Nginx..."

# Backup original
cp nginx/nginx.conf nginx/nginx.conf.backup

# Create new nginx config with rate limiting
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
    
    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    
    upstream menu_service {
        server menu-service:8001;
    }

    upstream order_service {
        server order-service:8002;
    }

    upstream chatbot_service {
        server chatbot-service:8003;
    }

    upstream user_service {
        server user-service:8004;
    }

    upstream payment_service {
        server payment-service:8005;
    }

    upstream notification_service {
        server notification-service:8006;
    }

    upstream analytics_service {
        server analytics-service:8007;
    }

    server {
        listen 80;
        server_name localhost;
        
        # Connection limit: max 10 connections per IP
        limit_conn addr 10;
        
        # Request body size limit
        client_max_body_size 10M;

        # Health check (no rate limit)
        location /health {
            return 200 "API Gateway is healthy\n";
            add_header Content-Type text/plain;
        }

        # Login endpoint - stricter rate limit
        location /api/users/login {
            limit_req zone=login_limit burst=2 nodelay;
            proxy_pass http://user_service/api/v1/users/login;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Menu Service - with rate limiting
        location /api/menu {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://menu_service/api/v1/menu;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Order Service - with rate limiting
        location /api/orders {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://order_service/api/v1/orders;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Chatbot Service - with rate limiting
        location /api/chat {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://chatbot_service/api/v1/chat;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # User Service - with rate limiting
        location /api/users {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://user_service/api/v1/users;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Payment Service - with rate limiting
        location /api/payments {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://payment_service/api/v1/payments;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Notification Service - with rate limiting
        location /api/notifications {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://notification_service/api/v1/notifications;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Analytics Service - with rate limiting
        location /api/analytics {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://analytics_service/api/v1/analytics;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # API Documentation
        location /docs {
            return 200 "SmartMenu AI - API Gateway\n\nAvailable APIs:\n- /api/menu\n- /api/orders\n- /api/chat\n- /api/users\n- /api/payments\n- /api/notifications\n- /api/analytics\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo "✅ Rate limiting added to Nginx!"
echo ""
echo "📊 Rate Limits:"
echo "  - API endpoints: 10 requests/second (burst 20)"
echo "  - Login: 5 requests/minute (burst 2)"
echo "  - Max connections per IP: 10"
echo "  - Max request body: 10MB"
echo ""
echo "🔄 Restart services to apply:"
echo "  docker compose restart api-gateway"
