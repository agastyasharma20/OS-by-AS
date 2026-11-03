from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

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


@router.get(
    "",
    response_model=HealthResponse,
    summary="Dependency health",
    responses={503: {"model": HealthResponse, "description": "One or more dependencies are down"}},
)
async def health(
    response: Response,
    probes: Annotated[dict[str, Probe], Depends(get_probes)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> HealthResponse:
    # Phase 5 restricts detailed output to platform operators (tracker: known limitations).
    result = await run_health_checks(probes, settings.health_check_timeout_seconds)
    if result.status != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result
