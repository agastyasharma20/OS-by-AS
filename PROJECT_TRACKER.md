# OS by AS — Project Tracker

Claude: read this first every session; update it at the end of every task.
Statuses: NOT STARTED · IN PROGRESS · BLOCKED · NEEDS REVIEW · COMPLETED

## Current focus
- Phase: 1 — Foundation and architecture
- Branch: `claude/keen-lamport-852of4`
- Next action: product owner approves `docs/plans/phase-01-plan.md`, then build Phase 1

## Phase status
| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Foundation and architecture | IN PROGRESS | Plan written, awaiting approval |
| 2 | Multi-tenant data foundation | NOT STARTED | |
| 3 | Identity and authentication | NOT STARTED | |
| 4 | Device trust and Security Center | NOT STARTED | |
| 5 | Authorization, audit, API security | NOT STARTED | |
| 6 | Shared platform services | NOT STARTED | |
| 7 | Configuration Studio | NOT STARTED | |
| 8 | Student and faculty information system | NOT STARTED | |
| 9 | Timetable and attendance (reference module) | NOT STARTED | |
| 10 | Assignments, quizzes, marks integrity | NOT STARTED | |
| 11 | LMS, Today feed, learning analytics | NOT STARTED | |
| 12 | AI Gateway and AI Campus | NOT STARTED | |
| — | Pilot gate | NOT STARTED | |
| 13 | AI Content Studio | NOT STARTED | |
| 14 | CHAKRAVYUH exam management | NOT STARTED | |
| 15 | CHAKRAVYUH intelligent evaluation | NOT STARTED | |
| 16 | Code sandbox and Virtual Labs | NOT STARTED | |
| 17 | CodeArena | NOT STARTED | |
| 18 | ProjectOS | NOT STARTED | |
| 19 | SkillVerse | NOT STARTED | |
| 20 | CareerForge and SpeakUp | NOT STARTED | |
| 21 | CampusConnect | NOT STARTED | |
| 22 | ClubOS | NOT STARTED | |
| 23 | OS Stars | NOT STARTED | |
| 24 | Admissions and Finance | NOT STARTED | |
| 25 | HR, payroll, campus operations | NOT STARTED | |
| 26 | Accreditation, alumni, OS Intelligence | NOT STARTED | |
| 27 | Hardening | NOT STARTED | |
| 28 | Release | NOT STARTED | |

## Implemented features
_None yet._

## Known limitations / deferred items
| Item | Reason | Planned phase |
|---|---|---|
| Hindi UI | Product owner: English only in v1; all strings are i18n keys so Hindi can be added | Post-v1 |
| Native mobile app | Product owner: app syncs in V2; v1 is responsive web/PWA, API-first | V2 |
| OS Mail (internal mail/inbox) | Not in REQUIREMENTS.md; requested by product owner 2026-11-03 | Phase 6 (proposed) |
| Running our own public SMTP server | Deliverability/blacklist risk; outbound mail goes via a transactional provider from our own domain | Not planned |

## Migrations
_None yet._

## API modules
_None yet._

## Security controls in place
_None yet._

## Test status
_Last `make check`: not run._

## Product owner decisions (2026-11-03)
- **Tenant = education group.** First tenant: Prestige Education Society. Hierarchy: tenant (group) → institution
  (configurable type: Engineering, UG, PG, Law, PU, …) → campus → department → program → section.
  New customers = new tenants on the same platform (it must be sellable to other groups/colleges).
- **Roles are data, not code.** Seeded templates: Student, Guardian, Faculty, Lab Assistant, HOD, Director/Dean,
  Management, COE, Registrar, Accounts, HR, Placements, Library, Sports, Institution Admin, Group Admin,
  Platform Super Admin. Institutions can add/rename roles.
- **Password rotation + MFA** apply to HOD, Director/Dean, COE, Management, Registrar, Accounts, HR and admins
  (configurable per role). Default off for students and faculty; passkey-only accounts exempt.
- **English only** in v1. Native app in V2 — design the API for it now.
- **Everything inside the platform:** internal communication via OS Mail; no Gmail needed for daily work.
- Claude decides ordering fixes (pull thin tenancy/audit/notification pieces forward; privacy-by-design from Phase 2).
- Hosting: Claude recommended (ADR 0006): cloud-agnostic containers; pilot on a single India VPS; production on AWS Mumbai.

## Open questions for the product owner
- Approve Phase 1 plan (`docs/plans/phase-01-plan.md`).
- Create a `main` branch (repo has no default branch, so no PR can be opened yet).
