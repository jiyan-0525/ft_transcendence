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

        #  Anna send request to ben
        response = anna.post("/api/friends/requests", json={"user_id": ben_id})
        assert response.status_code == 201
        req = response.json()
        assert req["requester_id"] == anna_id
        assert req["addressee_id"] == ben_id
        assert req["status"] == "PENDING"

        #(idempotent) Send again -> same request 
        again = anna.post("/api/friends/requests", json={"user_id": ben_id})
        assert again.json()["id"] == req["id"]

    #  Send to him self ->422
    assert anna.post("/api/friends/requests", json={"user_id": anna_id}).status_code == 422
    #  unkown user -> 404
    assert anna.post("/api/friends/requests", json={"user_id": 999999}).status_code == 404

def test_list_friend_requests(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        anna.post("/api/friends/requests", json={"user_id": ben_id})

        response = anna.get("/api/friends/requests")
        assert response.status_code == 200
        lists = response.json()
        assert [r["addressee_id"] for r in lists["outgoing"]] == [ben_id]
        assert lists['incoming'] == []

        lists = ben.get("/api/friends/requests").json()
        assert [r["requester_id"] for r in lists["incoming"]] == [anna_id]
        assert lists["outgoing"] == []

    with TestClient(app, base_url="https://testserver") as guest:
        assert guest.get("/api/friends/requests").status_code == 401