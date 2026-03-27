# Agent Command Center

**A real-time operations dashboard for multi-agent AI systems.**

Agent Command Center is a Next.js dashboard that provides visibility into your AI agent infrastructure — agents, sessions, tasks, system health, and cost tracking — all in one place.

![Dashboard Overview](https://img.shields.io/badge/status-alpha-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## Overview

Agent Command Center was built to solve a real problem: when running multiple AI agents (Jarvis, Bonnie, Steve, and others), there's no unified view of what's happening across all of them. Who is working on what? Which sessions are active? How much is this costing? Is anything broken?

This dashboard connects directly to your [OpenClaw](https://github.com/openclaw/openclaw) gateway and gives you live visibility into your entire agent fleet.

---

## Features

### 🖥️ System Health
- CPU, RAM, disk, and GPU utilization in real-time
- Service status for all connected components (frontend, backend, gateway)
- Gateway latency monitoring

### 🤖 Agent Management
- Live roster of all active agents
- Per-agent detail panels: overview, files, memory, session history
- Session-level visibility into what each agent is doing

### 📋 Task Tracking
- Tasks grouped by phase: Research → Design → Implement → Self-QC → QA → Document → Done
- Session aliveness indicators (green = active, red = orphaned)
- Powered by `TODO.md` — the same task file your agents use, no duplication

### 💰 Cost Dashboard
- Token-based cost tracking: cloud spend vs. local cost avoidance
- 5-minute resolution snapshots over 24-hour windows
- "What If" comparison against other AI models (GPT-5, Opus, etc.)
- Per-GPU utilization and VRAM monitoring

### 📊 Live Logs
- Real-time gateway log streaming via SSE
- Log level filtering (debug, info, warn, error)
- Backend API integration for health and diagnostics

### 🌐 Org Chart
- Visual hierarchy of your agent fleet
- Shows relationships between agents and their workspaces

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Command Center                     │
│                   (Next.js — Port 3000)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Overview   │   │   Agents     │   │     Cost       │  │
│  │   Page      │   │    Page      │   │    Dashboard   │  │
│  └─────────────┘   └──────────────┘   └────────────────┘  │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │    TODO     │   │  Projects    │   │    System      │  │
│  │    Page     │   │    Page      │   │    Page        │  │
│  └─────────────┘   └──────────────┘   └────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   OpenClaw      │   │   Backend      │   │   Ollama        │
│   Gateway       │◄──│   API Server   │◄──│   (Local AI)    │
│   (Port 18789)  │   │   (Port 3001)  │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | Next.js 15 + TypeScript | 3000 | Dashboard UI |
| Backend | Node.js + Express | 3001 | API proxy + data processing |
| Gateway | OpenClaw | 18789 | Agent orchestration + session management |
| AI Runtime | Ollama | 11434 | Local model inference |
| Data Store | Flat JSON files | — | Task history, cost snapshots, session state |

---

## Prerequisites

1. **Node.js** 18+ — [https://nodejs.org](https://nodejs.org)
2. **OpenClaw gateway** running on port 18789 — [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
3. **Ollama** for local AI inference — [https://ollama.ai](https://ollama.ai) (optional, for local model costs)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/mmcfate/Agent_Command_Center.git
cd Agent_Command_Center
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the backend

The backend server proxies requests between the frontend and the OpenClaw gateway. It lives in `dashboard/backend/` within this repo.

**Copy and edit the environment config:**

```bash
cp dashboard/backend/server.js dashboard/backend/server.local.js
```

Edit `dashboard/backend/server.local.js` and set your gateway credentials:

```javascript
const GATEWAY_URL = 'http://localhost:18789';       // your OpenClaw gateway URL
const GATEWAY_TOKEN = 'your-gateway-token-here';  // from your OpenClaw config
const OPENCLAW_DIR = '/home/youruser/.openclaw';  // path to your .openclaw directory
```

### 4. Configure model cost rates (optional)

In `dashboard/backend/server.local.js`, adjust the `MODEL_CONFIG` if you track costs:

```javascript
const MODEL_CONFIG = {
  'minimax-m2.7:cloud': { tag: 'cloud',  inputRate: 0.10, outputRate: 0.50 },
  'qwen2.5:14b':        { tag: 'local', inputRate: 0.10, outputRate: 0.50 },
};
```

### 5. Start the backend

```bash
cd dashboard/backend
node server.local.js
```

The backend runs on **port 3001**.

### 6. Start the frontend

```bash
# From the project root
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### Gateway Connection

The backend connects to your OpenClaw gateway. Set these in the backend server:

```javascript
const GATEWAY_URL = 'http://localhost:18789';
const GATEWAY_TOKEN = 'your-gateway-token';
```

Find your gateway token in `~/.openclaw/openclaw.json` under `gateway.accessToken`.

### Data Paths

The backend reads from your OpenClaw data directory:

| Data | Path |
|------|------|
| Session tokens | `~/.openclaw/agents/{agent}/sessions/sessions.json` |
| TODO.md | `~/.openclaw/projects/TODO.md` |
| Cost history | `~/.openclaw/data/cost-history.json` |
| Projects | `~/.openclaw/jarvis_cos/data/projects.json` |

### Cost Tracking

If you want cost tracking, configure model rates in `MODEL_CONFIG`:

```javascript
const MODEL_CONFIG = {
  'minimax-m2.7:cloud': { tag: 'cloud',  inputRate: 0.10, outputRate: 0.50 }, // real cost
  'qwen2.5:14b':        { tag: 'local', inputRate: 0.10, outputRate: 0.50 }, // avoidance
};
```

Set `tag: 'cloud'` for models you pay for, `tag: 'local'` for models running on your own GPU.

---

## Development

### Adding a New Page

1. Create a new directory under `src/app/[page-name]/`
2. Add a `page.tsx` file
3. The route is automatically available at `/[page-name]`

### Running Tests

```bash
# TypeScript type checking
npm run typecheck

# ESLint
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
agent-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── overview/          # Dashboard overview
│   │   ├── agents/            # Agent management
│   │   ├── cost/              # Cost tracking
│   │   ├── system/            # System diagnostics
│   │   ├── org/               # Org chart
│   │   ├── todo/              # Task tracking
│   │   └── projects/          # Project detail + kanban
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Card, Sparkline, StatusIndicator
│   │   ├── layout/            # Header, Sidebar
│   │   └── agents/            # Agent-specific components
│   ├── store/                 # Zustand SSE-driven state
│   └── types/                 # TypeScript type definitions
├── dashboard/
│   └── backend/
│       └── server.js          # Express API server (copy to server.local.js)
├── reports/                   # Development reports by version
├── CHANGELOG.md               # Version history
├── LICENSE                    # MIT license
└── README.md                  # This file
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Version Overview

| Version | Status | Description |
|---------|--------|-------------|
| v0.3.0 | Current | TODO.md phase tracking, Org Chart, completed tasks section |
| v0.2.1 | Released | Token-based cost dashboard, What-If comparisons |
| v0.2.0 | Released | Agent detail panels, memory search, session history |
| v0.1.0 | Released | Initial dashboard scaffold, system health, live logs |

---

## Contributing

Contributions are welcome. This project is MIT-licensed.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
