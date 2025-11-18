from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Notification Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql://smartmenu_user:smartmenu_pass@localhost:5432/smartmenu_notifications_db"
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    # Email settings (simulated)
    EMAIL_FROM: str = "noreply@smartmenu.com"
    SMS_FROM: str = "+1234567890"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
