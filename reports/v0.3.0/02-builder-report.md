# Builder Report — v0.3.0: Command Center TODO.md Sync

## What

Integrated the Command Center (Overview page) with the `cc-workflow` TODO.md system so tasks by phase are read live from `~/.openclaw/projects/TODO.md` instead of the static `projects.json`.

## Changes

### Backend (`dashboard/backend/server.js`)

**New endpoint: `GET /api/todo`**
- Parses `~/.openclaw/projects/TODO.md` into structured JSON
- Fetches active sessions from gateway (port 18789) to annotate tasks with `alive: true/false`
- Returns: `{ projects: [{ project, tasks: [{ description, phase, agent, session, started, skill, status, alive }] }] }`
- 5-second cache to prevent excessive reads
- **New endpoint: `POST /api/todo`** — clears cache (called when TODO.md is updated)

**Parser improvements:**
- Handles both old 6-column format (description, agent, session, started, skill, status) and new 7-column format (description, phase, agent, session, started, skill, status)
- Phase defaults to `implement` if missing
- Skips non-project sections (Rules, Format, Phases, date-only headers, example blocks)
- Only includes projects with ≥1 task

### Frontend (`agent-dashboard`)

**New API route: `src/app/api/todo/route.ts`**
- Proxies `GET /api/todo` from backend (port 3001)
- 10-second ISR cache

**Updated: `src/app/overview/page.tsx`**
- Replaced `ActiveTasksCard` (SSE-based) with `TodoTasksCard` (polling `/api/todo`)
- Shows tasks grouped by phase with phase-colored badges
- Live session alive/dead indicator (green dot = alive, red = dead/orphaned, gray = pending)
- 30-second polling interval

## Phase System

Tasks flow through phases: `research → design → implement → self_qc → qa → document → done`

| Phase | Color | Label |
|-------|-------|-------|
| research | #8888a0 | Research |
| design | #818cf8 | Design |
| implement | #f59e0b | Implement |
| self_qc | #06b6d4 | Self-QC |
| qa | #a78bfa | QA |
| document | #34d399 | Doc |
| done | #8888a0 | Done |

## TODO.md Format (updated)

```markdown
## project-name
| Task | Phase | Agent | Session | Started | Skill | Status |
|------|-------|-------|---------|---------|-------|--------|
| Description | implement | Jarvis | abc123 | 2026-03-25 | cc-workflow | in_progress |
```

## Test

```bash
curl http://localhost:3001/api/todo | python3 -m json.tool
# Returns: { "projects": [{ "project": "agent-dashboard", "tasks": [...] }] }
```

## Quality Gates

- [x] Backend parses TODO.md correctly
- [x] Session alive detection works
- [x] Frontend API route proxies correctly
- [x] TypeScript compiles
- [x] Overview page shows tasks grouped by phase
