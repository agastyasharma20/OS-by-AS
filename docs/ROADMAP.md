# OS by AS — Build Roadmap

28 phases in 5 milestones. Each phase is sized to finish in 1–3 focused Claude Code
sessions and ends with testable **exit criteria**. Detailed feature lists for every
module are in `docs/REQUIREMENTS.md` (section numbers given as "Req §").

Rules: do phases in order; a phase may start only when the previous phase's exit
criteria pass. Milestone B ends with a **pilot gate**: real users in one class section.

---

## Milestone A — Platform core

### Phase 1 — Foundation and architecture
Scope: monorepo (`apps/web`, `apps/api`, `packages/ui`, `packages/api-client`, `services/sandbox`,
`infra`), Docker Compose (Postgres+pgvector, Redis, MinIO, Keycloak, Mailpit), Makefile,
CI (lint, typecheck, test, build), app shell with design tokens, `ARCHITECTURE.md`,
first ADRs (stack, module pattern, tenancy strategy, identity provider).
Exit criteria:
- `make dev` starts every service from a clean clone; `make check` is green in CI.
- Web shell renders with sidebar (desktop), bottom nav (mobile), dark mode, Ctrl+K palette stub.
- `GET /api/v1/health` returns DB, Redis, storage and Keycloak status.

### Phase 2 — Multi-tenant data foundation (Req §12)
Scope: SQLAlchemy base with `tenant_id`, Postgres RLS policies, tenant-scoped session
dependency, models for tenant, institution, campus, department; constraints; seed script
for 2 fake institutions.
Exit criteria:
- Tests prove a query in tenant A can never return tenant B rows, even with a raw ID.
- A request without a resolved tenant is rejected.

### Phase 3 — Identity and authentication (Req §5.1, §5.2, §5.4)
Scope: Keycloak realm per tenant (or org), OIDC login in web, student ID login
(configurable ID pattern, e.g. `PIEMR2026CS001`), staff username login, password + passkey,
TOTP / Microsoft Authenticator for privileged roles, password policy (history, breached-password
check, configurable rotation e.g. 14 days for designated roles, none for passkey-only),
reset and recovery flows.
Exit criteria:
- Student, faculty and HOD seed users can log in; HOD is forced through MFA.
- Rotation policy is set from config, not code; passkey-only accounts are exempt.
- Session cookies are HttpOnly, Secure, SameSite; CSRF protection on state-changing calls.

### Phase 4 — Device trust and Security Center (Req §5.3)
Scope: device records and trust states (new, pending, trusted, restricted, revoked, suspicious),
new-device step-up, login alerts (email/push, no sensitive data in previews), login history,
active sessions, revoke device / session / all, "this wasn't me" flow.
Exit criteria:
- Login from a new browser triggers step-up + alert + audit event.
- Revoking a device invalidates its sessions within 60 seconds.
- Trust never skips authentication entirely.

### Phase 5 — Authorization, audit and API security (Req §6, §13)
Scope: role/permission model in DB, scopes (institution/campus/department/section), policy
engine (RBAC + ABAC, field-level rules), `policies.py` pattern, append-only audit store,
rate limiting, request IDs, standard error format, pagination/filter/sort helpers,
idempotency keys.
Exit criteria:
- Permission-matrix test suite runs for every endpoint (owner / wrong role / wrong dept / wrong tenant).
- Audit rows cannot be updated or deleted by the app DB user.
- Mass-assignment test: extra fields in a request are rejected.

### Phase 6 — Shared platform services (fills gaps: Notifications, Documents, Workflows)
Scope: notification engine (in-app, email, push, digest, preferences, templates), file service
(upload checks, malware scan hook, private storage, signed URLs), workflow/approval engine
(sequential, parallel, conditional, delegation, escalation, deadlines), background jobs.
Exit criteria:
- A sample two-step approval (faculty → HOD) runs end to end with notifications and audit.
- Uploading a disallowed file type is rejected; downloads require authorization and expire.

### Phase 7 — Configuration Studio (Req §7)
Scope: institution branding, campuses, departments, programs, academic years, semesters,
calendar and holidays, subjects → units → topics → outcomes, credits, grading, attendance
and assessment rules; versioning with preview, validation, approval, effective dates, rollback.
Exit criteria:
- An admin configures a full B.Tech CSE semester through the UI with zero code changes.
- Rolling back a config version restores the previous rules and is audited.

---

## Milestone B — Academic core (pilot-ready)

### Phase 8 — Student and faculty information system (Req §8.1)
Scope: student and faculty profiles, guardians, enrollment, sections, academic history,
documents, faculty subject allocation and workload, Excel/CSV bulk import with validation
report, field-level visibility.
Exit criteria:
- Import 1,200 students and 60 faculty from Excel in under 2 minutes with an error report.
- A faculty member sees only their assigned sections' student fields.

### Phase 9 — Timetable and attendance (Req §8.1, §8.2) — reference module
Scope: timetable (rooms, labs, clash detection, solver), class sessions, attendance marking
(bulk, with 10-second undo), shortage alerts, correction requests via workflow, faculty leave
and substitution.
Exit criteria:
- Attendance is the polished reference module other modules copy (documented in an ADR).
- A student cannot change attendance via any API call; corrections need approval and keep history.

### Phase 10 — Assignments, quizzes and marks integrity (Req §10.1–10.4)
Scope: assignments (files/code, rubrics, server deadlines, late policy, file hashes, receipts,
versions), quiz engine (server timing, attempts, randomization, server scoring, locking),
marks entry → review → approval → lock → amendment.
Exit criteria:
- Tests prove that changing the client clock or editing requests cannot alter deadlines,
  timers, scores or locked marks.
