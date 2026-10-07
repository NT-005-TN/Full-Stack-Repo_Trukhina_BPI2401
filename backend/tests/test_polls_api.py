from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User
from app.security import create_access_token


@pytest.fixture()
def client() -> TestClient:
    """Создаёт тестовый клиент и временную базу."""
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
    """Формирует корректное тело нового опроса."""
    return {
        "title": "Новый опрос",
        "description": "Описание",
        "status": "active",
        "end_date": str(date.today() + timedelta(days=7)),
        "owner_id": 1,
        "questions": [
            {
                "text": "Первый вопрос?",
                "options": [{"text": "Да"}, {"text": "Нет"}],
            }
        ],
    }


def auth_headers() -> dict[str, str]:
    """Выпускает access token для владельца тестового опроса."""
    return {"Authorization": f"Bearer {create_access_token(1)}"}


def test_poll_crud(client: TestClient) -> None:
    """Проверяет CRUD с авторизацией владельца."""
    created = client.post("/polls", json=poll_data(), headers=auth_headers())
    assert created.status_code == 201
    poll_id = created.json()["id"]
    assert len(created.json()["questions"][0]["options"]) == 2

    assert client.get("/polls").json()[0]["title"] == "Новый опрос"
    assert client.get(f"/polls/{poll_id}").status_code == 200

    updated = client.patch(
        f"/polls/{poll_id}", json={"status": "active"}, headers=auth_headers()
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "active"

    assert client.delete(f"/polls/{poll_id}", headers=auth_headers()).status_code == 204
    assert client.get(f"/polls/{poll_id}").status_code == 404


def test_private_poll_routes_require_owner(client: TestClient) -> None:
    """Личные коллекции и черновики доступны только владельцу."""
    assert client.get("/polls/mine").status_code == 401
    created = client.post("/polls", json=poll_data(), headers=auth_headers()).json()
    mine = client.get("/polls/mine", headers=auth_headers())
    assert mine.status_code == 200
    assert mine.json()[0]["id"] == created["id"]

    assert client.post(
        "/users", json={"email": "other@example.com", "password": "password123"}
    ).status_code == 201
    other_headers = {"Authorization": f"Bearer {create_access_token(2)}"}
    response = client.patch(
        f"/polls/{created['id']}", json={"title": "Чужое изменение"}, headers=other_headers
    )
    assert response.status_code == 403


def test_poll_validation_and_missing_owner(client: TestClient) -> None:
    """Проверяет валидацию и обязательность access token."""
    invalid = poll_data()
    invalid["questions"][0]["options"] = [{"text": "Один вариант"}]
    assert client.post("/polls", json=invalid, headers=auth_headers()).status_code == 422

    missing_owner = poll_data()
    missing_owner["owner_id"] = 999
    response = client.post("/polls", json=missing_owner, headers=auth_headers())
    assert response.status_code == 201
    assert response.json()["owner_id"] == 1
"""Интеграционные проверки защищённого CRUD опросов."""
