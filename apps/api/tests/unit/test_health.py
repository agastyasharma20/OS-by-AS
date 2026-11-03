import asyncio
import time

import httpx
import pytest
from fastapi import FastAPI

from app.core.config import Settings, get_settings
from app.core.health.checks import Probe
from app.core.health.router import get_probes

NAMES = ("database", "redis", "storage", "identity")


async def ok() -> None:
    return None


async def boom() -> None:
    raise ConnectionError("postgresql://osbyas:supersecret@db.internal:5432 refused")


async def slow() -> None:
    await asyncio.sleep(5)


def install(app: FastAPI, probes: dict[str, Probe], timeout: float = 2.0) -> None:
    app.dependency_overrides[get_probes] = lambda: probes
    app.dependency_overrides[get_settings] = lambda: Settings(
        env="test", health_check_timeout_seconds=timeout
    )


async def test_all_dependencies_up_returns_ok(app: FastAPI, client: httpx.AsyncClient) -> None:
    install(app, {n: ok for n in NAMES})
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert set(body["checks"]) == set(NAMES)
    assert all(c["status"] == "ok" and c["error"] is None for c in body["checks"].values())


@pytest.mark.parametrize("failing", NAMES)
async def test_one_dependency_down_returns_503(
    app: FastAPI, client: httpx.AsyncClient, failing: str
) -> None:
    install(app, {n: (boom if n == failing else ok) for n in NAMES})
    response = await client.get("/api/v1/health")
    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "degraded"
    assert body["checks"][failing] == {
        "status": "down",
        "latency_ms": body["checks"][failing]["latency_ms"],
        "error": "unavailable",
    }
    assert all(body["checks"][n]["status"] == "ok" for n in NAMES if n != failing)


async def test_failure_details_are_not_leaked(app: FastAPI, client: httpx.AsyncClient) -> None:
    install(app, {n: boom for n in NAMES})
    response = await client.get("/api/v1/health")
    for secret in ("supersecret", "db.internal", "postgresql", "refused"):
        assert secret not in response.text


async def test_slow_dependency_times_out_without_blocking_others(
    app: FastAPI, client: httpx.AsyncClient
) -> None:
    install(app, {"database": slow, "redis": slow, "storage": ok, "identity": ok}, timeout=0.2)
    started = time.perf_counter()
    response = await client.get("/api/v1/health")
    elapsed = time.perf_counter() - started
    assert response.status_code == 503
    checks = response.json()["checks"]
    assert checks["database"]["error"] == "timeout"
    assert checks["redis"]["error"] == "timeout"
    assert checks["storage"]["status"] == "ok"
    assert elapsed < 1.0, "checks must run concurrently and respect the timeout"


async def test_liveness_never_touches_dependencies(app: FastAPI, client: httpx.AsyncClient) -> None:
    called = False

    async def spy() -> None:
        nonlocal called
        called = True

    install(app, {n: spy for n in NAMES})
    response = await client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert called is False
