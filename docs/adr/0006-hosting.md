# ADR 0006 — Hosting and deployment

Status: Accepted · Date: 2026-11-03

## Context
The product owner will build first, pilot with one section, then sell to institutions. Indian
institutions handle students' personal data (DPDP Act), and buyers expect data in India.

## Decision
1. **Cloud-agnostic containers.** Everything ships as Docker images configured by environment; no
   provider-specific code outside small adapters (storage, email).
2. **Pilot:** a single VM in an India region (e.g. AWS Lightsail/EC2 Mumbai or another provider's
   Indian data centre) running the compose stack with managed backups. Rough cost ₹3,000–6,000/month.
3. **Production:** AWS **ap-south-1 (Mumbai)** — managed PostgreSQL (RDS, Multi-AZ), ElastiCache Redis,
   S3 with public access blocked, 2–3 application instances behind a load balancer, CloudWatch.
   Rough cost ₹60,000–1,50,000/month for the whole Prestige group plus AI usage (capped per tenant).
4. **CI:** GitHub Actions (`.github/workflows/ci.yml`).
5. **Email:** outbound system email from our own domain through a transactional provider (e.g. Amazon
   SES). We do not run a public SMTP server. Internal communication uses OS Mail (Phase 6).

Figures are estimates for planning, to be re-quoted before purchase.

## Consequences
- New customers are new tenants on the same deployment (lowest cost per college); large customers can
  get a dedicated deployment without code changes.
- Infrastructure-as-code and runbooks are delivered in Phase 28.
