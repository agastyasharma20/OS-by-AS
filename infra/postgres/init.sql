-- Runs once when the Postgres volume is first created (development only).
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE DATABASE keycloak;
