from fastapi.testclient import TestClient

from app.main import app
from tests.test_auth import auth,account #noqa: F401
from tests.test_friends import new_account, login, befriend

def test_start_conversation(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url = "https://testserver") as ben:
        ben_id = login(ben, new_account())
        befriend(anna, ben, ben_id)
        response = anna.post("/api/conversations", json = {"user_id": ben_id})
        assert response.status_code == 201
        conv = response.json()
        assert conv["other_user_id"] == ben_id

        again = ben.post("/api/conversations", json = {"user_id": anna_id})
        assert again.json()["id"] == conv["id"]
        assert again.json()["other_user_id"] == anna_id

def test_start_conversation_requires_friendship(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())

        assert anna.post("/api/conversations", json={"user_id": ben_id}).status_code == 403

    assert anna.post("/api/conversations", json={"user_id": anna_id}).status_code == 422
    assert anna.post("/api/conversations", json={"user_id": 999999}).status_code == 404