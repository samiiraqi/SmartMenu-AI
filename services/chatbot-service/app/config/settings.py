from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application Settings
    Loads configuration from environment variables
    """

    # API Settings
    APP_NAME: str = "Chatbot Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database Settings
    DATABASE_URL: str = "postgresql://smartmenu_user:smartmenu_pass@localhost:5432/smartmenu_chatbot_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Settings
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    # Other Microservices URLs
    MENU_SERVICE_URL: str = "http://localhost:8001"
    ORDER_SERVICE_URL: str = "http://localhost:8002"

    # AI Settings
    OPENAI_API_KEY: str = "your-openai-api-key-here"  # Optional
    AI_MODEL: str = "gpt-3.5-turbo"  # or "gpt-4"
    MAX_TOKENS: int = 500
    TEMPERATURE: float = 0.7

    # Chatbot Settings
    MAX_CONVERSATION_HISTORY: int = 10
    CONVERSATION_TIMEOUT_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
