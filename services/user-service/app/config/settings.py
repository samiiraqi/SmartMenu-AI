from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application Settings
    """

    # API Settings
    APP_NAME: str = "User Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database Settings
    DATABASE_URL: str = "postgresql://smartmenu_user:smartmenu_pass@localhost:5432/smartmenu_users_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-09876543211234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Settings
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:8003",
    ]

    # Password Settings
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
