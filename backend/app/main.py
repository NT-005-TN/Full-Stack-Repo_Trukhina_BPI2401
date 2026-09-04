from fastapi import FastAPI

from .routers import polls

app = FastAPI(title="Система опросов и голосований")
app.include_router(polls.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
