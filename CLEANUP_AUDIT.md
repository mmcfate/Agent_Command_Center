# Backend Audit — server.js cleanup

**File:** `~/dashboards/Jarvis_dashboard/dashboard/backend/server.js`
**Size:** ~71KB, ~1800 lines
**Date:** 2026-03-28

---

## SUMMARY: Frontend → Backend Route Map

The Next.js frontend calls these backend routes (via `/api/*` Next.js proxy routes):

| Frontend calls | Proxies to backend | Status |
|---|---|---|
| `/api/overview` | `/api/dashboard/overview` | ✅ WORKS |
| `/api/dashboard/agents` | `/api/dashboard/agents` | ✅ WORKS |
| `/api/dashboard/system` | `/api/dashboard/system` | ✅ WORKS |
| `/api/dashboard/logs` | `/api/dashboard/logs` | ✅ WORKS |
| `/api/settings` | (uses backend var) | ✅ WORKS |
| `/api/todo` | `/api/todo` | ✅ WORKS |
| `/api/openclaw/config` | `/api/openclaw/config` | ✅ WORKS |
| `/api/stream` (SSE) | `/api/dashboard/stream` | ❌ 404 — NOT IMPLEMENTED |

---

## ROUTES MARKED FOR REMOVAL (Vue-era dead weight)

### 1. `/api/agents` — OLD duplicate
- **What it does:** Returns agent info reading SOUL.md (same as `/api/dashboard/agents`)
- **Used by frontend:** NO — frontend uses `/api/dashboard/agents`
- **Verdict:** REMOVE — duplicates `/api/dashboard/agents`

### 2. `/api/system/cpu` — Unused individual stat
- **What it does:** Returns raw CPU stat breakdown
- **Used by frontend:** NO — frontend uses `/api/dashboard/system` (combined)
- **Verdict:** REMOVE — frontend doesn't call this

### 3. `/api/system/memory` — Unused individual stat
- **What it does:** Returns raw memory breakdown
- **Used by frontend:** NO — frontend uses `/api/dashboard/system`
- **Verdict:** REMOVE

### 4. `/api/system/disk` — Unused individual stat
- **What it does:** Returns raw disk stats
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 5. `/api/system/network` — Unused
- **What it does:** Returns network I/O bytes
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 6. `/api/system/temp` — Unused
- **What it does:** Returns CPU temperature
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 7. `/api/system/ollama` — Unused
- **What it does:** Returns Ollama model list
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 8. `/api/system/all` — Unused
- **What it does:** Returns all system stats at once
- **Used by frontend:** NO — frontend uses `/api/dashboard/system`
- **Verdict:** REMOVE — replaced by `/api/dashboard/system`

### 9. `/api/system/exec` — Dangerous, unused
- **What it does:** Executes ANY shell command passed in request body
- **Used by frontend:** NO
- **Verdict:** REMOVE — security risk, not used

### 10. `/api/version` — Unused
- **What it does:** Returns git-based version number for old Vue dashboard
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 11. `/api/chat` — Unused
- **What it does:** Sends a message to an agent via CLI
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 12. `/api/agent/status` — Unused duplicate
- **What it does:** Returns agent busy/idle status (separate from agents list)
- **Used by frontend:** NO — frontend uses `/api/dashboard/agents` and `/api/dashboard/sessions`
- **Verdict:** REMOVE — duplicates information already in `/api/dashboard/agents`

### 13. `/api/projects-json` — Old Vue project system
- **What it does:** Full CRUD for projects/tasks stored in `projects.json`
- **Used by frontend:** NO — CC uses `/api/dashboard/projects` and `/api/dashboard/tasks`
- **Verdict:** REMOVE — old Vue dashboard feature, CC uses different endpoints

### 14. `/api/backlog` — Old Vue feature
- **What it does:** Manages backlog items (separate from tasks)
- **Used by frontend:** NO
- **Verdict:** REMOVE — Vue-era, CC uses TODO.md instead

### 15. `/api/tags` — Old Vue feature
- **What it does:** CRUD for task tags
- **Used by frontend:** NO
- **Verdict:** REMOVE — Vue-era, CC uses different system

### 16. `/api/projects-with-tasks` — Old Vue feature
- **What it does:** Lists projects with parsed task counts from markdown
- **Used by frontend:** NO — CC uses `/api/dashboard/projects`
- **Verdict:** REMOVE

### 17. `/api/projects` and `/api/projects/:file` — Old Vue memory system
- **What it does:** Old file-based projects (not the same as CC projects)
- **Used by frontend:** NO
- **Verdict:** REMOVE

