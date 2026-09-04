from sqlalchemy.engine import Engine

from . import models
from .database import Base, engine


def create_tables(database_engine: Engine = engine) -> None:
    Base.metadata.create_all(database_engine)


if __name__ == "__main__":
    create_tables()
    print("Таблицы базы данных созданы.")
