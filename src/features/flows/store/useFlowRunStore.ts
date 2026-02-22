import { create } from 'zustand';
import type { NodeId, NodeStatus, RunStatus, TimelineEvent, ExecutionContext, NodeExecutionResult } from '../models/flow';

interface FlowRunState {
  runStatus: RunStatus;
  nodeStatuses: Map<NodeId, NodeStatus>;
  timeline: TimelineEvent[];
  context: ExecutionContext;
  abortController: AbortController | null;
  selectedResultNodeId: NodeId | null;
  setRunStatus: (status: RunStatus) => void;
  setNodeStatus: (nodeId: NodeId, status: NodeStatus) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  setContext: (context: ExecutionContext) => void;
  updateContextVars: (vars: Record<string, unknown>) => void;
  addLog: (level: 'info' | 'warn' | 'error', msg: string) => void;
  addNodeResult: (result: NodeExecutionResult) => void;
  setSelectedResultNodeId: (nodeId: NodeId | null) => void;
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
    results: {},
  },
  abortController: null,
  selectedResultNodeId: null,

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

  updateContextVars: (vars: Record<string, unknown>) => {
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

  addNodeResult: (result: NodeExecutionResult) => {
    const context = get().context;
    set({
      context: {
        ...context,
        results: {
          ...context.results,
          [result.nodeId]: result,
        },
      },
    });
  },

  setSelectedResultNodeId: (nodeId: NodeId | null) => {
    set({ selectedResultNodeId: nodeId });
  },

  reset: () => {
    set({
      runStatus: 'idle',
      nodeStatuses: new Map(),
      timeline: [],
      context: {
        flowVars: {},
        logs: [],
        results: {},
      },
      abortController: null,
      selectedResultNodeId: null,
    });
  },

  setAbortController: (controller: AbortController | null) => {
    set({ abortController: controller });
  },
}));
