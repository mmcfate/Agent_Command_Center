"use client";

import { useDashboardStore } from "@/store";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const { agents, isDark, toggleTheme } = useDashboardStore();
  const liveAgents = agents.filter((a) => a.status !== "offline");

  return (
    <header className="h-14 flex items-center justify-between px-6" style={{ backgroundColor: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: "#8888a0" }}>Agents:</span>
        <div className="flex items-center gap-3">
          {liveAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: agent.status === "online" ? "#34d399" : agent.status === "working" ? "#fbbf24" : "#8888a0",
                  boxShadow: agent.status === "online" ? "0 0 8px rgba(52, 211, 153, 0.5)" : agent.status === "working" ? "0 0 8px rgba(74, 158, 255, 0.5)" : "none",
                }}
              />
              <span className="text-xs" style={{ color: "#f0f0f5" }}>{agent.emoji}</span>
              <span className="text-xs" style={{ color: "#8888a0" }}>{agent.name}</span>
            </div>
          ))}
          {liveAgents.length === 0 && (
            <span className="text-xs italic" style={{ color: "#8888a0" }}>No agents online</span>
          )}
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150"
        style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a25"; (e.currentTarget as HTMLButtonElement).style.color = "#f0f0f5"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#8888a0"; }}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
        {isDark ? "Light" : "Dark"}
      </button>
    </header>
  );
}
