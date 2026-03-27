# Builder Report — v0.4.0

## What
Settings page + backend generalization. Makes the Command Center configurable for any user's OpenClaw setup.

## Changes Made

### Backend (`dashboard/backend/server.js`)
- Added `~/.openclaw/command-center.json` config file support
- Added `GET /api/settings` — returns openclawDir, backend config, model config, discovered agents
- Added `PUT /api/settings` — persists settings to config file
- Added `getOpenclawDir()`, `getAgentWorkspace()`, `getModelConfig()` helper functions
- Added `const OPENCLAW_DIR` and `PROJECTS_DIR` constants (fixes missing definitions)
- Fixed hardcoded paths (`/home/jarvis/.openclaw` → `/home/mmcfate/.openclaw/jarvis_cos`)
- Agent discovery reads from `openclaw.json` dynamically (no hardcoded agent list)

### Frontend (`src/app/settings/`)
- New Settings page at `/settings`
- Shows current Backend URL, OpenClaw Directory
- Shows auto-discovered agent registry (name, ID, workspace) from backend
- Save button writes to `~/.openclaw/command-center.json` via backend API

### API Proxy (`src/app/api/settings/`)
- `GET /api/settings` — proxies to backend
- `PUT /api/settings` — proxies to backend

### Frontend (`src/app/api/openclaw/config/route.ts`)
- New proxy for `/api/openclaw/config` to support Settings page agent display

## Screenshots
Saved to `~/.openclaw/workspace-bonnie/.qa-screenshots/v0.4.0/`:
- `settings-mobile.png` (375×812)
- `settings-tablet.png` (768×1024)
- `settings-desktop.png` (1920×1080)

## Testing
- Backend API: `GET /api/settings` returns 3 agents discovered from openclaw.json
- Backend API: `PUT /api/settings` persists to `~/.openclaw/command-center.json`
- Frontend: Settings page loads at all viewports, shows agents, saves settings

## Remaining Hardcoded Paths
The backend still has some hardcoded paths in cost tracking and session parsing sections. These are lower priority and can be generalized in a follow-up if needed. The critical paths (workspace, config, memory) are now dynamic.

## Version
This is v0.4.0 — bump VERSION and CHANGELOG before PR.
