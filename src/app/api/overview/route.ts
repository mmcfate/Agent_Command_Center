import { NextResponse } from "next/server";

const BACKEND = "http://localhost:3001";

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const [health, agents, tasks, projects, sessions, crons, system] = await Promise.all([
    safeFetch(`${BACKEND}/api/health`),
    safeFetch(`${BACKEND}/api/dashboard/agents`),
    safeFetch(`${BACKEND}/api/dashboard/tasks`),
    safeFetch(`${BACKEND}/api/dashboard/projects`),
    safeFetch(`${BACKEND}/api/dashboard/sessions`),
    safeFetch(`${BACKEND}/api/dashboard/crons`),
    safeFetch(`${BACKEND}/api/dashboard/system`),
  ]);

  const orphanAlerts = Array.isArray(tasks)
    ? tasks.filter((t: any) => t.status === "orphaned")
    : [];

  return NextResponse.json({
    agents: agents || [],
    tasks: tasks || [],
    projects: projects || [],
    sessions: sessions || [],
    crons: crons || [],
    system: system || null,
    orphanAlerts,
    lastUpdated: new Date().toISOString(),
  });
}
