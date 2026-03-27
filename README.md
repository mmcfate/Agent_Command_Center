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

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [OpenClaw](https://github.com/openclaw/openclaw) gateway running
- [Ollama](https://ollama.ai/) for local AI inference (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/mmcfate/Agent_Command_Center.git
cd Agent_Command_Center

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

The backend server must be running separately:

```bash
cd dashboard/backend
node server.js
```

The backend runs on port 3001 and proxies requests to the OpenClaw gateway.

---

## Configuration

### Backend Endpoints

The backend connects to your OpenClaw gateway. Configure the gateway URL and token in the backend server:

```javascript
// dashboard/backend/server.js
const GATEWAY_URL = 'http://localhost:18789';
const GATEWAY_TOKEN = 'your-gateway-token';
```

### Cost Tracking

Cost tracking requires session token counts from OpenClaw. Configure model rates in `server.js`:

```javascript
const MODEL_CONFIG = {
  'minimax-m2.7:cloud': { tag: 'cloud', inputRate: 0.10, outputRate: 0.50 },
  'qwen2.5:14b':        { tag: 'local', inputRate: 0.10, outputRate: 0.50 },
};
```

### TODO.md Path

The task tracking system reads from `~/.openclaw/projects/TODO.md`. Ensure this path is accessible from the backend server.

---

## Project Structure

```
agent-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── overview/          # Dashboard overview
│   │   ├── agents/            # Agent management
│   │   ├── cost/              # Cost tracking
│   │   ├── system/            # System diagnostics
│   │   ├── org/               # Org chart
│   │   ├── todo/              # Task tracking
│   │   └── projects/          # Project management
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base components (Card, Sparkline, etc.)
│   │   ├── layout/            # Header, Sidebar
│   │   └── agents/            # Agent-specific components
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript type definitions
├── dashboard/
│   └── backend/
│       └── server.js          # Express API server
├── reports/                   # Development reports by version
├── CHANGELOG.md               # Version history
├── LICENSE                    # MIT license
└── README.md                  # This file
```

---

## Development

### Adding a New Page

1. Create a new directory under `src/app/[page-name]/`
2. Add a `page.tsx` file
3. Register the route in the sidebar navigation

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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Version Overview

| Version | Status | Description |
|---------|--------|-------------|
| v0.3.0 | Current | TODO.md phase tracking integration, Org Chart page |
| v0.2.1 | Released | Token-based cost dashboard, What-If comparisons |
| v0.2.0 | Released | Agent detail panels, memory search, session history |
| v0.1.0 | Released | Initial dashboard scaffold, system health, live logs |

---

## Contributing

Contributions are welcome. This project is MIT-licensed.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
