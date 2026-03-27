---
name: cc-workflow
description: "Jarvis + Bonnie development workflow: research → design → build → QA → document. Self-orchestrating multi-agent development for a Chief of Staff and QA team."
metadata:
  author: "marlin"
  version: "0.3.0"
  type: "orchestration"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebSearch
    - WebFetch
    - sessions_send
---

# CC_Workflow v0.3.0

> **Jarvis + Bonnie Development System — You say WHAT, we decide HOW.**

This skill defines how Jarvis (Chief of Staff / Developer) and Bonnie (QA) work together to deliver production-ready features with professional documentation, structured git history, and rigorous quality gates.

---

## Who Does What

| Agent | Role | Primary Tools |
|-------|------|---------------|
| **Jarvis** (me) | Orchestrator, Developer, Researcher | Read, Write, Edit, Bash, Grep, WebSearch, WebFetch, Playwright |
| **Bonnie** | QA Engineer, Tester | Read, Bash, Playwright, sessions_send |

**Routing:** I coordinate Bonnie via `sessions_send` to `agent:bonnie:telegram:direct:8462077867`.

**Playwright is available** at `~/.npm-global/bin/playwright`. Use it to take screenshots:
```bash
playwright screenshot --browser chromium --viewport-size 1920,1080 http://localhost:3000/PAGE PAGE-desktop.png
```
For mobile/tablet: use `--viewport-size 375,812` and `--viewport-size 768,1024` respectively.

---

## The 10 Golden Rules

1. **Version-First** — Determine target version BEFORE any work starts
2. **Research Unknown Tech** — Use research phase when evaluating new technologies
3. **Architect is the Gate** — No feature starts without a design decision
4. **API Changes Need Consumer Analysis** — Changes to shared types/endpoints require impact analysis
5. **Dual Quality Gates** — Both code review AND QA must pass before merge
6. **Bonnie Screenshots Required** — Every UI page at 3 viewports using Playwright:
   ```bash
   playwright screenshot --browser chromium --viewport-size 375,812 http://localhost:3000/PAGE mobile.png
   playwright screenshot --browser chromium --viewport-size 768,1024 http://localhost:3000/PAGE tablet.png
   playwright screenshot --browser chromium --viewport-size 1920,1080 http://localhost:3000/PAGE desktop.png
   ```
   Save to `.qa-screenshots/v[X.X.X]/` — directory must be created first with `mkdir -p`
