"""Настройки backend, загружаемые из переменных окружения и файла .env."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Хранит адрес подключения к PostgreSQL."""
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/polls"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
