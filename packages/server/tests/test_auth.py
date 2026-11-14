from datetime import UTC, datetime, timedelta
from hashlib import sha256
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import COOKIE_NAME
from app.database import engine, get_db
from app.main import app
from app.models import AuthSession, User


@pytest.fixture
def auth():
    # Route commits stay inside an outer transaction, even on the local dev DB.
    with engine.connect() as connection:
        connection.begin()
        with Session(
            bind=connection,
            join_transaction_mode="create_savepoint",
            expire_on_commit=False,
        ) as db:
            app.dependency_overrides[get_db] = lambda: db
            try:
                with TestClient(app, base_url="https://testserver") as client:
                    yield client, db
            finally:
                app.dependency_overrides.pop(get_db)


@pytest.fixture
def account():
    suffix = uuid4().hex
    return {
        "email": f"{suffix}@example.com",
        "username": f"user_{suffix}",
        "password": "Aa1!aaaa",
    }


def credentials(account):
    return {"email": account["email"], "password": account["password"]}


def test_registration_login_restore_and_logout(auth, account):
    client, db = auth
    assert client.get("/api/auth/me").status_code == 401

    response = client.post("/api/auth/register", json=account)
    assert response.status_code == 201
    assert "set-cookie" not in response.headers
    user = response.json()
    assert user["role"] == "USER"
    assert set(user) == {"id", "email", "username", "role", "is_active", "created_at"}
    assert client.get("/api/auth/me").status_code == 401

    response = client.post("/api/auth/login", json=credentials(account))
    assert response.status_code == 200
    assert response.json() == user
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=lax" in response.headers["set-cookie"].lower()
    token = client.cookies[COOKIE_NAME]
    digest = sha256(token.encode()).hexdigest()
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == digest))
    assert session.user_id == user["id"]
    assert client.get("/api/auth/me").json() == user

    response = client.post("/api/auth/logout")
    assert response.status_code == 204
    assert response.content == b""
    assert COOKIE_NAME not in client.cookies
    replay = client.get("/api/auth/me", headers={"Cookie": f"{COOKIE_NAME}={token}"})
    assert replay.status_code == 401


def test_validation_conflict_and_wrong_credentials(auth, account):
    client, _ = auth
    response = client.post("/api/auth/register", json={**account, "role": "ADMIN"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_PAYLOAD"
    assert account["password"] not in response.text

    response = client.post("/api/auth/register", json={**account, "password": "short"})
    assert response.status_code == 422

    assert client.post("/api/auth/register", json=account).status_code == 201
    for duplicate, message in (
        (
            {**account, "username": "other_" + uuid4().hex},
            "This email is already registered.",
        ),
        (
            {**account, "email": f"{uuid4().hex}@example.com"},
            "This username is already taken.",
        ),
    ):
        response = client.post("/api/auth/register", json=duplicate)
        assert response.status_code == 409
        error = response.json()["error"]
        assert error["code"] == "CONFLICT"
        assert error["message"] == message
        assert error["requestId"]

    response = client.post("/api/auth/login", json={**credentials(account), "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"
    assert "set-cookie" not in response.headers


def test_logout_revokes_only_current_session(auth, account):
    client, _ = auth
    assert client.post("/api/auth/register", json=account).status_code == 201
    with TestClient(app, base_url="https://testserver") as other_device:
        for device in (client, other_device):
            assert device.post("/api/auth/login", json=credentials(account)).status_code == 200
        assert client.cookies[COOKIE_NAME] != other_device.cookies[COOKIE_NAME]
        assert client.get("/api/auth/me").status_code == 200
        assert client.post("/api/auth/logout").status_code == 204
        assert other_device.get("/api/auth/me").status_code == 200


@pytest.mark.parametrize("invalid_state", ["expired", "disabled"])
def test_invalid_session_cannot_restore_identity(auth, account, invalid_state):
    client, db = auth
    user = client.post("/api/auth/register", json=account).json()
    assert client.post("/api/auth/login", json=credentials(account)).status_code == 200
    if invalid_state == "expired":
        session = db.scalar(select(AuthSession).where(AuthSession.user_id == user["id"]))
        session.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    else:
        db.get(User, user["id"]).is_active = False
    db.commit()
    assert client.get("/api/auth/me").status_code == 401


def test_cross_origin_logout_is_rejected(auth, account):
    client, _ = auth
    assert client.post("/api/auth/register", json=account).status_code == 201
    assert client.post("/api/auth/login", json=credentials(account)).status_code == 200
    response = client.post("/api/auth/logout", headers={"Origin": "https://untrusted.example"})
    assert response.status_code == 403
    assert client.get("/api/auth/me").status_code == 200


def test_status_checks_database_and_returns_request_id(auth):
    client, _ = auth
    response = client.get("/api/status")
    assert response.status_code == 200
    assert response.json()["database"] == "ok"
    assert response.headers["X-Request-ID"]


def test_post_ownership_and_moderation(auth, account):
    owner, db = auth
    other_account = {
        **account,
        "email": f"{uuid4().hex}@example.com",
        "username": "user_" + uuid4().hex,
    }
    assert owner.get("/api/posts").status_code == 401
    assert owner.post("/api/posts", json={"body": "Guest post"}).status_code == 401
    assert owner.post("/api/auth/register", json=account).status_code == 201
    assert owner.post("/api/auth/login", json=credentials(account)).status_code == 200
    owner_id = owner.get("/api/auth/me").json()["id"]
    rejected = owner.post("/api/posts", json={"body": "Forged author", "author_id": 1})
    assert rejected.status_code == 422
    assert rejected.json()["error"]["requestId"] == rejected.headers["X-Request-ID"]

    created = owner.post("/api/posts", json={"body": "Hello from Week 1"})
    assert created.status_code == 201
    post = created.json()
    assert post["author_id"] == owner_id
    path = f"/api/posts/{post['id']}"
    assert owner.patch(path, json={"body": "Updated text"}).status_code == 200

    with TestClient(app, base_url="https://testserver") as other:
        assert other.post("/api/auth/register", json=other_account).status_code == 201
        assert other.post("/api/auth/login", json=credentials(other_account)).status_code == 200
        assert other.patch(path, json={"body": "Other edit"}).status_code == 403
        assert other.delete(path).status_code == 403
        assert {row["id"]: row["body"] for row in other.get("/api/posts").json()}[
            post["id"]
        ] == "Updated text"

        other_id = other.get("/api/auth/me").json()["id"]
        db.get(User, other_id).role = "MODERATOR"
        db.commit()
        assert other.patch(path, json={"body": "Moderator edit"}).status_code == 403
        assert other.delete(path).status_code == 204

    assert all(row["id"] != post["id"] for row in owner.get("/api/posts").json())
    assert owner.post("/api/auth/logout").status_code == 204
    assert owner.post("/api/posts", json={"body": "Logged out"}).status_code == 401
