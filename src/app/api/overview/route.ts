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
    const [agents, sessions, crons, system, todoData] = await Promise.all([
      safeFetch(`${BACKEND}/api/agents`),
      safeFetch(`${BACKEND}/api/openclaw/sessions`),
      safeFetch(`${BACKEND}/api/cron`),
      safeFetch(`${BACKEND}/api/system/all`),
      safeFetch(`${BACKEND}/api/todo`),
    ]);

    return NextResponse.json({
      agents: agents || [],
      sessions: sessions || [],
      crons: crons || [],
      system: system || null,
      projects: todoData?.projects || [],
      tasks: [],
      orphanAlerts: [],
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
