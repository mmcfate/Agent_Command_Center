import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ catchall: string[] }> }
) {
  const { catchall } = await params;
  const path = catchall.join("/");
  const url = `${BACKEND}/api/dashboard/${path}`;
  
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Backend fetch failed", details: String(e) }, { status: 502 });
  }
}
