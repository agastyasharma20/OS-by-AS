"""Runs against the real Postgres and Redis from docker compose (`make infra-up`)."""

import pytest
from sqlalchemy import text

from app.core.db import get_engine
from app.core.health.checks import check_database, check_redis

pytestmark = pytest.mark.integration


async def test_database_probe_succeeds() -> None:
    await check_database()


async def test_redis_probe_succeeds() -> None:
    await check_redis()


async def test_pgvector_extension_is_installed() -> None:
    async with get_engine().connect() as conn:
        result = await conn.execute(text("SELECT extname FROM pg_extension WHERE extname='vector'"))
        assert result.scalar_one() == "vector"
