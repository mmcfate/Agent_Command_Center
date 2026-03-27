# Setup Guide

This guide walks you through setting up the Agent Command Center from scratch on a new machine.

---

## Overview

The Command Center has two parts:

1. **Frontend** — Next.js app on port 3000 (this repo)
2. **Backend** — Node.js API server on port 3001 (this repo, but needs setup)

The backend proxies requests between the frontend and the OpenClaw gateway. It needs to know where your OpenClaw data lives.

---

## Step 1 — Clone and Install

```bash
git clone https://github.com/mmcfate/Agent_Command_Center.git
cd Agent_Command_Center
npm install
```

---

## Step 2 — Configure the Backend

Create your backend config by copying the template:

```bash
cp dashboard/backend/server.template.js dashboard/backend/server.local.js
```

Open `dashboard/backend/server.local.js` and set these three values at the top:

```javascript
// REQUIRED: Path to your .openclaw directory
const OPENCLAW_DIR = '/path/to/your/.openclaw';

// REQUIRED: Your OpenClaw gateway URL (usually localhost:18789)
const GATEWAY_URL = 'http://localhost:18789';

// REQUIRED: Your gateway access token (find in ~/.openclaw/openclaw.json)
const GATEWAY_TOKEN = 'your-token-here';
```

### Finding your gateway token

```bash
cat ~/.openclaw/openclaw.json | grep -A2 '"accessToken"'
```

### Optional: Configure model cost rates

If you track costs, edit the `MODEL_CONFIG` section:

```javascript
const MODEL_CONFIG = {
  'your-cloud-model:tag': { tag: 'cloud',  inputRate: 0.10, outputRate: 0.50 },
  'your-local-model:tag': { tag: 'local', inputRate: 0,    outputRate: 0    },
};
```

Set `tag: 'cloud'` for models you pay for (OpenAI, Anthropic, etc.) and `tag: 'local'` for models running on your own GPU.

---

## Step 3 — Start the Backend

```bash
cd dashboard/backend
node server.local.js
```

You should see:

```
Dashboard API server running on port 3001
```

If it fails on missing modules:

```bash
npm install express cors
```

---

## Step 4 — Start the Frontend

```bash
# From the project root
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5 — Verify

Navigate to the **System** page. You should see:

- Gateway: ONLINE (version + uptime + latency)
- Backend API: ONLINE
- CPU, RAM, disk metrics
- GPU stats

If Gateway shows OFFLINE, check your `GATEWAY_URL` and `GATEWAY_TOKEN` in `server.local.js`.

---

## Troubleshooting

### "Gateway OFFLINE"

1. Is your OpenClaw gateway running? (`openclaw gateway status`)
2. Is it on the port you specified? (default: 18789)
3. Is your `GATEWAY_TOKEN` correct?

### "Backend API OFFLINE"

1. Is the backend process running? (`node server.local.js`)
2. Is port 3001 free?

### Tasks page shows no tasks

The backend reads from `~/.openclaw/projects/TODO.md`. Make sure:
1. The path in `OPENCLAW_DIR` is correct
2. The `TODO.md` file exists at `$OPENCLAW_DIR/projects/TODO.md`

### Cost page shows zeros

Cost tracking requires session token data from OpenClaw. Make sure:
1. `sessions.json` exists at `$OPENCLAW_DIR/agents/{agent}/sessions/sessions.json`
2. Model rates are configured in `MODEL_CONFIG`

---

## Running on Boot

Create a systemd user service so the backend starts automatically:

```ini
# ~/.config/systemd/user/dashboard-backend.service
[Unit]
Description=Agent Command Center Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/Agent_Command_Center/dashboard/backend
ExecStart=/usr/bin/node server.local.js
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable dashboard-backend
systemctl --user start dashboard-backend
```

For PM2 instead:

```bash
npm install -g pm2
cd dashboard/backend
pm2 start server.local.js --name dashboard-backend
pm2 save
pm2 startup
```
