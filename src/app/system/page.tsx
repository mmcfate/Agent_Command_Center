"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDashboardStore } from "@/store";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { Server, HardDrive, Wifi, Zap, Activity, Clock, Send, Trash2, Pause, Play, ChevronDown, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const API = "http://localhost:3001";

const API_ENDPOINTS = [
  "/api/dashboard/agents",
  "/api/dashboard/sessions",
  "/api/dashboard/tasks",
  "/api/dashboard/projects",
  "/api/dashboard/crons",
  "/api/dashboard/system",
  "/api/dashboard/overview",
  "/api/dashboard/agents/jarvis/files",
  "/api/dashboard/agents/jarvis/memory",
  "/api/dashboard/agents/jarvis/sessions",
];

// ============ Gateway Card ============
function GatewayCard() {
  const { system } = useDashboardStore();
  if (!system) return null;

  return (
    <Card>
      <CardHeader title="Gateway" icon={<Server size={14} />} />
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Status</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: system.gateway.online ? "#34d399" : "#f87171" }} />
            <span className="text-xs font-medium" style={{ color: system.gateway.online ? "#34d399" : "#f87171" }}>
              {system.gateway.online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Version</span>
          <span className="text-xs" style={{ color: "var(--color-text)" }}>{system.gateway.version || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Latency</span>
          <span className="text-xs" style={{ color: "var(--color-text)" }}>{system.gateway.latencyMs}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Uptime</span>
          <span className="text-xs" style={{ color: "var(--color-text)" }}>
            {system.gateway.uptime > 0 ? `${Math.floor(system.gateway.uptime / 3600)}h ${Math.floor((system.gateway.uptime % 3600) / 60)}m` : "—"}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

// ============ Services Card ============
function ServiceRow({ service }: { service: any }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: service.online ? "#34d399" : "#f87171" }} />
        <span className="text-xs" style={{ color: "var(--color-text)" }}>{service.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>:{service.port}</span>
        <span className="text-xs" style={{ color: service.online ? "#34d399" : "#f87171" }}>
          {service.online ? "up" : "down"}
        </span>
      </div>
    </div>
  );
}

function ServicesCard() {
  const { system } = useDashboardStore();
  if (!system) return null;
  return (
    <Card>
      <CardHeader title="Services" icon={<Wifi size={14} />} />
      <CardBody className="p-0 px-4">
        {system.services.map((svc) => <ServiceRow key={svc.port} service={svc} />)}
      </CardBody>
    </Card>
  );
}

// ============ System Metrics ============
function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="h-full rounded-full transition-all" style={{ backgroundColor: color, width: `${value}%` }} />
      </div>
    </div>
  );
}

