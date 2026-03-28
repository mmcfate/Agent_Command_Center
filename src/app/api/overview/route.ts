import { NextResponse } from "next/server";

const BACKEND = "http://localhost:3001";

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function reshapeSystem(sys: any) {
  if (!sys) return null;
  return {
    cpu: typeof sys.cpu === "number" ? sys.cpu : sys.cpu?.percent ?? 0,
    ram: typeof sys.ram === "number" ? sys.ram : sys.ram?.percent ?? 0,
    disk: typeof sys.disk === "number" ? sys.disk : sys.disk?.percent ?? 0,
    network: sys.network ?? {},
    uptime: sys.uptime ?? {},
    ollama: sys.ollama ?? null,
    gateway: sys.gateway ?? { online: false, version: "", uptime: 0 },
    memory: sys.memory ?? {},
    timestamp: sys.timestamp ?? new Date().toISOString(),
  };
}

function reshapeAgent(raw: any) {
  return {
    id: raw.id || raw.agentId || "unknown",
    name: raw.name || raw.identityName || raw.identity || "Unknown",
    emoji: raw.emoji || raw.identityEmoji || "🤖",
    role: raw.role || raw.identityName || "",
    status: raw.status || "offline",
    currentTask: raw.currentTask || null,
    loadedSkill: raw.loadedSkill || null,
    sessionId: raw.sessionId || null,
    lastActive: raw.lastActive || null,
  };
}

export async function GET() {
  try {
    const [rawAgents, sessions, crons, dashSystem, todoData] = await Promise.all([
      safeFetch(`${BACKEND}/api/agents`),
      safeFetch(`${BACKEND}/api/openclaw/sessions`),
      safeFetch(`${BACKEND}/api/cron`),
      safeFetch(`${BACKEND}/api/dashboard/system`),
      safeFetch(`${BACKEND}/api/todo`),
    ]);

    const agents = Array.isArray(rawAgents)
      ? rawAgents.map(reshapeAgent)
      : Object.values(rawAgents || {}).map(reshapeAgent);

    return NextResponse.json({
      agents,
      sessions: sessions || [],
      crons: crons || [],
      system: reshapeSystem(dashSystem),
      projects: todoData?.projects || [],
      tasks: [],
      orphanAlerts: [],
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
