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
