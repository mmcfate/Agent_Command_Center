"use client";

import { useEffect } from "react";
import { X, Clock, User, Folder, Hash, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import type { Task } from "@/types";

const PHASE_LABELS: Record<string, string> = {
  research: "🔬 Research",
  design: "🎨 Design",
  implement: "⚙️ Implement",
  self_qc: "🔍 Self-QC",
  qa: "🧪 QA",
  document: "📝 Doc",
  done: "✅ Done",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  in_progress: { color: "#fbbf24", icon: <Clock size={14} />, label: "In Progress" },
  complete: { color: "#34d399", icon: <CheckCircle2 size={14} />, label: "Complete" },
  pending: { color: "#8888a0", icon: <Circle size={14} />, label: "Pending" },
  orphaned: { color: "#f87171", icon: <AlertTriangle size={14} />, label: "Orphaned" },
  cancelled: { color: "#4a4a5a", icon: <Circle size={14} />, label: "Cancelled" },
};

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!task) return null;

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const phase = PHASE_LABELS[task.phase] || task.phase;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl"
        style={{ backgroundColor: "#1a1a25", border: "1px solid #2a2a3a" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4" style={{ borderBottom: "1px solid #2a2a3a" }}>
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-sm font-semibold leading-tight" style={{ color: "#f0f0f5" }}>
              {task.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: "#8888a0" }}>
              {phase}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={16} style={{ color: "#8888a0" }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span style={{ color: status.color }}>{status.icon}</span>
            <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
          </div>

          {/* Meta grid */}
          <div className="space-y-2">
            {task.agent && (
              <div className="flex items-center gap-2 text-xs">
                <User size={12} style={{ color: "#6a6a8a" }} />
                <span style={{ color: "#8888a0" }}>Agent:</span>
                <span style={{ color: "#c0c0d0" }}>{task.agent}</span>
              </div>
            )}
            {task.project && (
              <div className="flex items-center gap-2 text-xs">
                <Folder size={12} style={{ color: "#6a6a8a" }} />
                <span style={{ color: "#8888a0" }}>Project:</span>
                <span style={{ color: "#c0c0d0" }}>{task.project}</span>
              </div>
            )}
            {task.sessionId && (
              <div className="flex items-center gap-2 text-xs">
                <Hash size={12} style={{ color: "#6a6a8a" }} />
                <span style={{ color: "#8888a0" }}>Session:</span>
                <span className="font-mono text-xs" style={{ color: "#6a6a8a" }}>
                  {task.sessionId.slice(0, 8)}...
                </span>
              </div>
            )}
            {task.started && (
              <div className="flex items-center gap-2 text-xs">
                <Clock size={12} style={{ color: "#6a6a8a" }} />
                <span style={{ color: "#8888a0" }}>Started:</span>
                <span style={{ color: "#c0c0d0" }}>
                  {new Date(task.started).toLocaleDateString()} {new Date(task.started).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            {task.progress !== undefined && (
              <div className="pt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#8888a0" }}>Progress</span>
                  <span style={{ color: "#c0c0d0" }}>{task.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#2a2a3a" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${task.progress}%`, backgroundColor: "#4a9eff" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 rounded-b-xl" style={{ borderTop: "1px solid #2a2a3a" }}>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: "#2a2a3a", color: "#c0c0d0" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
