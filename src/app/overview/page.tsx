"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboardStore, connectStream } from "@/store";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Server, HardDrive, Cpu, Zap, AlertTriangle } from "lucide-react";

// ─── Phase constants (shared with projects/[id]/page.tsx) ─────────────────────
const PHASES = ["research", "design", "implement", "self_qc", "qa", "document", "done"] as const;
type Phase = typeof PHASES[number];

const PHASE_LABELS: Record<Phase, string> = {
  research: "Research",
  design: "Design",
  implement: "Implement",
  self_qc: "Self-QC",
  qa: "QA",
  document: "Doc",
  done: "Done",
};

const PHASE_COLORS: Record<Phase, string> = {
  research: "#8888a0",
  design: "#818cf8",
  implement: "#f59e0b",
  self_qc: "#06b6d4",
  qa: "#a78bfa",
  document: "#34d399",
  done: "#8888a0",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface TodoTask {
  description: string;
  phase: Phase;
  agent: string;
  session: string | null;
  started: string;
  skill: string;
  status: string;
  alive: boolean;
}

interface TodoProject {
  project: string;
  tasks: TodoTask[];
}

interface TodoApiResponse {
  projects: TodoProject[];
  activeSessionCount: number;
  parsedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Derive a human-readable alive dot color from a task's session/alive fields. */
function sessionColor(task: TodoTask): string {
  if (task.session === "pending") return "#8888a0";       // gray  – waiting
  if (task.session === null || task.session === "(done)") return "#f87171"; // red – dead/done
  return task.alive ? "#34d399" : "#f87171";             // green – alive, red – orphaned
}

function sessionLabel(task: TodoTask): string {
  if (task.session === "pending") return "pending";
  if (!task.session || task.session === "(done)") return "(done)";
  return task.session.slice(0, 8);
}

// ─── TodoTasksCard ────────────────────────────────────────────────────────────
function TodoTasksCard() {
  const [data, setData] = useState<TodoApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/todo");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 30_000);
    return () => clearInterval(id);
  }, [fetch_]);

  if (loading && !data) {
    return (
      <Card>
        <CardHeader title="Tasks by Phase" icon={<Zap size={14} />} />
        <CardBody>
          <p className="text-xs italic" style={{ color: "#8888a0" }}>Loading…</p>
        </CardBody>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardHeader title="Tasks by Phase" icon={<Zap size={14} />} />
        <CardBody>
          <p className="text-xs italic" style={{ color: "#f87171" }}>Error: {error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!data) return null;

  // Flatten all tasks from all projects
  const allTasks: (TodoTask & { project: string })[] = data.projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, project: p.project }))
  );

  const byPhase = PHASES.reduce<Record<Phase, typeof allTasks>>((acc, ph) => {
    acc[ph] = allTasks.filter((t) => t.phase === ph);
    return acc;
  }, {} as Record<Phase, typeof allTasks>);

  return (
    <Card>
      <CardHeader title="Tasks by Phase" icon={<Zap size={14} />} />
      <CardBody className="space-y-3">
        {allTasks.length === 0 ? (
          <p className="text-xs italic" style={{ color: "#8888a0" }}>No tasks</p>
        ) : (
          PHASES.map((phase) => {
            const phaseTasks = byPhase[phase];
            if (phaseTasks.length === 0) return null;
            return (
              <div key={phase}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PHASE_COLORS[phase] }}
                  />
                  <span className="text-xs font-medium" style={{ color: PHASE_COLORS[phase] }}>
                    {PHASE_LABELS[phase]}
                  </span>
                  <span className="text-xs rounded px-1.5 py-0.5 ml-auto" style={{ background: "#1a1a25", color: "#8888a0" }}>
                    {phaseTasks.length}
                  </span>
                </div>
                <div className="space-y-1 ml-4">
                  {phaseTasks.map((task, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-1 px-2 rounded text-xs"
                      style={{ background: "#12121f", border: "1px solid #2a2a3a" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ color: "#e0e0f0" }} title={task.description}>
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5" style={{ color: "#6a6a8a" }}>
                          <span>{task.agent}</span>
                          <span>·</span>
                          <span className="truncate" title={task.session || ""}>{sessionLabel(task)}</span>
                        </div>
                      </div>
                      {/* Alive indicator dot */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1 ml-2"
                        style={{ backgroundColor: sessionColor(task) }}
                        title={`Session: ${sessionLabel(task)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}

// ─── SystemHealthCard ─────────────────────────────────────────────────────────
function SystemHealthCard() {
  const { system } = useDashboardStore();

  if (!system) {
    return (
      <Card>
        <CardHeader title="System Health" icon={<Server size={14} />} />
        <CardBody>
          <p className="text-xs italic" style={{ color: "#8888a0" }}>Loading...</p>
        </CardBody>
      </Card>
    );
  }

  const metrics = [
    { label: "CPU", value: system.cpu, icon: Cpu },
    { label: "RAM", value: system.ram, icon: HardDrive },
    { label: "Disk", value: system.disk, icon: HardDrive },
  ];

  return (
    <Card>
      <CardHeader title="System Health" icon={<Server size={14} />} />
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#8888a0" }}>Gateway</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: system.gateway?.online ? "#34d399" : "#f87171" }}
            />
            <span className="text-xs" style={{ color: "#f0f0f5" }}>
              {system.gateway?.online ? `Online (${system.gateway?.version || "?"})` : "Offline"}
            </span>
          </div>
        </div>

        {metrics.map((m) => {
          const pct = typeof m.value === "number" ? m.value : 0;
          const barColor = pct > 85 ? "#f87171" : pct > 70 ? "#fbbf24" : "#34d399";
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#8888a0" }}>{m.label}</span>
                <span className="text-xs" style={{ color: "#f0f0f5" }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1a1a25" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ backgroundColor: barColor, width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

// ─── OrphanAlertBanner ─────────────────────────────────────────────────────────
function OrphanAlertBanner() {
  const { orphanAlerts } = useDashboardStore();

  if (orphanAlerts.length === 0) return null;

  return (
    <div className="rounded-lg px-4 py-3 mb-6 flex items-center gap-3 animate-fade-in"
      style={{ backgroundColor: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)" }}>
      <AlertTriangle size={16} className="flex-shrink-0" style={{ color: "#f87171" }} />
      <div className="flex-1">
        <p className="text-xs font-semibold" style={{ color: "#f87171" }}>Orphaned Tasks Detected</p>
        <p className="text-xs mt-0.5" style={{ color: "#8888a0" }}>
          {orphanAlerts.map((t) => t.title).join(", ")} — sessions ended unexpectedly
        </p>
      </div>
      <button className="text-xs px-2 py-1 rounded" style={{ border: "1px solid rgba(248, 113, 113, 0.3)", color: "#f87171" }}>
        Review
      </button>
    </div>
  );
}

// ─── AgentRosterCard ───────────────────────────────────────────────────────────
function AgentRosterCard() {
  const { agents } = useDashboardStore();

  return (
    <Card>
      <CardHeader title="Agent Roster" icon={<Zap size={14} />} />
      <CardBody className="space-y-2">
        {agents.length === 0 ? (
          <p className="text-xs italic" style={{ color: "#8888a0" }}>No agents found</p>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #2a2a3a" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{agent.emoji}</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#f0f0f5" }}>{agent.name}</p>
                  <p className="text-xs" style={{ color: "#8888a0" }}>{agent.role}</p>
                </div>
              </div>
              <StatusIndicator status={agent.status} />
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

// ─── OverviewPage ─────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { setAll, agents } = useDashboardStore();

  useEffect(() => {
    // Fetch initial data
    fetch("/api/overview")
      .then((r) => r.json())
      .then((data) => {
        setAll(data);
      })
      .catch((e) => console.error("Overview fetch failed:", e));

    // Connect SSE stream (defensive — don't let SSE errors crash the page)
    let disconnect: (() => void) | undefined;
    try {
      disconnect = connectStream();
    } catch (e) {
      console.error("SSE connection failed:", e);
    }
    return () => { if (disconnect) disconnect(); };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>Overview</h1>
        <span className="text-xs" style={{ color: "#8888a0" }}>
          {agents.filter((a) => a.status !== "offline").length} agents online
        </span>
      </div>

      <OrphanAlertBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SystemHealthCard />
        <TodoTasksCard />
        <AgentRosterCard />
      </div>
    </div>
  );
}
