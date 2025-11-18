from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Payment Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql://smartmenu_user:smartmenu_pass@localhost:5432/smartmenu_payments_db"

    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    # Other services
    ORDER_SERVICE_URL: str = "http://localhost:8002"
    USER_SERVICE_URL: str = "http://localhost:8004"

    # Payment settings
    PAYMENT_CURRENCY: str = "USD"
    PAYMENT_PROVIDER: str = "stripe_simulation"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
