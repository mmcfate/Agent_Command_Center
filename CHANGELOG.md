# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — v0.2.0

### Added
- **Agent Detail Panel** — Tabbed detail view for each agent (Overview, Files, Memory, Sessions)
  - Overview: SOUL.md and IDENTITY.md rendered as markdown
  - Files: Browse all markdown files in agent workspace
  - Memory: Browse and search agent's memory files with markdown rendering
  - Sessions: Recent session history per agent
- **Global Memory Search** — (stretch) Search across all agents' memory from one place

### Ideas for Future (see `reports/v0.2.0/future-ideas.md`)
- Live Logs + Activity Console (v0.2.1)
- Full Chat + File/Image Attachments (v0.3.0)
- Org Chart (interactive agent hierarchy)
- Cost Dashboard (token usage + anomaly detection)
- Pipelines / DAG View (workflow orchestration)
- Voice Chat (full duplex — recording, STT, TTS, ElevenLabs)

---

## [0.1.0] — 2026-03-26

### Added
- Overview dashboard (CPU, memory, network, uptime)
- Agents page (session list)
- Projects/Kanban (drag-and-drop tasks)
- Dark/light theme toggle
- System/Debug pages
- Initial project structure with Next.js + Tailwind
