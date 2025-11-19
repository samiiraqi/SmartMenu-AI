#!/bin/bash

echo "🛡️ Adding enhanced input validation to all services..."

# Create validation utilities for Menu Service
cat > services/menu-service/app/utils/validators.py << 'EOF'
import re
from typing import Optional


def validate_price(price: float) -> bool:
    """Validate price is positive and reasonable"""
    return 0 < price < 10000


def validate_prep_time(prep_time: int) -> bool:
    """Validate prep time is reasonable (1-120 minutes)"""
    return 1 <= prep_time <= 120


def validate_name(name: str) -> bool:
    """Validate name is not empty and reasonable length"""
    return 1 <= len(name.strip()) <= 100


def validate_category(category: str) -> bool:
    """Validate category name"""
    allowed_categories = ["Pizza", "Pasta", "Burgers", "Salads", "Desserts", "Drinks", "Appetizers", "Main Course"]
    return category in allowed_categories or (1 <= len(category.strip()) <= 50)


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters"""
    # Remove HTML tags
    value = re.sub(r'<[^>]*>', '', value)
    # Remove SQL keywords (basic protection)
    dangerous_patterns = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', '--', ';']
    for pattern in dangerous_patterns:
        value = value.replace(pattern, '')
    return value.strip()
EOF

# Create validation utilities for Order Service
cat > services/order-service/app/utils/validators.py << 'EOF'
import re


def validate_table_number(table_number: int) -> bool:
    """Validate table number is reasonable"""
    return 1 <= table_number <= 200


def validate_quantity(quantity: int) -> bool:
    """Validate order quantity"""
    return 1 <= quantity <= 50


def validate_special_instructions(instructions: str) -> bool:
    """Validate special instructions length"""
    return len(instructions) <= 500


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters"""
    value = re.sub(r'<[^>]*>', '', value)
    return value.strip()
EOF

# Create validation utilities for User Service
cat > services/user-service/app/utils/validators.py << 'EOF'
import re


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Allow international format
    pattern = r'^\+?[1-9]\d{1,14}$'
    return re.match(pattern, phone.replace('-', '').replace(' ', '')) is not None


def validate_username(username: str) -> bool:
    """Validate username"""
    # 3-20 chars, alphanumeric and underscore only
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return re.match(pattern, username) is not None


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "Password is strong"
EOF

echo ""
echo "✅ Validation utilities created for all services!"
echo ""
echo "📝 Next: Update route handlers to use these validators"
echo "   Example usage in routes:"
echo "   from app.utils.validators import validate_price, sanitize_string"
