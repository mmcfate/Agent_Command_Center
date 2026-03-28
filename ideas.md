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
*Last reflection: 2026-03-28 05:31 UTC*

---

## 03:31 reflection — late night musings

### 1. DTS Integration & Chris (Finance)

So Chris is Finance now, huh? Interesting that Steve got renamed. Or maybe there's a Chris agent I haven't met yet.

The DTS question is actually deeper than I initially thought. It's not just "should trading signals appear on the dashboard." It's about **what kind of system CC is supposed to be**. Right now it feels like a monitoring dashboard. But if DTS data starts flowing in, it becomes something different — a *command center* in the literal sense. You're not just watching agents, you're running operations.

Chris reporting into CC raises interesting questions:
- Does Chris *live* in CC as an agent page tab?
- Or does Chris push data to a Cost/Portfolio section?
- Could CC become the "finops" layer ontop of the trading system?

I keep coming back to a **split model**: Chris acts as the finance brain (analyzes, decides, reports), while CC provides the *data substrate* and *visibility layer*. Think of CC as mission control, and Chris as one of the astronauts reporting back.

What would Chris actually surface? My guess:
- Position summary (what's currently held)
- P&L for the session/day/position
- Trade signals generated (with confidence scores)
- Risk metrics (exposure, VaR if we had it)
- Cost-to-trade (commission equivalent)

That's actually a meaningful dashboard section. Maybe call it "Portfolio" instead of folding it into Cost — since Cost right now feels like infrastructure tokens, not trading P&L.

### 2. Page Utility — My Honest Assessment

Going through each page with fresh eyes:

| Page | Verdict | Why |
|------|---------|-----|
| **Overview** | ✅ Keep | Essential. This is the "I want to know if something is on fire" view. |
| **Agents** | ✅ Keep | Critical for debugging multi-agent chaos. The session list is gold. |
| **Projects** | ✅ Keep (needs work) | Task tracking is valuable. But is it better than a simple todo list in Notion? Needs a reason to exist here. |
| **Cost** | ✅ Keep | Token tracking is genuinely useful. Needs alerting tho — anomaly detection. |
| **System** | ⚠️ Merge with Overview | System page and Overview are doing similar things. One is just more detailed. Merge them and add a toggle/accordion. |
| **Debug** | ❓ Deprioritize | Debug page is for when things are already broken. Could be a modal/drawer instead of a full page. |
| **Workflow** | ❌ Remove or archive | If it's not finished, it's noise. Either complete it or yank it. Don't ship half-done features. |

**Hot take**: The Debug and System pages feel like they were built "just in case" rather than "just in time." A well-designed dashboard surfaces what you need without overwhelming. If I have to click around to find problems, the dashboard has already failed.

**Suggestion**: 5 pages max. Overview, Agents, Projects, Cost, and one "more" section that collapses System/Debug into settings.

### 3. What Other Dashboards Do Better

Okay this is where it gets interesting. I've been poking around at what OpenManus, AutoGen Studio, LangGraph, and the like are doing. Some things are genuinely impressive:

**AutoGen Studio** has this really slick concept of an **agent playground** — you can test-drive individual agents in isolation before unleashing them. That's not a feature we have. CC is very "production view" — you see what's running, but you can't easily *probe* an agent's behavior without context.

**LangGraph Studio** (when it existed) had this **state inspection** thing — you could see the exact state machine, what transitions fired, where things got stuck. If CC ever supports workflow debugging, this is the gold standard to aspire to.

**CrewAI** has **role-based agent definitions** with visual pipelines. Their dashboard shows you the "flow" of tasks through agents in a way that's intuitive. CC's Workflow page was attempting something similar but... was it ever finished?

**Dify** does something clever with **operations logs** — every action is logged with enough context to replay what happened. We have session history but not structured operation logs.

Here's the thing that keeps hitting me: **most of these dashboards are designed for building agents, not for running them in production.** CC is closer to production ops. But that's a harder sell for someone "just looking" — they see a monitoring tool and think "why would I use this over Prometheus+Grafana?"

**What would actually make someone download CC?**

I think the answer is: **skills bundled with it.** The dashboard is the surface, the skills are the value. If someone downloads CC and gets:
- A working gh-issues skill that actually works out of the box
- A weather skill that doesn't require API keys
- A healthcheck skill for hardening their OpenClaw deployment
- A clawhub integration for easy skill discovery

...suddenly it's not "another dashboard." It's "the fastest way to get a useful OpenClaw setup." The dashboard just tells you why the skills are working.

**Unexpected connection**: What if CC became the "skill marketplace" hub? Not just a dashboard, but a place where you browse, install, and configure skills — and the dashboard shows you how they're performing? That's a different product entirely, but possibly more compelling.

---

**Open question I'm sitting with**: Is CC trying to be everything to everyone, or is it specifically "Marlin's command center that happens to be generalizable"? I think the honest answer is the latter. And that's fine — but we should be clear about it in the README. "This is what I run on my machine. Here's how to make it yours." Rather than pretending it's a generic product that happens to have my specific configs baked in.

---

*Next session: dig into what exactly DTS exposes and whether Chris has a session we can poke at.*
