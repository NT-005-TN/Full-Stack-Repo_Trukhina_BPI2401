from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    """Маршрут health возвращает успешный статус."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
"""Проверка служебного маршрута доступности приложения."""
