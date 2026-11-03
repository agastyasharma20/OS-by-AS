"""Application settings. All configuration comes from the environment (.env in development)."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "test", "production"]

# Values that are only acceptable on a developer machine. Production refuses to start with them.
DEV_ONLY_SECRETS = frozenset(
    {"", "changeme", "osbyas", "minioadmin", "rustfsadmin", "osbyas-dev", "osbyas-dev-secret"}
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    env: Environment = "development"
    app_name: str = "OS by AS"

    database_url: SecretStr = SecretStr("postgresql+asyncpg://osbyas:osbyas@localhost:5432/osbyas")
    redis_url: SecretStr = SecretStr("redis://localhost:6379/0")

    s3_endpoint_url: str | None = "http://localhost:9000"
    s3_region: str = "ap-south-1"
    s3_bucket: str = "osbyas-private"
    s3_access_key: SecretStr = SecretStr("osbyas-dev")
    s3_secret_key: SecretStr = SecretStr("osbyas-dev-secret")

    # OIDC issuer, e.g. http://localhost:8080/realms/osbyas
    oidc_issuer_url: str = "http://localhost:8080/realms/osbyas"

    health_check_timeout_seconds: float = Field(default=2.0, gt=0, le=10)
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def docs_enabled(self) -> bool:
        return self.env != "production"

    @model_validator(mode="after")
    def _refuse_dev_secrets_in_production(self) -> "Settings":
        if self.env != "production":
            return self
        problems: list[str] = []
        for name in ("s3_access_key", "s3_secret_key"):
            value: SecretStr = getattr(self, name)
            if value.get_secret_value() in DEV_ONLY_SECRETS:
                problems.append(name)
        for name in ("database_url", "redis_url"):
            url: SecretStr = getattr(self, name)
            raw = url.get_secret_value()
            if "localhost" in raw or ":osbyas@" in raw:
                problems.append(name)
        if any(origin.startswith("http://") for origin in self.cors_origins):
            problems.append("cors_origins")
        if problems:
            raise ValueError(
                "Refusing to start in production with development settings: " + ", ".join(problems)
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
