import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  
  try {
    const res = await fetch(`${backendUrl}/api/settings`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }
    
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  
  try {
    const body = await request.json();
    const res = await fetch(`${backendUrl}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }
    
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 500 });
  }
}
