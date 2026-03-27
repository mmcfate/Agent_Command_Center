"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, MemoryStick, Clock, Search, Download, ChevronRight } from "lucide-react";

const API = `${window.location.protocol}//${window.location.hostname}:3001`;

type Tab = "overview" | "files" | "memory" | "sessions";

interface AgentFile {
  name: string;
  size: number;
  modified: string;
}

interface MemoryFile {
  name: string;
  size: number;
  modified: string;
}

interface SessionInfo {
  id: string;
  key: string;
  startedAt: string;
  endedAt?: string;
  lastActive: string;
  status: string;
  totalTokens?: number;
  model?: string;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: string;
  soul?: string;
  identity?: string;
}

export function AgentDetailPanel({ agentId, onClose }: { agentId: string; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [memorySearch, setMemorySearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch files list when Files tab selected
  useEffect(() => {
    if (tab === "files" && files.length === 0) {
      fetch(`${API}/api/dashboard/agents/${agentId}/files`)
        .then(r => r.json())
        .then(d => setFiles(d.files || []))
        .catch(() => setFiles([]));
    }
  }, [tab, agentId]);

  // Fetch memory files when Memory tab selected
  useEffect(() => {
    if (tab === "memory" && memoryFiles.length === 0) {
      fetch(`${API}/api/dashboard/agents/${agentId}/memory`)
        .then(r => r.json())
        .then(d => setMemoryFiles(d.files || []))
        .catch(() => setMemoryFiles([]));
    }
  }, [tab, agentId]);

  // Fetch sessions when Sessions tab selected
  useEffect(() => {
    if (tab === "sessions" && sessions.length === 0) {
      fetch(`${API}/api/dashboard/agents/${agentId}/sessions`)
        .then(r => r.json())
        .then(d => setSessions(d.sessions || []))
        .catch(() => setSessions([]));
    }
  }, [tab, agentId]);

  // Fetch file content
  useEffect(() => {
    if (!selectedFile) return;
    const isMemory = tab === "memory";
    const endpoint = isMemory
      ? `${API}/api/dashboard/agents/${agentId}/memory?file=${encodeURIComponent(selectedFile)}`
      : `${API}/api/dashboard/agents/${agentId}/files?path=${encodeURIComponent(selectedFile)}`;
    setLoading(true);
    fetch(endpoint)
      .then(r => r.json())
      .then(d => { setFileContent(d.content || ""); setLoading(false); })
      .catch(() => { setFileContent(""); setLoading(false); });
  }, [selectedFile, tab, agentId]);

  const handleMemorySearch = () => {
    if (!memorySearch.trim()) { setSearchResults([]); return; }
    fetch(`${API}/api/dashboard/agents/${agentId}/memory?q=${encodeURIComponent(memorySearch)}`)
      .then(r => r.json())
      .then(d => setSearchResults(d.results || []))
      .catch(() => setSearchResults([]));
  };

  const downloadFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([fileContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FileText size={14} /> },
    { id: "files", label: "Files", icon: <FileText size={14} /> },
    { id: "memory", label: "Memory", icon: <MemoryStick size={14} /> },
    { id: "sessions", label: "Sessions", icon: <Clock size={14} /> },
  ];

  return (
    <div className="flex h-full" style={{ background: "var(--color-bg-surface)", borderRadius: 8 }}>
      {/* Tab sidebar */}
      <div className="w-36 flex-shrink-0 border-r" style={{ borderColor: "var(--color-border)" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelectedFile(null); setFileContent(""); setSearchResults([]); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors"
            style={{
              color: tab === t.id ? "var(--color-accent)" : "var(--color-text-secondary)",
              background: tab === t.id ? "var(--color-bg-hover)" : "transparent",
              borderLeft: tab === t.id ? "2px solid var(--color-accent)" : "2px solid transparent",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === "overview" && <OverviewPanel agentId={agentId} />}
        {tab === "files" && (
          <FilesPanel
            files={files}
            selectedFile={selectedFile}
            fileContent={fileContent}
            loading={loading}
            onSelect={setSelectedFile}
          />
        )}
        {tab === "memory" && (
          <MemoryPanel
            files={memoryFiles}
            selectedFile={selectedFile}
            fileContent={fileContent}
            loading={loading}
            searchQuery={memorySearch}
            searchResults={searchResults}
            onSelect={setSelectedFile}
            onSearchChange={setMemorySearch}
            onSearch={handleMemorySearch}
          />
        )}
        {tab === "sessions" && <SessionsPanel sessions={sessions} />}
      </div>
    </div>
  );
}

function OverviewPanel({ agentId }: { agentId: string }) {
  const [soul, setSoul] = useState("");
  const [identity, setIdentity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/dashboard/agents/${agentId}/files?path=SOUL.md`).then(r => r.json()),
      fetch(`${API}/api/dashboard/agents/${agentId}/files?path=IDENTITY.md`).then(r => r.json()),
    ]).then(([soulData, identityData]) => {
      setSoul(soulData.content || "*No SOUL.md found*");
      setIdentity(identityData.content || "*No IDENTITY.md found*");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [agentId]);

  if (loading) return <div className="p-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--color-text-secondary)" }}>SOUL.md</h3>
        <div className="p-3 rounded" style={{ background: "var(--color-bg-elevated)" }}>
          <div className="text-sm prose prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>
            {soul}
          </ReactMarkdown></div>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--color-text-secondary)" }}>IDENTITY.md</h3>
        <div className="p-3 rounded" style={{ background: "var(--color-bg-elevated)" }}>
          <div className="text-sm prose prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>
            {identity}
          </ReactMarkdown></div>
        </div>
      </div>
    </div>
  );
}

function FilesPanel({ files, selectedFile, fileContent, loading, onSelect }: {
  files: AgentFile[]; selectedFile: string | null; fileContent: string; loading: boolean; onSelect: (f: string) => void;
}) {
  return (
    <div className="flex h-full">
      {/* File list */}
      <div className="w-48 flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => onSelect(f.name)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm"
            style={{
              color: selectedFile === f.name ? "var(--color-accent)" : "var(--color-text-secondary)",
              background: selectedFile === f.name ? "var(--color-bg-hover)" : "transparent",
            }}
          >
            <FileText size={12} />
            <span className="truncate">{f.name}</span>
          </button>
        ))}
        {files.length === 0 && <p className="p-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>No files found</p>}
      </div>
      {/* Content viewer */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
        ) : selectedFile ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{selectedFile}</h3>
              <button onClick={() => {
                const blob = new Blob([fileContent], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = selectedFile;
                a.click();
                URL.revokeObjectURL(url);
              }} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                <Download size={12} /> Download
              </button>
            </div>
            <div className="text-sm prose prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fileContent}
            </ReactMarkdown></div>
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Select a file to view</p>
        )}
      </div>
    </div>
  );
}

function MemoryPanel({ files, selectedFile, fileContent, loading, searchQuery, searchResults, onSelect, onSearchChange, onSearch }: {
  files: MemoryFile[]; selectedFile: string | null; fileContent: string; loading: boolean;
  searchQuery: string; searchResults: any[]; onSelect: (f: string) => void;
  onSearchChange: (v: string) => void; onSearch: () => void;
}) {
  return (
    <div className="flex h-full">
      {/* Memory file list */}
      <div className="w-48 flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
        {/* Search */}
        <div className="p-2 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex gap-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder="Search..."
              className="flex-1 text-xs px-2 py-1 rounded"
              style={{ background: "var(--color-bg-elevated)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
            />
            <button onClick={onSearch} className="text-xs px-1.5 py-1 rounded" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
              <Search size={12} />
            </button>
          </div>
        </div>
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="p-2">
            <p className="text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>{searchResults.length} results</p>
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => onSelect(r.file)}
                className="block w-full text-left px-2 py-1 text-xs rounded mb-0.5 truncate"
                style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
                title={r.text}
              >
                {r.file}:{r.line}
              </button>
            ))}
          </div>
        )}
        {/* File list */}
        {!searchQuery && files.map(f => (
          <button
            key={f.name}
            onClick={() => onSelect(f.name)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm"
            style={{
              color: selectedFile === f.name ? "var(--color-accent)" : "var(--color-text-secondary)",
              background: selectedFile === f.name ? "var(--color-bg-hover)" : "transparent",
            }}
          >
            <MemoryStick size={12} />
            <span className="truncate">{f.name}</span>
          </button>
        ))}
        {files.length === 0 && !searchQuery && <p className="p-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>No memory files</p>}
      </div>
      {/* Content viewer */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
        ) : selectedFile ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{selectedFile}</h3>
              <button onClick={() => {
                const blob = new Blob([fileContent], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = selectedFile;
                a.click();
                URL.revokeObjectURL(url);
              }} className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}>
                <Download size={12} /> Download
              </button>
            </div>
            <div className="text-sm prose prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fileContent}
            </ReactMarkdown></div>
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Select a memory file to view</p>
        )}
      </div>
    </div>
  );
}

function SessionsPanel({ sessions }: { sessions: SessionInfo[] }) {
  if (sessions.length === 0) {
    return <div className="p-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>No sessions found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        {sessions.map(s => (
          <div
            key={s.id || s.key}
            className="p-3 rounded text-sm"
            style={{ background: "var(--color-bg-elevated)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock size={12} style={{ color: "var(--color-text-secondary)" }} />
                <span className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {s.id ? `#${s.id.slice(0, 8)}` : "—"}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: s.status === "running" ? "#34d39922" : "#8888a022",
                    color: s.status === "running" ? "#34d399" : "#8888a0",
                  }}
                >
                  {s.status}
                </span>
              </div>
              {s.model && (
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{s.model}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <div>Started: {s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}</div>
              <div>Last active: {s.lastActive ? new Date(s.lastActive).toLocaleString() : "—"}</div>
              {s.totalTokens && <div>Tokens: {s.totalTokens.toLocaleString()}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
