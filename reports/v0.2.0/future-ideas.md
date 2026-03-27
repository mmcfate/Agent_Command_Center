# Future Ideas — Phase 2 Extensions

**File:** For future reference when ready to build
**Location:** This file is the canonical source — don't lose it

---

## Deferred to v0.2.1 (Next Sprint)

### F2: Live Logs + Activity Console
**What it is:** Persistent real-time log widget that survives page navigation + historical log browser.

**Details (from 2026-03-26 session):**
- Floating live stream widget that persists across navigation
- Historical log browser with JSON expansion (click row → see raw JSON)
- Auto-refresh, filter by severity (INFO, WARN, ERROR)
- Backend: SSE endpoint that tails the OpenClaw log file
- Frontend: `LiveLogWidget` component, dockable/collapsible
- Log path: `~/.openclaw/logs/gateway.log` or `/var/log/ollama.log`
- Backend endpoint: `GET /api/logs` (last N lines), `GET /api/logs/stream` (SSE)

**Technical notes:**
- Use SSE (already have SSE infrastructure)
- Virtualized list if logs are many (`@tanstack/react-virtual`)
- JSON expansion modal on click
- `localStorage` for widget visibility preference
- Parse log lines: timestamp, level, message, metadata

**Verification:**
- [ ] Live widget shows new log entries within 1 second
- [ ] Click row → JSON expands
- [ ] Widget persists when navigating between tabs
- [ ] Filter by INFO/WARN/ERROR works

---

### F3: Full Chat
**What it is:** Persistent chat UI with streaming responses, file attachments, image support.

**Details (from 2026-03-26 session):**
- Backend: extend existing `/api/chat` to accept `FormData` with file attachments
- Image support: base64 encode → send to model
- Streaming text via SSE (already implemented)
- Conversation history in `localStorage` (key: `chat_conversations`)
- Conversation selector sidebar
- Dark/light theme consistent with existing design
- Responsive: full-width on mobile, sidebar + chat on desktop

**Deferred to v0.3.0:**
- Voice recording + playback (Option D — Web Audio API)
- Voice input to AI (speech-to-text via Web Speech API)
- Voice output from AI (TTS — browser `speechSynthesis` or ElevenLabs `sag`)
- Full voice conversation mode

**Verification:**
- [ ] Send text → streaming response displays
- [ ] Attach image → image in chat, model responds to it
- [ ] Theme works in dark AND light mode

---

## Ideas for Future Phases

### F4: 🌳 Org Chart

**What it is:** Interactive visual hierarchy of all agents — shows relationships, status, who reports to whom.

**Why valuable:**
- At a glance: "Who do I have? What's each agent's role and current state?"
- Visual confirmation that multi-agent setup is working correctly
- Useful for debugging when agents start getting confused about roles

**Technical approach:**
- React Flow (already in @xyflow/react dependency chain — verify)
- Pull agent list from gateway `/api/agents`
- Hierarchy defined in OpenClaw config (`openclaw.json` → agents)
- Each node: avatar, name, status indicator, role

**When to build:** When we have 4+ agents with distinct roles

---

### F5: 💰 Cost Dashboard

**What it is:** Token usage + cost analysis per agent, per conversation, per day.

**Why valuable:**
- Know exactly what's driving token consumption
- Detect anomalies (unexpected spikes)
- Week-over-week trends to spot degradation
- Cache savings visualization (if applicable)

**Technical approach:**
- OpenClaw gateway has cost tracking per session (already in session metadata)
- Aggregate from session records in `~/.openclaw/agents/*/sessions/*.jsonl`
- Chart: recharts (already in package.json) — area chart for daily, bar for per-agent
- Anomaly detection: simple — flag any day > 2x rolling average

**When to build:** When token costs become a concern, or before we hit rate limits

---

### F6: 🔄 Pipelines / DAG View

**What it is:** Visual workflow orchestration — show agent tasks as a directed acyclic graph (DAG) with health checks.

**Why valuable:**
- Multi-agent workflows can get complex — visualize the flow
- Health check per step: did it succeed, fail, or is it running?
- Useful for the trading system especially (research → analyze → signal → execute)

**Technical approach:**
- React Flow (same as Org Chart)
- Define pipeline stages as nodes, edges = dependencies
- Each node: stage name, agent assigned, status (pending/running/done/error)
- Real-time status update via SSE

**When to build:** When we have complex multi-step workflows that are hard to track

---

## Notes

- Features 4 and 6 both use React Flow — good synergy, could potentially build both together
- Feature 5 (Cost) is the most independent — could be built anytime
- F2 (Live Logs) and F3 (Chat) are the next sprint targets (v0.2.1)
