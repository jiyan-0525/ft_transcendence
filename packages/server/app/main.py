from fastapi import FastAPI

from app.auth import router as auth_router
from app.config import settings
from app.errors import install_error_handlers


app = FastAPI(title=settings.app_name)
install_error_handlers(app)
app.include_router(auth_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
    }
