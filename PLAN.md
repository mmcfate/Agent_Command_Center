# Agent Command Center — Project Plan

## What
A real-time dashboard for multi-agent development team (Jarvis + Bonnie). Visualizes the development workflow, shows active tasks across all agents, displays system health, and surfaces orphaned tasks.

## Why
Current dashboard is Vue-based, single-agent, flat data model. Doesn't support multi-agent workflow (Jarvis↔Bonnie), shared TODO, visual pipeline, or session-aware task tracking.

## Stack
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Zustand
- **Backend:** Express (existing)
- **Real-time:** SSE
- **Workflow graph:** React Flow
- **Charts:** Recharts

## Key Differentiators
1. Visual workflow pipeline (research→design→implement→QA→doc→PR)
2. Shared TODO with orphan detection
3. Session-aware task tracking
4. Real-time orphan alert banners
5. File-based state (not DB) — dashboard observes, doesn't own

## Status
PLANNING — spec written, awaiting approval
