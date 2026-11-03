Run Phase $ARGUMENTS of OS by AS.

## 1. Load context (read only, no edits)
- Read `PROJECT_TRACKER.md` and confirm the previous phase is COMPLETED. If not, stop and tell me.
- Read Phase $ARGUMENTS in `docs/ROADMAP.md` and the `docs/REQUIREMENTS.md` sections it cites.
- Inspect the existing code, models, migrations and APIs this phase touches.

## 2. Plan, then stop
Write a plan with:
- User stories and the roles involved.
- Tables and migrations (with tenant_id, constraints, indexes).
- Endpoints with their permission rule for each role.
- Screens (mobile + desktop) and their empty/error/loading states.
- Tests: permission matrix, integrity rules, and the phase exit criteria.
- Risks, open questions, and anything you propose to defer (with reason).
Then STOP and wait for my approval.

## 3. Build (after approval)
- Work in vertical slices: migration → service → policies → router → tests → UI → seed data.
- Write permission and integrity tests before the code that satisfies them.
- Commit after each slice with a clear message. Keep `make check` green.

## 4. Verify
- Run `make check`. Fix every failure; never skip or delete a failing test to get green.
- Run the `security-reviewer` agent on the phase diff and fix high/medium findings.
- Check each exit criterion and show evidence (test name, command output or screenshot).

## 5. Report
- Update `PROJECT_TRACKER.md` (status, features, limitations, next actions) and `CHANGELOG.md`.
- Reply using the end-of-phase report format in `CLAUDE.md`.
