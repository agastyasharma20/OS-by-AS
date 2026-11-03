# ADR 0004 — Identity provider

Status: Accepted · Date: 2026-11-03

## Context
Requirements (§5) need student-ID and staff logins, passwords with policy, passkeys (WebAuthn), TOTP
(Microsoft/Google Authenticator) for privileged roles, device trust and recovery. Hand-rolled
authentication is forbidden by the project rules.

## Decision
- **Keycloak 26**, OIDC (authorization code + PKCE) to a backend-for-frontend in the Next.js app;
  the browser holds only HttpOnly, Secure, SameSite session cookies.
- **One realm (`osbyas`) with one Keycloak Organization per tenant**, rather than a realm per tenant.
  Realm-per-tenant multiplies configuration, upgrades and memory as we sell to more customers;
  Organizations give per-tenant membership, identity-provider linking and domain mapping in one realm.
- Roles are platform data (Phase 5 policy engine), not hard-coded Keycloak realm roles. Keycloak
  carries identity and organization membership; OS by AS decides permissions.
- Rotation and MFA requirements target role *groups* configured per tenant (default: HOD,
  Director/Dean, COE, Management, Registrar, Accounts, HR, admins). Passkey-only accounts are exempt
  from rotation.
- Breached-password checking: offline k-anonymity list or HIBP range API behind a Keycloak extension —
  decided in Phase 3.

## Consequences
- Keycloak needs ~1 GB RAM and its own database (`keycloak` on the same Postgres in development).
- Development uses the `keycloak/keycloak` image on Docker Hub (quay.io is the upstream source).
