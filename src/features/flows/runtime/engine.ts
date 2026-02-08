import type { Flow, FlowNode, FlowEdge, ExecutionContext } from '../models/flow';
import { HttpClient } from '../../../shared/http/HttpClient';
import { resolveTemplate, extractJsonPath, evaluateCondition } from './resolvers';
import { executeScript, type ScriptContext } from '../../../shared/http/scriptExecutor';
import type { HttpRequest, HttpResponse, Environment } from '../../../shared/models';
import { db } from '../../../shared/storage/db';

export interface ExecutionCallbacks {
  onNodeStart: (nodeId: string) => void;
  onNodeSuccess: (nodeId: string, data?: any) => void;
  onNodeError: (nodeId: string, error: string) => void;
  onLog: (level: 'info' | 'warn' | 'error', msg: string) => void;
  onContextUpdate: (context: ExecutionContext) => void;
}

export class FlowExecutionEngine {
  private httpClient: HttpClient;
  private abortController: AbortController;
  private context: ExecutionContext;
  private callbacks: ExecutionCallbacks;
  private envVars: Record<string, string>;
  private environment: Environment | null = null;

  constructor(
    private flow: Flow,
    callbacks: ExecutionCallbacks,
    abortController: AbortController
  ) {
    this.httpClient = new HttpClient();
    this.callbacks = callbacks;
    this.abortController = abortController;
    this.context = {
      flowVars: { ...flow.variables },
      logs: [],
    };
    this.envVars = {};
  }

