from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    """Маршрут health подтверждает работу приложения."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_local_frontend_is_allowed_by_cors() -> None:
    """Локальный frontend может обращаться к backend из браузера."""
    response = client.options(
        "/polls",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
"""Проверки доступности API и разрешённого локального CORS."""
