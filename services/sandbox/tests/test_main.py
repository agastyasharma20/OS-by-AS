from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_liveness() -> None:
    assert client.get("/health/live").json() == {"status": "ok", "execution": "disabled"}


def test_no_execution_routes_exist() -> None:
    paths = {getattr(r, "path", "") for r in app.routes}
    assert paths <= {"/health/live", "/openapi.json"}
