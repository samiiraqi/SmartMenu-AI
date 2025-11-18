from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Payment Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    ORDER_SERVICE_URL: str = "http://localhost:8002"
    USER_SERVICE_URL: str = "http://localhost:8004"

    PAYMENT_CURRENCY: str = "USD"
    PAYMENT_PROVIDER: str = "stripe_simulation"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
