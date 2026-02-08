import { create } from 'zustand';
import type { NodeId, NodeStatus, RunStatus, TimelineEvent, ExecutionContext } from '../models/flow';

interface FlowRunState {
  runStatus: RunStatus;
  nodeStatuses: Map<NodeId, NodeStatus>;
  timeline: TimelineEvent[];
  context: ExecutionContext;
  abortController: AbortController | null;
  setRunStatus: (status: RunStatus) => void;
  setNodeStatus: (nodeId: NodeId, status: NodeStatus) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  setContext: (context: ExecutionContext) => void;
  updateContextVars: (vars: Record<string, any>) => void;
  addLog: (level: 'info' | 'warn' | 'error', msg: string) => void;
  reset: () => void;
  setAbortController: (controller: AbortController | null) => void;
}

export const useFlowRunStore = create<FlowRunState>((set, get) => ({
  runStatus: 'idle',
  nodeStatuses: new Map(),
  timeline: [],
  context: {
    flowVars: {},
    logs: [],
  },
  abortController: null,

  setRunStatus: (status: RunStatus) => {
    set({ runStatus: status });
  },

  setNodeStatus: (nodeId: NodeId, status: NodeStatus) => {
    const nodeStatuses = new Map(get().nodeStatuses);
    nodeStatuses.set(nodeId, status);
    set({ nodeStatuses });
  },

  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => {
    const timeline = [...get().timeline];
    timeline.push({
      ...event,
      id: `event-${Date.now()}-${Math.random()}`,
    });
    set({ timeline });
  },

  setContext: (context: ExecutionContext) => {
    set({ context });
  },

  updateContextVars: (vars: Record<string, any>) => {
    const context = get().context;
    set({
      context: {
        ...context,
        flowVars: { ...context.flowVars, ...vars },
      },
    });
  },

  addLog: (level: 'info' | 'warn' | 'error', msg: string) => {
    const context = get().context;
    set({
      context: {
        ...context,
        logs: [...context.logs, { ts: Date.now(), level, msg }],
      },
    });
  },

  reset: () => {
    set({
      runStatus: 'idle',
      nodeStatuses: new Map(),
      timeline: [],
      context: {
        flowVars: {},
        logs: [],
      },
      abortController: null,
    });
  },

  setAbortController: (controller: AbortController | null) => {
    set({ abortController: controller });
  },
}));
