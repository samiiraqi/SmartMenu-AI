import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://smartmenu:smartmenu123@postgres:5432/smartmenu_db"
    )

    # Services
    MENU_SERVICE_URL: str = os.getenv("MENU_SERVICE_URL", "http://menu-service:8001")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3001")

    # Other
    MAX_CONVERSATION_HISTORY: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
