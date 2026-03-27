export type AgentStatus = 'online' | 'offline' | 'idle' | 'working';
export type TaskPhase = 'research' | 'design' | 'implement' | 'self_qc' | 'qa' | 'document' | 'done';
export type TaskStatus = 'in_progress' | 'pending' | 'complete' | 'orphaned' | 'cancelled';
export type ServiceStatus = 'online' | 'offline';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  loadedSkill?: string;
  sessionId?: string;
  lastActive?: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  agent: string;
  sessionId?: string;
  skill?: string;
  phase: TaskPhase;
  status: TaskStatus;
  started?: string;
  updated?: string;
  progress?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  plan?: string;
  taskCount: { total: number; done: number };
  lastActivity?: string;
}

export interface Session {
  id: string;
  agentId: string;
  agentName: string;
  started: string;
  lastActive: string;
  contextPct?: number;
  model?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'idle' | 'error';
  lastSuccess?: boolean;
  duration?: string;
}

export interface Service {
  name: string;
  port: number;
  online: boolean;
  url?: string;
}

export interface SystemHealth {
  gateway: { online: boolean; version: string; uptime: number; latencyMs: number };
  backend: { online: boolean; latencyMs: number };
  services: Service[];
  cpu: number;
  ram: number;
  disk: number;
}

export interface WorkflowStep {
  id: string;
  label: string;
  agent: string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  started?: string;
  duration?: string;
  progress?: number;
}

export interface DashboardState {
  agents: Agent[];
  tasks: Task[];
  projects: Project[];
  sessions: Session[];
  crons: CronJob[];
  system: SystemHealth | null;
  orphanAlerts: Task[];
  lastUpdated: string | null;
}
