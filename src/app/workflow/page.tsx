"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDashboardStore } from "@/store";

const NODE_COLORS: Record<string, string> = {
  jarvis: "#4a9eff",
  bonnie: "#a78bfa",
  task: "#fbbf24",
  project: "#34d399",
};

interface FlowNode {
  id: string;
  type?: string;
  data: { label: string };
  position: { x: number; y: number };
  style?: React.CSSProperties;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  markerEnd?: { type: MarkerType; color?: string };
}

function buildGraph(tasks: any[], agents: any[], sessions: any[]) {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const ySpacing = 130;
  const xSpacing = 260;

  // Project nodes (left column)
  const projectGroups: Record<string, any[]> = {};
  for (const task of tasks) {
    const proj = task.project || "general";
    if (!projectGroups[proj]) projectGroups[proj] = [];
    projectGroups[proj].push(task);
  }

  const projects = Object.keys(projectGroups);
  projects.forEach((proj, pi) => {
    nodes.push({
      id: `project-${proj}`,
      type: "input",
      data: { label: proj },
      position: { x: 0, y: pi * ySpacing * 2 },
      style: {
        backgroundColor: "#12121a",
        border: "1px solid #2a2a3a",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#f0f0f5",
        fontSize: "13px",
        fontWeight: 500,
      },
    });
  });

  // Task nodes (middle column)
  let taskIndex = 0;
  projects.forEach((proj, pi) => {
    const projTasks = projectGroups[proj] || [];
    projTasks.forEach((task, ti) => {
      const y = pi * ySpacing * 2 + ti * ySpacing;
      const taskNodeId = `task-${task.id}`;

      let borderColor = "#fbbf24";
      if (task.status === "complete") borderColor = "#34d399";
      else if (task.status === "orphaned") borderColor = "#f87171";
      else if (task.status === "pending") borderColor = "#8888a0";

      nodes.push({
        id: taskNodeId,
        data: {
          label: `${task.title}\n${task.agent} · ${task.phase}`,
        },
        position: { x: xSpacing, y },
        style: {
          backgroundColor: "#12121a",
          border: `2px solid ${borderColor}`,
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#f0f0f5",
          fontSize: "12px",
          minWidth: "160px",
        },
      });

      edges.push({
        id: `e-${proj}-${taskNodeId}`,
        source: `project-${proj}`,
        target: taskNodeId,
        type: "smoothstep",
        style: { stroke: "#2a2a3a", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2a2a3a" },
      });

      taskIndex++;
    });
  });

  // Agent nodes (right column)
  agents.forEach((agent: any, ai: number) => {
    const y = ai * ySpacing * 1.5;
    const color = NODE_COLORS[agent.id] || "#8888a0";

    const agentStyle: React.CSSProperties = {
      backgroundColor: "#12121a",
      border: `2px solid ${color}`,
      borderRadius: "8px",
      padding: "10px 14px",
      color: "#f0f0f5",
      fontSize: "13px",
      fontWeight: 500,
    };

    if (agent.status === "working") {
      agentStyle.boxShadow = `0 0 12px ${color}60`;
    }

    nodes.push({
      id: `agent-${agent.id}`,
      type: "output",
      data: { label: `${agent.emoji} ${agent.name}\n${agent.status}` },
      position: { x: xSpacing * 2.2, y },
      style: agentStyle,
    });

    // Connect tasks to their assigned agent
    for (const task of tasks) {
      if (!task.agent) continue;
      const agentId = task.agent.toLowerCase().includes("bonnie") ? "bonnie" : "jarvis";
      if (agentId !== agent.id) continue;
      edges.push({
        id: `e-${task.id}-${agentId}`,
        source: `task-${task.id}`,
        target: `agent-${agentId}`,
        type: "smoothstep",
        animated: task.status === "in_progress",
        style: {
          stroke: task.status === "in_progress" ? "#fbbf24" : "#2a2a3a",
          strokeWidth: task.status === "in_progress" ? 2 : 1,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2a2a3a" },
      });
    }
  });

  return { nodes, edges };
}

export default function WorkflowPage() {
  const { tasks, agents, sessions } = useDashboardStore();
  const [error, setError] = useState<string | null>(null);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(
    () => buildGraph(tasks, agents, sessions),
    [tasks, agents, sessions]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes/edges when data changes
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "#f0f0f5" }}>
        <div className="text-center space-y-4">
          <p className="text-sm font-medium" style={{ color: "#f87171" }}>
            Failed to load workflow
          </p>
          <p className="text-xs" style={{ color: "#8888a0" }}>
            {error}
          </p>
          <button
            onClick={() => { setError(null); }}
            className="text-xs px-3 py-1.5 rounded"
            style={{ border: "1px solid #2a2a3a", color: "#8888a0" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>
          Workflow
        </h1>
        <div className="flex items-center gap-4 text-xs" style={{ color: "#8888a0" }}>
          <span>Projects → Tasks → Agents</span>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "#0a0a0f",
          border: "1px solid #2a2a3a",
          height: "calc(100vh - 180px)",
          minHeight: "400px",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: "#0a0a0f" }}
          onError={(msg) => setError(msg)}
        >
          <Background color="#1a1a25" gap={20} />
          <Controls
            style={{
              backgroundColor: "#12121a",
              border: "1px solid #2a2a3a",
              borderRadius: "6px",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
