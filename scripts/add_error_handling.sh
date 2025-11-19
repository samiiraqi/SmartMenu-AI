#!/bin/bash

echo "⚠️ Adding enhanced error handling to all services..."

# Create error handlers for Menu Service
cat > services/menu-service/app/utils/error_handlers.py << 'EOF'
from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError
import logging

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(AppException):
    """Validation error"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class NotFoundError(AppException):
    """Resource not found"""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class DatabaseError(AppException):
    """Database operation error"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)


async def app_exception_handler(request: Request, exc: AppException):
    """Handle application exceptions"""
    logger.error(f"AppException: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "status_code": exc.status_code}
    )


async def validation_exception_handler(request: Request, exc: Exception):
    """Handle validation exceptions"""
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation failed", "detail": str(exc)}
    )


async def database_exception_handler(request: Request, exc: Exception):
    """Handle database exceptions"""
    logger.error(f"Database error: {str(exc)}")
    
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Resource already exists or constraint violation"}
        )
    
    if isinstance(exc, OperationalError):
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Database service temporarily unavailable"}
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Database operation failed"}
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.exception(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "detail": "An unexpected error occurred"}
    )
EOF

# Copy to other services
cp services/menu-service/app/utils/error_handlers.py services/order-service/app/utils/
cp services/menu-service/app/utils/error_handlers.py services/user-service/app/utils/
cp services/menu-service/app/utils/error_handlers.py services/chatbot-service/app/utils/ 2>/dev/null || mkdir -p services/chatbot-service/app/utils && cp services/menu-service/app/utils/error_handlers.py services/chatbot-service/app/utils/
cp services/menu-service/app/utils/error_handlers.py services/payment-service/app/utils/ 2>/dev/null || mkdir -p services/payment-service/app/utils && cp services/menu-service/app/utils/error_handlers.py services/payment-service/app/utils/
cp services/menu-service/app/utils/error_handlers.py services/notification-service/app/utils/ 2>/dev/null || mkdir -p services/notification-service/app/utils && cp services/menu-service/app/utils/error_handlers.py services/notification-service/app/utils/

echo ""
echo "✅ Error handlers created for all services!"
echo ""
echo "📝 To use in main.py, add:"
echo "   from app.utils.error_handlers import *"
echo "   app.add_exception_handler(AppException, app_exception_handler)"
echo "   app.add_exception_handler(Exception, general_exception_handler)"
EOF

