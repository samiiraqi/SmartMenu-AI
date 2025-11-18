#!/bin/bash

echo "📝 Adding logging configuration to docker-compose.yml..."

# Backup original
cp docker-compose.yml docker-compose.yml.backup

# Python script to add logging to all services
python3 << 'EOF'
import yaml
import sys

# Load docker-compose.yml
with open('docker-compose.yml', 'r') as f:
    compose = yaml.safe_load(f)

# Logging configuration
logging_config = {
    'driver': 'json-file',
    'options': {
        'max-size': '10m',
        'max-file': '3'
    }
}

# Add logging to each service
services_to_update = [
    'menu-service',
    'order-service', 
    'chatbot-service',
    'user-service',
    'payment-service',
    'notification-service',
    'analytics-service',
    'api-gateway'
]

for service in services_to_update:
    if service in compose['services']:
        compose['services'][service]['logging'] = logging_config
        print(f"✅ Added logging to {service}")

# Write back
with open('docker-compose.yml', 'w') as f:
    yaml.dump(compose, f, default_flow_style=False, sort_keys=False)

print("\n🎉 Logging configuration added to all services!")
EOF

# Check if PyYAML is installed
if ! python3 -c "import yaml" 2>/dev/null; then
    echo "Installing PyYAML..."
    pip3 install pyyaml
    # Run the script again
    python3 << 'EOF'
import yaml

with open('docker-compose.yml', 'r') as f:
    compose = yaml.safe_load(f)

logging_config = {
    'driver': 'json-file',
    'options': {
        'max-size': '10m',
        'max-file': '3'
    }
}

services_to_update = [
    'menu-service', 'order-service', 'chatbot-service',
    'user-service', 'payment-service', 'notification-service',
    'analytics-service', 'api-gateway'
]

for service in services_to_update:
    if service in compose['services']:
        compose['services'][service]['logging'] = logging_config
        print(f"✅ Added logging to {service}")

with open('docker-compose.yml', 'w') as f:
    yaml.dump(compose, f, default_flow_style=False, sort_keys=False)

print("\n🎉 Logging configuration added to all services!")
EOF
fi

echo ""
echo "✅ Done! Backup saved as docker-compose.yml.backup"
