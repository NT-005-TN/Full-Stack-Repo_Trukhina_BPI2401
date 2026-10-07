import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client():
    """Создаёт API-клиент с отдельной тестовой базой."""
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    sessions = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)

    def get_test_db():
        with sessions() as db:
            yield db

    app.dependency_overrides[get_db] = get_test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_register_login_refresh_and_logout(client: TestClient):
    """Проверяет регистрацию, вход, обновление и отзыв refresh token."""
    credentials = {"email": "student@example.com", "password": "password123"}
    registered = client.post("/auth/register", json=credentials)
    assert registered.status_code == 201
    tokens = registered.json()

    me = client.get(
        "/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert me.json()["email"] == credentials["email"]

    refreshed = client.post(
        "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refreshed.status_code == 200
    assert client.post(
        "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    ).status_code == 401

    new_refresh = refreshed.json()["refresh_token"]
    assert client.post("/auth/logout", json={"refresh_token": new_refresh}).status_code == 204
    assert client.post(
        "/auth/refresh", json={"refresh_token": new_refresh}
    ).status_code == 401

    assert client.post("/auth/login", json=credentials).status_code == 200
    assert client.post(
        "/auth/login", json={**credentials, "password": "wrong-password"}
    ).status_code == 401


def test_protected_route_requires_access_token(client: TestClient):
    """Защищённый маршрут отклоняет запрос без access token."""
    assert client.get("/auth/me").status_code == 401
    assert client.get(
        "/auth/me", headers={"Authorization": "Bearer broken-token"}
    ).status_code == 401
"""Интеграционные проверки полного жизненного цикла токенов."""
