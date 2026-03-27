"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  workspace: string;
  role: string;
}

export default function SettingsPage() {
  const [backendUrl, setBackendUrl] = useState("http://localhost:3001");
  const [openclawDir, setOpenclawDir] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setOpenclawDir(data.openclawDir || "");
          setBackendUrl(`http://${data.backend?.host || "localhost"}:${data.backend?.port || 3001}`);
          setAgents(data.agents || []);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function saveSettings() {
    setSaveError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openclawDir,
          backend: {
            host: backendUrl.replace("http://", "").replace("https://", "").split(":")[0] || "localhost",
            port: parseInt(backendUrl.split(":")[2]) || 3001
          }
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setSaveError("Failed to save");
      }
    } catch (e) {
      setSaveError("Connection error");
    }
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
        {saved && <span className="text-sm text-green-400">Saved!</span>}
        {saveError && <span className="text-sm text-red-400">{saveError}</span>}
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
                  <th className="text-left py-2 text-[var(--color-text-muted)]">Workspace</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 text-[var(--color-text)]">{agent.name}</td>
                    <td className="py-2 text-[var(--color-text-muted)] font-mono">{agent.id}</td>
                    <td className="py-2 text-[var(--color-text-muted)] font-mono text-xs truncate max-w-[250px]" title={agent.workspace}>
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
    </div>
  );
}
