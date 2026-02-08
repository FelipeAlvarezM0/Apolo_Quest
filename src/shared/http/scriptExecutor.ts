import type { HttpRequest, HttpResponse, Environment } from '../models';

export interface ScriptContext {
  request: HttpRequest;
  environment: Environment | null;
  response?: HttpResponse;
  setEnv: (key: string, value: string) => void;
  getEnv: (key: string) => string | undefined;
  console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };
}

export function executeScript(
  script: string,
  context: ScriptContext
): { success: boolean; error?: string } {
  if (!script || script.trim() === '') {
    return { success: true };
  }

  try {
    const wrappedScript = `
      (function() {
        ${script}
      })();
    `;

    const func = new Function(
      'request',
      'environment',
      'response',
      'setEnv',
      'getEnv',
      'console',
      wrappedScript
    );

    func(
      context.request,
      context.environment,
      context.response,
      context.setEnv,
      context.getEnv,
      context.console
    );

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Script execution error:', message);
    return { success: false, error: message };
  }
}
