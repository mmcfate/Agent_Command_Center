"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboardStore } from "@/store";
import { Card, CardBody } from "@/components/ui/Card";
import { TaskDetailModal } from "@/components/ui/TaskDetailModal";
import { ArrowLeft, Folder, FileText, CheckCircle2, Circle, Clock, User, ChevronDown } from "lucide-react";
import type { Task } from "@/types";

const PHASES = ["research", "design", "implement", "self_qc", "qa", "document", "done"] as const;
type Phase = typeof PHASES[number];

const PHASE_LABELS: Record<Phase, string> = {
  research: "🔬 Research",
  design: "🎨 Design",
  implement: "⚙️ Implement",
  self_qc: "🔍 Self-QC",
  qa: "🧪 QA",
  document: "📝 Doc",
  done: "✅ Done",
};

const PHASE_COLORS: Record<Phase, string> = {
  research: "#8b5cf6",
  design: "#ec4899",
  implement: "#f59e0b",
  self_qc: "#06b6d4",
  qa: "#10b981",
  document: "#3b82f6",
  done: "#34d399",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, tasks } = useDashboardStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  const projectId = params.id as string;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!showCompleted || completedTasks.length > 0) return;
    fetch(`/api/tasks-md/${projectId}`)
      .then(r => r.json())
      .then(d => setCompletedTasks(d.tasks || []))
      .catch(() => setCompletedTasks([]));
  }, [showCompleted, projectId, completedTasks.length]);
  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.project === projectId);

  const tasksByPhase = PHASES.reduce((acc, phase) => {
    acc[phase] = projectTasks.filter((t) => t.phase === phase);
    return acc;
  }, {} as Record<Phase, typeof projectTasks>);

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} style={{ color: "#8888a0" }} />
        </div>
        <div className="flex items-center gap-2">
          <Folder size={20} style={{ color: "#4a9eff" }} />
          <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>
            {project?.name || projectId}
          </h1>
        </div>
      </div>

      {/* Project meta */}
      {project && (
        <div className="flex gap-4 text-xs" style={{ color: "#8888a0" }}>
          <span className="flex items-center gap-1">
            <FileText size={12} /> {project.taskCount?.total || 0} tasks
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} style={{ color: "#34d399" }} /> {project.taskCount?.done || 0} done
          </span>
          <span className="flex items-center gap-1">
            <Circle size={12} /> {projectTasks.filter(t => t.phase !== "done").length} active
          </span>
        </div>
      )}

      {/* Description */}
      {project?.description && (
        <Card>
          <CardBody>
            <p className="text-sm" style={{ color: "#c0c0d0" }}>{project.description}</p>
          </CardBody>
        </Card>
      )}

      {/* Kanban Board */}
      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: "#8888a0" }}>Tasks by Phase</h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PHASES.map((phase) => (
            <div
              key={phase}
              className="flex-shrink-0 w-48 rounded-lg p-3"
              style={{ background: "#1a1a2a", border: "1px solid #2a2a3a" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: PHASE_COLORS[phase] }}>
                  {PHASE_LABELS[phase]}
                </span>
                <span className="text-xs rounded px-1.5 py-0.5" style={{ background: "#2a2a3a", color: "#8888a0" }}>
                  {tasksByPhase[phase].length}
                </span>
              </div>
              <div className="space-y-2">
                {tasksByPhase[phase].length === 0 ? (
                  <p className="text-xs italic text-center py-4" style={{ color: "#4a4a5a" }}>No tasks</p>
                ) : (
                  tasksByPhase[phase].map((task) => (
                    <div
                      key={task.id}
                      className="rounded p-2 text-xs cursor-pointer hover:ring-1 transition-all"
                      style={{ background: "#12121f", border: "1px solid #2a2a3a" }}
                      onClick={() => setSelectedTask(task)}
                    >
                      <p className="font-medium leading-tight mb-1" style={{ color: "#e0e0f0" }}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1" style={{ color: "#6a6a8a" }}>
                        {task.agent && (
                          <span className="flex items-center gap-0.5">
                            <User size={10} /> {task.agent}
                          </span>
                        )}
                        {task.sessionId && (
                          <span className="flex items-center gap-0.5 ml-auto">
                            <Clock size={10} /> {new Date(task.started || 0).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="mt-6 border-t" style={{ borderColor: "#2a2a3a" }}>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 mt-4 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: "#8888a0" }}
        >
          <ChevronDown size={14} className={`transition-transform ${showCompleted ? "rotate-180" : ""}`} />
          Completed Tasks ({completedTasks.length})
        </button>

        {showCompleted && completedTasks.length === 0 && (
          <p className="text-xs italic mt-2" style={{ color: "#8888a0" }}>
            No completed tasks yet. Move a task to "done" to archive it here.
          </p>
        )}

        {showCompleted && completedTasks.length > 0 && (
          <div className="mt-3 space-y-2">
            {completedTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-2 px-3 rounded" style={{ backgroundColor: "#1a1a2a" }}>
                <CheckCircle2 size={12} style={{ color: "#34d399" }} />
                <span style={{ color: "#f0f0f5" }}>{task.title}</span>
                <span className="ml-auto text-xs" style={{ color: "#8888a0" }}>
                  {task.agent} · {task.phase}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: "#8888a0" }}>All Tasks</h2>
        <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #2a2a3a" }}>
          <CardBody className="p-0 overflow-x-auto">
            {projectTasks.length === 0 ? (
              <p className="text-sm italic text-center py-8" style={{ color: "#6a6a8a" }}>No tasks for this project</p>
            ) : (
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "#6a6a8a" }}>Task</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "#6a6a8a" }}>Phase</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "#6a6a8a" }}>Agent</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "#6a6a8a" }}>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {projectTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      onTouchEnd={(e) => { e.preventDefault(); setSelectedTask(task); }}
                      style={{ borderBottom: "1px solid #1e1e2e", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e1e2e")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="p-3" style={{ color: "#d0d0e0" }}>{task.title}</td>
                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: PHASE_COLORS[task.phase as Phase] + "20", color: PHASE_COLORS[task.phase as Phase] }}
                        >
                          {PHASE_LABELS[task.phase as Phase]}
                        </span>
                      </td>
                      <td className="p-3" style={{ color: "#8888a0" }}>{task.agent || "—"}</td>
                      <td className="p-3" style={{ color: "#6a6a8a" }}>
                        {task.started ? new Date(task.started || 0).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
