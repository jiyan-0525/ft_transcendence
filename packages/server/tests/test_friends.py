from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from tests.test_auth import auth, account, credentials   # noqa: F401  (Fixtures wiederverwenden)


def new_account():
    suffix = uuid4().hex
    return {"email": f"{suffix}@example.com", "username": f"user_{suffix}", "password": "Aa1!aaaa"}


def login(client, acc):
    assert client.post("/api/auth/register", json=acc).status_code == 201
    assert client.post("/api/auth/login", json=credentials(acc)).status_code == 200
    return client.get("/api/auth/me").json()["id"]


def test_send_friend_request(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())

        # Anna fragt Ben an
        response = anna.post("/api/friends/requests", json={"user_id": ben_id})
        assert response.status_code == 201
        req = response.json()
        assert req["requester_id"] == anna_id
        assert req["addressee_id"] == ben_id
        assert req["status"] == "PENDING"

        # Nochmal senden -> dieselbe Anfrage zurück (idempotent)
        again = anna.post("/api/friends/requests", json={"user_id": ben_id})
        assert again.json()["id"] == req["id"]

    # Sich selbst anfragen -> 422
    assert anna.post("/api/friends/requests", json={"user_id": anna_id}).status_code == 422
    # Unbekannter Nutzer -> 404
    assert anna.post("/api/friends/requests", json={"user_id": 999999}).status_code == 404