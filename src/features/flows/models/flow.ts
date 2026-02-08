import { HttpRequest, HttpResponse } from '../../../shared/models';

export type FlowId = string;
export type NodeId = string;
export type EdgeId = string;

export interface XY {
  x: number;
  y: number;
}

export interface Flow {
  id: FlowId;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, string>;
  environmentId?: string;
  version: number;
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
}

export interface EndNode {
  id: NodeId;
  type: 'end';
  position: XY;
}

export interface RequestNode {
  id: NodeId;
  type: 'request';
  position: XY;
  data: {
    requestRef:
      | { kind: 'collectionRequest'; collectionId: string; requestId: string }
      | { kind: 'adhoc'; request: HttpRequest };
    name?: string;
    overrideEnvId?: string;
    saveResponseAs?: string;
  };
}

export interface ExtractNode {
  id: NodeId;
  type: 'extract';
  position: XY;
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
  data: {
    key: string;
    valueTemplate: string;
  };
}

export interface DelayNode {
  id: NodeId;
  type: 'delay';
  position: XY;
  data: {
    ms: number;
  };
}

export interface LogNode {
  id: NodeId;
  type: 'log';
  position: XY;
  data: {
    messageTemplate: string;
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
  | LogNode;

export type NodeStatus = 'pending' | 'running' | 'success' | 'error';
export type RunStatus = 'idle' | 'running' | 'stopped' | 'error' | 'success';

export interface TimelineEvent {
  id: string;
  ts: number;
  nodeId: NodeId;
  type: 'start' | 'success' | 'error';
  message: string;
  data?: any;
}

export interface ExecutionContext {
  flowVars: Record<string, any>;
  lastResponse?: HttpResponse;
  lastRequest?: HttpRequest;
  logs: { ts: number; level: 'info' | 'warn' | 'error'; msg: string }[];
}
