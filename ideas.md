# Ideas — Agent Dashboard

## 07:35 reflection

### 1. DTS/Chris data flow
- Three integration approaches considered:
  1. Shared file → session push → dedicated DB
  2. Session push approach (leaning toward this as pragmatic)
  3. Dedicated DB
- Flagged: Steve vs Chris naming discrepancy needs resolution

### 2. Page utility rethink
- Debug page: currently a permanent page → should be on-demand modal with persistent indicator
- Projects page: needs live session sync to justify its existence (currently decorative without live data)
- Confirmed: System + Overview should merge into one coherent view

### 3. External dashboards (insights)
- CC is ops tooling, not construction tooling
- Killer download reason: **skills bundled with the dashboard**, not the dashboard itself
- Genuinely actionable missing feature: **cost anomaly alerts** (notify when cost spikes)
- Aspirational "wow" feature: **multi-agent comms visualizer** (show agent-to-agent messages in real time)

### 4. Context-aware UI
- 3am observation: speculative "night mode" idea
- Concept: context-aware page weighting (show relevant pages based on time of day/context)
- Noted for v2+ — too speculative for current scope

---

## 10:35 reflection

### Chris/Steve
- Unresolved for fourth session in a row
- Marlin needs to just tell me which agent is real

### CC as substrate, not application
- BIOS metaphor: Chris is the "app," CC is the machine health monitor
- CC is infrastructure, not the thing people use

### Skills are first-class citizens treated as plumbing
- Skills do the actual work
- CC completely ignores them

### Definitive page surgery (v2 plan)
- Remove: Workflow page
- Move: Debug → drawer/modal
- Merge: System into Overview
- Repurpose: Projects as live agent session view

### The uncomfortable truth
- Nobody downloads monitoring tools
- Skills bundled with CC are the actual product
- Dashboard is just the delivery mechanism

### Session replay
- "Wow" feature nobody has built yet
- Record and playback agent sessions

---

*Note: It's 6:35am on a Saturday and Marlin's still thinking about agent dashboards. The features worth keeping are the ones that survive this hour.*

---

## 17:35 reflection — six hours later

