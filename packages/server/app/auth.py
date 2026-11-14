from datetime import UTC, datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AuthSession, User
from app.schemas import LoginRequest, RegisterRequest, UserResponse
from app.security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
COOKIE_NAME = "session"
DbSession = Annotated[Session, Depends(get_db)]
SessionToken = Annotated[str | None, Cookie(alias=COOKIE_NAME)]
LOCAL_ORIGINS = {
    f"http://{host}:{port}"
    for host in ("localhost", "127.0.0.1")
    for port in (5173, 8000)
}


def require_trusted_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin is None:
        return
    allowed = {settings.auth_allowed_origin} if settings.auth_allowed_origin else set()
    if settings.app_env != "production":
        allowed.update(LOCAL_ORIGINS)
    if origin not in allowed:
        raise HTTPException(403, "Request origin is not allowed.")


def token_digest(token: str) -> str:
    return sha256(token.encode()).hexdigest()


def get_current_user(db: DbSession, token: SessionToken = None) -> User:
    if token:
        user = db.scalar(
            select(User)
            .join(AuthSession, AuthSession.user_id == User.id)
            .where(
                AuthSession.token_hash == token_digest(token),
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > datetime.now(UTC),
                User.is_active.is_(True),
            )
        )
        if user is not None:
            return user
    raise HTTPException(401, "Authentication required.")


@router.post(
    "/register", response_model=UserResponse, status_code=201,
    dependencies=[Depends(require_trusted_origin)],
)
def register(body: RegisterRequest, db: DbSession) -> User:
    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password.get_secret_value()),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if getattr(exc.orig, "sqlstate", None) == "23505":
            constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
            if constraint == "users_email_key":
                raise HTTPException(409, "This email is already registered.") from exc
            if constraint == "users_username_key":
                raise HTTPException(409, "This username is already taken.") from exc
        raise
    return user


@router.post(
    "/login", response_model=UserResponse, dependencies=[Depends(require_trusted_origin)]
)
def login(body: LoginRequest, response: Response, db: DbSession) -> User:
    user = db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password.get_secret_value(), user.password_hash):
        raise HTTPException(401, "Invalid email or password.")
    if not user.is_active:
        raise HTTPException(401, "Invalid email or password.")

    token = token_urlsafe(32)
    db.add(
        AuthSession(
            user_id=user.id,
            token_hash=token_digest(token),
            expires_at=datetime.now(UTC) + timedelta(hours=settings.auth_session_hours),
        )
    )
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        path="/",
    )
    return user


@router.get("/me", response_model=UserResponse)
def me(response: Response, user: Annotated[User, Depends(get_current_user)]) -> User:
    response.headers["Cache-Control"] = "no-store"
    return user


@router.post("/logout", status_code=204, dependencies=[Depends(require_trusted_origin)])
def logout(db: DbSession, token: SessionToken = None) -> Response:
    if token:
        db.execute(
            update(AuthSession)
            .where(AuthSession.token_hash == token_digest(token), AuthSession.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
        db.commit()
    response = Response(status_code=204, headers={"Cache-Control": "no-store"})
    response.delete_cookie(
        COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
    )
    return response