function SystemMetricsCard() {
  const system = useDashboardStore((s) => s.system);
  const hist = useDashboardStore((s) => s.systemHistory);
  if (!system) return null;

  const getColor = (v: number) =>
    v > 85 ? "#f87171" : v > 70 ? "#fbbf24" : "#34d399";

  return (
    <Card>
      <CardHeader title="Host Metrics" icon={<HardDrive size={14} />} />
      <CardBody className="space-y-4">
        {/* CPU row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <MetricBar label="CPU" value={system.cpu} color={getColor(system.cpu)} />
          </div>
          <Sparkline data={hist.cpu} color={getColor(system.cpu)} width={100} height={32} />
        </div>
        {/* RAM row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <MetricBar label="RAM" value={system.ram} color={getColor(system.ram)} />
          </div>
          <Sparkline data={hist.ram} color={getColor(system.ram)} width={100} height={32} />
        </div>
        {/* Disk row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <MetricBar label="Disk" value={system.disk} color={getColor(system.disk)} />
          </div>
          <Sparkline data={hist.disk} color={getColor(system.disk)} width={100} height={32} />
        </div>
        {/* GPU rows */}
        {hist.gpus.map((g) => {
          const memTotal = g.memTotal[0] || 1;
          const latestMemPct = g.memUsed.length > 0
            ? Math.round((g.memUsed[g.memUsed.length - 1] / memTotal) * 100)
            : 0;
          const memUsed = g.memUsed[g.memUsed.length - 1] || 0;
          const gpuData = g.memUsed.map((v, idx) =>
            Math.round((v / (g.memTotal[0])) * 100)
          );
          return (
            <div key={g.id} className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>
                    GPU {g.id} <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>({g.name})</span>
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {memUsed}MiB / {memTotal}MiB
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
                  <div className="h-full rounded-full transition-all" style={{ backgroundColor: getColor(latestMemPct), width: `${latestMemPct}%` }} />
                </div>
              </div>
              <Sparkline data={gpuData} color={getColor(latestMemPct)} width={100} height={32} />
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
// ============ Crons Card ============
function CronsCard() {
  const { crons } = useDashboardStore();
  return (
    <Card>
      <CardHeader title="Cron Jobs" icon={<Clock size={14} />} />
      <CardBody className="p-0 px-4">
        {crons.length === 0 ? (
          <p className="text-xs italic py-3" style={{ color: "var(--color-text-secondary)" }}>No cron jobs</p>
        ) : (
          crons.map((cron) => (
            <div key={cron.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cron.status === "active" ? "#34d399" : "#8888a0" }} />
                <span className="text-xs" style={{ color: "var(--color-text)" }}>{cron.name}</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>{cron.schedule || "—"}</span>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

// ============ API Tester ============
function ApiTesterCard() {
  const [endpoint, setEndpoint] = useState(API_ENDPOINTS[0]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const send = () => {
    setLoading(true);
    const reqStart = Date.now();
    fetch(`${API}${endpoint}`)
      .then(res => res.json().then(data => ({ status: res.status, body: data, latencyMs: Date.now() - reqStart })))
      .then(d => setResponse(d))
      .catch(e => setResponse({ error: e.message }))
      .finally(() => setLoading(false));
  };

  const statusColor = (s: number) => s < 300 ? "#34d399" : s < 400 ? "#fbbf24" : "#f87171";

  return (
    <Card>
      <CardHeader title="API Tester" icon={<Activity size={14} />} />
      <CardBody className="space-y-3">
        <div className="flex gap-2">
          <select
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            className="flex-1 text-xs px-2 py-1.5 rounded"
            style={{ background: "var(--color-bg-elevated)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
          >
            {API_ENDPOINTS.map(ep => <option key={ep} value={ep}>{ep}</option>)}
          </select>
          <button
            onClick={() => send()}
            disabled={loading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            <Send size={12} /> Send
          </button>
        </div>
        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {response.error ? (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#f87171" }}><XCircle size={12} /> {response.error}</span>
              ) : (
                <>
                  <span className="text-xs font-mono font-medium" style={{ color: statusColor(response.status) }}>
                    {response.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {response.latencyMs}ms
                  </span>
                </>
              )}
            </div>
            <pre
              className="text-xs p-2 rounded overflow-auto max-h-40 font-mono"
              style={{ background: "var(--color-bg-elevated)", color: "var(--color-text)" }}
            >
              {response.error ? response.error : JSON.stringify(response.body, null, 2).slice(0, 800)}
            </pre>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============ Live Logs ============
interface LogEntry {
  timestamp: string | null;
  level: string;
  message: string;
  raw: string;
}

function LiveLogsCard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial logs
  useEffect(() => {
    fetch(`${API}/api/dashboard/logs?lines=100`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); setLoadError(false); })
      .catch(() => { setLoading(false); setLoadError(true); });
  }, []);

  // SSE stream
  useEffect(() => {
    if (paused) {
      if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
      return;
    }
    const es = new EventSource(`${API}/api/dashboard/logs/stream`);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const entry: LogEntry = JSON.parse(e.data);
        setLogs(prev => [...prev.slice(-999), entry]);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [paused]);

  // Auto-scroll
  useEffect(() => {
    if (!paused && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const filtered = logs.filter(l => {
    if (filter !== "ALL" && l.level !== filter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.raw.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const levelColor = (l: string) => {
    if (l === "ERROR") return "#f87171";
    if (l === "WARN") return "#fbbf24";
    return "var(--color-text-secondary)";
  };

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span>Live Gateway Log</span>
            {loadError && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#f8717122", color: "#f87171" }}>Log file not found</span>}
          </div>
        }
        icon={<Zap size={14} />}
      />
      <CardBody className="p-0 px-4 pb-3 space-y-2">
        {/* Controls */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex gap-1">
            {(["ALL", "INFO", "WARN", "ERROR"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  background: filter === f ? (f === "ERROR" ? "#f87171" : f === "WARN" ? "#fbbf24" : "var(--color-accent)") : "var(--color-bg-elevated)",
                  color: filter === f ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs px-2 py-1 rounded"
            style={{ background: "var(--color-bg-elevated)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
          />
          <button
            onClick={() => setLogs([])}
            className="text-xs p-1.5 rounded"
            style={{ color: "var(--color-text-secondary)" }}
            title="Clear logs"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded"
            style={{ background: "var(--color-bg-elevated)", color: paused ? "#fbbf24" : "var(--color-text-secondary)" }}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
        {/* Log list */}
        <div
          ref={listRef}
          className="rounded p-2 font-mono text-xs overflow-y-auto"
          style={{ background: "var(--color-bg-elevated)", height: "240px", scrollBehavior: "auto" }}
        >
          {loading ? (
            <p style={{ color: "var(--color-text-secondary)" }}>Loading logs...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)" }}>No log entries{filter !== "ALL" ? ` (${filter} only)` : ""}</p>
          ) : (
            filtered.map((l, i) => (
              <div key={i} className="flex gap-2 py-0.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-secondary)" }}>
                  {l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ""}
                </span>
                <span className="text-xs flex-shrink-0 font-medium w-12" style={{ color: levelColor(l.level) }}>
                  {l.level}
                </span>
                <span className="text-xs" style={{ color: levelColor(l.level) === "var(--color-text-secondary)" ? "var(--color-text)" : levelColor(l.level) }}>
                  {l.message}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>{filtered.length} / {logs.length} entries{paused ? " • PAUSED" : ""}</span>
          <span>auto-scroll {paused ? "off" : "on"}</span>
        </div>
      </CardBody>
    </Card>
  );
}

// ============ Main Page ============
export default function SystemPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>System Diagnostics</h1>
      </div>

      {/* Top row: existing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GatewayCard />
        <ServicesCard />
        <SystemMetricsCard />
        <CronsCard />
      </div>

      {/* Live Logs — full width */}
      <LiveLogsCard />

      {/* API Tester — below Live Logs */}
      <ApiTesterCard />
    </div>
  );
}
