"""Sandbox service placeholder.

Phase 16 adds isolated execution (CPU/memory/time/network limits). Until then this service
exposes only a health endpoint and deliberately has NO way to run code.
"""

from fastapi import FastAPI

app = FastAPI(title="OS by AS Sandbox", version="0.1.0", docs_url=None, redoc_url=None)


@app.get("/health/live")
async def liveness() -> dict[str, str]:
    return {"status": "ok", "execution": "disabled"}
