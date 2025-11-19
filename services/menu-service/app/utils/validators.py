import re



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
    allowed_categories = [
        "Pizza",
        "Pasta",
        "Burgers",
        "Salads",
        "Desserts",
        "Drinks",
        "Appetizers",
        "Main Course",
    ]
    return category in allowed_categories or (1 <= len(category.strip()) <= 50)


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters"""
    # Remove HTML tags
    value = re.sub(r"<[^>]*>", "", value)
    # Remove SQL keywords (basic protection)
    dangerous_patterns = ["DROP", "DELETE", "INSERT", "UPDATE", "SELECT", "--", ";"]
    for pattern in dangerous_patterns:
        value = value.replace(pattern, "")
    return value.strip()
