import { NextResponse } from "next/server";
const BACKEND = "http://localhost:3001";
export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const res = await fetch(`${BACKEND}/api/tasks-md/${projectId}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ tasks: [] });
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ tasks: [] }); }
}
