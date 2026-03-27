import { NextResponse } from "next/server";

const BACKEND = "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/todo`, {
      next: { revalidate: 10 }, // cache 10s
    });
    if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
