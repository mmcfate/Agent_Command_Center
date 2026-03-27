# Agent Command Center — SPEC.md

**Version:** 0.3.0
**Author:** Jarvis (for Marlin McFate)
**Date:** 2026-03-25
**Status:** Awaiting approval
**Spec version:** With recommendations

---

## 1. Concept & Vision

A real-time command center for a multi-agent development team. Marlin defines what he wants; Jarvis and Bonnie execute. This dashboard makes the invisible visible — showing exactly where every task is in the pipeline, who is working on what, and what the current state of the system is.

**Personality:** Clean, precise, calm. Like a mission control console — information-dense but not overwhelming. It should feel like looking at a well-designed aircraft cockpit: everything you need, nothing you don't.

**Philosophy:** The dashboard is a _read-only observer_ of the agents' work, not a controller. It surfaces what agents are doing, it doesn't direct them. Agents direct themselves through their skills and the TODO file.

---

## 2. Design Language

### Aesthetic Direction
Aviation/space mission control meets modern SaaS. Think NASA mission control crossed with Linear or Vercel's dashboard — dark by default, highly readable, precise typography, data-forward. Premium feel with purposeful density.

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0a0a0f` | Main background |
| `bg-surface` | `#12121a` | Cards, panels |
| `bg-elevated` | `#1a1a25` | Hover states, modals |
| `border` | `#2a2a3a` | Dividers, card borders |
| `text-primary` | `#f0f0f5` | Headings, primary text |
| `text-secondary` | `#8888a0` | Labels, timestamps |
| `accent-jarvis` | `#4a9eff` | Jarvis agent accent (blue) |
| `accent-bonnie` | `#a78bfa` | Bonnie agent accent (violet) |
| `accent-success` | `#34d399` | Done, passed, healthy |
| `accent-warning` | `#fbbf24` | In progress, pending |
| `accent-danger` | `#f87171` | Failed, blocked, orphan |
| `accent-info` | `#60a5fa` | Research, info states |

### Typography
- **Headings:** Inter (Google Fonts) — 600/700 weight
- **Body:** Inter — 400/500 weight
- **Monospace:** JetBrains Mono — for IDs, timestamps, code
- **Scale:** 11px (micro) / 12px (label) / 14px (body) / 16px (subheading) / 20px (section title) / 28px (page title)

### Spatial System
- Base unit: 4px
- Content padding: 24px
- Card padding: 16px
- Gap between cards: 12px
- Gap between sections: 32px
- Border radius: 8px (cards), 4px (badges), 12px (modals)

### Motion Philosophy
- Transitions: 150ms ease-out for state changes
- Panel reveals: 200ms fade + 8px translateY
- Live data pulses: subtle 2s opacity animation on live indicators
- No gratuitous animation — every motion communicates state change

### Visual Assets
- **Icons:** Lucide React — minimal stroke, consistent weight
- **Status indicators:** 8px circles — green (live), grey (offline), yellow (working)
- **Workflow graph:** React Flow — DAG nodes with connecting edges
- **Charts:** Recharts

### Component Style
- **Cards:** `bg-surface` fill, 1px `border`, 8px radius, subtle box shadow (0 1px 3px rgba(0,0,0,0.3))
- **Buttons:** Subtle gradient fill (top to bottom, lighter to darker), 1px border, 6px radius
- **Badges:** Filled with accent color at 20% opacity, 4px radius, subtle inner glow
- **Inputs:** 1px border, `bg-surface`, 6px radius. Focus: border becomes `accent-info`, subtle glow
- **Tables:** Clean rows, 1px border between rows, header with `bg-elevated`
- **Modals:** `bg-surface`, 1px border, 12px radius. Backdrop: `rgba(0,0,0,0.7)` with backdrop-blur(8px)

### Visual Assets
- **Icons:** Lucide React (consistent, MIT licensed)
- **Status indicators:** 8px circles with glow effect for live agents
- **Workflow graph:** React Flow (DAG-style nodes and edges)
- **Charts:** Recharts (lightweight, composable)

---

## 3. Layout & Structure

