import os

import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Pong API")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "pong-api"}


def main() -> None:
    uvicorn.run(
        "app.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "3000")),
        reload=os.getenv("APP_ENV", "development") == "development",
    )


if __name__ == "__main__":
    main()
