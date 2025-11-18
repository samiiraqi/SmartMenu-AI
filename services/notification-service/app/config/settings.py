from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Notification Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    EMAIL_FROM: str = "noreply@smartmenu.com"
    SMS_FROM: str = "+1234567890"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
