# v0.4.0 Design Notes — Generalization + Settings

## Problem Statement

The Command Center is currently hardcoded to Marlin's specific setup:
1. Hardcoded paths (`/home/mmcfate/...`) throughout backend
2. Hardcoded model config in frontend cost page
3. No way to configure backend URL from UI
4. Agent registry is implicit, not configurable

This makes it impossible for anyone else to download and use the CC.

## What We're Building

### 1. Settings Page
A new `/settings` page in the CC where users can configure:
- **Backend URL**: The base URL for the OpenClaw backend API (e.g., `http://localhost:3001`)
- **OpenClaw Directory**: Path to the `.openclaw` workspace (e.g., `/home/user/.openclaw`)
- **Agent Registry**: List of agents with name, workspace path, role

### 2. Backend Generalization
Refactor `server.js` to read configuration from a config file instead of hardcoded paths:
- `~/.openclaw/command-center.json` (or discovered from environment)
- All paths become configurable
- Backend discovers agents from `openclaw.json` instead of hardcoding `jarvis_cos`, `bonnie_qa`

### 3. Model Config UI
Expose the model rates (input/output cost per 1M tokens) in the Settings page so users can configure their own model pricing.

### 4. Frontend Dynamic Backend URL
Currently the frontend uses `window.location` to auto-detect the backend URL. Add a Settings option to override this manually (useful for VPN/Tailscale setups where auto-detect might fail).

## Technical Approach

### Config File: `~/.openclaw/command-center.json`
```json
{
  "openclowDir": "/home/mmcfate/.openclaw",
  "backend": {
    "host": "localhost",
    "port": 3001
  },
  "models": {
    "minimax-m2.7:cloud": { "inputRate": 0.10, "outputRate": 0.50, "tag": "cloud" },
    "deepseek-coder:6.7b": { "inputRate": 0, "outputRate": 0, "tag": "local" }
  },
  "agents": [
    { "id": "jarvis", "name": "Jarvis", "workspace": "/home/mmcfate/.openclaw/workspace-jarvis", "role": "Chief of Staff" },
    { "id": "bonnie", "name": "Bonnie", "workspace": "/home/mmcfate/.openclaw/workspace-bonnie", "role": "QA" }
  ]
}
```

### Backend Changes
1. Read `~/.openclaw/command-center.json` at startup
2. Fall back to `openclaw.json` to discover agents
3. All hardcoded paths (`/home/mmcfate/.openclaw/jarvis_cos`, etc.) become dynamic
4. `MODEL_CONFIG` comes from the config file

### Frontend Changes
1. Settings page at `/settings`
2. Store settings in `localStorage` (persisted per browser)
3. API helper function that uses `localStorage` override or falls back to auto-detect
4. Settings page shows: current config, detected agents, model rates

### Settings Page UI
- **Backend URL** field with current value auto-filled
- **OpenClaw Dir** field with current value auto-filled  
- **Agent Registry** table (name, workspace, role) — editable
- **Model Config** table (model name, input rate, output rate, tag) — editable
- Save button → writes to `~/.openclaw/command-center.json` (via backend API endpoint)

### API Endpoints Needed
- `GET /api/settings` — read current config
- `PUT /api/settings` — write config file
- `GET /api/agents` — discover agents from `openclaw.json` (auto-detect, no hardcode)

## Files to Change

### Backend (`~/dashboards/Jarvis_dashboard/dashboard/backend/server.js`)
- Add `~/.openclaw/command-center.json` reading
- Add `/api/settings` GET + PUT endpoints
- Replace hardcoded paths with config values
- Replace hardcoded `MODEL_CONFIG` with config file values

### Frontend (`~/projects/agent-dashboard/src/`)
- New `app/settings/page.tsx` — Settings UI
- Update `store/index.ts` — use localStorage override for backend URL
- Update `app/api/` proxies — use dynamic backend URL
- New `components/ui/SettingsCard.tsx`?

## Skills Design for Small Models

Bonnie will be on a small local model (qwen2.5:14b equivalent). Small models need step-by-step procedure cards, not abstract principles. Every instruction must be explicit and complete.

For Bonnie QA skill:
- Include exact commands to run
- Don't assume inference from context
- Treat the skill as a "recipe card" not a "philosophy document"
- sessions_send messages must include every step explicitly

## Version Bump
This is a MINOR release: new features (settings, generalization). Current: 0.2.0, Next: 0.3.0.

Wait — VERSION says 0.2.0 but CHANGELOG shows 0.3.0 unreleased. Let me check...

VERSION file says 0.2.0. CHANGELOG shows [Unreleased] v0.3.1 and [0.3.0]. This is inconsistent. Need to clarify — is the current released version 0.2.0 or 0.3.0?

Decision: Current version is effectively 0.3.0 (CHANGELOG reflects what's deployed). v0.4.0 is the next release.

## Risks
- Writing config file from frontend requires backend API permission
- OpenClaw dir path changes need careful handling
- Existing hardcoded paths in backend are numerous — need systematic replacement
- Settings page needs to work BEFORE backend URL is configured (chicken-and-egg)

## Approach
1. Build Settings page with localStorage-first for backend URL
2. Backend reads config, falls back to defaults
3. Settings page can write config via backend API
4. Agent discovery reads `openclaw.json` dynamically

## TODO
- [ ] Create `~/.openclaw/command-center.json` with current hardcoded values as defaults
- [ ] Add backend config reader
- [ ] Add `/api/settings` GET/PUT endpoints
- [ ] Replace hardcoded paths with config lookups
- [ ] Build Settings page (`/settings`)
- [ ] Wire up agent discovery from `openclaw.json`
- [ ] Self QC
- [ ] Bonnie QA
- [ ] Update CHANGELOG + VERSION
- [ ] PR
