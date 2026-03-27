"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { AgentDetailPanel } from "@/components/agents/AgentDetailPanel";
import { X, Cpu, Clock, Activity, Zap } from "lucide-react";

export default function AgentsPage() {
  const { agents } = useDashboardStore();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    online: "#34d399",
    working: "#fbbf24",
    idle: "#8888a0",
    offline: "#4a4a5a",
  };

  const statusLabels: Record<string, string> = {
    online: "Online",
    working: "Working",
    idle: "Idle",
    offline: "Offline",
  };

  return (
    <div className="h-full flex" style={{ gap: "var(--space-4, 16px)" }}>
      {/* Agent list — left sidebar */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Agents</h1>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {agents.filter((a) => a.status !== "offline").length}/{agents.length} online
          </span>
        </div>

        {agents.map((agent) => (
          <Card
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            className="cursor-pointer transition-all"
            style={{
              border: selectedAgent === agent.id ? "1px solid var(--color-accent)" : "1px solid transparent",
              opacity: selectedAgent && selectedAgent !== agent.id ? 0.6 : 1,
            }}
          >
            <CardBody className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{agent.emoji || "🤖"}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{agent.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{agent.role}</p>
                  </div>
                </div>
                <StatusIndicator status={agent.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                <div className="flex items-center gap-1.5">
                  <Activity size={11} style={{ color: "var(--color-text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{statusLabels[agent.status] || agent.status}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} style={{ color: "var(--color-text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {agent.lastActive ? new Date(agent.lastActive).toLocaleTimeString() : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu size={11} style={{ color: "var(--color-text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {agent.sessionId ? `#${agent.sessionId.slice(0, 8)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={11} style={{ color: "var(--color-text-secondary)" }} />
                  <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{agent.loadedSkill || "—"}</span>
                </div>
              </div>

              {agent.currentTask && (
                <div className="pt-1.5" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Current task</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text)" }}>{agent.currentTask}</p>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Detail panel — right */}
      <div className="flex-1 overflow-hidden">
        {selectedAgent ? (
          <div className="h-full flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{agents.find(a => a.id === selectedAgent)?.emoji}</span>
                <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                  {agents.find(a => a.id === selectedAgent)?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={16} />
              </button>
            </div>
            {/* Tabbed content */}
            <div className="flex-1 overflow-hidden" style={{ background: "var(--color-bg-surface)", borderRadius: 8 }}>
              <AgentDetailPanel agentId={selectedAgent} />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center" style={{ color: "var(--color-text-secondary)" }}>
            <div className="text-center">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm">Select an agent to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
