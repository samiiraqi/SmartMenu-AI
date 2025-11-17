from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application Settings
    Loads configuration from environment variables
    """

    # API Settings
    APP_NAME: str = "Menu Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database Settings
    DATABASE_URL: str = (
        "postgresql://smartmenu_user:smartmenu_pass@localhost:5432/smartmenu_db"
    )
    # Redis Cache Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Settings
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
