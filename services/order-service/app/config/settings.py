import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "Order Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://smartmenu:smartmenu123@postgres:5432/smartmenu_db",
    )

    # Services
    MENU_SERVICE_URL: str = os.getenv(
        "MENU_SERVICE_URL", "http://menu-service:8001"
    )

    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3001")

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "your-secret-key-min-32-chars-long-replace-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # API
    API_PREFIX: str = "/api/v1"

    # Other
    MAX_CONVERSATION_HISTORY: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

