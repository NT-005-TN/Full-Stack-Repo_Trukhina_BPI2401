"""Подключение SQLAlchemy и управление сессиями базы данных."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Общий базовый класс всех ORM-моделей."""
    pass


def get_db():
    """Выдаёт сессию маршруту FastAPI и гарантированно закрывает её."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
