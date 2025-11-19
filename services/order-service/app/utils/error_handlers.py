import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError

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
        content={"error": exc.message, "status_code": exc.status_code},
    )


async def validation_exception_handler(request: Request, exc: Exception):
    """Handle validation exceptions"""
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation failed", "detail": str(exc)},
    )


async def database_exception_handler(request: Request, exc: Exception):
    """Handle database exceptions"""
    logger.error(f"Database error: {str(exc)}")

    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Resource already exists or constraint violation"},
        )

    if isinstance(exc, OperationalError):
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Database service temporarily unavailable"},
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Database operation failed"},
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.exception(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred",
        },
    )
