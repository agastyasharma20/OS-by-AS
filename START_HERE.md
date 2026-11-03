# OS by AS — Start here

Your original master prompt is now split into the files Claude Code uses best:

| File | Loaded | Purpose |
|---|---|---|
| `CLAUDE.md` | Automatically, every session | Rules, stack, security invariants, definition of done |
| `docs/ROADMAP.md` | When a phase starts | 28 phases with scope and testable exit criteria |
| `docs/REQUIREMENTS.md` | Only the cited sections | Your full feature lists (unchanged) |
| `docs/PRD.md` | Only the relevant section | Add your PRD file here |
| `PROJECT_TRACKER.md` | First and last in every session | Status and memory between sessions |
| `.claude/commands/phase.md` | When you type `/phase N` | Plan → approve → build → verify → report loop |
| `.claude/agents/security-reviewer.md` | When Claude reviews a diff | Independent security review |

## Setup (once)
1. Create an empty folder `os-by-as`, copy these files into it, and add your PRD as `docs/PRD.md`.
2. `git init && git add . && git commit -m "Project kit"`
3. Open Claude Code in the folder: `claude`

## First message to paste

```
You are starting OS by AS. Read CLAUDE.md, PROJECT_TRACKER.md and docs/ROADMAP.md.
Skim the headings of docs/PRD.md and docs/REQUIREMENTS.md (don't read them in full).

Before any code, reply with:
1. Your understanding of the product in 5 bullet points.
2. Any contradictions, gaps or risks you see in the roadmap or requirements.
3. Up to 5 questions you need me to answer before Phase 1.

Then wait. After I answer, run /phase 1.
```

## Every phase after that
```
/phase 2
```
Review the plan Claude writes, answer its questions, reply "approved", and let it build.
Run `/clear` between phases: the tracker carries the memory forward.

## Useful one-liners
- Resume after a break: `Read PROJECT_TRACKER.md and continue the current phase from the next action.`
- Second opinion: `Use the security-reviewer agent on the current branch.`
- UI check: `Open the app with Playwright at 390px and 1440px, screenshot every page changed in this phase, and fix layout issues.`
- Scope creep guard: `Is this in docs/REQUIREMENTS.md for the current phase? If not, add it to the tracker as a future item instead of building it.`