### Overall Shell
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Agent Roster (online dots) | Theme     │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  Sidebar   │         Main Content Area                  │
│  (nav)     │                                            │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Sidebar Navigation
1. **Overview** — system health, active agents, at-a-glance
2. **Workflow** — visual pipeline of active task
3. **Agents** — per-agent detail view
4. **Projects** — project list → task board
5. **Shared TODO** — all active tasks across agents
6. **System** — gateway, sessions, crons, costs

### Responsive Strategy
- Desktop-first (primary use case)
- Tablet: sidebar collapses to icons
- Mobile: bottom nav, stacked panels — functional but not primary

### Content Pacing
- Overview: dense, scannable cards
- Workflow: full-width visual graph
- Agent detail: generous whitespace, focused

---

## 4. Features & Interactions

### 4.1 Overview Panel
**Purpose:** At-a-glance health check in < 5 seconds.

**Components:**
- **Agent Roster Strip** (top header): Shows all agents. Green dot = live, grey = offline. Click → jump to agent detail.
- **System Health Card**: Gateway online/offline, backend responding, frontend responding, disk, memory, CPU
- **Active Task Summary**: "Jarvis: building dark mode (40%) | Bonnie: QA pending"
- **Recent Activity Feed**: Last 10 events (task started, QA completed, PR merged)
- **Orphan Alert Banner**: If any session in TODO died without resolution → red banner: "⚠ Orphaned task: dark mode — session XYZ ended. Say 'resume' or 'discard'"

**Interactions:**
- Auto-refresh: 10 seconds
- Click any card → navigate to relevant section
- System health turns red/yellow based on thresholds

---

### 4.2 Workflow Pipeline Panel
**Purpose:** Visual representation of the Jarvis ↔ Bonnie development workflow.

**Visual:** DAG / flowchart using React Flow
- Nodes: Marlin (idea) → Jarvis (research) → Jarvis (design) → Marlin (approval) → Jarvis (implement) → Jarvis (self-QC) → Bonnie (QA) → Jarvis (document) → Jarvis (PR)
- Current step highlighted with accent color + pulse
- Completed steps show checkmark
- Timestamps on each step
- Active step shows progress percentage

**Task Selector:** Dropdown at top to pick which active task to visualize.

**Node States:**
| State | Appearance |
|-------|-----------|
| Pending | Dashed border, muted |
| In Progress | Solid border, accent color, pulse |
| Complete | Filled, checkmark, success color |
| Failed/Orphan | Red border, warning icon |

**Interactions:**
- Hover node → tooltip with details (who, started at, duration, notes)
- Click node → side panel with full details
- If step is "In Progress" and step is "Bonnie QA" → shows Bonnie as the working agent

---

### 4.3 Agent Detail Panel
**Purpose:** Deep dive on each agent — Jarvis, Bonnie, and any future agents.

**Per-agent view:**
- **Agent Card**: Name, emoji, role, status (online/offline/idle/working)
- **Current Task**: What they're working on right now, progress %, step
- **Loaded Skill**: Current skill (e.g., `cc-workflow v0.3.1`)
- **Session Info**: Session ID, started at, last active
- **Recent History**: Last 5 tasks completed
- **Workspace Health**: Memory index status, disk usage

**Agent Roster Mode:** When viewing Agents tab without selecting a specific agent → shows all agents as cards.

