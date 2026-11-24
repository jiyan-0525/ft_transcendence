from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.main import app
from tests.test_auth import auth, account, credentials   # noqa: F401  (Fixtures wiederverwenden)
from app.models import Friendship

def new_account():
    suffix = uuid4().hex
    return {"email": f"{suffix}@example.com", "username": f"user_{suffix}", "password": "Aa1!aaaa"}


def login(client, acc):
    assert client.post("/api/auth/register", json=acc).status_code == 201
    assert client.post("/api/auth/login", json=credentials(acc)).status_code == 200
    return client.get("/api/auth/me").json()["id"]

def befriend(requester, addressee, addressee_id):
    req = requester.post("/api/friends/requests", json={"user_id": addressee_id})
    assert req.status_code == 201
    accepted = addressee.post(f"/api/friends/requests/{req.json()['id']}/accept")
    assert accepted.status_code == 200

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

def test_accept_friend_request(auth, account):
    anna, db = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        req = anna.post("/api/friends/requests", json={"user_id": ben_id}).json()
        path = f"/api/friends/requests/{req['id']}/accept"

        assert anna.post(path).status_code == 403

        response = ben.post(path)
        assert response.status_code == 200
        assert response.json()["status"] == "ACCEPTED"

        assert ben.post(path).status_code == 409

        assert ben.get("/api/friends/requests").json()["incoming"] == []
    
    friendship = db.scalar(
        select(Friendship).where(
            Friendship.user_a_id == min(anna_id, ben_id), Friendship.user_b_id == max(anna_id, ben_id),
        )
    )

    assert friendship is not None

    assert anna.post("/api/friends/requests/99999/accept").status_code == 404
def test_accept_creates_separate_friendships(auth, account):
    anna, db = auth
    anna_id = login(anna, account)

    for _ in range(2):                       # zweimal: Ben, dann Carl
        with TestClient(app, base_url="https://testserver") as other:
            other_id = login(other, new_account())
            req = anna.post("/api/friends/requests", json={"user_id": other_id}).json()
            assert other.post(f"/api/friends/requests/{req['id']}/accept").status_code == 200

            friendship = db.scalar(
                select(Friendship).where(
                    Friendship.user_a_id == min(anna_id, other_id),
                    Friendship.user_b_id == max(anna_id, other_id),
                )
            )
            assert friendship is not None


def test_reject_friend_request(auth, account):
    anna, db = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        req = anna.post("/api/friends/requests", json={"user_id": ben_id}).json()
        path = f"/api/friends/requests/{req['id']}/reject"

        assert anna.post(path).status_code == 403

        response = ben.post(path)
        assert response.status_code == 200
        assert response.json()["status"] == "REJECTED"

        assert ben.post(path).status_code == 409    

        assert ben.get("api/friends/requests").json()["incoming"] == []
     
    friendship = db.scalar(
        select(Friendship).where(
            Friendship.user_a_id == min(anna_id, ben_id), Friendship.user_b_id == max(anna_id, ben_id),
        )
    )

    assert friendship is None

    assert anna.post("/api/friends/requests/99999/reject").status_code == 404

def test_list_friends(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url = "https://testserver") as ben:
        ben_account = new_account()
        ben_id = login(ben, ben_account)

        #anna and ben get friends
        req = anna.post("/api/friends/requests", json={"user_id": ben_id}).json()
        assert ben.post(f"/api/friends/requests/{req['id']}/accept").status_code == 200

        friends = anna.get("/api/friends").json()
        assert [f["user_id"] for f in friends] == [ben_id]
        assert friends[0]["username"] == ben_account["username"]
        friends = ben.get("/api/friends").json()
        assert [f["user_id"] for f in friends] == [anna_id]


    with TestClient(app, base_url = "https://testserver") as guest:
        assert guest.get("/api/friends"). status_code == 401

    with TestClient(app, base_url="https://testserver") as carl:
        login(carl, new_account())
        assert carl.get("/api/friends").json() == []

def test_remove_friend(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)
  
    with TestClient(app, base_url = "https://testserver") as ben:
        ben_id = login(ben, new_account())
        req = anna.post("/api/friends/requests", json = {"user_id": ben_id}).json()
        assert ben.post(f"/api/friends/requests/{req['id']}/accept").status_code == 200
        assert anna.delete(f"api/friends/{ben_id}").status_code == 204
        assert anna.get("/api/friends").json() == []
        assert ben.get("/api/friends").json() == []

        assert anna.delete(f"/api/friends/{ben_id}").status_code == 404
    
    with TestClient(app, base_url="https://testserver") as guest:
        assert guest.delete(f"/api/friends/{anna_id}").status_code == 401

def test_cannot_request_existing_friend(auth, account):
    anna, _ = auth
    login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        befriend(anna, ben, ben_id)

        assert anna.post("/api/friends/requests", json={"user_id": ben_id}).status_code == 409


def test_cannot_send_request_back(auth, account):
    anna, _ = auth
    anna_id = login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        assert anna.post("/api/friends/requests", json={"user_id": ben_id}).status_code == 201

        assert ben.post("/api/friends/requests", json={"user_id": anna_id}).status_code == 409


def test_request_again_after_removal(auth, account):
    anna, _ = auth
    login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_id = login(ben, new_account())
        befriend(anna, ben, ben_id)
        assert anna.delete(f"/api/friends/{ben_id}").status_code == 204

        befriend(anna, ben, ben_id)          # klappt jetzt ein zweites Mal
        assert [f["user_id"] for f in anna.get("/api/friends").json()] == [ben_id]

def test_request_list_show_name(auth, account):
    anna, _ = auth
    login(anna, account)

    with TestClient(app, base_url="https://testserver") as ben:
        ben_account = new_account()
        ben_id = login(ben, ben_account)
        anna.post("/api/friends/requests", json={"user_id": ben_id})
        incoming = ben.get("/api/friends/requests").json()["incoming"]
        assert incoming[0]["requester_username"] == account["username"]
        assert incoming[0]["addressee_username"] == ben_account["username"]