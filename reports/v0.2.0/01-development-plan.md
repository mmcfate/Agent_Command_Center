# Phase 2 Development Plan — v0.2.0

**Version:** 0.2.0 (MINOR — new features)
**Date:** 2026-03-26
**Author:** Jarvis

---

## Release Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| F1 | **Agent Detail Panel** — SOUL, IDENTITY, Files, Memory tabs per agent | P0 |
| F2 | Memory Browser — (moved into Agent Detail as a tab) | P1 |

**Out of Scope (→ v0.2.1):** Live Logs + Activity Console, Full Chat, Org Chart, Cost Dashboard, Pipelines

---

## Design Decision

**Original plan:** Separate `/memory` page, separate `/chat`, separate `/logs`

**Revised plan:** All within the existing Agents page — add a detail panel when you select an agent, with tabs for:
- **Overview** — SOUL.md, IDENTITY.md (who this agent is)
- **Files** — AGENTS.md, TOOLS.md, HEARTBEAT.md, USER.md
- **Memory** — memory/*.md files, searchable, rendered markdown
- **Sessions** — recent sessions, duration, status

**Rationale (Marlin's suggestion):** Memory browsing should be scoped to the agent. Combining it with the agent detail view gives you the ClawPort "Agent Detail" feature we liked, plus memory browsing — one coherent page instead of two.

**Optional enhancement:** Global memory search across all agents' files (search once, see results from all workspaces).

---

## Architecture

```
/agents
├── Agent List (left sidebar)
└── Agent Detail Panel (right, when selected)
    ├── Tab: Overview — SOUL.md, IDENTITY.md rendered
    ├── Tab: Files — all *.md files in workspace root
    ├── Tab: Memory — memory/*.md files, grep search, markdown
    └── Tab: Sessions — recent sessions from this agent
```

---

## Backend

### `/api/agents` (existing)
Returns list of agents. No change needed.

### `/api/agents/:id/files`
**New endpoint.**
- List all `.md` files in agent's workspace root
- Read a specific file's content
- `GET /api/agents/:id/files?path=TOOLS.md` → returns file content
- `GET /api/agents/:id/files` → returns list of files
- Path: `~/.openclaw/workspaces/{agentId}/*.{md,txt}`

### `/api/agents/:id/memory`
**New endpoint.**
- `GET /api/agents/:id/memory` → list `memory/*.md` files
- `GET /api/agents/:id/memory?file=YYYY-MM-DD.md` → read specific file
- `GET /api/agents/:id/memory/search?q=<query>` → grep across memory files
- Returns: `{ files: [...], content?: "...", searchResults?: [...] }`

---

## Frontend

### Agents Page (`/agents/page.tsx`)
**Current state:** Simple agent list.
**Change:** Add a split-panel layout — list on left (30%), detail on right (70%).

### AgentDetailPanel component
**New component.**
- Props: `agentId: string`
- State: `selectedTab: 'overview' | 'files' | 'memory' | 'sessions'`

### Tab: Overview
- Read `SOUL.md` + `IDENTITY.md` from agent's workspace
- Render as markdown
- Show agent name, role, last active

### Tab: Files
- Tree list of all `.md` files in workspace root
- Click to read — render as markdown
- Show: AGENTS.md, TOOLS.md, HEARTBEAT.md, USER.md, MEMORY.md, etc.

### Tab: Memory
- List `memory/*.md` files by date
- Click to read — render as markdown (via `react-markdown`)
- Search bar — calls `/api/agents/:id/memory/search?q=`
- Download button per file

### Tab: Sessions
- List recent sessions for this agent
- Columns: session ID, started, duration, status, message count
- Read-only (no session replay from dashboard)

### Global Memory Search (stretch)
- Search icon in header → modal
- Input: search query
- Output: results from ALL agents' memory files
- Show: agent name, file, matching line

---

## UI/UX

- Split panel: fixed left sidebar (agent list) + expandable right panel
- Right panel: tabbed interface, tabs at top
- Dark/light theme: consistent with existing design
- Responsive: on mobile, agent list and detail stack vertically
- Loading states: skeleton while fetching files
- Error states: "Agent workspace not found" if path doesn't exist

---

## Implementation Order

```
Step 1: Backend
  → /api/agents/:id/files endpoint
  → /api/agents/:id/memory endpoint

Step 2: Frontend — Agent Detail Panel shell
  → Split-panel layout in /agents
  → Tab navigation component
  → Overview tab (read SOUL + IDENTITY)

Step 3: Frontend — Files tab
  → File list + markdown reader
  → AGENTS.md, TOOLS.md, etc.

Step 4: Frontend — Memory tab
  → Memory file list + reader
  → react-markdown rendering
  → Search

Step 5: Frontend — Sessions tab
  → Session list from existing API or new endpoint

Step 6: Global Memory Search (stretch goal)
  → Search modal accessible from header
  → Aggregates results from all agents
```

---

## Dependencies

- `react-markdown` — markdown rendering
- `remark-gfm` — GitHub Flavored Markdown (tables, strikethrough)
- `highlight.js` or `react-syntax-highlighter` — code blocks in markdown
- All already in or can be added to `package.json`

---

## Open Questions

1. Should memory files be editable from the dashboard, or read-only? → **Read-only recommended for safety**
2. Session list — use existing `/api/agents` data or create new endpoint?
3. Do we show Bonnie's sensitive files (memory with personal notes) to all users? → Workspace permissions not in scope; assume single-operator

---

## Verification Criteria

- [ ] Agent list shows all agents (Jarvis, Bonnie, Steve/main)
- [ ] Click agent → detail panel opens
- [ ] Overview tab renders SOUL.md and IDENTITY.md as markdown
- [ ] Files tab lists all .md files in agent's workspace
- [ ] Click file → renders correctly
- [ ] Memory tab lists all memory/*.md files
- [ ] Click memory file → renders markdown correctly
- [ ] Search in Memory tab → returns matching lines
- [ ] Sessions tab shows recent sessions for selected agent
- [ ] All tabs work in dark AND light theme
- [ ] Mobile: agent list and detail stack vertically
