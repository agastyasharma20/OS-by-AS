from typing import Literal

from pydantic import BaseModel, ConfigDict

CheckStatus = Literal["ok", "down"]
# Generic, non-sensitive failure codes. Real exception details go to server logs only.
CheckError = Literal["timeout", "unavailable"]


class CheckResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: CheckStatus
    latency_ms: float
    error: CheckError | None = None


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["ok", "degraded"]
    checks: dict[str, CheckResult]


class LivenessResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["ok"]
