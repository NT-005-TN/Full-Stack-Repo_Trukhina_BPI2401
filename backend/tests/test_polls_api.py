from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User


@pytest.fixture()
def client() -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)

    with test_session() as db:
        db.add(User(email="owner@example.com", password_hash="hash"))
        db.commit()

    def get_test_db():
        with test_session() as db:
            yield db

    app.dependency_overrides[get_db] = get_test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def poll_data() -> dict:
    return {
        "title": "Новый опрос",
        "description": "Описание",
        "end_date": str(date.today() + timedelta(days=7)),
        "owner_id": 1,
        "questions": [
            {
                "text": "Первый вопрос?",
                "options": [{"text": "Да"}, {"text": "Нет"}],
            }
        ],
    }


def test_poll_crud(client: TestClient) -> None:
    created = client.post("/polls", json=poll_data())
    assert created.status_code == 201
    poll_id = created.json()["id"]
    assert len(created.json()["questions"][0]["options"]) == 2

    assert client.get("/polls").json()[0]["title"] == "Новый опрос"
    assert client.get(f"/polls/{poll_id}").status_code == 200

    updated = client.patch(f"/polls/{poll_id}", json={"status": "active"})
    assert updated.status_code == 200
    assert updated.json()["status"] == "active"

    assert client.delete(f"/polls/{poll_id}").status_code == 204
    assert client.get(f"/polls/{poll_id}").status_code == 404


def test_poll_validation_and_missing_owner(client: TestClient) -> None:
    invalid = poll_data()
    invalid["questions"][0]["options"] = [{"text": "Один вариант"}]
    assert client.post("/polls", json=invalid).status_code == 422

    missing_owner = poll_data()
    missing_owner["owner_id"] = 999
    response = client.post("/polls", json=missing_owner)
    assert response.status_code == 404
    assert response.json()["detail"] == "Владелец опроса не найден"
