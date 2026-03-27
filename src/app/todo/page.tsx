"use client";

import { useDashboardStore } from "@/store";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

function TaskRow({ task }: { task: any }) {
  const statusIcon = {
    complete: <CheckCircle2 size={14} style={{ color: "#34d399" }} />,
    in_progress: <Clock size={14} style={{ color: "#fbbf24" }} />,
    pending: <Circle size={14} style={{ color: "#8888a0" }} />,
    orphaned: <Circle size={14} style={{ color: "#f87171" }} />,
    cancelled: <Circle size={14} style={{ color: "#4a4a5a" }} />,
  };

  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #2a2a3a" }}>
      {statusIcon[task.status as keyof typeof statusIcon] || statusIcon.pending}
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate" style={{ color: "#f0f0f5" }}>{task.title}</p>
        <p className="text-xs" style={{ color: "#8888a0" }}>{task.agent} · {task.project}</p>
      </div>
      <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "#1a1a25", color: "#8888a0" }}>
        {task.phase}
      </span>
      <ArrowRight size={12} style={{ color: "#8888a0" }} />
    </div>
  );
}

function ProjectSection({ title, tasks }: { title: string; tasks: any[] }) {
  if (tasks.length === 0) return null;

  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const complete = tasks.filter((t) => t.status === "complete");
  const pending = tasks.filter((t) => t.status === "pending");
  const orphaned = tasks.filter((t) => t.status === "orphaned");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: "#f0f0f5" }}>{title}</h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#8888a0" }}>
          <span style={{ color: "#fbbf24" }}>{inProgress.length} active</span>
          <span style={{ color: "#34d399" }}>{complete.length} done</span>
          <span>{pending.length} pending</span>
          {orphaned.length > 0 && <span style={{ color: "#f87171" }}>{orphaned.length} orphaned</span>}
        </div>
      </div>
      <Card>
        <CardBody className="p-0 px-4">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default function TodoPage() {
  const { tasks } = useDashboardStore();

  // Group by project
  const byProject: Record<string, any[]> = {};
  for (const task of tasks) {
    const proj = task.project || "general";
    if (!byProject[proj]) byProject[proj] = [];
    byProject[proj].push(task);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>Tasks</h1>
        <span className="text-xs" style={{ color: "#8888a0" }}>
          {tasks.filter((t) => t.status === "in_progress").length} active · {tasks.length} total
        </span>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm italic text-center" style={{ color: "#8888a0" }}>No tasks in the shared TODO</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byProject).map(([project, projectTasks]) => (
            <ProjectSection key={project} title={project} tasks={projectTasks} />
          ))}
        </div>
      )}
    </div>
  );
}
