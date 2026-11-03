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


async def test_app_role_cannot_bypass_row_level_security() -> None:
    """RLS (Phase 2) is meaningless if the runtime role is a superuser, owner or BYPASSRLS."""
    async with get_engine().connect() as conn:
        row = (
            await conn.execute(
                text(
                    "SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb "
                    "FROM pg_roles WHERE rolname = current_user"
                )
            )
        ).one()
        assert tuple(row) == (False, False, False, False)
        owns = await conn.execute(
            text(
                "SELECT count(*) FROM pg_class "
                "WHERE relowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)"
            )
        )
        assert owns.scalar_one() == 0
