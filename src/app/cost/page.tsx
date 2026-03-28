"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, Cpu, HardDrive, Activity, Clock, Settings } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GPU {
  id: number;
  util: number;
  memoryUsed: number;
  memoryTotal: number;
}

interface HistoryRow {
  ts: string;
  cloudTokens: number;
  localTokens: number;
  cloudCost: number;
  avoidance: number;
  totalCloudTokens?: number;
  totalLocalTokens?: number;
  totalCloudCost?: number;
  totalAvoidance?: number;
  gpus: GPU[];
}

interface WhatIfModel {
  name: string;
  inputRate: number;
  outputRate: number;
  enabled: boolean;
}

interface CostApiResponse {
  history: HistoryRow[];
  cloudTokens: number;
  localTokens: number;
  cloudCost: number;
  avoidance: number;
  cloudRate: number;
  activeSessionCount: number;
  gpus: GPU[];
  models: Record<string, { tag: string; inputRate: number; outputRate: number }>;
}

interface ChartDataPoint {
  time: string;
  ts: number;
  cloudDelta: number;
  avoidanceDelta: number;
  cloudCumulative: number;
  avoidanceCumulative: number;
  [key: string]: number | string;
}

type TimeRange = 6 | 12 | 24;

// ─── Constants ─────────────────────────────────────────────────────────────────

const WHAT_IF_COLORS = ["#f97316", "#60a5fa", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
const DEFAULT_WHAT_IF: WhatIfModel = { name: "GPT-5", inputRate: 0.20, outputRate: 1.25, enabled: true };
const WHAT_IF_STORAGE_KEY = "cost.whatIf";
const POLL_INTERVAL_MS = 30_000;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function loadWhatIfModels(): WhatIfModel[] {
  if (typeof window === "undefined") return [DEFAULT_WHAT_IF];
  try {
    const raw = localStorage.getItem(WHAT_IF_STORAGE_KEY);
    if (!raw) return [DEFAULT_WHAT_IF];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_WHAT_IF];
  } catch {
    return [DEFAULT_WHAT_IF];
  }
}

function saveWhatIfModels(models: WhatIfModel[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WHAT_IF_STORAGE_KEY, JSON.stringify(models));
}

function formatCurrency(v: number): string {
  return `$${v.toFixed(2)}`;
}

function formatUtil(gpu: GPU): string {
  return `${gpu.util}% · ${gpu.memoryUsed}/${gpu.memoryTotal} MiB`;
}

function buildChartData(history: HistoryRow[], hours: TimeRange): ChartDataPoint[] {
  const now = Date.now();
  const cutoff = now - hours * 3_600_000;
  const rows = history.filter((r) => new Date(r.ts).getTime() >= cutoff);

  // Each history row now has cloudCost/avoidance as DELTA for this interval
  // AND totalCloudCost/totalAvoidance as never-reset running totals.
  // Use totalCloudCost directly for cumulative chart (no double-accumulation).
  return rows.map((row) => {
    const d = new Date(row.ts);
    const label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return {
      time: label,
      ts: d.getTime(),
      cloudDelta: row.cloudCost ?? 0,
      avoidanceDelta: row.avoidance ?? 0,
      cloudCumulative: row.totalCloudCost ?? 0,
      avoidanceCumulative: row.totalAvoidance ?? 0,
    };
  });
}

function computeWhatIfCumulative(
  history: HistoryRow[],
  hours: TimeRange,
  model: WhatIfModel
): number {
  if (!model.enabled) return 0;
  const now = Date.now();
  const cutoff = now - hours * 3_600_000;
  const rows = history.filter((r) => new Date(r.ts).getTime() >= cutoff);
  const totalTokens = rows.reduce((sum, r) => sum + r.cloudTokens, 0);
  const avgRate = (model.inputRate + model.outputRate) / 2;
  return (totalTokens * avgRate) / 1_000_000;
}

// ─── Components ────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Icon size={16} style={{ color: accent }} />
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {title}
            </span>
          </span>
        }
      />
      <CardBody>
        <div className="text-2xl font-semibold" style={{ color: accent }}>
          {value}
        </div>
        {sub && <div className="mt-1 text-xs text-[var(--color-text-muted)]">{sub}</div>}
      </CardBody>
    </Card>
  );
}

function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const options: TimeRange[] = [6, 12, 24];
  return (
    <div className="flex rounded border border-[var(--color-border)] bg-[var(--color-bg)]">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            value === opt
              ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
          style={value === opt ? { borderBottom: "2px solid var(--color-accent)" } : {}}
        >
          {opt}h
        </button>
      ))}
    </div>
  );
}

