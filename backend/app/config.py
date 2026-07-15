"""Loads configuration from backend/.env"""
import os
from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest").strip()
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    CORS_ORIGINS: list = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
    DB_PATH: str = os.path.join(BACKEND_DIR, os.getenv("DB_PATH", "data/sales_buddy.db"))

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.GEMINI_API_KEY)


settings = Settings()
