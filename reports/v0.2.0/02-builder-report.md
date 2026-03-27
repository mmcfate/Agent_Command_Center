# Builder Report — v0.2.0 Agent Detail Panel + System Diagnostics

**Date:** 2026-03-26
**Author:** Jarvis
**Feature:** Agent Detail Panel + System Diagnostics (API Tester + Live Logs)
**Status:** QA in progress

---

## What Was Built

### Backend Changes
**File:** `~/dashboards/Jarvis_dashboard/dashboard/backend/server.js`

Three new API endpoints (files, memory, sessions) + two new diagnostics endpoints:

4. **`GET /api/dashboard/logs`**
   - Returns last N log lines from `~/.openclaw/logs/dashboard.log`
   - Query param `?lines=N` (default 100, max 1000)
   - Parses each line via `parseLogLine()` → `{ timestamp, level, message, raw }`

5. **`GET /api/dashboard/logs/stream`** — SSE endpoint
   - On connect: sends last 20 log lines immediately
   - Then: polls log file every 1 second, streams new lines as they appear
   - Uses `fs.createReadStream` for efficient tail - only reads new bytes
   - Cleanup: clears interval and ends response on client disconnect

6. **`GET /api/dashboard/tester`** — API Tester
   - Accepts `?endpoint=<path>` (validated against whitelist)
   - Makes internal HTTP request to specified endpoint
   - Returns `{ status, body, latencyMs }` or `{ error, latencyMs }`
   - Whitelist: 10 predefined dashboard API endpoints

**Helper:** `parseLogLine(line)` — parses timestamps, extracts level (DEBUG/INFO/WARN/ERROR), strips level prefix from message

**Bug fixed during build:** sessions.json shape is dict keyed by session key. Added `Object.values()` conversion.

---

### Frontend Changes

**Modified:** `src/app/system/page.tsx` (complete rewrite)
- New title: "System Diagnostics"
- Existing cards unchanged: Gateway, Services, Host Metrics, Cron Jobs
- **New: ApiTesterCard** — dropdown to pick endpoint, Send button, color-coded status badge, JSON response preview
- **New: LiveLogsCard** — real-time SSE log viewer, level filter (ALL/INFO/WARN/ERROR), search, pause/resume, clear, auto-scroll, log count

**Modified:** `src/components/ui/Card.tsx`
- `CardHeader` title prop now accepts `string | React.ReactNode` (was `string` only)

**Modified:** `src/components/ui/Card.tsx`
- Added `onClick` prop to CardProps

**New dependency:** `remark-gfm`

---

## Self-QC Checklist

- [x] TypeScript compiles — `npx tsc --noEmit` clean
- [x] All API endpoints tested: `/logs`, `/logs/stream` (SSE works), `/tester`
- [x] Sessions data shape fixed (dict → array)
- [x] react-markdown v10 className fix applied (wrapper div)
- [x] Card onClick + CardHeader ReactNode title added
- [x] Backend restarted and verified serving on port 3001
- [x] QA tasks sent for both features (Agent Detail + System page)

---

## Files Changed

```
backend/server.js              — log streaming + API tester endpoints + parseLogLine helper
src/app/system/page.tsx        — complete rewrite (API Tester + Live Logs)
src/app/agents/page.tsx        — split-panel layout rewrite
src/components/agents/AgentDetailPanel.tsx  — NEW (409 lines)
src/components/ui/Card.tsx      — onClick + ReactNode title
package.json                   — added remark-gfm
```

---

## Known Limitations

- Log file path hardcoded: `~/.openclaw/logs/dashboard.log`
- Dashboard.log appears to contain JSON objects per line — parseLogLine handles this but message extraction is rough
- API Tester: only GET requests, no body/custom headers
- SSE reconnects not handled — if connection drops, manual refresh needed


---

## What Was Built

### Backend Changes
**File:** `~/dashboards/Jarvis_dashboard/dashboard/backend/server.js`

Three new Express endpoints added before the 404 handler:

1. **`GET /api/dashboard/agents/:id/files`**
   - Lists all `.md` and `.txt` files in agent workspace root
   - Query param `?path=<filename>` — reads specific file content
   - Path: `~/.openclaw/workspace-{jarvis,bonnie,main}/`

2. **`GET /api/dashboard/agents/:id/memory`**
   - Lists `memory/*.md` files
   - Query param `?file=YYYY-MM-DD.md` — reads specific memory file
   - Query param `?q=<search>` — grep search across all memory files
   - Returns: `{ files: [...] }` or `{ file, content }` or `{ query, results: [{file, line, text}] }`

3. **`GET /api/dashboard/agents/:id/sessions`**
   - Reads `sessions.json` (keyed by session key, not array)
   - Maps to: `{ id, startedAt, endedAt, lastActive, status, totalTokens, model }`
   - Returns last 20 sessions, sorted by lastActive desc

**Bug fixed during build:** sessions.json shape is a dict keyed by session key, not an array. Added `Object.values()` conversion.

---

### Frontend Changes

**New component:** `src/components/agents/AgentDetailPanel.tsx`
- 4-tab panel: Overview, Files, Memory, Sessions
- Shared file/memory list with content viewer
- Markdown rendering via `react-markdown` + `remark-gfm`
- Search in memory files
- Download button per file

**Modified:** `src/app/agents/page.tsx`
- Split-panel layout: agent list (left 30%) + detail panel (right 70%)
- Click agent card → opens detail panel
- Click X or same agent → closes panel
- Responsive: list + detail stack on mobile

**Modified:** `src/components/ui/Card.tsx`
- Added `onClick` prop to CardProps

**Added dependency:** `react-markdown` (already had), `remark-gfm` (fresh install)

---

## Self-QC Checklist

- [x] TypeScript compiles — `npx tsc --noEmit` clean
- [x] All 3 API endpoints tested manually via curl
- [x] Sessions data shape fixed (dict → array)
- [x] react-markdown v10 className fix applied (wrapper div)
- [x] Card onClick prop added
- [x] Backend restarted and verified serving on port 3001
- [x] QA task sent to Bonnie

---

## Files Changed

```
backend/server.js                   — 3 new API endpoints + sessions fix
src/app/agents/page.tsx             — split-panel layout rewrite
src/components/agents/AgentDetailPanel.tsx  — NEW (409 lines)
src/components/ui/Card.tsx          — added onClick prop
package.json                        — added remark-gfm
```

---

## Known Limitations

- Session data for "main" agent may not exist (Steve/main sessions may be under a different agent ID)
- Memory search is simple grep — no fuzzy search or ranking
- No error boundary on markdown rendering
- Download uses `URL.createObjectURL` — works but not the cleanest approach
