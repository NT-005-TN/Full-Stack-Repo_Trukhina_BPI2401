from fastapi import FastAPI

app = FastAPI(title="Система опросов и голосований")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
