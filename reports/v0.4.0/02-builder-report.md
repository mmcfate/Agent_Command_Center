# Builder Report — v0.4.0

## What
Settings page + backend generalization. Makes the Command Center configurable for any user's OpenClaw setup.

## Why
Previously hardcoded to Marlin's specific paths, models, and agents. Not portable.

## How
- Settings page at `/settings` with localStorage-persisted configuration
- Backend config file at `~/.openclaw/command-center.json`
- Agent auto-discovery from `openclaw.json` via `/api/openclaw/config` proxy

## Changes
### Frontend
- `src/app/settings/page.tsx` — new Settings page
- `src/app/api/openclaw/config/route.ts` — API proxy for agent discovery

### Backend (server.js)
- Config loading at startup from `~/.openclaw/command-center.json`
- All hardcoded paths replaced with `CONFIG.*` lookups
- `/api/settings` GET/PUT endpoints

### Config defaults (when no command-center.json exists)
- `openclawDir`: `~/.openclaw`
- `jarvisWorkspace`: `~/.openclaw/workspace-jarvis`
- `bonnieWorkspace`: `~/.openclaw/workspace-bonnie`
- `memoryDir`: `~/.openclaw/memory`
- `dashboardDir`: `~/dashboards/Jarvis_dashboard/dashboard`
- `dtsDir`: `~/DTS`

## Testing
- Settings page loads ✅
- Backend URL configurable ✅
- OpenClaw dir configurable ✅
- Agent registry auto-discovered (3 agents: main, jarvis, bonnie) ✅
- Save button works ✅
- No console errors ✅

## QA
- Bonnie: PASS (all checks green)

## Screenshots
Saved to `~/.openclaw/workspace-bonnie/.qa-screenshots/v0.4.0/`
