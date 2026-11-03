from collections.abc import AsyncIterator

import pytest

from app.core.db import get_engine
from app.core.redis import get_redis


@pytest.fixture(autouse=True)
async def _fresh_connections() -> AsyncIterator[None]:
    # Each test has its own event loop; pooled connections must not cross loops.
    yield
    await get_engine().dispose()
    await get_redis().aclose()
    get_redis.cache_clear()
