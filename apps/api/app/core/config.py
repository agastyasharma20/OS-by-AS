"""Application settings. All configuration comes from the environment (.env in development).

Safe by default: `env` defaults to "production", which turns on strict validation. Development and
tests must opt out explicitly with ENV=development / ENV=test.
"""

import ipaddress
from functools import lru_cache
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "test", "production"]

# Values that are only acceptable on a developer machine. Production refuses to start with them.
DEV_ONLY_SECRETS = frozenset(
    {
        "",
        "changeme",
        "password",
        "osbyas",
        "osbyas-dev",
        "osbyas-dev-secret",
        "osbyas-app-dev",
        "osbyas-migrator-dev",
        "minioadmin",
        "rustfsadmin",
    }
)
LOCAL_HOSTNAMES = frozenset({"localhost", "host.docker.internal", "0.0.0.0"})  # noqa: S104


def _is_local_host(host: str | None) -> bool:
    if not host:
        return True
    host = host.strip("[]").lower()
    if host in LOCAL_HOSTNAMES or host.endswith(".localhost"):
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _url_problems(name: str, raw: str, *, require_tls: bool = False) -> list[str]:
    parts = urlsplit(raw)
    problems: list[str] = []
    if _is_local_host(parts.hostname):
        problems.append(f"{name} (local host)")
    if parts.password is not None and parts.password in DEV_ONLY_SECRETS:
        problems.append(f"{name} (development password)")
    if require_tls and parts.scheme != "https":
        problems.append(f"{name} (must use https)")
    return problems


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    env: Environment = "production"
    app_name: str = "OS by AS"

    # Runtime role: no superuser, no BYPASSRLS, does not own tables (ADR 0003).
    database_url: SecretStr = SecretStr(
        "postgresql+asyncpg://osbyas_app:osbyas-app-dev@localhost:5432/osbyas"
    )
    # Owner role used only by Alembic. Falls back to database_url when unset.
    migration_database_url: SecretStr | None = None
    redis_url: SecretStr = SecretStr("redis://:osbyas-dev@localhost:6379/0")

    s3_endpoint_url: str | None = "http://localhost:9000"
    s3_region: str = "ap-south-1"
    s3_bucket: str = "osbyas-private"
    s3_access_key: SecretStr = SecretStr("osbyas-dev")
    s3_secret_key: SecretStr = SecretStr("osbyas-dev-secret")

    oidc_issuer_url: str = "http://localhost:8080/realms/osbyas"

    health_check_timeout_seconds: float = Field(default=2.0, gt=0, le=10)
    health_cache_seconds: float = Field(default=5.0, ge=0, le=60)
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def docs_enabled(self) -> bool:
        return self.env != "production"

    @property
    def migrations_url(self) -> str:
        url = self.migration_database_url or self.database_url
        return url.get_secret_value()

    @model_validator(mode="after")
    def _refuse_dev_settings_in_production(self) -> "Settings":
        if self.env != "production":
            return self
        problems: list[str] = []
        for name in ("s3_access_key", "s3_secret_key"):
            value: SecretStr = getattr(self, name)
            if value.get_secret_value() in DEV_ONLY_SECRETS:
                problems.append(name)
        problems += _url_problems("database_url", self.database_url.get_secret_value())
        if self.migration_database_url is not None:
            problems += _url_problems(
                "migration_database_url", self.migration_database_url.get_secret_value()
            )
        problems += _url_problems("redis_url", self.redis_url.get_secret_value())
        problems += _url_problems("oidc_issuer_url", self.oidc_issuer_url, require_tls=True)
        if self.s3_endpoint_url is not None:
            problems += _url_problems("s3_endpoint_url", self.s3_endpoint_url, require_tls=True)
        if not self.cors_origins:
            problems.append("cors_origins (empty)")
        for origin in self.cors_origins:
            if origin == "*" or not origin.startswith("https://") or "*" in origin:
                problems.append(f"cors_origins ({origin!r} must be an explicit https origin)")
        if problems:
            raise ValueError(
                "Refusing to start in production with development settings: " + ", ".join(problems)
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
