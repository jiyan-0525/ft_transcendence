from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_service_status() -> None:
    response = TestClient(app).get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "pong-api"}
    assert response.headers["content-type"].startswith("application/json")