### 18. `/api/openclaw/memory*` — OpenClaw internal
- **What it does:** Reads OpenClaw memory files
- **Used by frontend:** NO — CC uses `/api/dashboard/agents/:id/memory`
- **Verdict:** REMOVE — superseded by `/api/dashboard/agents/:id/memory`

### 19. `/api/test/*` — Debug endpoints
- **What it does:** Various self-test endpoints
- **Used by frontend:** NO — these are developer debug routes
- **Verdict:** REMOVE — not needed in production

### 20. ENTIRE DTS SECTION (lines ~1300-end) — Not CC
- **What it does:** Day Trading System endpoints: `/api/trading/*`, `/api/trading/portfolio`, `/api/trading/market`, `/api/trading/metrics`, `/api/trading/risk`, `/api/trading/candidates`, `/api/trading/signals`, etc.
- **Used by frontend:** NO — DTS is a SEPARATE system running in `~/DTS/`
- **Verdict:** REMOVE FROM THIS FILE — DTS should have its own backend or be integrated differently

---

## ROUTES TO KEEP (CC actively uses)

| Route | Purpose | Status |
|---|---|---|
| `/api/health` | Health check | ✅ KEEP |
| `/api/openclaw/status` | Gateway status | ⚠️ CHECK — may not be used |
| `/api/openclaw/sessions` | Sessions list | ✅ KEEP — used by backend itself for agent status |
| `/api/openclaw/config` | Gateway config | ✅ KEEP — proxied via `/api/openclaw/config` |
| `/api/cron` | Cron jobs list | ✅ KEEP — `/api/dashboard/crons` uses this |
| `/api/agents` → replaced by | — | SEE NOTE BELOW |
| `/api/dashboard/agents` | Agent list from SOUL.md | ✅ KEEP |
| `/api/dashboard/tasks` | Tasks from TODO.md | ✅ KEEP |
| `/api/dashboard/projects` | Project list | ✅ KEEP |
| `/api/dashboard/sessions` | Gateway sessions | ✅ KEEP |
| `/api/dashboard/crons` | Formatted cron jobs | ✅ KEEP |
| `/api/dashboard/system` | System + gateway health | ✅ KEEP |
| `/api/dashboard/overview` | Combined overview data | ✅ KEEP |
| `/api/dashboard/agents/:id/files` | Agent workspace files | ✅ KEEP |
| `/api/dashboard/agents/:id/memory` | Agent memory search | ✅ KEEP |
| `/api/dashboard/agents/:id/sessions` | Agent session history | ✅ KEEP |
| `/api/dashboard/logs` | Dashboard logs | ✅ KEEP |
| `/api/dashboard/logs/stream` | SSE log stream | ❌ EXISTS but broken — FIX |
| `/api/settings` | CC configuration | ✅ KEEP |
| `/api/todo` | TODO.md parser | ✅ KEEP |

---

## ROUTES THAT EXIST BUT MAY HAVE ISSUES

### `/api/dashboard/overview`
- Currently reads from `OPENCLAW_DIR/agents/*/identity` files which may not exist
- Has fallback to `openclaw.json agents.list`
- CC frontend expects this to return agent data from SOUL.md (via `getAgentInfo()`)
- **Issue:** The route tries multiple sources — might return mixed/partial data

### `/api/dashboard/logs/stream` (SSE)
- Route EXISTS at line ~2102 — sets up SSE headers correctly
- BUT — it's watching `LOG_FILE = '/tmp/jarvis-dashboard.log'` which may not exist
- The frontend connects to this but gets no data because log file isn't being written
- **Issue:** Route exists but stream never fires because no log writer

---

## ESTIMATED CLEANUP

- **Routes to remove:** ~35 routes (test, Vue projects, DTS, old stats, etc.)
- **Routes to keep:** ~20 routes
- **Estimated size after:** ~35KB (from 71KB)
- **Sections to restructure:** Add clear headers, group related routes

---

## RECOMMENDED ACTION ORDER

1. **Archive first** — copy current `server.js` to `ARCHIVE/server.js.backup`
2. **Remove DTS section** — simplest, clearly separate system
3. **Remove test endpoints**
4. **Remove old Vue project system** (`/api/projects-json`, `/api/backlog`, `/api/tags`)
5. **Remove old system stats** (individual `/api/system/*` routes)
6. **Remove old agent routes** (`/api/agents`, `/api/agent/status`)
7. **Remove dangerous** (`/api/system/exec`, `/api/chat`)
8. **Remove unused** (`/api/version`, `/api/projects-with-tasks`, old `/api/projects`)
9. **Add clear section headers** and comments throughout
10. **Fix `/api/dashboard/logs/stream`** — ensure log writer exists or simplify
11. **Review `/api/dashboard/overview`** — consolidate to use `getAgentInfo()` properly

---

*Audit completed: 2026-03-28*
