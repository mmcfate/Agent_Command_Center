import { NextResponse } from "next/server";

const BACKEND = "localhost:3001";

export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object, eventType = "snapshot") => {
        const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      const fetchData = async () => {
        try {
          const [agents, sessions, crons, system, todoData] = await Promise.all([
            fetch(`http://${BACKEND}/api/agents`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`http://${BACKEND}/api/openclaw/sessions`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`http://${BACKEND}/api/cron`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`http://${BACKEND}/api/system/all`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`http://${BACKEND}/api/todo`).then(r => r.ok ? r.json() : null).catch(() => null),
          ]);

          // Add gateway status (derived from openclaw status)
          let gatewayOnline = false;
          let gatewayVersion = "";
          try {
            const status = await fetch(`http://${BACKEND}/api/openclaw/status`).then(r => r.ok ? r.json() : null);
            if (status) {
              gatewayOnline = status.runtimeVersion ? true : (status.gateway?.reachable ?? false);
              gatewayVersion = status.runtimeVersion || status.gateway?.self?.version || "";
            }
          } catch {}

          sendEvent({
            type: "snapshot",
            payload: {
              agents: agents || [],
              sessions: sessions || [],
              crons: crons || [],
              system: {
                ...(system || {}),
                gateway: { online: gatewayOnline, version: gatewayVersion }
              },
              projects: todoData?.projects || [],
              tasks: [],
              orphanAlerts: [],
            },
          }, "snapshot");
        } catch (e) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "fetch failed" })}\n\n`));
        }
      };

      // Send immediately, then every 30s
      await fetchData();
      const interval = setInterval(fetchData, 30000);

      // Keep alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(interval);
          clearInterval(keepAlive);
        }
      }, 15000);

      // Cleanup on close
      // Note: in Next.js edge, cleanup is tricky — rely on client reconnect
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
