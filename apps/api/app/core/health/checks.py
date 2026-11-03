"""Dependency probes. Each probe raises on failure and returns None on success."""

import asyncio
from collections.abc import Awaitable, Callable

import httpx
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import get_engine
from app.core.redis import get_redis
from app.core.storage import get_s3_client

Probe = Callable[[], Awaitable[None]]


async def check_database() -> None:
    async with get_engine().connect() as conn:
        await conn.execute(text("SELECT 1"))


async def check_redis() -> None:
    if not await get_redis().ping():
        raise RuntimeError("redis ping returned false")


async def check_storage() -> None:
    bucket = get_settings().s3_bucket
    await asyncio.to_thread(get_s3_client().head_bucket, Bucket=bucket)


async def check_identity() -> None:
    url = get_settings().oidc_issuer_url.rstrip("/") + "/.well-known/openid-configuration"
    async with httpx.AsyncClient(timeout=2.0) as client:
        response = await client.get(url)
        response.raise_for_status()


def default_probes() -> dict[str, Probe]:
    return {
        "database": check_database,
        "redis": check_redis,
        "storage": check_storage,
        "identity": check_identity,
    }
