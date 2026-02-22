import { HttpRequest, HttpResponse } from '../../../shared/models';

export type FlowId = string;
export type NodeId = string;
export type EdgeId = string;

export interface XY {
  x: number;
  y: number;
}

export interface FlowVariable {
  value: string;
  description?: string;
}

export interface Flow {
  id: FlowId;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, FlowVariable>;
  environmentId?: string;
  version: number;
  tags?: string[];
}

export interface FlowEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface StartNode {
  id: NodeId;
  type: 'start';
  position: XY;
  label?: string;
}

export interface EndNode {
  id: NodeId;
  type: 'end';
  position: XY;
  label?: string;
}

export interface RequestNode {
  id: NodeId;
  type: 'request';
  position: XY;
  label?: string;
  data: {
    requestRef:
      | { kind: 'collectionRequest'; collectionId: string; requestId: string }
      | { kind: 'adhoc'; request: HttpRequest };
    name?: string;
    overrideEnvId?: string;
    saveResponseAs?: string;
    preRequestScript?: string;
    postRequestScript?: string;
  };
}

export interface ExtractNode {
  id: NodeId;
  type: 'extract';
  position: XY;
  label?: string;
  data: {
    from: 'lastResponseBody' | 'flowVar';
    flowVarName?: string;
    jsonPath: string;
    toFlowVar: string;
  };
}

export interface ConditionNode {
  id: NodeId;
  type: 'condition';
  position: XY;
  label?: string;
  data: {
    left: { kind: 'flowVar' | 'lastStatus' | 'lastResponseBodyPath'; value: string };
    op: 'equals' | 'notEquals' | 'contains' | 'gt' | 'lt';
    right: { kind: 'literal' | 'flowVar'; value: string };
  };
}

export interface SetVarNode {
  id: NodeId;
  type: 'setVar';
  position: XY;
  label?: string;
  data: {
    key: string;
    valueTemplate: string;
  };
}

export interface DelayNode {
  id: NodeId;
  type: 'delay';
  position: XY;
  label?: string;
  data: {
    ms: number;
  };
}

export interface LogNode {
  id: NodeId;
  type: 'log';
  position: XY;
  label?: string;
  data: {
    messageTemplate: string;
  };
}

export interface LoopNode {
  id: NodeId;
  type: 'loop';
  position: XY;
  label?: string;
  data: {
    arrayVar: string;
    itemVar: string;
    indexVar?: string;
  };
}

export interface ParallelNode {
  id: NodeId;
  type: 'parallel';
  position: XY;
  label?: string;
  data: {
    branches: number;
  };
}

export interface MapNode {
  id: NodeId;
  type: 'map';
  position: XY;
  label?: string;
  data: {
    inputVar: string;
    outputVar: string;
    transformScript: string;
  };
}

export interface ScriptNode {
  id: NodeId;
  type: 'script';
  position: XY;
  label?: string;
  data: {
    script: string;
  };
}

export interface ErrorHandlerNode {
  id: NodeId;
  type: 'errorHandler';
  position: XY;
  label?: string;
  data: {
    errorVar?: string;
  };
}

export type FlowNode =
  | StartNode
  | EndNode
  | RequestNode
  | ExtractNode
  | ConditionNode
  | SetVarNode
  | DelayNode
  | LogNode
  | LoopNode
  | ParallelNode
  | MapNode
  | ScriptNode
  | ErrorHandlerNode;

export type NodeStatus = 'pending' | 'running' | 'success' | 'error';
export type RunStatus = 'idle' | 'running' | 'stopped' | 'error' | 'success';

export interface TimelineEvent {
  id: string;
  ts: number;
  nodeId: NodeId;
  type: 'start' | 'success' | 'error';
  message: string;
  data?: unknown;
}

export interface NodeExecutionResult {
  nodeId: NodeId;
  status: 'success' | 'error';
  startTime: number;
  endTime: number;
  response?: HttpResponse;
  request?: HttpRequest;
  error?: string;
  data?: unknown;
}

export interface ExecutionContext {
  flowVars: Record<string, unknown>;
  lastResponse?: HttpResponse;
  lastRequest?: HttpRequest;
  logs: { ts: number; level: 'info' | 'warn' | 'error'; msg: string }[];
  results: Record<NodeId, NodeExecutionResult>;
}
