import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  
  try {
    const res = await fetch(`${backendUrl}/api/openclaw/config`, {
      headers: { Authorization: `Bearer ${process.env.OPENCLAW_TOKEN || ""}` },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }
    
    const data = await res.json();
    
    // Extract agents list
    const agentsList = (data.agents?.list || []).map((a: any) => ({
      id: a.id || "",
      name: a.name || a.id || "",
      workspace: a.workspace || "",
      role: a.role || data.agents?.defaults?.role || ""
    }));
    
    return NextResponse.json({ agents: { list: agentsList } });
  } catch (e) {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 500 });
  }
}
