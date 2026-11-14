from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.auth import DbSession
from app.auth import router as auth_router
from app.config import settings
from app.errors import install_error_handlers
from app.posts import router as posts_router


app = FastAPI(title=settings.app_name)
install_error_handlers(app)
app.include_router(auth_router)
app.include_router(posts_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
    }


@app.get("/api/status")
def status(db: DbSession):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(503, "Database unavailable.") from exc
    return {"status": "ok", "database": "ok"}
