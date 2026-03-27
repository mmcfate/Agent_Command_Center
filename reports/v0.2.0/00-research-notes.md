# Phase 2 Research Notes — Agent Detail + Memory Browser

**Date:** 2026-03-26
**Author:** Jarvis (via cc-workflow)
**Sources:** ClawPort (JohnRiceML/clawport-ui), current dashboard codebase

---

## Design Pivot

**Original plan:** Separate `/memory` page, separate `/chat`, separate `/logs`

**Revised plan (Marlin's direction):** Combine memory browsing into the Agent Detail Panel on the existing Agents page. Each agent gets a tabbed detail view — Overview, Files, Memory, Sessions.

**Why:**
- Memory should be scoped to the agent (not a global page)
- Better UX — one place for agent context instead of scattered pages
- Matches ClawPort's "Agent Detail" feature
- Single-panel design scales better on desktop

---

## ClawPort Reference Features

**Agent Detail (from ClawPort):**
- Full profile per agent: SOUL.md viewer, tools, hierarchy, cron status, voice ID
- Direct chat link
- Memory browsing (their version is a global page, ours is per-agent)

**Memory Browser (from ClawPort):**
- Team memory browser — read daily logs, long-term memory
- Markdown rendering
- JSON syntax highlighting
- Search
- Download

---

## Implementation Strategy

### Backend: `/api/agents/:id/files` and `/api/agents/:id/memory`

**Files endpoint:**
- Lists all `.md`, `.txt` files in `~/.openclaw/workspaces/{agentId}/`
- Reads specific file content
- Used by: Overview tab (SOUL.md, IDENTITY.md), Files tab

**Memory endpoint:**
- Lists `memory/*.md` files
- Reads specific file
- Search across all memory files
- Used by: Memory tab

### Frontend: Agent Detail Panel

- Split view: agent list (left) + detail panel (right)
- Tabs: Overview | Files | Memory | Sessions
- Uses `react-markdown` + `remark-gfm` for rendering
- Global memory search as stretch goal

---

## Dependencies

- `react-markdown` + `remark-gfm` for markdown rendering
- Code syntax highlighting (optional, for memory files with code blocks)

---

## Open Questions

1. Read-only or editable memory? → Recommend read-only
2. Session viewing — existing API or new?
3. Should global memory search aggregate across all agents? (stretch goal)
