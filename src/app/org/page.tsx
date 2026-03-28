"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboardStore } from "@/store";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import Link from "next/link";

const BACKEND = "http://localhost:3001";

function MarlinNode() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 0 20px #4f46e544",
        }}
      >
        M
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Marlin</p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>CTO / CISO</p>
      </div>
    </div>
  );
}

function AgentNode({ agent }: { agent: any }) {
  const statusColor = agent.status === "online" ? "#34d399" : agent.status === "working" ? "#fbbf24" : agent.status === "idle" ? "#8888a0" : "#4a4a5a";

  return (
    <Link href={`/agents/${agent.id}`} className="no-underline block">
      <Card className="transition-all hover:scale-105 cursor-pointer">
        <CardBody className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{agent.emoji || "🤖"}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{agent.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{agent.role}</p>
              </div>
            </div>
            <StatusIndicator status={agent.status} />
          </div>
          {agent.loadedSkill && (
            <div className="flex items-center gap-1">
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#4f46e522", color: "#a5b4fc" }}>
                {agent.loadedSkill}
              </span>
            </div>
          )}
          {agent.currentTask && (
            <p className="text-xs italic" style={{ color: "var(--color-text-secondary)" }}>
              {agent.currentTask}
            </p>
          )}
          {agent.lastActive && (
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Last active: {new Date(agent.lastActive).toLocaleString()}
            </p>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}

function getAgentStatusColor(status: string) {
  switch (status) {
    case "online": return "#34d399";
    case "working": return "#fbbf24";
    case "idle": return "#8888a0";
    default: return "#4a4a5a";
  }
}

export default function OrgPage() {
  // Local state — self-sufficient, doesn't need overview page to load first
  const [agents, setAgents] = useState<any[]>([]);
  const storeAgents = useDashboardStore((s) => s.agents);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dims, setDims] = useState({ width: 800, height: 300 });

  // Fetch agents on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/dashboard/agents`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch(() => {});
  }, []);

  // Subscribe to store changes for live updates (SSE-driven)
  useEffect(() => {
    if (storeAgents.length > 0) {
      setAgents(storeAgents);
    }
  }, [storeAgents]);

  useEffect(() => {
    setMounted(true);
    const onResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement!.getBoundingClientRect();
        setDims({ width: rect.width || 800, height: 300 });
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const MARLIN_X = dims.width / 2;
  const MARLIN_Y = 60;
  const AGENT_Y = 260;
  const AGENT_SPREAD = 180;

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Org Chart</h1>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Team structure and agent status</p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#34d399" }} /> Online
            <span className="w-2 h-2 rounded-full" style={{ background: "#fbbf24" }} /> Working
            <span className="w-2 h-2 rounded-full" style={{ background: "#8888a0" }} /> Idle
            <span className="w-2 h-2 rounded-full" style={{ background: "#4a4a5a" }} /> Offline
          </div>
        </div>

        <Card>
          <CardBody className="p-6">
            {/* Marlin */}
            <div className="flex justify-center mb-6">
              <MarlinNode />
            </div>

            {/* SVG connector lines */}
            <svg
              ref={svgRef}
              className="w-full"
              height={dims.height}
              viewBox={`0 0 ${dims.width} ${dims.height}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}
            >
              {mounted && agents.map((agent, i) => {
                const count = agents.length || 1;
                const totalWidth = (count - 1) * AGENT_SPREAD;
                const startX = (dims.width - totalWidth) / 2;
                const agentX = startX + i * AGENT_SPREAD;
                const color = getAgentStatusColor(agent.status);
                return (
                  <g key={agent.id}>
                    <line
                      x1={MARLIN_X} y1={MARLIN_Y + 50}
                      x2={agentX} y2={AGENT_Y - 20}
                      stroke={color} strokeWidth={2} strokeOpacity={0.4}
                    />
                    <line
                      x1={MARLIN_X} y1={MARLIN_Y + 50}
                      x2={MARLIN_X} y2={AGENT_Y - 20}
                      stroke={color} strokeWidth={2} strokeOpacity={0.2}
                    />
                    <circle cx={agentX} cy={AGENT_Y - 20} r={3} fill={color} />
                  </g>
                );
              })}
            </svg>

            {/* Agent nodes */}
            <div
              className="flex justify-center gap-6"
              style={{
                position: "relative",
                zIndex: 1,
                paddingTop: dims.height - 60,
              }}
            >
              {mounted && agents.map((agent, i) => (
                <div
                  key={agent.id}
                  className="w-48"
                  style={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: ((agents.length - 1) * AGENT_SPREAD) / -2 + i * AGENT_SPREAD,
                    top: AGENT_Y - 60,
                    transform: "translateX(-50%)",
                  }}
                >
                  <AgentNode agent={agent} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Click any agent to open their detail panel. Status updates in real-time via SSE.
        </div>
      </div>
    </div>
  );
}
