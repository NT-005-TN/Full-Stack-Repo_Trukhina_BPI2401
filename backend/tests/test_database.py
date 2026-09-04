from sqlalchemy import create_engine, inspect
from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

from app.database import Base
from app.init_db import create_tables


EXPECTED_TABLES = {
    "users",
    "polls",
    "questions",
    "options",
    "participations",
    "submissions",
    "answers",
}


def test_create_all_tables_and_foreign_keys() -> None:
    engine = create_engine("sqlite:///:memory:")
    create_tables(engine)
    inspector = inspect(engine)

    assert set(inspector.get_table_names()) == EXPECTED_TABLES
    assert inspector.get_foreign_keys("polls")[0]["referred_table"] == "users"
    assert inspector.get_foreign_keys("questions")[0]["referred_table"] == "polls"
    assert inspector.get_foreign_keys("options")[0]["referred_table"] == "questions"


def test_models_generate_postgresql_ddl() -> None:
    statements = [
        str(CreateTable(table).compile(dialect=postgresql.dialect()))
        for table in Base.metadata.sorted_tables
    ]

    assert len(statements) == len(EXPECTED_TABLES)
    assert all("CREATE TABLE" in statement for statement in statements)
    assert any("FOREIGN KEY(owner_id) REFERENCES users" in statement for statement in statements)
