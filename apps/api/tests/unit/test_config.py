import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app

SAFE_PROD: dict[str, object] = {
    "env": "production",
    "database_url": "postgresql+asyncpg://app:Strong-Pass-1@db.prod:5432/osbyas",
    "redis_url": "rediss://cache.prod:6379/0",
    "s3_access_key": "AKIAEXAMPLEPROD",
    "s3_secret_key": "a-long-random-production-secret",
    "cors_origins": ["https://app.osbyas.in"],
}


def test_production_refuses_development_defaults() -> None:
    with pytest.raises(ValidationError, match="Refusing to start in production"):
        Settings(env="production")


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("s3_secret_key", "minioadmin"),
        ("database_url", "postgresql+asyncpg://osbyas:osbyas@localhost:5432/osbyas"),
        ("cors_origins", ["http://insecure.example"]),
    ],
)
def test_production_rejects_each_unsafe_value(field: str, value: object) -> None:
    with pytest.raises(ValidationError, match=field):
        Settings.model_validate({**SAFE_PROD, field: value})


def test_production_with_real_settings_starts_and_hides_docs() -> None:
    settings = Settings.model_validate(SAFE_PROD)
    app = create_app(settings)
    paths = {getattr(r, "path", "") for r in app.routes}
    assert "/api/docs" not in paths
    assert "/api/openapi.json" not in paths


def test_secrets_are_not_printed_in_repr() -> None:
    settings = Settings.model_validate(SAFE_PROD)
    assert "a-long-random-production-secret" not in repr(settings)
