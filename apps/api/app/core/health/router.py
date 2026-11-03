import asyncio
import time
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status

from app.core.config import Settings, get_settings
from app.core.health.checks import Probe, default_probes
from app.core.health.schemas import HealthResponse, LivenessResponse
from app.core.health.service import run_health_checks

router = APIRouter(prefix="/health", tags=["health"])


def get_probes() -> dict[str, Probe]:
    return default_probes()


@router.get("/live", response_model=LivenessResponse, summary="Process liveness (no dependencies)")
async def liveness() -> LivenessResponse:
    return LivenessResponse(status="ok")


async def _cached_health(
    request: Request, probes: dict[str, Probe], settings: Settings
) -> HealthResponse:
    """Run probes at most once per `health_cache_seconds` per process.

    Unauthenticated callers can therefore not use this endpoint to amplify load on dependencies.
    """
    state = request.app.state
    if not hasattr(state, "health_lock"):
        state.health_lock = asyncio.Lock()
        state.health_cache = None
    async with state.health_lock:
        cached: tuple[float, HealthResponse] | None = state.health_cache
        now = time.monotonic()
        if cached and now - cached[0] < settings.health_cache_seconds:
            return cached[1]
        result = await run_health_checks(probes, settings.health_check_timeout_seconds)
        state.health_cache = (time.monotonic(), result)
        return result


@router.get(
    "",
    response_model=HealthResponse,
    summary="Dependency health",
    responses={503: {"model": HealthResponse, "description": "One or more dependencies are down"}},
)
async def health(
    request: Request,
    response: Response,
    probes: Annotated[dict[str, Probe], Depends(get_probes)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> HealthResponse:
    # Phase 5 restricts detailed output to platform operators (tracker: known limitations).
    result = await _cached_health(request, probes, settings)
    response.headers["Cache-Control"] = "no-store"
    if result.status != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result
