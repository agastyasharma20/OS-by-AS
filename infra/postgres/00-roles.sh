#!/bin/sh
# Runs once when the Postgres volume is first created (development and CI only).
# Production roles are provisioned by infrastructure code with the same shape.
#
#   POSTGRES_USER   cluster superuser — bootstrap only, never used by the app
#   osbyas_migrator owns the schema objects; used only by Alembic
#   osbyas_app      runtime role: no superuser, no BYPASSRLS, owns nothing (ADR 0003)
#   keycloak        owns the separate keycloak database
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v migrator_pw="$MIGRATOR_DB_PASSWORD" -v app_pw="$APP_DB_PASSWORD" -v kc_pw="$KEYCLOAK_DB_PASSWORD" <<'SQL'
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE ROLE osbyas_migrator LOGIN PASSWORD :'migrator_pw' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE osbyas_app LOGIN PASSWORD :'app_pw' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS NOINHERIT;
CREATE ROLE keycloak LOGIN PASSWORD :'kc_pw' NOSUPERUSER NOCREATEDB NOCREATEROLE;

REVOKE ALL ON DATABASE osbyas FROM PUBLIC;
GRANT CONNECT ON DATABASE osbyas TO osbyas_migrator, osbyas_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO osbyas_migrator;
GRANT USAGE ON SCHEMA public TO osbyas_app;

-- Tables the migrator creates are usable (not owned) by the app role.
ALTER DEFAULT PRIVILEGES FOR ROLE osbyas_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO osbyas_app;
ALTER DEFAULT PRIVILEGES FOR ROLE osbyas_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO osbyas_app;

CREATE DATABASE keycloak OWNER keycloak;
SQL
