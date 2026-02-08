import { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowsStore } from '../store/useFlowsStore';
import { useFlowRunStore } from '../store/useFlowRunStore';
import { FlowExecutionEngine } from '../runtime/engine';
import { NodePalette } from './components/NodePalette';
import { NodeInspector } from './components/NodeInspector';
import { RunPanel } from './components/RunPanel';
import type { FlowNode } from '../models/flow';
import { generateId } from '../../../shared/utils/id';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Save, ArrowLeft } from 'lucide-react';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { useCollectionsStore } from '../../collections/store/useCollectionsStore';
import { useEnvironmentStore } from '../../environments/store/useEnvironmentStore';

interface FlowEditorPageProps {
  flowId: string;
  onNavigateToList: () => void;
}

export function FlowEditorPage({ flowId, onNavigateToList }: FlowEditorPageProps) {
  const { activeFlow, loadFlow, updateFlow, setSelectedNodeId, selectedNodeId } = useFlowsStore();
  const { loadCollections } = useCollectionsStore();
  const { loadEnvironments } = useEnvironmentStore();
  const {
    runStatus,
    nodeStatuses,
    setRunStatus,
    setNodeStatus,
    addTimelineEvent,
    setContext,
    updateContextVars,
    addLog,
    reset,
    setAbortController,
  } = useFlowRunStore();
  const { addToast } = useToastStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('');

  useEffect(() => {
    loadFlow(flowId);
    loadCollections();
    loadEnvironments();
  }, [flowId, loadFlow, loadCollections, loadEnvironments]);

  useEffect(() => {
    if (activeFlow) {
      setFlowName(activeFlow.name);

      const flowNodes: Node[] = activeFlow.nodes.map((node) => ({
        id: node.id,
        type: 'default',
        position: node.position,
        data: {
          label: getNodeLabel(node),
          status: nodeStatuses.get(node.id) || 'pending',
        },
        style: getNodeStyle(node, nodeStatuses.get(node.id) || 'pending'),
      }));

      const flowEdges: Edge[] = activeFlow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [activeFlow, nodeStatuses, setNodes, setEdges]);

  const handleSave = useCallback(async () => {
    if (!activeFlow) return;

    const flowNodes: FlowNode[] = nodes.map((node) => {
      const originalNode = activeFlow.nodes.find((n) => n.id === node.id);
      if (!originalNode) {
        return createFlowNode(node.id, 'log', node.position);
      }
      return { ...originalNode, position: node.position };
    });

    const updatedFlow = {
      ...activeFlow,
      name: flowName,
      nodes: flowNodes,
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    };

    await updateFlow(updatedFlow);
    addToast('success', 'Flow saved');
  }, [activeFlow, nodes, edges, flowName, updateFlow, addToast]);

  const handleAddNode = useCallback(
    (type: string) => {
      const id = generateId();
      const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };

      const flowNode = createFlowNode(id, type as any, position);

      const newNode: Node = {
        id,
        type: 'default',
        position,
        data: {
          label: getNodeLabel(flowNode),
          status: 'pending',
        },
        style: getNodeStyle(flowNode, 'pending'),
      };

      setNodes((nds) => nds.concat(newNode));

      if (activeFlow) {
        const updatedFlow = {
          ...activeFlow,
          nodes: [...activeFlow.nodes, flowNode],
        };
        updateFlow(updatedFlow);
      }
    },
    [setNodes, activeFlow, updateFlow]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: generateId(),
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      if (activeFlow) {
        const updatedFlow = {
          ...activeFlow,
          edges: [
            ...activeFlow.edges,
            {
              id: newEdge.id!,
              source: newEdge.source!,
              target: newEdge.target!,
              sourceHandle: newEdge.sourceHandle || undefined,
              targetHandle: newEdge.targetHandle || undefined,
            },
          ],
        };
        updateFlow(updatedFlow);
      }
    },
    [setEdges, activeFlow, updateFlow]
  );

  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handleNodeUpdate = useCallback(
    (updatedNode: FlowNode) => {
      if (!activeFlow) return;

      const updatedNodes = activeFlow.nodes.map((n) =>
        n.id === updatedNode.id ? updatedNode : n
      );

      const updatedFlow = { ...activeFlow, nodes: updatedNodes };
      updateFlow(updatedFlow);

      const node = nodes.find((n) => n.id === updatedNode.id);
      if (node) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === updatedNode.id
              ? { ...n, data: { ...n.data, label: getNodeLabel(updatedNode) } }
              : n
          )
        );
      }
    },
    [activeFlow, nodes, setNodes, updateFlow]
  );

  const handleRun = useCallback(async () => {
    if (!activeFlow || runStatus === 'running') return;

    reset();
    setRunStatus('running');

    const abortController = new AbortController();
    setAbortController(abortController);

    const callbacks = {
      onNodeStart: (nodeId: string) => {
        setNodeStatus(nodeId, 'running');
        addTimelineEvent({
          ts: Date.now(),
          nodeId,
          type: 'start',
          message: `Node ${getNodeName(nodeId)} started`,
        });
      },
      onNodeSuccess: (nodeId: string, data?: any) => {
        setNodeStatus(nodeId, 'success');
        addTimelineEvent({
          ts: Date.now(),
          nodeId,
          type: 'success',
          message: `Node ${getNodeName(nodeId)} completed`,
          data,
        });
      },
      onNodeError: (nodeId: string, error: string) => {
        setNodeStatus(nodeId, 'error');
        addTimelineEvent({
          ts: Date.now(),
          nodeId,
          type: 'error',
          message: `Node ${getNodeName(nodeId)} failed: ${error}`,
        });
      },
      onLog: (level: 'info' | 'warn' | 'error', msg: string) => {
        addLog(level, msg);
      },
      onContextUpdate: (context: any) => {
        setContext(context);
      },
    };

    const engine = new FlowExecutionEngine(activeFlow, callbacks, abortController);

    try {
      await engine.execute();
      setRunStatus('success');
      addToast('success', 'Flow completed successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'AbortError') {
        setRunStatus('stopped');
        addToast('info', 'Flow execution stopped');
      } else {
        setRunStatus('error');
        addToast('error', error instanceof Error ? error.message : 'Flow failed');
      }
    }

    setAbortController(null);
  }, [activeFlow, runStatus, reset, setRunStatus, setNodeStatus, addTimelineEvent, addLog, setContext, addToast, setAbortController]);

  const handleStop = useCallback(() => {
    const { abortController } = useFlowRunStore.getState();
    if (abortController) {
      abortController.abort();
    }
  }, []);

  const getNodeName = (nodeId: string): string => {
    if (!activeFlow) return nodeId;
    const node = activeFlow.nodes.find((n) => n.id === nodeId);
    return node ? getNodeLabel(node) : nodeId;
  };

  const selectedNode = activeFlow?.nodes.find((n) => n.id === selectedNodeId) || null;

  if (!activeFlow) {
    return <div className="h-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-bg-panel">
      <div className="px-md py-sm border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-md flex-1">
          <button
            onClick={onNavigateToList}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
          >
            <ArrowLeft size={18} />
          </button>
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-base font-semibold max-w-md"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-1.5"
        >
          <Save size={16} />
          Save
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <NodePalette onAddNode={handleAddNode} />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <NodeInspector node={selectedNode} onUpdateNode={handleNodeUpdate} />
      </div>

      <RunPanel onRun={handleRun} onStop={handleStop} />
    </div>
  );
}

