"""Точка входа FastAPI-приложения и подключение маршрутов."""

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, polls, users

app = FastAPI(title="Система опросов и голосований")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(polls.router)
app.include_router(users.router)


@app.get("/health")
def health() -> dict[str, str]:
    """Простая проверка доступности backend."""
    return {"status": "ok"}
