"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  workspace: string;
  role: string;
}

interface Model {
  id: string;
  inputRate: number;
  outputRate: number;
  tag: "cloud" | "local";
}

export default function SettingsPage() {
  const [backendUrl, setBackendUrl] = useState("");
  const [openclawDir, setOpenclawDir] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-detect current backend URL
  useEffect(() => {
    const proto = window.location.protocol === "https:" ? "https:" : "http:";
    const host = window.location.hostname;
    const port = window.location.port === "3000" ? "3001" : (window.location.port || "3001");
    setBackendUrl(`${proto}//${host}:${port}`);
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("cc-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.backendUrl) setBackendUrl(parsed.backendUrl);
        if (parsed.openclawDir) setOpenclawDir(parsed.openclawDir);
      } catch {}
    }
    
    // Load agents from backend
    fetchAgents();
    setLoading(false);
  }, []);

  async function fetchAgents() {
    try {
      const res = await fetch("/api/openclaw/config");
      if (res.ok) {
        const data = await res.json();
        // Parse agents from openclaw.json
        const agentsList = data.agents?.list || [];
        setAgents(agentsList.map((a: any) => ({
          id: a.id || "",
          name: a.name || a.id || "",
          workspace: a.workspace || "",
          role: a.role || ""
        })));
      }
    } catch (e) {
      console.error("Failed to fetch agents", e);
    }
  }

  function saveSettings() {
    const settings = { backendUrl, openclawDir };
    localStorage.setItem("cc-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>
        {saved && (
          <span className="text-sm text-green-400">Saved!</span>
        )}
      </div>

      {/* Connection Settings */}
      <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Connection</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Backend URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              The base URL for the Command Center backend API
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              OpenClaw Directory
            </label>
            <input
              type="text"
              value={openclawDir}
              onChange={(e) => setOpenclawDir(e.target.value)}
              placeholder="~/.openclaw"
              className="w-full px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Path to your .openclaw configuration directory
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Agent Registry */}
      <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Agents</h2>
        
        {agents.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No agents found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 text-[var(--color-text-muted)]">Name</th>
                  <th className="text-left py-2 text-[var(--color-text-muted)]">ID</th>
                  <th className="text-left py-2 text-[var(--color-text-muted)]">Role</th>
                  <th className="text-left py-2 text-[var(--color-text-muted)]">Workspace</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 text-[var(--color-text)]">{agent.name}</td>
                    <td className="py-2 text-[var(--color-text-muted)] font-mono">{agent.id}</td>
                    <td className="py-2 text-[var(--color-text)]">{agent.role || "—"}</td>
                    <td className="py-2 text-[var(--color-text-muted)] font-mono text-xs truncate max-w-[200px]">
                      {agent.workspace}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Agents are automatically discovered from your openclaw.json configuration
        </p>
      </div>

      {/* Model Config */}
      <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Model Pricing</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Model cost configuration. Rates are per 1M tokens.
        </p>
        <div className="mt-3 text-sm text-[var(--color-text-muted)]">
          Configure model rates in the Cost Dashboard settings panel.
        </div>
      </div>
    </div>
  );
}