function createFlowNode(id: string, type: string, position: { x: number; y: number }): FlowNode {
  const baseNode = { id, position };

  switch (type) {
    case 'start':
      return { ...baseNode, type: 'start' };
    case 'end':
      return { ...baseNode, type: 'end' };
    case 'request':
      return {
        ...baseNode,
        type: 'request',
        data: {
          requestRef: {
            kind: 'collectionRequest',
            collectionId: '',
            requestId: '',
          },
        },
      };
    case 'extract':
      return {
        ...baseNode,
        type: 'extract',
        data: {
          from: 'lastResponseBody',
          jsonPath: '',
          toFlowVar: '',
        },
      };
    case 'condition':
      return {
        ...baseNode,
        type: 'condition',
        data: {
          left: { kind: 'flowVar', value: '' },
          op: 'equals',
          right: { kind: 'literal', value: '' },
        },
      };
    case 'setVar':
      return {
        ...baseNode,
        type: 'setVar',
        data: {
          key: '',
          valueTemplate: '',
        },
      };
    case 'delay':
      return {
        ...baseNode,
        type: 'delay',
        data: {
          ms: 1000,
        },
      };
    case 'log':
      return {
        ...baseNode,
        type: 'log',
        data: {
          messageTemplate: '',
        },
      };
    case 'loop':
      return {
        ...baseNode,
        type: 'loop',
        data: {
          arrayVar: '',
          itemVar: 'item',
          indexVar: 'index',
        },
      };
    case 'parallel':
      return {
        ...baseNode,
        type: 'parallel',
        data: {
          branches: 2,
        },
      };
    case 'map':
      return {
        ...baseNode,
        type: 'map',
        data: {
          inputVar: '',
          outputVar: '',
          transformScript: '',
        },
      };
    case 'script':
      return {
        ...baseNode,
        type: 'script',
        data: {
          script: '',
        },
      };
    case 'errorHandler':
      return {
        ...baseNode,
        type: 'errorHandler',
        data: {
          errorVar: 'error',
        },
      };
    default:
      return { ...baseNode, type: 'log', data: { messageTemplate: '' } };
  }
}

function getNodeLabel(node: FlowNode): string {
  if (node.label) return node.label;

  switch (node.type) {
    case 'start':
      return 'Start';
    case 'end':
      return 'End';
    case 'request':
      return node.data.name || 'Request';
    case 'extract':
      return `Extract: ${node.data.toFlowVar || '?'}`;
    case 'condition':
      return 'Condition';
    case 'setVar':
      return `Set: ${node.data.key || '?'}`;
    case 'delay':
      return `Delay ${node.data.ms}ms`;
    case 'log':
      return 'Log';
    case 'loop':
      return `Loop: ${node.data.arrayVar || '?'}`;
    case 'parallel':
      return `Parallel (${node.data.branches})`;
    case 'map':
      return `Map: ${node.data.inputVar || '?'}`;
    case 'script':
      return 'Script';
    case 'errorHandler':
      return 'Error Handler';
    default:
      return 'Node';
  }
}

function getNodeStyle(node: FlowNode, status: string) {
  let backgroundColor = 'var(--bg-elevated)';
  let borderColor = 'var(--border-default)';
  let color = 'var(--text-primary)';

  if (status === 'running') {
    borderColor = 'var(--accent-primary)';
    backgroundColor = 'var(--accent-primary)/10';
  } else if (status === 'success') {
    borderColor = 'var(--status-success)';
    backgroundColor = 'var(--status-success)/10';
  } else if (status === 'error') {
    borderColor = 'var(--status-error)';
    backgroundColor = 'var(--status-error)/10';
  }

  if (node.type === 'start') {
    backgroundColor = 'var(--status-success)/20';
    borderColor = 'var(--status-success)';
  } else if (node.type === 'end') {
    backgroundColor = 'var(--status-error)/20';
    borderColor = 'var(--status-error)';
  }

  return {
    backgroundColor,
    borderColor,
    borderWidth: '2px',
    borderStyle: 'solid',
    color,
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  };
}
