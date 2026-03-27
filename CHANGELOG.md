# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — v0.4.1

---

## [0.4.0] — 2026-03-27

### Added
- **Settings Page** — New `/settings` page with backend URL configuration, OpenClaw directory, and agent registry display
- **Backend Config File** — Reads `~/.openclaw/command-center.json` for all paths; falls back to defaults
- **`/api/settings` Endpoint** — GET returns openclawDir, backend config, model config, discovered agents; PUT persists settings
- **Agent Auto-Discovery** — Backend discovers agents from `openclaw.json` dynamically

### Changed
- **Generalized Backend** — All hardcoded paths replaced with dynamic `OPENCLAW_DIR`/`CONFIG.*` lookups
- **Fixed Hardcoded Paths** — `/home/jarvis/.openclaw` → `/home/mmcfate/.openclaw/jarvis_cos`

---

## [0.3.0] — 2026-03-27

### Added
- **`/api/todo` Backend Endpoint** — Parses `~/.openclaw/projects/TODO.md` into structured JSON
  - Fetches active sessions from OpenClaw gateway to annotate tasks with `alive: true/false`
  - Session aliveness detection
  - 5-second cache to prevent excessive file reads
- **Frontend `/api/todo` Proxy** — Next.js API route at `src/app/api/todo/route.ts`
- **`TodoTasksCard` Component** — Replaced SSE-based ActiveTasksCard with TODO.md polling
  - Groups tasks by phase with color-coded badges
  - Session alive/dead dot indicator
  - 30-second polling interval
- **Professional Documentation** — Full README with architecture diagram, getting started guide, and project structure

### Changed
- **Overview Page** — Now powered by `GET /api/todo` instead of SSE stream for task display

### Technical Details
- Backend endpoint: `GET /api/todo` → returns `{ projects: [{ project, tasks: [{ description, phase, agent, session, started, skill, status, alive }] }] }`
- Frontend proxy: `GET /api/todo` (Next.js) → proxies to backend `http://localhost:3001/api/todo`
- Parser skips non-project sections (Rules, Format, Phases, date-only headers)
- Gateway session check: `GET /api/sessions` on port 18789 with bearer token

---

## [0.2.1] — 2026-03-27

### Added
- **Token-Based Cost Tracking** — Complete rewrite of cost monitoring
  - Reads session tokens from `~/.openclaw/agents/{agent}/sessions/sessions.json`
  - Token diffing: compares current vs. stored tokens per session every 5 minutes
  - `cost-state.json` persists token tracking state across restarts
  - Monthly rollover on 1st of month
- **Cost Dashboard Frontend** — New dedicated cost page at `/cost`
  - 4 KPI cards: Cloud Cost, Cost Avoidance, GPU-0 Util, GPU-1 Util
  - Delta chart (per-interval token rate) + Cumulative chart (running totals)
  - "What If" comparison configurator (localStorage-persisted)
  - Time range toggle: 6h / 12h / 24h
  - 30-second polling
- **What-If Model Comparison**
  - Multiple toggleable comparison models (GPT-5, Opus, etc.)
  - Computed from stored cloud token history
  - Custom input/output rates per model
  - Cumulative comparison lines on chart

### Changed
- **Model Configuration**
  - `minimax-m2.7:cloud`: cloud (real cost), $0.10/M input, $0.50/M output
  - `qwen2.5:14b`: local (cost avoidance), $0.10/M input, $0.50/M output
  - `deepseek-coder:6.7b`: local, $0/M (free)

### Fixed
- Session files are `.jsonl` (message logs) — now correctly reads `sessions.json` index
- Frontend fetch URLs now include `http://localhost:3001` base (previously 404)

---

## [0.2.0] — 2026-03-26

### Added
- **Agent Detail Panel** — Tabbed detail view for each agent
  - Overview: `SOUL.md` and `IDENTITY.md` rendered as markdown
  - Files: Browse all markdown files in agent workspace
  - Memory: Browse and search agent's memory files with markdown rendering
  - Sessions: Recent session history per agent
- **System Diagnostics Page** — `/system`
  - Gateway card: version, uptime, latency
  - Services card: frontend dev, backend API, frontend prod status
  - Host metrics: CPU, RAM, disk with sparklines
  - GPU details: VRAM, utilization, temperature, power
  - API Tester: dropdown with all endpoints, live response testing
  - Live Logs: real-time log streaming with level filtering
- **Global Memory Search** — Search across all agents' memory from one place
- **Org Chart Page** — Visual hierarchy of the agent fleet

### Changed
- Dashboard scaffold upgraded to Next.js 15 with App Router
- Theme toggle: dark/light mode with CSS variables
- Zustand store for SSE-driven state management

---

## [0.1.0] — 2026-03-25

### Added
- Initial dashboard scaffold: Next.js + Tailwind + Zustand
- Overview page: CPU, memory, disk, network, uptime
- Agents page: session list with status
- Projects/Kanban page: drag-and-drop task management
- Backend API routes: `/agents`, `/tasks`, `/projects`, `/sessions`, `/crons`, `/system`
- Overview page loads real data from backend
- Theme toggle + dark mode foundation
