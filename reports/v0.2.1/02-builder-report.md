# Builder Report — v0.2.1

## What Was Built

### Backend
- `GET /api/dashboard/gpu` — live GPU snapshot (nvidia-smi): index, name, util%, memUtil%, memUsed/total MiB, powerDraw W, temp °C
- `GET /api/dashboard/cost` — aggregated: GPU snapshot + session counts per agent + 7-day history from `~/.openclaw/data/cost-history.json`
- Background process appends a cost snapshot row every 5 minutes (capped at 2016 rows = 7 days)
- `cost-history.json` stored at `~/.openclaw/data/cost-history.json`

### Frontend: Org Chart (`/org`)
- Marlin centered at top with gradient avatar
- All agents displayed below in a horizontal row, connected by SVG lines
- Line colors match agent status (green=online, yellow=working, gray=idle, dark=offline)
- Each agent node: emoji, name, role, status badge, loaded skill, current task, last active
- Click → navigates to `/agents/:id`
- Responsive: agent nodes re-center on resize
- Live data via SSE store (agents array)

### Frontend: Cost Dashboard (`/cost`)
- KPI cards: Today's GPU-min, Monthly projected cost, Active sessions, GPU-0 VRAM
- Per-GPU cards: name, utilization, temperature, power draw, VRAM bar
- Sparkline row: CPU/RAM/Disk history (60-point ring buffer, from store's SSE data)
- Cost history area chart (Recharts): stacked by agent, last 72 history points
- Ollama running models panel (`/api/ollama/ps`)
- Editable GPU hourly rate (localStorage-persisted, default $0.50/hr)
- Auto-refresh: 30 seconds

### Sidebar
Added: Cost (💰) and Org Chart (👥) nav items.

### Real-Time Architecture
- `SSEProvider` now uses `connectStream()` which uses true `EventSource` (not polling)
- `DashboardStore` maintains `systemHistory`: ring buffer of 60 readings for cpu/ram/disk
- Each `system` heartbeat updates the ring buffer
- `GPUCard` shows current snapshot; sparklines show last 60 readings

## Files Created/Modified
- `~/dashboards/Jarvis_dashboard/dashboard/backend/server.js` — GPU + Cost endpoints + background recorder
- `~/projects/agent-dashboard/src/components/layout/Sidebar.tsx` — Cost + Org nav items
- `~/projects/agent-dashboard/src/components/ui/Sparkline.tsx` — new SVG sparkline component
- `~/projects/agent-dashboard/src/store/index.ts` — SSE EventSource + history ring buffer
- `~/projects/agent-dashboard/src/components/SSEProvider.tsx` — simplified, delegates to connectStream
- `~/projects/agent-dashboard/src/app/org/page.tsx` — new org chart page
- `~/projects/agent-dashboard/src/app/cost/page.tsx` — new cost dashboard page
- `~/.openclaw/data/cost-history.json` — created on first cost snapshot

## Status
- [x] Backend endpoints
- [x] Sidebar
- [x] Org Chart page
- [x] Cost Dashboard page
- [ ] QA (Bonnie)
