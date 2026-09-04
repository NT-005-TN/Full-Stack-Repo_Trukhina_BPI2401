from fastapi import FastAPI

from .routers import polls, users

app = FastAPI(title="Система опросов и голосований")
app.include_router(polls.router)
app.include_router(users.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