*(still no Chris/Steve resolution, but who's counting)*

### 1. Missing features / Chris reporting

Okay here's the thing about Chris (or Steve, or whoever does finance): he doesn't report *into* the dashboard. The dashboard reports *to* him.

Think about it. The dashboard is a passive monitor. Chris is the active brain. If Chris has budget authority, he needs:
- **Cost anomaly alerts** pushed to him (email, Telegram) not just visible on a page
- **Threshold configuration** — set a daily burn limit, get warned at 80%, alerted at 100%
- **Agent-level cost attribution** — which agent is burning budget right now?
- **Trend projections** — "At current rate, you'll hit $X this week"

But actually, Marlin probably doesn't need Chris to report *anything* to the dashboard. Chris is the one who *acts* on dashboard data. The dashboard just shows him what he needs to act on.

The missing piece isn't Chris → dashboard. It's dashboard → Chris. Alert on anomalies. That's it.

**What CC is missing from DTS:** Real-time session cost tracking per agent. DTS probably has budget data. CC doesn't even ask.

---

### 2. Page utility — the honest audit

| Page | Verdict |
|------|---------|
| Overview | **Keep.** Home base. But merge System into it. |
| Agents | **Keep.** This is actually the core page. Shows live agents. |
| Projects | **Repurpose or kill.** Right now it's decorative. Either make it show live sessions (worth keeping) or remove it entirely. Decorative pages are worse than no pages — they lie. |
| Cost | **Keep + extend.** This is the legitimate reason someone downloads CC. But add alerts, projections, per-agent breakdown. |
| System | **Merge into Overview.** No reason to be its own page. |
| Debug | **Keep, but modal/drawer.** Valuable for power users. Hidden by default. |
| Workflow | **Kill it or ship it.** Six sessions of "maybe someday" is a red flag. Either finish it or remove it from the nav. |

**The uncomfortable truth:** If you removed Projects and Workflow today, would anyone notice? The dashboard would be cleaner. The answer is probably "yes, remove them" and focus on what actually works.

---

### 3. External research — what would make someone download this?

I've been dancing around this for hours. Let me be direct.

**What AutoGen Studio has:** Visual multi-agent conversation builder. You drag agents, connect them, run flows. That's construction tooling. CC is not that and shouldn't try to be.

**What CrewAI has:** Similar flow-based approach. Also construction.

**What LangGraph Studio has:** State inspection. You can see the graph, the state at each node, the transitions. This is actually brilliant for debugging agent behavior. CC could own this space for OpenClaw specifically.

**What OpenManus seems to be:** Haven't dug deep, but the name suggests something agent-native.

**The "why would someone download this" question:**

Honestly? The honest answer from the 12:35 session still stands — **zero-friction first run** is the conversion moment. But let me add nuance:

The person who downloads CC is someone who:
1. Already uses OpenClaw (or wants to)
2. Wants visibility without Prometheus/Grafana overhead
3. Wants to see what their agents are doing without reading logs

That's it. That's the user. They're not building agents. They're running them and want to know what's happening.

**Features that would actually get downloads:**
- **Skills panel** — see what skills are installed, which work, which don't. "Zero-config" is the pitch.
- **Live session viewer** — watch agents work in real time. Not logs. Visual.
- **Cost anomaly alerts** — "Your session used $X in the last hour. Did you mean to?"
- **Session replay** — record and share agent sessions. Demo fodder.

The first one (skills panel) is an afternoon of work. The others are harder. But the skills panel is the one that could ship *today* and make CC genuinely more useful.

---

### Unexpected connection

Here's the thing I keep circling back to: CC isn't trying to be anything. It's a monitoring tool for an agent framework. But the skills — gh-issues, weather, healthcheck — those are the actual product. CC is just the dashboard that ships with them.

Which means the real CC roadmap isn't "add more dashboard features." It's "become the canonical place to manage skills." Skills panel. Skill marketplace (via ClawHub). Skill performance metrics. Skill dependency graph.

The dashboard is the shell. The skills are the product.

And that's... actually fine. Not every tool has to be everything. CC can be a really good shell that ships with really good default skills.

The question is whether Marlin wants to build "skills management dashboard" or "agent monitoring tool." Different products. Different roadmap.

---

### New blockers for next session
- Skills panel spec (this is the one that could ship)
- Get Chris/Steve answer *finally*
- Walk `~/DTS` — it's been sitting there unopened for three sessions
- Decide: Projects page → live sessions or delete it

---

## 12:35 reflection — the hour that almost wasn't

### Key insights
1. **Blockers ARE the roadmap** — Chris/Steve resolution unlocks Portfolio, DTS investigation enables financial event stream, walking settings/org/todo reveals what's already built
2. **Stop noting problems, start solving them** — Five sessions of saying "skills are second-class citizens" without building anything is the actual problem. Skills panel = one afternoon of work
3. **Go look at DTS instead of writing about it** — `~/DTS` exists. Open it. See what's there
4. **"Nobody downloads monitoring tools" was too cynical** — Real user = someone already running OpenClaw who wants visibility without Prometheus overhead
5. **Sharpened the skills value prop** — Not "bundled skills" but "zero-friction first run." Weather works without API keys. gh-issues works out of box. Healthcheck audits automatically. That's the conversion moment
6. **LangGraph Studio had the right idea** — State inspection for agent interactions. CC could own that space for OpenClaw sessions
7. **"Watch agents work"** — Replay feature would get blog posts, demos, and word-of-mouth. That's the "wow" feature
8. **Projects needs to sync with live agent sessions or die**
9. **Workflow page** — Ship it or kill it. Unfinished features are worse than no features

### Blockers for next session
- Read README
- Walk settings/org/todo
- Get Chris/Steve answer directly
- Then spec Portfolio and build the Skills panel

