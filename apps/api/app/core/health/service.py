import asyncio
import logging
import time

from app.core.health.checks import Probe
from app.core.health.schemas import CheckResult, HealthResponse

logger = logging.getLogger(__name__)


async def _run_probe(name: str, probe: Probe, timeout_s: float) -> CheckResult:
    started = time.perf_counter()
    try:
        await asyncio.wait_for(probe(), timeout=timeout_s)
    except TimeoutError:
        logger.warning("health check timed out", extra={"check": name})
        return CheckResult(status="down", latency_ms=_ms(started), error="timeout")
    except Exception:
        logger.exception("health check failed", extra={"check": name})
        return CheckResult(status="down", latency_ms=_ms(started), error="unavailable")
    return CheckResult(status="ok", latency_ms=_ms(started))


def _ms(started: float) -> float:
    return round((time.perf_counter() - started) * 1000, 2)


async def run_health_checks(probes: dict[str, Probe], timeout_s: float) -> HealthResponse:
    names = list(probes)
    results = await asyncio.gather(*(_run_probe(n, probes[n], timeout_s) for n in names))
    checks = dict(zip(names, results, strict=True))
    overall = "ok" if all(r.status == "ok" for r in results) else "degraded"
    return HealthResponse(status=overall, checks=checks)
