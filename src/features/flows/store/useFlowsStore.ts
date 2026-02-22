import { create } from 'zustand';
import type { Flow, FlowNode, FlowEdge, FlowVariable } from '../models/flow';
import { flowsRepo } from '../repo/flowsRepo';

interface FlowsState {
  flows: Flow[];
  activeFlow: Flow | null;
  selectedNodeId: string | null;
  loadFlows: () => Promise<void>;
  loadFlow: (id: string) => Promise<void>;
  createFlow: (name: string, description?: string) => Promise<Flow | undefined>;
  updateFlow: (flow: Flow) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  duplicateFlow: (id: string) => Promise<void>;
  setActiveFlow: (flow: Flow | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodes: (nodes: FlowNode[]) => void;
  updateEdges: (edges: FlowEdge[]) => void;
  updateFlowVariables: (variables: Record<string, FlowVariable>) => void;
  importFlow: (json: string) => Promise<{ success: boolean; error?: string }>;
  exportFlow: (flowId: string) => Promise<{ success: boolean; json?: string; error?: string }>;
}

export const useFlowsStore = create<FlowsState>((set, get) => ({
  flows: [],
  activeFlow: null,
  selectedNodeId: null,

  loadFlows: async () => {
    const flows = await flowsRepo.getAll();
    set({ flows });
  },

  loadFlow: async (id: string) => {
    const flow = await flowsRepo.getById(id);
    if (flow) {
      set({ activeFlow: flow, selectedNodeId: null });
    }
  },

  createFlow: async (name: string, description?: string) => {
    const flow = await flowsRepo.create({
      name,
      description,
      nodes: [
        {
          id: 'start-node',
          type: 'start',
          position: { x: 250, y: 50 },
        },
        {
          id: 'end-node',
          type: 'end',
          position: { x: 250, y: 300 },
        },
      ],
      edges: [],
      variables: {},
    });

    const flows = await flowsRepo.getAll();
    set({ flows, activeFlow: flow });
    return flow;
  },

  updateFlow: async (flow: Flow) => {
    await flowsRepo.update(flow);
    const flows = await flowsRepo.getAll();
    set({ flows, activeFlow: flow });
  },

  deleteFlow: async (id: string) => {
    await flowsRepo.delete(id);
    const flows = await flowsRepo.getAll();
    set({ flows });
  },

  duplicateFlow: async (id: string) => {
    await flowsRepo.duplicate(id);
    const flows = await flowsRepo.getAll();
    set({ flows });
  },

  setActiveFlow: (flow: Flow | null) => {
    set({ activeFlow: flow, selectedNodeId: null });
  },

  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  updateNodes: (nodes: FlowNode[]) => {
    const { activeFlow } = get();
    if (!activeFlow) return;

    const updated = { ...activeFlow, nodes };
    set({ activeFlow: updated });
  },

  updateEdges: (edges: FlowEdge[]) => {
    const { activeFlow } = get();
    if (!activeFlow) return;

    const updated = { ...activeFlow, edges };
    set({ activeFlow: updated });
  },

  updateFlowVariables: (variables: Record<string, FlowVariable>) => {
    const { activeFlow } = get();
    if (!activeFlow) return;

    const updated = { ...activeFlow, variables };
    set({ activeFlow: updated });
  },

  importFlow: async (json: string) => {
    const result = await flowsRepo.importFlow(json);
    if (result.success) {
      const flows = await flowsRepo.getAll();
      set({ flows });
    }
    return result;
  },

  exportFlow: async (flowId: string) => {
    return await flowsRepo.exportFlow(flowId);
  },
}));