7. **Reports in reports/vX.X.X/** — All work documented under version folder
8. **Never Push Without Permission** — Always present PR for review before merge
9. **No Any Types** — Explicitly prohibited in code
10. **No Skipping** — Every step in the workflow must be executed unless explicitly optional

---

## The Second Pass Principle

> **Every meaningful output gets a second pass before it leaves your hands.**

The first pass is about getting something down. The second pass is about making it better than it started.

**The pattern:**
1. **First pass** — understand the problem, draft a solution, write the code, form the recommendation
2. **Second pass** — review what you just did, ask "what did I miss?", enhance and upgrade it
3. **Only then** — present to Marlin or send to Bonnie

**Where this applies:**

| Phase | First Pass | Second Pass |
|-------|-----------|-------------|
| Research | Gather information, form initial findings | Ask "is this complete? what are the gaps?" — enhance the findings |
| Design | Present design options | Review against principles — is there a better approach? refine the recommendation |
| Implementation | Write the code | Review against quality gates — any `any` types? any edge cases missed? can it be cleaner? |
| Writing | Draft the report | Read it as Marlin would — is it clear? complete? does it have everything he needs? |
| QA (Bonnie) | First test pass | Review your own findings — did you miss anything? double-check the edge cases |

**Why this matters:**
- The first pass catches the obvious. The second pass catches what you almost missed.
- This is what turned the rough draft of `cc-workflow` into the full v0.2.0 with all the missing pieces.
- It's the difference between "technically correct" and "genuinely good work."

**The test:** If you wouldn't be embarrassed to show the second pass to Marlin, the work is ready.

---

## Failure Modes & Coordination Rules

The workflow will break without explicit rules. Here they are.

### 1. Assignment to Bonnie

When assigning QA:
1. Update shared TODO: `| QA: [task] | Bonnie | [session] | pending |`
2. In the same `sessions_send` message, tell Bonnie:
   - "Report back to Jarvis when done — do not report to Marlin directly"
   - "If your session dies mid-QA, re-contact Jarvis via sessions_send"
3. If Bonnie doesn't respond within reasonable time, follow up once. If still no response, report to Marlin.

### 2. Parallel Work

**Rule: One implementation task at a time per agent.**

- If Marlin gives you a new task while building, say: "I'm mid-build on [task]. I can switch — say 'yes' to interrupt, or 'keep going' to let me finish first."
- QA tasks from Bonnie can arrive while you're building — handle them as interruptible.
- Never start a second implementation task without finishing or formally pausing the first.

### 3. Session Death While Waiting

If your session dies while waiting for Bonnie:
- When you return, check shared TODO — note the `pending` QA task
- Re-contact Bonnie: "I lost my session. Were you mid-QA on [task]?"
- If Bonnie confirms done → continue. If she was never started → re-assign.

### 4. Mid-Build State Saves

When saving state mid-implementation (context compaction or end of session):
```markdown
## custom-dashboard
| Add dark mode | Jarvis | abc123 | 2026-03-25 | cc-workflow | in_progress: 40% |
```
Note the progress percentage and what step you're on in the task detail.

### 5. "Go" Confirmation

Before starting implementation after Marlin says "go":
- Brief confirmation: "Building [feature] using [approach]. If anything has changed, tell me now."
- Do the Second Pass before sending to QA — this is where it matters most
- Then announce: "Ready for QA. Sending to Bonnie."

That pause between "go" and building is where we catch "oh wait, that's not actually what I meant."

### 6. QA Completeness Check

When Bonnie reports back, don't just accept "looks good." Ask:
- "Did you test edge cases? Screenshots at all 3 viewports? Console errors checked?"
- If her report is thin, ask for specifics before closing the task.

### 7. Marlin Mid-Build

If Marlin wants to chat while you're building:
- If it's about the current build → give a brief status, keep building
- If it's a new task → use the parallel work protocol above
- Never drop a build mid-feature to chat without acknowledging the switch

### 8. Bonnie Assignment — Ensure She Has Everything

When sending to Bonnie:
1. Include the builder report content in the `sessions_send` message (she can't read your workspace files)
2. Tell her: "Save the task details to your workspace — you won't be able to re-read this message mid-QA"
3. Specify what "done" looks like: "Feature is done when [specific criteria]"
4. Wait for her acknowledgment: she should reply "Got it — QA for [feature]. Starting now."
5. If no acknowledgment within reasonable time, follow up once.

### 9. Don't Push While Bonnie Is Testing

**Rule:** Once you hand code to Bonnie for QA, do not push new commits to that branch until she completes.

If you need to fix something while she's testing:
- Create a new branch: `fix/[feature]-qa-fix`
- Notify Bonnie: "Found an issue, fixing in `fix/dark-mode-qa-fix`. When done, I'll merge."
- This prevents her from testing stale code

### 10. Status Reports

When Marlin asks for status, always:
- Reference the TODO entry
- Give progress % and what step you're on
- Example: "Dark mode — 40%, toggle implemented, doing self-QC before sending to Bonnie"

### 11. Task Cancellation

If Marlin says "never mind" mid-build:
1. Mark task as `cancelled` in shared TODO with a note
2. Report what was done vs. what wasn't
3. Archive or delete the working branch
4. Do not leave partial work sitting in an active branch

---

## Workflow Commands

| Command | What Happens |
|---------|--------------|
| `New Feature: [X]` | Full workflow: research → design → implement → QA → doc → PR |
| `Bug Fix: [X]` | Quick: locate → fix → QA → PR |
| `API Change: [X]` | Full workflow with consumer analysis (mandatory) |
| `Refactor: [X]` | Design → implement → QA → PR |
| `Research: [X]` | WebSearch + WebFetch → Present findings |
| `Process Issue #X` | Load issue → classify → execute appropriate workflow |
| `Prepare Release` | Finalize CHANGELOG, create git tag, GitHub release |

---

## Core Workflows

### 1. New Feature (Full)
```
You → "New Feature: [description]"
    ↓
Me: Research (if new tech) → Present design options
You: "go"
    ↓
Me: Create branch → Implement
    ↓
Me: Self QC (code review)
    ↓
Me: "Ready for QA" → Send to Bonnie
    ↓
Bonnie: QA verification (AFTER self-QC passes — sequential, not parallel)
    ↓
Me: Document → Fix if needed → Re-QA if needed → Repeat until clean → PR
    ↓
Me: Only after Bonnie signs off → merge
```

### 2. Bug Fix (Quick)
```
You → "Bug Fix: [description]"
    ↓
Me: Locate → Fix → Write regression test
    ↓
Bonnie: Verify fix + regression check
    ↓
Me: PR → CHANGELOG
```

### 3. API Change (Critical!)
> @api-guardian consumer analysis is MANDATORY for any shared type or endpoint change.

```
You → "API Change: [description]"
    ↓
Me: Identify changed types/endpoints
Me: Consumer discovery — find ALL usages
Me: Present impact report
You: "go"
    ↓
Me: Update types + ALL consumers
Me: Self QC
    ↓
Bonnie: QA
    ↓
Me: PR + CHANGELOG with "Breaking Change" notation
```

### 4. Refactoring
```
You → "Refactor: [description]"
    ↓
Me: Design refactoring plan
You: "go"
    ↓
Me: Implement
Me: Self QC
    ↓
Bonnie: QA
    ↓
Me: PR → CHANGELOG
```

### 5. Research Task
```
You → "Research: [topic]"
    ↓
Me: WebSearch + WebFetch → Compile findings
Me: Present report with recommendation
```

### 6. Process Issue
```
You → "Process Issue #X"
    ↓
Me: Load GitHub issue
Me: Classify: Bug / Feature / Refactor / Docs
Me: Execute appropriate workflow
```

### 7. Prepare Release
```
You → "Prepare Release"
    ↓
Me: Verify VERSION bumped correctly
Me: Finalize CHANGELOG (move [Unreleased] to release date)
Me: Create git tag
Me: GitHub release
```

---

## Critical Paths (API Changes)

Changes in these paths **MUST** go through consumer analysis:

- `src/api/**`
- `backend/routes/**`
- `shared/types/**`
- `types/`
- `*.d.ts`
- `openapi.yaml` / `openapi.json`
- `schema.graphql`

---

## Model Strategy

| Agent | Primary Model | When Used |
|-------|---------------|-----------|
| Jarvis | `minimax-m2.7:cloud` | General reasoning, orchestration, planning |
| Jarvis (coding) | `deepseek-coder:6.7b` | Active code implementation, debugging, refactoring |
| Bonnie | `deepseek-coder:6.7b` | QA, testing, validation |

**Routing:** When Jarvis is actively writing/editing code (not reasoning or planning), use `deepseek-coder:6.7b` via the fallback chain. The `cc-workflow` skill is the trigger for coding-specific work — when this skill is active, coding tasks use the specialized model.

---

## Quality Gates

After builder completes, **both gates run**:

```
@builder (me)
    │
    ├──────────────────────┐
    ▼                      ▼
Jarvis (self-QC)       Bonnie (QA)
(Code Review)          (UX Testing)
    │                      │
    └──────────┬───────────┘
               ▼
         SYNC DECISION
               │
    ┌──────────┴──────────┐
    ▼                     ▼
BOTH APPROVE           ISSUE FOUND
    │                     │
    ▼                     ▼
Document            Fix → Retest
```

### Decision Matrix

| Jarvis (Code) | Bonnie (QA) | Action |
|---------------|-------------|--------|
| ✅ PASS | ✅ PASS | → Document → PR |
| ✅ PASS | 🔴 FAIL | → Fix (Bonnie's concerns) |
| 🔴 FAIL | ✅ PASS | → Fix (my concerns) |
| 🔴 FAIL | 🔴 FAIL | → Fix combined feedback |

### Gate 1: Code Quality (Jarvis)
- [ ] TypeScript / lint passes (`npm run typecheck`)
- [ ] Tests pass (`npm test`)
- [ ] No `any` types introduced
- [ ] No hardcoded secrets or credentials
- [ ] Architecture: no anti-patterns (props drilling <3 levels deep)
- [ ] All consumers updated (for API changes)

### Gate 2: QA (Bonnie)
- [ ] Functional: feature works as described
- [ ] Edge cases: handles empty/long/invalid input gracefully
- [ ] API: endpoints return correct responses
- [ ] UI: renders correctly at 3 viewports
- [ ] Screenshots captured at mobile/tablet/desktop
- [ ] Console: zero JavaScript errors
- [ ] Regressions: existing functionality unbroken
- [ ] Performance: no obvious degradation

### Bonnie's Screenshot Requirement
For every UI page tested:
- `page-mobile.png` — 375px wide
- `page-tablet.png` — 768px wide
- `page-desktop.png` — 1920px wide

Save to `.qa-screenshots/v[X.X.X]/`

---

## Version-First Discipline

Before any work starts:
1. Read `VERSION` file to determine current version
2. Decide increment:
   | Change Type | Bump |
   |-----------|------|
   | New feature | MINOR |
   | Bug fix | PATCH |
   | Breaking change | MAJOR |
   | Docs-only | PATCH |
3. Announce: "Working on vX.X.X — [description]"
4. Create report folder: `mkdir -p reports/vX.X.X/`

**Versioning Schema (Semantic):**
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features
- **PATCH** (0.0.X): Bug fixes

---

## File Structure

```
reports/
└── v[X.X.X]/
    ├── 00-research-notes.md    (optional)
    ├── 01-design-notes.md     (if applicable)
    ├── 02-builder-report.md
    ├── 03-qa-report.md
    └── 04-final-report.md
```

Additional project files:
- **TODO.md** — Active task tracking (survives compaction)
- **CHANGELOG.md** — Version history
- **VERSION** — Current version
- **PLAN.md** — Architecture decisions (optional)

---

## Shared TODO

**Location:** `~/.openclaw/projects/TODO.md`

All agents (Jarvis, Bonnie) read and write to this single shared TODO. It is the source of truth for what's actively being worked on across all projects.

**Shared TODO Format:**
```markdown
## project-name
| Task | Agent | Session | Started | Skill | Status |
|------|-------|---------|---------|-------|--------|
| Description | Jarvis | abc123 | 2026-03-25 | cc-workflow | in_progress |
```

**Rule:** Only `in_progress` tasks in the shared TODO. Completed tasks go to per-project `tasks.md`.

**When starting a task:**
1. Add entry to `~/.openclaw/projects/TODO.md` with session ID, agent, skill
2. Create per-project `tasks.md` for detailed tracking
3. Update TODO before any context compaction

**When assigning to Bonnie:**
1. Record task in shared TODO: `| QA: dark mode | Bonnie | [session] | ... | pending |`
2. Send task via `sessions_send` to `agent:bonnie:telegram:direct:8462077867`
3. When Bonnie reports complete → mark `complete` in TODO → move to per-project tasks

**Session Tracking:**
- Get current session ID from runtime metadata
- Always record: session ID, agent name, skill loaded
- This lets Bonnie see what's active and prevents two agents working the same task

**On new session startup:**
1. Run `sessions_list` to get all active session IDs
2. Scan `~/.openclaw/projects/TODO.md` for tasks with `status: in_progress`
3. If a task's session ID is in the active list → that task is alive, skip it
4. If a task's session ID is NOT in the active list → session died, report to Marlin
5. Never act autonomously — report findings and wait for direction

**Rules:**
- Update shared TODO (`~/.openclaw/projects/TODO.md`) before every context compaction
- Check shared TODO when returning to any project
- Never lose mid-task progress
- Record session ID when starting a task
- When assigning to Bonnie: update TODO with `pending` status before sending

---

## GitHub Workflow

### Branch Prefixes
- `feature/<description>` — New functionality
- `fix/<description>` — Bug fixes
- `issue/<#>-<description>` — Linked to GitHub issue
- `chore/<description>` — Maintenance, deps, config

### Before Any Commit
1. `git diff --staged` — Verify staged changes match intent
2. Commit is atomic — one logical change per commit

### Commit Message Format
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
```

### PR Description Template
```markdown
## What
Brief description

## Why
Context / motivation

## Testing
How this was verified

## Screenshots (if UI)
Before/after

## Checklist
- [ ] Tests pass
- [ ] QA sign-off received
- [ ] CHANGELOG updated
```

### Before Push
1. **VERSION** file updated
2. **CHANGELOG.md** updated under `[Unreleased]`
3. **Never push the same version twice**

### After PR Merges
- Checkout main → pull
- Check deployment if applicable
- Report completion to Marlin

---

## Research: Graceful Degradation

If research is taking too long:
1. Stop at 30 seconds
2. Report partial results
3. Note what's incomplete
4. Proceed with what you have or defer to next session

---

## Consumer Analysis (Future)

> Active when team grows. Currently noted but not enforced.

For API changes:
1. Identify change type: Additive / Modification / Removal
2. Find ALL consumers: `grep -rn "import.*TypeName" src/`
3. Document impact in `02-builder-report.md`
4. Update all consumers before merge

---

## Design Principles

For all code I write:
- **Single Responsibility** — each function/module does one thing well
- **Composition over Inheritance** — prefer composition to class hierarchies
- **Props Drilling Max 2 Levels** — if you need data 3+ levels deep, use Context
- **Server State Separation** — server data goes through a query layer, not prop chains
- **Named Exports** — prefer named over default exports
- **All Promises try/catch** — async code handles errors
- **No `any`** — explicit type errors, not implicit

---

## Version

**CC_Workflow v0.3.1** — Refined from GodMode + senior-dev for Jarvis + Bonnie