- Every marks change stores old value, new value, reason, actor, time and approval.

### Phase 11 — LMS, Today feed and learning analytics (Req §8.3, §9)
Scope: subject pages, resources (notes, slides, PDFs, video), discussions, announcements with
de-duplication, progress, activity events (opened vs active interaction vs completion),
"Today" home feed, student / faculty / HOD dashboards v1.
Exit criteria:
- Student home shows today's classes, due work, attendance %, unread notices in one screen.
- Analytics never label time-on-page as "studied"; access follows role and purpose rules.

### Phase 12 — AI Gateway and AI Campus (Req §8.5, §10.6)
Scope: provider-agnostic gateway (prompt registry with versions, model routing, per-tenant
budgets, rate limits, logging, PII filtering), permission-aware RAG over approved resources
(pgvector), student tutor with citations, faculty and HOD assistants, notice summaries,
AI eval suite.
Exit criteria:
- A student cannot retrieve another section's resources through the assistant (tested).
- Answers cite source documents; with no relevant source the assistant says so.
- Eval suite of ≥20 cases passes; monthly cost per tenant is capped.

**Pilot gate:** deploy to staging, onboard one real section with synthetic-then-approved data,
collect feedback, fix top 10 issues before Milestone C.

---

## Milestone C — Intelligent academics

### Phase 13 — AI Content Studio (Req §8.4)
Topic-based notes, lecture plans, slides, diagrams (Mermaid), MCQs, question banks, labs,
rubrics, curriculum drafts, uploaded-document conversion; review → approve → publish with versions.
Exit: nothing AI-generated reaches students without faculty approval; references are never invented.

### Phase 14 — CHAKRAVYUH: exam management (Req §8.6, first half)
Question papers (Bloom, CO mapping), moderation workflow, COE approval and locking, exam
calendar, eligibility, hall tickets, seating plans, invigilators, results, SGPA/CGPA, revaluation.
Exit: a paper moves faculty → HOD → COE → locked; results compute correctly against configured grading.

### Phase 15 — CHAKRAVYUH: intelligent evaluation (Req §8.6, second half)
QR/barcode answer books, scanning pipeline, OCR/handwriting, question segmentation,
blind IDs, rubric-based AI suggestions with confidence, faculty review UI, escalation.
Exit: AI marks are provisional until approved; originals and all evaluation versions are preserved.

### Phase 16 — Code sandbox and Virtual Labs (Req §8.7)
Isolated execution service (CPU/memory/time/network limits), Python, SQL/DBMS, Linux terminal,
TOC simulators, DSA and web labs, hidden tests, digital lab records with PDF export.
Exit: a fork bomb, infinite loop or network call from student code is contained and logged.

### Phase 17 — CodeArena (Req §8.10)
DSA topics with visualizations, problems, multi-language compiler on the sandbox, hidden tests,
contests, leaderboards, AI Code Mentor with policy-controlled hints.

### Phase 18 — ProjectOS (Req §8.8)
Proposals, teams, mentor allocation, configurable meeting tracker, milestones, task boards,
GitHub integration, reports, evaluation, viva, final submission.

### Phase 19 — SkillVerse (Req §8.9)
Configurable multidisciplinary pathways, modules, practical tasks, assessments, certifications.

---

## Milestone D — Student life and careers

### Phase 20 — CareerForge and SpeakUp (Req §8.11, §8.12)
Placement CRM, recruiters, drives, eligibility engine, applications, offers, Resume Studio
(verified data only), AI Interview Studio, speaking challenges with transcription and feedback.
Exit: eligibility rules run from config; AI never adds unverified skills to a resume.

### Phase 21 — CampusConnect (Req §8.13)
Event pages (public/restricted, templates, shareable URL), registration (team, capacity,
waitlist, fees), signed single-use QR passes, offline gate scanning, certificates, festivals, AI copilot.
Exit: concurrent double-scan of one pass admits once; capacity is never exceeded under load.

### Phase 22 — ClubOS (Req §8.14)
Club creation by HOD, coordinator, positions, recruitment, membership, event proposals,
budgets/expenses with approvals, elections, handover, reports.

### Phase 23 — OS Stars (Req §8.15)
Configurable star rules, badges, leagues, streaks, challenges, leaderboards, verification
for high-value awards, anti-fraud checks, public achievement profile.

---

## Milestone E — Operations and enterprise readiness

### Phase 24 — Admissions and Finance (Req §8.1, §8.16)
Enquiry CRM, applications, merit, counselling, enrollment + ID generation; fee structures,
installments, payment gateway (idempotent), receipts, scholarships, refunds, ledgers, reconciliation.

### Phase 25 — HR, payroll and campus operations (Req §8.17, §8.18)
Employee lifecycle, leave, payroll, payslips, appraisals; library, hostel, transport, sports,
canteen, inventory, procurement, facilities, IT helpdesk.

### Phase 26 — Accreditation, alumni and OS Intelligence (Req §8.19, §8.20)
CO/PO/PSO attainment, evidence, IQAC, configurable NAAC/NBA reports; alumni network;
institution and management dashboards, early-warning (at-risk students) analytics.

### Phase 27 — Hardening (Req §10.7, §14)
Full security review, OWASP ASVS checklist, pen test, cross-tenant tests, load tests
(2,000+ concurrent students), backup/restore drill, observability, privacy (DPDP) and
accessibility review.

### Phase 28 — Release
Production config, CI/CD, monitoring, backup automation, runbooks, API/user/admin/security
docs, final acceptance tests (Req §14 end-to-end list), release notes.
