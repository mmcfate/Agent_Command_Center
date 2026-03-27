# SPEC.md — Cost Dashboard v2 (Token-Based)

## Overview

Track AI inference costs across cloud and local models. Two metrics: real cloud spend and cost avoidance (local tokens × cloud rate). Comparison models allow "what if I ran on X" analysis.

---

## Architecture

### Storage
- **`~/.openclaw/data/cost-history.json`** — flat JSON array, one row per 5-min snapshot
  ```json
  {
    "ts": "2026-03-27T14:00:00Z",
    "cloudTokens": 48291,
    "localTokens": 182003,
    "cloudCost": 7.42,
    "avoidance": 27.92,
    "gpus": [{"id": "0", "util": 4, "memUsed": 8200, ...}]
  }
  ```
- **`~/.openclaw/data/cost-state.json`** — token tracking state (in-memory snapshot between intervals)
  ```json
  {
    "sessions": {
      "sessionId123": { "model": "minimax-m2.7:cloud", "prevTokens": 1500, "cloud": true }
    }
  }
  ```
- **Monthly rollover**: on 1st of month, archive `cost-history.json` to `cost-YYYY-MM.json` and start fresh

### Model Config (backend)
Each configured model tagged `cloud` or `local` with rates:
```json
{
  "models": {
    "minimax-m2.7:cloud": { "tag": "cloud", "inputRate": 0.10, "outputRate": 0.50 },
    "qwen2.5:14b":        { "tag": "local", "inputRate": 0.10, "outputRate": 0.50 },
    "deepseek-coder:6.7b":{ "tag": "local", "inputRate": 0, "outputRate": 0 }
  }
}
```
Cloud rates are real $/1M tokens. Local rates stored for consistency but avoidance always uses the actual cloud rate.

---

## Backend

### Token Tracking Logic (every 5 min)
1. Query gateway sessions → for each session, get model + accumulated tokens
2. Diff against stored `prevTokens` for that session:
   - New session: `delta = currentTokens` (counts all tokens)
   - Existing session: `delta = current - prev`
   - Ended session: `delta = prev` (final count), remove from tracking
3. Accumulate deltas by model tag → `cloudTokens`, `localTokens`
4. Write snapshot: `{ts, cloudTokens, localTokens, cloudCost, avoidance, gpus}`
5. Update `cost-state.json` with current token counts

### Ollama Token Counting
- Intercept calls to `http://localhost:11434/api/generate` and `/api/chat`
- Parse response JSON for `prompt_eval_count` (input tokens) + `eval_count` (output tokens)
- Track per model in the session state
- Note: batch/embedding calls may not return eval counts — handle gracefully

### Cost Snapshot Interval
- `COST_INTERVAL_MS = 5 * 60 * 1000` (5 minutes)
- On gateway startup, check date → if 1st of month, do rollover before starting interval
- Snapshot written to file atomically (write to temp, rename)

---

## Frontend — Cost Dashboard (`/cost`)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Cost Dashboard          [6h │ 12h │ 24h]  [What If ⚙]   │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ Cloud    │ Avoidance│ GPU0 Util│ GPU1 Util                  │
│ $7.42    │ $27.92   │ ██░░ 4% │ ░░░░ 0%                   │
│ 48.3K tok│ 182K tok │ 8200 MiB │ 8027 MiB                  │
├──────────┴──────────┴──────────┴────────────────────────────┤
│                                                             │
│  Cost Over Time                                             │
│  [Delta graph — token rate per 5-min window]                 │
│  [Total graph — cumulative tokens]                           │
│                                                             │
│  Lines: ── Cloud Cost   ── Cost Avoidance                  │
│         ── What If: GPT-5   ── What If: Opus               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ What If Configurator (modal/panel):                         │
│ Model        Input $   Output $    │ [on/off]               │
│ GPT-5        0.20      1.25       │  ✓                     │
│ Opus 4       0.15      0.75       │  ○                     │
│ Claude 4     0.18      0.90       │  ○                     │
│                                        [+ Add Model]         │
└─────────────────────────────────────────────────────────────┘
```

### Graph Details
- **No Y-axis** (clean, shape-focused)
- **X-axis**: time labels (6h / 12h / 24h)
- **Two sub-graphs**: Delta (rate) + Total (cumulative), stacked vertically
- **Each metric has two lines**: delta and total
  - Delta: goes up/down with activity
  - Total: always climbs, resets on monthly rollover
- **What If lines**: total only (no delta — same rate shape as Cloud delta)
- **Tooltip** on hover:
  ```
  T=14:00
  ──────────────┬──────────┬──────────┬──────────┐
  Metric        │ Delta    │ Total    │ Cost     │
  ──────────────┼──────────┼──────────┼──────────┤
  Cloud Cost    │ 1,234 t  │ 48,291 t │ $7.42    │
  Cost Avoid.   │ 4,102 t  │ 182,003 t│ $27.92   │
  What If: GPT-5│ —        │ 48,291 t │ $9.66    │
  What If: Opus │ —        │ 48,291 t │ $5.55    │
  ```

### What If Configurator
- localStorage key: `cost.whatIf`
- Per model: `{ id, name, inputRate, outputRate, enabled }`
- Input/output rates: cost per 1M tokens
- Comparison formula: `cloudTokens × (inputRate + outputRate) / 2 / 1_000_000` (simplified blended rate)
- Or: show input and output separately in tooltip
- Add/remove/toggle models

### KPIs (top row)
- **Cloud Cost**: cumulative $ spent this month
- **Cost Avoidance**: cumulative $ avoided (local tokens × cloud rate)
- **GPU-0 / GPU-1**: current util % + VRAM used/total

### Refresh
- Frontend polls `GET /api/dashboard/cost` every 30s
- SSE update available when connected ( piggyback on existing stream)

---

## Backend API

### `GET /api/dashboard/cost`
Returns:
```json
{
  "history": [ /* last 288 snapshots (24h) */ ],
  "cloudTokens": 48291,
  "localTokens": 182003,
  "cloudCost": 7.42,
  "avoidance": 27.92,
  "gpus": [...],
  "models": {
    "minimax-m2.7:cloud": { "tag": "cloud", "inputRate": 0.10, "outputRate": 0.50 },
    "qwen2.5:14b": { "tag": "local", "inputRate": 0.10, "outputRate": 0.50 }
  }
}
```

---

## Build Order

1. Backend: token tracking state + diffing logic + new snapshot format
2. Backend: Ollama response interception for token counting
3. Backend: monthly rollover
4. Frontend: replace cost page with new UI (dual-line graph, What If configurator)
5. QA: Bonnie tests

## Constraints
- All Ollama inference is free (local GPUs) — cloud cost is illustrative
- What If is computed frontend-only from stored cloud token counts
- If backend is down, 5-min window is missed — negligible over a month
