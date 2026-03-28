# Command Center — Ideas for v0.5.0 and Beyond

*Ongoing research and brainstorming. Updated as insights emerge.*

---

## Research Questions

### 1. Missing Dashboard Features
What existing dashboards or tools do we have that aren't yet in the Command Center?

**DTS Dashboard** — The trading system lives in `~/DTS/`. Not integrated into CC. Questions to explore:
- Should CC surface trading signals?
- Should Chris (Finance agent) report into the CC dashboard?
- Is there a portfolio overview that should live in CC?

**Other standalone tools:**
- What else is running on this machine that could be a "source" for CC?
- Are there scripts, dashboards, or tools Marlin uses that aren't yet connected?

---

### 2. Page Utility Analysis
Which existing CC pages actually provide useful information?

**Overview** — System stats (CPU, memory, disk, network). Generally useful.
**Agents** — Session list with status. Useful for debugging.
**Projects** — Task board. Useful for tracking.
**Cost** — Token tracking and GPU utilization. Useful for cost awareness.
**System** — Detailed system info. Possibly redundant with Overview.
**Debug** — Low-level diagnostics. Niche use case.
**Workflow** — Workflow visualization. Unclear if this was ever finished.

**Questions:**
- Which pages do we actually visit? Which do we ignore?
- Should some pages be merged or removed?
- Does the average user need "Debug" and "System" pages, or are they noise?

---

### 3. External Dashboard Research
What do other AI agent dashboards and command centers offer?

**Things to research:**
- OpenManus
- AutoGen Studio
- CrewAI interfaces
- LangGraph Studio
- OpenAI Agent SDK dashboards
- Botpress
- Dify
- Other open-source agent platforms

**Feature ideas from research (TBD):**
- [ ] Agent-to-agent communication visualizer
- [ ] Task dependency graph / DAG view
- [ ] Cron job management UI
- [ ] Memory browser (view/edit agent memory)
- [ ] Voice chat interface
- [ ] File/attachment sharing with agents
- [ ] Cost anomaly detection and alerts
- [ ] Agent behavior logging and replay
- [ ] Multi-model comparison view
- [ ] Sandbox/preview environment per agent

---

## User Story Goal

> "A developer downloads the Command Center, configures it for their OpenClaw setup, and immediately gets value — both from using the dashboard and from the skills that come with it."

**What "value" means:**
1. Visibility into what their agents are doing
2. Tools and skills to build new agents/features
3. Cost awareness (what's this actually costing?)
4. Task management that actually works

---

## Open Questions

- [ ] Should the CC be a general-purpose tool or specifically "Marlin's setup" exposed generically?
- [ ] Can we make the skills independently useful without the full CC?
- [ ] What's the minimum viable feature set for a 1.0 release?

---

*Started: 2026-03-27*
*Last updated: 2026-03-27*
