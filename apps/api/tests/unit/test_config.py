import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app

SAFE_PROD: dict[str, object] = {
    "env": "production",
    "database_url": "postgresql+asyncpg://app:Strong-Pass-1@db.prod:5432/osbyas",
    "migration_database_url": "postgresql+asyncpg://owner:Other-Pass-2@db.prod:5432/osbyas",
    "redis_url": "rediss://:Redis-Pass-3@cache.prod:6379/0",
    "s3_endpoint_url": None,
    "s3_access_key": "AKIAEXAMPLEPROD",
    "s3_secret_key": "a-long-random-production-secret",
    "oidc_issuer_url": "https://id.osbyas.in/realms/osbyas",
    "cors_origins": ["https://app.osbyas.in"],
}


def test_environment_defaults_to_production(monkeypatch: pytest.MonkeyPatch) -> None:
    """Forgetting ENV must fail closed, not open."""
    monkeypatch.delenv("ENV", raising=False)
    with pytest.raises(ValidationError, match="Refusing to start in production"):
        Settings(_env_file=None)


def test_production_refuses_development_defaults() -> None:
    with pytest.raises(ValidationError, match="Refusing to start in production"):
        Settings(env="production", _env_file=None)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("s3_secret_key", "osbyas-dev-secret"),
        ("s3_access_key", "rustfsadmin"),
        ("database_url", "postgresql+asyncpg://app:Strong-Pass-1@localhost:5432/osbyas"),
        ("database_url", "postgresql+asyncpg://app:Strong-Pass-1@127.0.0.1:5432/osbyas"),
        ("database_url", "postgresql+asyncpg://app:Strong-Pass-1@[::1]:5432/osbyas"),
        ("database_url", "postgresql+asyncpg://app:Strong-Pass-1@host.docker.internal/osbyas"),
        ("database_url", "postgresql+asyncpg://app:osbyas-app-dev@db.prod:5432/osbyas"),
        ("migration_database_url", "postgresql+asyncpg://o:osbyas-migrator-dev@db.prod/osbyas"),
        ("redis_url", "redis://localhost:6379/0"),
        ("oidc_issuer_url", "http://id.osbyas.in/realms/osbyas"),
        ("s3_endpoint_url", "http://storage.internal:9000"),
        ("cors_origins", ["http://insecure.example"]),
        ("cors_origins", ["*"]),
        ("cors_origins", ["https://*.osbyas.in"]),
        ("cors_origins", []),
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


def test_migrations_use_owner_role_when_configured() -> None:
    settings = Settings.model_validate(SAFE_PROD)
    assert settings.migrations_url.startswith("postgresql+asyncpg://owner:")
    no_owner = Settings.model_validate({**SAFE_PROD, "migration_database_url": None})
    assert no_owner.migrations_url.startswith("postgresql+asyncpg://app:")


def test_secrets_are_not_printed_in_repr() -> None:
    settings = Settings.model_validate(SAFE_PROD)
    for secret in ("a-long-random-production-secret", "Strong-Pass-1", "Redis-Pass-3"):
        assert secret not in repr(settings)
