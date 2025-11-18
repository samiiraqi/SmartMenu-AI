from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Order Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    MENU_SERVICE_URL: str = "http://localhost:8001"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
