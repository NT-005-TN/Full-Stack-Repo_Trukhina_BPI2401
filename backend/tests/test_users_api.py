from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User


@pytest.fixture()
def client_and_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)

    def get_test_db():
        with test_session() as db:
            yield db

    app.dependency_overrides[get_db] = get_test_db
    with TestClient(app) as client:
        yield client, test_session
    app.dependency_overrides.clear()


def test_user_crud_and_password_hash(client_and_session) -> None:
    client, test_session = client_and_session
    created = client.post(
        "/users", json={"email": "student@example.com", "password": "password123"}
    )
    assert created.status_code == 201
    assert created.json() == {"id": 1, "email": "student@example.com"}

    with test_session() as db:
        saved_user = db.scalar(select(User))
        assert saved_user is not None
        assert saved_user.password_hash != "password123"

    assert client.get("/users").json() == [created.json()]
    updated = client.patch("/users/1", json={"email": "new@example.com"})
    assert updated.json()["email"] == "new@example.com"
    assert client.delete("/users/1").status_code == 204
    assert client.get("/users/1").status_code == 404


def test_duplicate_email_and_invalid_password(client_and_session) -> None:
    client, _ = client_and_session
    data = {"email": "student@example.com", "password": "password123"}
    assert client.post("/users", json=data).status_code == 201
    assert client.post("/users", json=data).status_code == 409
    assert client.post(
        "/users", json={"email": "second@example.com", "password": "short"}
    ).status_code == 422
    assert client.post(
        "/users", json={"email": "not-an-email", "password": "password123"}
    ).status_code == 422


def test_user_with_poll_cannot_be_deleted(client_and_session) -> None:
    client, _ = client_and_session
    user = client.post(
        "/users", json={"email": "owner@example.com", "password": "password123"}
    ).json()
    poll = {
        "title": "Опрос владельца",
        "end_date": str(date.today() + timedelta(days=7)),
        "owner_id": user["id"],
        "questions": [
            {
                "text": "Вопрос?",
                "options": [{"text": "Да"}, {"text": "Нет"}],
            }
        ],
    }
    assert client.post("/polls", json=poll).status_code == 201

    response = client.delete(f"/users/{user['id']}")
    assert response.status_code == 409
    assert response.json()["detail"] == "Сначала удалите опросы пользователя"