  async execute(): Promise<void> {
    try {
      await this.loadEnvironment();

      const startNode = this.flow.nodes.find(n => n.type === 'start');
      if (!startNode) {
        throw new Error('No start node found');
      }

      await this.executeNode(startNode.id);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.callbacks.onLog('info', 'Flow execution stopped');
      } else {
        this.callbacks.onLog('error', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    }
  }

  private async loadEnvironment(): Promise<void> {
    if (this.flow.environmentId) {
      this.environment = await db.environments.get(this.flow.environmentId) || null;
      if (this.environment) {
        this.envVars = this.environment.variables
          .filter(v => v.enabled)
          .reduce((acc, v) => {
            acc[v.key] = v.value;
            return acc;
          }, {} as Record<string, string>);
      }
    }
  }

  private async executeNode(nodeId: string): Promise<void> {
    if (this.abortController.signal.aborted) {
      throw new Error('AbortError');
    }

    const node = this.flow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    this.callbacks.onNodeStart(nodeId);

    try {
      switch (node.type) {
        case 'start':
          await this.executeStartNode(node);
          break;
        case 'end':
          await this.executeEndNode(node);
          break;
        case 'request':
          await this.executeRequestNode(node);
          break;
        case 'extract':
          await this.executeExtractNode(node);
          break;
        case 'condition':
          await this.executeConditionNode(node);
          break;
        case 'setVar':
          await this.executeSetVarNode(node);
          break;
        case 'delay':
          await this.executeDelayNode(node);
          break;
        case 'log':
          await this.executeLogNode(node);
          break;
        case 'loop':
          await this.executeLoopNode(node);
          break;
        case 'parallel':
          await this.executeParallelNode(node);
          break;
        case 'map':
          await this.executeMapNode(node);
          break;
        case 'script':
          await this.executeScriptNode(node);
          break;
        case 'errorHandler':
          await this.executeErrorHandlerNode(node);
          break;
      }

      this.callbacks.onNodeSuccess(nodeId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.callbacks.onNodeError(nodeId, message);
      throw error;
    }
  }

  private async executeStartNode(node: FlowNode): Promise<void> {
    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeEndNode(node: FlowNode): Promise<void> {
    this.callbacks.onLog('info', 'Flow completed successfully');
  }

  private async executeRequestNode(node: FlowNode & { type: 'request' }): Promise<void> {
    let request: HttpRequest;

    if (node.data.requestRef.kind === 'collectionRequest') {
      const collection = await db.collections.get(node.data.requestRef.collectionId);
      if (!collection) {
        throw new Error(`Collection ${node.data.requestRef.collectionId} not found`);
      }

      const foundRequest = collection.requests.find(r => r.id === node.data.requestRef.requestId);
      if (!foundRequest) {
        throw new Error(`Request ${node.data.requestRef.requestId} not found`);
      }

      request = foundRequest;
    } else {
      request = node.data.requestRef.request;
    }

    request = this.resolveRequest(request);

    if (request.preRequestScript) {
      await this.executeRequestScript(request, 'pre');
    }

    const response = await this.httpClient.execute(request, {
      signal: this.abortController.signal,
    });

    this.context.lastRequest = request;
    this.context.lastResponse = response;
    this.callbacks.onContextUpdate(this.context);

    if (node.data.saveResponseAs) {
      try {
        const parsed = JSON.parse(response.body);
        this.context.flowVars[node.data.saveResponseAs] = parsed;
      } catch {
        this.context.flowVars[node.data.saveResponseAs] = response.body;
      }
      this.callbacks.onContextUpdate(this.context);
    }

    if (request.postRequestScript) {
      await this.executeRequestScript(request, 'post');
    }

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private resolveRequest(request: HttpRequest): HttpRequest {
    const resolved = { ...request };

    resolved.url = resolveTemplate(request.url, this.context, this.envVars);

    resolved.headers = request.headers.map(h => ({
      ...h,
      value: resolveTemplate(h.value, this.context, this.envVars),
    }));

    resolved.queryParams = request.queryParams.map(q => ({
      ...q,
      value: resolveTemplate(q.value, this.context, this.envVars),
    }));

    if (request.body.type === 'raw') {
      resolved.body = {
        ...request.body,
        content: resolveTemplate(request.body.content, this.context, this.envVars),
      };
    }

    if (request.auth.type === 'bearer' && request.auth.token) {
      resolved.auth = {
        ...request.auth,
        token: resolveTemplate(request.auth.token, this.context, this.envVars),
      };
    }

    return resolved;
  }

  private async executeRequestScript(request: HttpRequest, phase: 'pre' | 'post'): Promise<void> {
    const script = phase === 'pre' ? request.preRequestScript : request.postRequestScript;
    if (!script) return;

    const scriptContext: ScriptContext = {
      request,
      environment: this.environment,
      response: phase === 'post' ? this.context.lastResponse : undefined,
      setEnv: (key: string, value: string) => {
        this.context.flowVars[key] = value;
      },
      getEnv: (key: string) => {
        return this.context.flowVars[key] || this.envVars[key];
      },
      console: {
        log: (...args) => this.callbacks.onLog('info', args.join(' ')),
        error: (...args) => this.callbacks.onLog('error', args.join(' ')),
        warn: (...args) => this.callbacks.onLog('warn', args.join(' ')),
        info: (...args) => this.callbacks.onLog('info', args.join(' ')),
      },
    };

    const result = executeScript(script, scriptContext);
    if (!result.success && result.error) {
      this.callbacks.onLog('error', `Script error: ${result.error}`);
    }

    this.callbacks.onContextUpdate(this.context);
  }

  private async executeExtractNode(node: FlowNode & { type: 'extract' }): Promise<void> {
    let sourceData: any;

    if (node.data.from === 'lastResponseBody') {
      if (!this.context.lastResponse) {
        throw new Error('No response available');
      }
      try {
        sourceData = JSON.parse(this.context.lastResponse.body);
      } catch {
        sourceData = this.context.lastResponse.body;
      }
    } else {
      if (!node.data.flowVarName) {
        throw new Error('Flow variable name not specified');
      }
      sourceData = this.context.flowVars[node.data.flowVarName];
    }

    const extracted = extractJsonPath(sourceData, node.data.jsonPath);
    this.context.flowVars[node.data.toFlowVar] = extracted;
    this.callbacks.onContextUpdate(this.context);

    this.callbacks.onLog('info', `Extracted "${node.data.jsonPath}" → ${node.data.toFlowVar}`);

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeConditionNode(node: FlowNode & { type: 'condition' }): Promise<void> {
    let leftValue: any;

    if (node.data.left.kind === 'flowVar') {
      leftValue = this.context.flowVars[node.data.left.value];
    } else if (node.data.left.kind === 'lastStatus') {
      leftValue = this.context.lastResponse?.status;
    } else if (node.data.left.kind === 'lastResponseBodyPath') {
      if (!this.context.lastResponse) {
        throw new Error('No response available');
      }
      try {
        const parsed = JSON.parse(this.context.lastResponse.body);
        leftValue = extractJsonPath(parsed, node.data.left.value);
      } catch {
        leftValue = undefined;
      }
    }

    let rightValue: any;
    if (node.data.right.kind === 'literal') {
      rightValue = node.data.right.value;
    } else {
      rightValue = this.context.flowVars[node.data.right.value];
    }

    const result = evaluateCondition(leftValue, node.data.op, rightValue);

    this.callbacks.onLog('info', `Condition: ${leftValue} ${node.data.op} ${rightValue} = ${result}`);

    const handle = result ? 'true' : 'false';
    const nextEdge = this.flow.edges.find(e => e.source === node.id && e.sourceHandle === handle);

    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeSetVarNode(node: FlowNode & { type: 'setVar' }): Promise<void> {
    const value = resolveTemplate(node.data.valueTemplate, this.context, this.envVars);
    this.context.flowVars[node.data.key] = value;
    this.callbacks.onContextUpdate(this.context);

    this.callbacks.onLog('info', `Set ${node.data.key} = ${value}`);

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeDelayNode(node: FlowNode & { type: 'delay' }): Promise<void> {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, node.data.ms);

      this.abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('AbortError'));
      });
    });

    this.callbacks.onLog('info', `Delayed ${node.data.ms}ms`);

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeLogNode(node: FlowNode & { type: 'log' }): Promise<void> {
    const message = resolveTemplate(node.data.messageTemplate, this.context, this.envVars);
    this.callbacks.onLog('info', message);

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeLoopNode(node: FlowNode & { type: 'loop' }): Promise<void> {
    const arrayVar = this.context.flowVars[node.data.arrayVar];
    if (!Array.isArray(arrayVar)) {
      throw new Error(`Variable ${node.data.arrayVar} is not an array`);
    }

    for (let i = 0; i < arrayVar.length; i++) {
      this.context.flowVars[node.data.itemVar] = arrayVar[i];
      if (node.data.indexVar) {
        this.context.flowVars[node.data.indexVar] = i;
      }
      this.callbacks.onContextUpdate(this.context);

      const nextEdge = this.flow.edges.find(e => e.source === node.id);
      if (nextEdge) {
        await this.executeNode(nextEdge.target);
      }
    }
  }

  private async executeParallelNode(node: FlowNode & { type: 'parallel' }): Promise<void> {
    const edges = this.flow.edges.filter(e => e.source === node.id);
    const promises = edges.map(edge => this.executeNode(edge.target));
    await Promise.all(promises);
  }

  private async executeMapNode(node: FlowNode & { type: 'map' }): Promise<void> {
    const inputData = this.context.flowVars[node.data.inputVar];

    try {
      const func = new Function('input', 'flowVars', node.data.transformScript);
      const result = func(inputData, this.context.flowVars);
      this.context.flowVars[node.data.outputVar] = result;
      this.callbacks.onContextUpdate(this.context);
    } catch (error) {
      throw new Error(`Map script error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeScriptNode(node: FlowNode & { type: 'script' }): Promise<void> {
    try {
      const func = new Function('flowVars', 'setVar', 'getVar', 'console', node.data.script);
      func(
        this.context.flowVars,
        (key: string, value: any) => {
          this.context.flowVars[key] = value;
        },
        (key: string) => this.context.flowVars[key],
        {
          log: (...args: any[]) => this.callbacks.onLog('info', args.join(' ')),
          error: (...args: any[]) => this.callbacks.onLog('error', args.join(' ')),
          warn: (...args: any[]) => this.callbacks.onLog('warn', args.join(' ')),
        }
      );
      this.callbacks.onContextUpdate(this.context);
    } catch (error) {
      throw new Error(`Script error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }

  private async executeErrorHandlerNode(node: FlowNode & { type: 'errorHandler' }): Promise<void> {
    const nextEdge = this.flow.edges.find(e => e.source === node.id);
    if (nextEdge) {
      await this.executeNode(nextEdge.target);
    }
  }
}
