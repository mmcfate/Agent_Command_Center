import { create } from "zustand";
import type { Agent, Task, Project, Session, CronJob, SystemHealth } from "@/types";

const HISTORY_SIZE = 60;

interface GpuHistory {
  id: string;
  name: string;
  util: number[];
  memUsed: number[];
  memTotal: number[]; // always [totalMiB] — stable capacity baseline
}

interface SystemHistory {
  cpu: number[];
  ram: number[];
  disk: number[];
  gpus: GpuHistory[];
}

interface DashboardState {
  agents: Agent[];
  tasks: Task[];
  projects: Project[];
  sessions: Session[];
  crons: CronJob[];
  system: SystemHealth | null;
  systemHistory: SystemHistory;
  orphanAlerts: Task[];
  isDark: boolean;
  isConnected: boolean;

  setAll: (data: any) => void;
  toggleTheme: () => void;
  setConnected: (v: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  agents: [],
  tasks: [],
  projects: [],
  sessions: [],
  crons: [],
  system: null,
  systemHistory: { cpu: [], ram: [], disk: [], gpus: [] },
  orphanAlerts: [],
  isDark: true,
  isConnected: false,

  setAll: (data) => {
    const sys = data.system;
    if (sys) {
      const hist = get().systemHistory;
      const push = (arr: number[], val: number) => {
        const next = [...arr, val];
        return next.length > HISTORY_SIZE ? next.slice(-HISTORY_SIZE) : next;
      };

      // Match incoming GPUs to existing history slots by id
      const incomingGpus: GpuHistory[] = (sys.gpus || []).map((g: any) => {
        const existing = hist.gpus.find((h) => h.id === g.id);
        // realTotal: from incoming if non-zero, else from existing, else fallback 16384
        const rawTotal = Array.isArray(g.memTotal) ? g.memTotal[0] : g.memTotal;
        const incomingTotal = typeof rawTotal === 'number' ? rawTotal : 0;
        const existingTotal = existing?.memTotal?.[0] || 0;
        const total = incomingTotal || existingTotal || 16384;
        return {
          id: g.id,
          name: g.name,
          util: push(existing?.util || [], g.util || 0),
          memUsed: push(existing?.memUsed || [], g.memUsed || 0),
          memTotal: [total],
        };
      });

      set({
        agents: data.agents || [],
        tasks: data.tasks || [],
        projects: data.projects || [],
        sessions: data.sessions || [],
        crons: data.crons || [],
        system: sys,
        systemHistory: {
          cpu: push(hist.cpu, sys.cpu ?? 0),
          ram: push(hist.ram, sys.ram ?? 0),
          disk: push(hist.disk, sys.disk ?? 0),
          gpus: incomingGpus.length > 0 ? incomingGpus : hist.gpus,
        },
        orphanAlerts: data.orphanAlerts || [],
      });
    } else {
      set({
        agents: data.agents || [],
        tasks: data.tasks || [],
        projects: data.projects || [],
        sessions: data.sessions || [],
        crons: data.crons || [],
        orphanAlerts: data.orphanAlerts || [],
      });
    }
  },

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      if (state.isDark) {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return { isDark: next };
    }),

  setConnected: (v) => set({ isConnected: v }),
}));

// SSE connection manager — true EventSource with auto-reconnect
// Use current host so it works from any network location
const SSE_URL = `${window.location.protocol}//${window.location.hostname}:3001/api/dashboard/stream`;
let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 5000;
let lastMessageTime = 0;
let pingTimer: ReturnType<typeof setInterval> | null = null;

export function connectStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }

  eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    useDashboardStore.getState().setConnected(true);
    reconnectDelay = 5000; // reset backoff on successful connection
    lastMessageTime = Date.now();

    // Detect silent disconnections: if no message in 20s, force reconnect
    pingTimer = setInterval(() => {
      if (Date.now() - lastMessageTime > 20000) {
        // No message in 20s — SSE likely silently dropped, reconnect
        eventSource?.close();
        eventSource = null;
        reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
        reconnectTimer = setTimeout(() => connectStream(), reconnectDelay);
      }
    }, 15000);
  };

  eventSource.onmessage = (event) => {
    lastMessageTime = Date.now();
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "snapshot" || msg.type === "heartbeat") {
        useDashboardStore.getState().setAll({
          ...msg.payload,
          orphanAlerts: (msg.payload.tasks || []).filter((t: any) => t.status === "orphaned"),
        });
      }
    } catch {
      // ignore parse errors
    }
  };

  eventSource.onerror = () => {
    useDashboardStore.getState().setConnected(false);
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    eventSource?.close();
    eventSource = null;
    reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
    reconnectTimer = setTimeout(() => connectStream(), reconnectDelay);
  };

  // Reconnect when tab becomes visible again after being hidden
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !eventSource) {
      connectStream();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    eventSource?.close();
    eventSource = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (pingTimer) clearInterval(pingTimer);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