**Interactions:**
- Click agent card → expand to detail view
- Sessions list is read-only (dashboard observes, doesn't control)

---

### 4.4 Projects Panel
**Purpose:** Every project has a home. View task state across all projects.

**Project List View:**
- Cards showing: project name, active task count, last activity
- Click card → expand to task board

**Project Task Board (per project):**
- Kanban-style columns: Backlog | Research | Design | Implement | QA | Done
- Each task card shows: title, assignee (agent), phase, session ID, started
- Filter by: agent, status, date range
- Sort by: newest, oldest, priority

**Per-project pages (from project card or task board):**
- **Overview tab**: Project name, description, plan (markdown rendered)
- **Tasks tab**: Full task board
- **Reports tab**: All `reports/vX.X.X/` folders with builder report, QA report, final report
- **Notes tab**: All markdown notes for this project

**Interactions:**
- Drag task between columns → updates phase in real-time
- Click task → side panel with full task detail + history
- Create task → inline form (title, description, assignee)

---

### 4.5 Shared TODO Panel
**Purpose:** One view of all in-progress work across all agents.

**Table columns:**
| Task | Project | Agent | Session | Started | Phase | Status |

**Row states:**
- `in_progress`: Accent color row
- `pending`: Yellow tint (waiting on someone)
- `orphaned`: Red tint, warning icon

**Interactions:**
- Click row → navigate to task in project board
- Filter by: agent, project, status
- Sort by: newest, oldest, project
- Orphaned rows always appear at top

---

### 4.6 System Panel
**Purpose:** Infrastructure health — the agent dashboard equivalent of server monitoring.

**Sub-sections:**
- **Gateway**: Online/offline, version, uptime, `/healthz` response time
- **Sessions**: List of all active sessions, which agent, last active, context tokens used
- **Cron Jobs**: All scheduled jobs, last run, next run, success/fail status, can manually trigger
- **Services**: Backend (port 3001), Frontend Dev (5173), Frontend Prod (4000) — status + restart button
- **Memory Search**: Embedding model, indexed files/chunks per agent

---

### 4.7 Dark/Light Mode
**Toggle in header.**
- Dark: default (aviation console aesthetic)
- Light: clean SaaS look (for bright environments)
- Persisted in `localStorage`

---

### 4.8 Orphan Task Alerts
**Appears as:** Sticky alert banner at top of Overview and Shared TODO panels.

**Trigger:** A task in `~/.openclaw/projects/TODO.md` has a session ID not found in `sessions_list`.

**Banner:** "⚠ Orphaned task: [task name] ([agent]) — session ended [X] ago. Say 'resume' to take over or 'discard' to clear."

**Interactions:**
- Click "resume" → copies task details to clipboard for Marlin to act on
- Click "discard" → marks task as discarded in TODO

---

## 5. Component Inventory

### Status Indicator
- 8px circle — green (live), grey (offline), yellow (working)
- Subtle glow or drop shadow to separate from background

### AgentCard
- **States:** online (green), offline (grey), working (blue pulse), idle (no pulse)
- **Shows:** emoji, name, role, current task badge
- Card: `bg-surface`, 1px border, 8px radius, subtle shadow

### WorkflowNode (React Flow custom node)
- **States:** pending, in_progress, complete, failed, orphaned
- **Shows:** phase name, agent avatar, timestamp, duration

### TaskCard
- **States:** backlog, research, design, implement, qa, done
- **Shows:** title, assignee avatar, phase badge, session ID, relative time

### StatusBadge
- **Variants:** success, warning, danger, info, neutral
- **Shows:** colored dot + label

### SystemHealthCard
- **States:** healthy (green), degraded (yellow), critical (red)
- **Shows:** metric name, value, sparkline (24h), threshold indicator

### SessionRow
- **Shows:** session ID (monospace, truncated), agent, started, last active, context %

### CronJobRow
- **Shows:** name, schedule, last run (time + success/fail), next run, duration

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** React 19, Tailwind CSS 4
- **State:** Zustand (lightweight, no boilerplate)
- **Real-time:** Server-Sent Events (SSE) from backend — simpler than WebSockets for one-way data flow
- **Charts:** Recharts
- **Workflow graph:** React Flow
- **Icons:** Lucide React
- **Fonts:** Inter, JetBrains Mono (Google Fonts)

### Architecture
```
Browser (Next.js frontend)
       ↕ SSE + REST
Express Backend (port 3001)
       ↕ REST
OpenClaw Gateway (port 18789) ← reads → ~/.openclaw/*
```

### Data Flow
- **Frontend** renders from Zustand store
- **Backend** polls/subscribes to OpenClaw gateway + reads filesystem
- **SSE stream** pushes updates to frontend every 10 seconds
- **TODO file** (`~/.openclaw/projects/TODO.md`) is the source of truth for tasks
- **Agent workspaces** (read-only) for SOUL.md, AGENTS.md, skills

### Key Files Read by Backend
| File | Purpose |
|------|---------|
| `~/.openclaw/projects/TODO.md` | Active task state |
| `~/.openclaw/projects/*/tasks.md` | Per-project task history |
| `~/.openclaw/projects/*/plan.md` | Per-project plans |
| `~/.openclaw/agents/*/SOUL.md` | Agent identity |
| `~/.openclaw/agents/*/workspace/AGENTS.md` | Agent workspace config |
| `~/.openclaw/agents/*/sessions/*.jsonl` | Session list |
| `~/.openclaw/openclaw.json` | Gateway config |
| `~/.openclaw/cron/jobs.json` | Cron jobs |

### API Endpoints (Backend → Frontend)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | System health (gateway, backend, frontend) |
| `GET` | `/api/agents` | All agents + current state |
| `GET` | `/api/agents/:id` | Single agent detail |
| `GET` | `/api/sessions` | All active sessions |
| `GET` | `/api/tasks` | All tasks from TODO.md |
| `GET` | `/api/projects` | All projects with task counts |
| `GET` | `/api/projects/:id` | Single project detail |
| `GET` | `/api/crons` | All cron jobs |
| `GET` | `/api/system` | CPU, RAM, disk, gateway uptime |
| `GET` | `/api/stream` | SSE stream — all real-time updates |

### Frontend Pages (App Router)
```
app/
├── layout.tsx          # Shell: sidebar + header
├── page.tsx           # Redirects to /overview
├── overview/          # Overview panel
├── workflow/          # Workflow pipeline panel
├── agents/            # Agent roster + detail
├── projects/          # Project list + task board
│   └── [id]/          # Per-project: tasks, reports, notes
├── todo/              # Shared TODO panel
└── system/            # Gateway, sessions, crons, services
```

### Authentication
- No auth for MVP — this runs on localhost behind Tailscale
- Future: optional bearer token if exposed beyond local network

### Data Model

**Agent:**
```typescript
interface Agent {
  id: string;           // "jarvis", "bonnie"
  name: string;         // "Jarvis", "Bonnie"
  emoji: string;        // "🤖", "🔧"
  role: string;         // "Chief of Staff", "QA Engineer"
  status: "online" | "offline" | "idle" | "working";
  currentTask?: string;
  loadedSkill?: string;
  sessionId?: string;
  lastActive?: string; // ISO timestamp
}
```

**Task:**
```typescript
interface Task {
  id: string;
  title: string;
  project: string;
  agent: string;        // "Jarvis" | "Bonnie"
  sessionId?: string;
  skill?: string;
  phase: "research" | "design" | "implement" | "self_qc" | "qa" | "document" | "done";
  status: "in_progress" | "pending" | "complete" | "orphaned" | "cancelled";
  started?: string;
  updated?: string;
  progress?: number;    // 0-100
}
```

**Project:**
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  plan?: string;       // markdown
  taskCount: { total: number; done: number };
  lastActivity?: string;
}
```

**SystemHealth:**
```typescript
interface SystemHealth {
  gateway: { online: boolean; version: string; uptime: number };
  backend: { online: boolean; latencyMs: number };
  services: { name: string; online: boolean; port: number }[];
  system: { cpu: number; ram: number; disk: number };
}
```

---

## 7. Missing from Existing Dashboards (Our Differentiators)

| Feature | Exists in ClawPort? | Exists in Mission Control? | Ours |
|---------|---------------------|----------------------------|------|
| Visual workflow pipeline (Jarvis↔Bonnie) | No (DAG for org chart) | No | ✅ |
| Shared TODO with orphan detection | No | Kanban, but no session awareness | ✅ |
| Second Pass / methodology indicators | No | No | ✅ |
| Session-aware task tracking | No | No | ✅ |
| Per-agent loaded skill display | Agent profile | Agent list | ✅ |
| Real-time orphan alert banner | No | No | ✅ |
| Per-project reports browser | No | No | ✅ |
| File-based (not DB) for tasks | No (Convex) | No (SQLite) | ✅ |

---

## 8. Phases

### Phase 1 — Foundation
- Next.js project setup (App Router, Tailwind, Zustand)
- Express backend scaffold
- Basic layout shell (sidebar, header, routing)
- Backend: health endpoint, agents endpoint, sessions endpoint
- Frontend: Overview page with static data

### Phase 2 — Core Data
- Backend: read TODO.md, projects, agent workspaces
- Frontend: Agents page, System page
- SSE stream from backend
- Real-time refresh

### Phase 3 — Workflow Visualization
- React Flow integration
- Workflow page with task selector
- Step nodes with state coloring

### Phase 4 — Projects & Tasks
- Project list + task board
- Per-project pages (tasks, reports, notes)
- Shared TODO panel

### Phase 5 — Polish
- Dark/light mode
- Responsive layout
- Orphan alert banners
- Animations and transitions

---

## 9. Out of Scope (Phase 1)
- Mobile app
- Auth system
- WebSocket (SSE is sufficient)
- Task creation/deletion via UI (filesystem is truth)
- Direct agent chat from dashboard
- Voice/video

---

## 10. Recommendations for Key Decisions

### 1. File-based state, NOT a database
**Recommendation: Keep filesystem as source of truth.**
- All task state lives in `~/.openclaw/projects/TODO.md` and per-project `tasks.md`
- Backend reads these files directly (with 10-second in-memory cache)
- Dashboard never writes to these files — it observes only
- Marlin and agents own the files; dashboard is a mirror
- **Why:** No second source of truth, no sync problems, no DB to back up
- **Risk:** File read on every SSE tick — mitigated by caching. For < 50 projects this is imperceptible.

### 2. SSE over WebSockets
**Recommendation: SSE (Server-Sent Events).**
- Backend pushes updates every 10 seconds to all connected browsers
- One-way: backend → frontend. Frontend never pushes to backend
- **Why:** Simpler than WebSockets, works over Tailscale, no special infrastructure
- **Why not WebSockets:** We don't need bidirectional communication. Dashboard observes, doesn't control.

### 3. No Auth for MVP
**Recommendation: No authentication.**
- Runs on `localhost` behind Tailscale — only Marlin's devices can reach it
- **Why:** Simpler, faster to ship
- **Future:** Bearer token via `X-API-Key` header if ever exposed beyond Tailscale

### 4. No Task Creation from Dashboard UI
**Recommendation: Agents and Marlin create tasks via conversation. Dashboard displays.**
- Tasks are created by: Marlin saying "New Feature: X", agents updating TODO.md
- Dashboard never writes `TODO.md` — it only reads
- **Why:** Keeps the TODO file as single source of truth. No dashboard-specific state drift.
- **Future:** If needed, dashboard could write to a `dashboard_queue.md` that Jarvis reads

### 5. Build Phase 1 before Phase 2
**Recommendation: Ship incrementally.**
- Phase 1 (foundation + overview + agents) is usable from day 1 — shows who's online, what they're working on
- Phase 2 (SSE, live data) makes it real-time
- Phase 3 (workflow viz) is the wow moment
- Don't wait to ship — get v1 working, then add features

### 6. Clone from ClawPort, Don't Rebuild from Scratch
**Recommendation: Study ClawPort's architecture for signal/observability patterns.**
- ClawPort is MIT licensed, well-structured, similar goals
- We should NOT fork it — our data model (file-based, multi-agent workflow) is different
- But its React component patterns and SSE implementation are worth studying

### 7. Backend Port: Keep 3001
**Recommendation: Keep Express backend on port 3001.**
- Already running, already has the health/sessions/crons logic
- Next.js frontend on port 3000 proxies to 3001
- Don't add a new port.

### 8. CSS: Tailwind CSS 4 with CSS Variables
**Recommendation: Tailwind 4 + CSS custom properties for theming.**
- Dark mode: CSS variables swap on `html.dark` / `html.light`
- No separate theme files — one set of CSS variables, swapped by class
- Faster to implement than a full theme system

---

## 11. Open Questions (with recommended answers)

| Question | Recommendation |
|----------|---------------|
| DB vs Filesystem | Filesystem — source of truth is `~/.openclaw/projects/` |
| Git integration | Not MVP — future phase |
| Auth | None for MVP — localhost + Tailscale is the security boundary |
| Multi-machine agents | MVP assumes same machine |
| Version display for skills | Nice-to-have — add when we have v1 |

---

## 12. Out of Scope (Phase 1)
- Mobile app
- Auth system
- WebSocket (SSE is sufficient)
- Task creation/deletion via UI (filesystem is truth)
- Direct agent chat from dashboard
- Voice/video
- Git status / PR integration
- Cross-machine agent support
