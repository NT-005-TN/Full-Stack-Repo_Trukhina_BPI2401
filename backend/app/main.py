"""Точка входа FastAPI-приложения и подключение маршрутов."""

from fastapi import FastAPI

from .routers import polls, users

app = FastAPI(title="Система опросов и голосований")
app.include_router(polls.router)
app.include_router(users.router)


@app.get("/health")
def health() -> dict[str, str]:
    """Простая проверка доступности backend."""
    return {"status": "ok"}
