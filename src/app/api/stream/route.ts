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

export async function GET() {
  try {
    const [agents, tasks, projects, sessions, crons, system] = await Promise.all([
      safeFetch(`${BACKEND}/api/dashboard/agents`),
      safeFetch(`${BACKEND}/api/dashboard/tasks`),
      safeFetch(`${BACKEND}/api/dashboard/projects`),
      safeFetch(`${BACKEND}/api/dashboard/sessions`),
      safeFetch(`${BACKEND}/api/dashboard/crons`),
      safeFetch(`${BACKEND}/api/dashboard/system`),
    ]);

    return NextResponse.json({
      type: "snapshot",
      payload: {
        agents: agents || [],
        tasks: tasks || [],
        projects: projects || [],
        sessions: sessions || [],
        crons: crons || [],
        system: system || null,
        orphanAlerts: (tasks || []).filter((t: any) => t.status === "orphaned"),
      },
    });
  } catch {
    return NextResponse.json({ type: "error", message: "fetch failed" }, { status: 500 });
  }
}