interface WhatIfModalProps {
  models: WhatIfModel[];
  onChange: (m: WhatIfModel[]) => void;
  onClose: () => void;
}

function WhatIfModal({ models, onChange, onClose }: WhatIfModalProps) {
  const [local, setLocal] = useState<WhatIfModel[]>(models);

  const update = (i: number, patch: Partial<WhatIfModel>) => {
    const next = local.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    setLocal(next);
  };

  const add = () =>
    setLocal([...local, { name: "", inputRate: 0, outputRate: 0, enabled: true }]);

  const remove = (i: number) => setLocal(local.filter((_, idx) => idx !== i));

  const save = () => {
    onChange(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold">What If — Comparison Models</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          {local.map((model, i) => (
            <div
              key={i}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Model name"
                  className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
                <button
                  onClick={() => remove(i)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-2">
                <label className="flex-1 space-y-1">
                  <span className="text-xs text-[var(--color-text-muted)]">Input $/1M</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={model.inputRate}
                    onChange={(e) => update(i, { inputRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text)]"
                  />
                </label>
                <label className="flex-1 space-y-1">
                  <span className="text-xs text-[var(--color-text-muted)]">Output $/1M</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={model.outputRate}
                    onChange={(e) => update(i, { outputRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text)]"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={model.enabled}
                  onChange={(e) => update(i, { enabled: e.target.checked })}
                  className="accent-[var(--color-accent)]"
                />
                <span className="text-xs text-[var(--color-text-muted)]">Enabled</span>
              </label>
            </div>
          ))}

          <button
            onClick={add}
            className="w-full rounded border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            + Add Model
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  showDelta?: boolean;
}

function CustomTooltip({ active, payload, label, showDelta }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const cloudEntry = payload.find((p) => p.dataKey === "cloudDelta" || p.dataKey === "cloudCumulative");
  const avoidanceEntry = payload.find((p) => p.dataKey === "avoidanceDelta" || p.dataKey === "avoidanceCumulative");
  const whatIfEntries = payload.filter(
    (p) => p.dataKey.startsWith("whatIf_") && p.value > 0
  );

  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 text-xs shadow-lg">
      <div className="mb-1 font-medium text-[var(--color-text-muted)]">{label}</div>
      {cloudEntry && (
        <div className="flex justify-between gap-4">
          <span style={{ color: "#a78bfa" }}>Cloud</span>
          {showDelta && <span>${cloudEntry.value.toFixed(4)}/int</span>}
          <span>${(cloudEntry.value as number).toFixed(4)} total</span>
        </div>
      )}
      {avoidanceEntry && (
        <div className="flex justify-between gap-4">
          <span style={{ color: "#34d399" }}>Avoidance</span>
          {showDelta && <span>${avoidanceEntry.value.toFixed(4)}/int</span>}
          <span>${(avoidanceEntry.value as number).toFixed(4)} total</span>
        </div>
      )}
      {whatIfEntries.map((entry) => {
        const modelName = entry.dataKey.replace("whatIf_", "");
        return (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{modelName}</span>
            <span>${(entry.value as number).toFixed(4)} total</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function CostPage() {
  const [data, setData] = useState<CostApiResponse | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(24);
  const [whatIfModels, setWhatIfModels] = useState<WhatIfModel[]>([DEFAULT_WHAT_IF]);
  const [showWhatIf, setShowWhatIf] = useState(false);

  // Load What If models from localStorage on mount
  useEffect(() => {
    setWhatIfModels(loadWhatIfModels());
  }, []);

  // Poll live data every 30s
  // Backend URL — use same host as the page (works locally or via Tailscale)
  const BACKEND = (() => {
    if (typeof window === 'undefined') return 'http://localhost:3001';
    return `http://${window.location.hostname}:3001`;
  })();

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/dashboard/cost`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error("Failed to poll cost data", e);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchLive]);

  // Fetch history on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND}/api/dashboard/cost/history?hours=${timeRange}`);
        if (res.ok) {
          const json = await res.json();
          setData((prev) => ({ ...(prev ?? json), ...json }));
        }
      } catch (e) {
        console.error("Failed to fetch cost history", e);
      }
    })();
  }, [timeRange]);

  // Build chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data?.history) return [];
    const built = buildChartData(data.history, timeRange);

    // Attach What If cumulative values to each point
    return built.map((point) => {
      const cumulative: ChartDataPoint = { ...point };
      whatIfModels
        .filter((m) => m.enabled)
        .forEach((model) => {
          const key = `whatIf_${model.name}`;
          // Compute proportional share per interval
          const totalCumulative = computeWhatIfCumulative(data.history!, timeRange, model);
          // Scale to same ratio as cloudCumulative proportion
          const cloudTotal = data.history!.reduce((s, r) => s + r.cloudCost, 0);
          if (cloudTotal > 0) {
            cumulative[key] = (point.cloudCumulative / cloudTotal) * totalCumulative;
          }
        });
      return cumulative;
    });
  }, [data, timeRange, whatIfModels]);

  // Last GPU data
  const lastGPU = data?.history?.[data.history.length - 1]?.gpus ?? data?.gpus ?? [];

  // What If totals for display
  const whatIfTotals = useMemo(() => {
    if (!data?.history) return [];
    return whatIfModels
      .filter((m) => m.enabled)
      .map((m, i) => ({
        name: m.name,
        total: computeWhatIfCumulative(data.history!, timeRange, m),
        color: WHAT_IF_COLORS[i % WHAT_IF_COLORS.length],
      }));
  }, [data, timeRange, whatIfModels]);

  // Delta chart: cloudDelta + avoidanceDelta
  const deltaPayload = [
    { dataKey: "cloudDelta" as const, color: "#a78bfa", name: "Cloud" },
    { dataKey: "avoidanceDelta" as const, color: "#34d399", name: "Avoidance" },
  ];

  // Cumulative chart: cloudCumulative + avoidanceCumulative + whatIf_*
  const cumulativePayload = [
    { dataKey: "cloudCumulative" as const, color: "#a78bfa", name: "Cloud" },
    { dataKey: "avoidanceCumulative" as const, color: "#34d399", name: "Avoidance" },
    ...whatIfModels
      .filter((m) => m.enabled)
      .map((m, i) => ({
        dataKey: `whatIf_${m.name}` as const,
        color: WHAT_IF_COLORS[i % WHAT_IF_COLORS.length],
        name: m.name,
      })),
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Cost Dashboard</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Cloud spend vs. local cost avoidance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          <button
            onClick={() => setShowWhatIf(true)}
            className="flex items-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <Settings size={12} />
            What If
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Cloud Cost"
          value={formatCurrency(data?.cloudCost ?? 0)}
          sub="This month"
          icon={DollarSign}
          accent="#a78bfa"
        />
        <KPICard
          title="Cost Avoidance"
          value={formatCurrency(data?.avoidance ?? 0)}
          sub="Local inference savings"
          icon={Activity}
          accent="#34d399"
        />
        {["GPU-0", "GPU-1"].map((label, i) => {
          const gpu = lastGPU[i] ?? { util: 0, memoryUsed: 0, memoryTotal: 1 };
          return (
            <KPICard
              key={label}
              title={label}
              value={`${gpu.util}%`}
              sub={`${gpu.memoryUsed}/${gpu.memoryTotal} MiB VRAM`}
              icon={Cpu}
              accent={i === 0 ? "#60a5fa" : "#f97316"}
            />
          );
        })}
      </div>

      {/* What If Summary */}
      {whatIfTotals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {whatIfTotals.map((w) => (
            <div
              key={w.name}
              className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: w.color }} />
              <span className="text-[var(--color-text-muted)]">{w.name}:</span>
              <span style={{ color: w.color }}>{formatCurrency(w.total)}</span>
              <span className="text-[var(--color-text-muted)]">vs.</span>
              <span style={{ color: "#a78bfa" }}>{formatCurrency(data?.cloudCost ?? 0)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Delta Chart */}
      <Card>
        <CardHeader title="Cost Delta — per interval" />
        <CardBody>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <Tooltip content={<CustomTooltip showDelta />} />
              {deltaPayload.map((entry) => (
                <Area
                  key={entry.dataKey}
                  type="monotone"
                  dataKey={entry.dataKey as string}
                  stroke={entry.color}
                  fill={entry.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Cumulative Chart */}
      <Card>
        <CardHeader title="Cumulative Cost Over Time" />
        <CardBody>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <Tooltip content={<CustomTooltip showDelta={false} />} />
              {cumulativePayload.map((entry) => (
                <Area
                  key={entry.dataKey}
                  type="monotone"
                  dataKey={entry.dataKey as string}
                  stroke={entry.color}
                  fill={entry.color}
                  fillOpacity={entry.dataKey.startsWith("whatIf_") ? 0.05 : 0.15}
                  strokeWidth={entry.dataKey.startsWith("whatIf_") ? 1.5 : 2}
                  strokeDasharray={entry.dataKey.startsWith("whatIf_") ? "5 3" : undefined}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* What If Config Modal */}
      {showWhatIf && (
        <WhatIfModal
          models={whatIfModels}
          onChange={(models) => {
            setWhatIfModels(models);
            saveWhatIfModels(models);
          }}
          onClose={() => setShowWhatIf(false)}
        />
      )}
    </div>
  );
}
