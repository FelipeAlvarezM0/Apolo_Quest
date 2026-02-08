import type { HttpRequest, HttpResponse, Environment } from '../models';
import { httpClient } from './HttpClient';
import { executeScript } from './scriptExecutor';

const environmentCache: Map<string, string> = new Map();

export function replaceVariables(text: string, environment: Environment | null): string {
  if (!environment) return text;

  let result = text;

  environment.variables
    .filter(v => v.enabled)
    .forEach(variable => {
      const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g');
      result = result.replace(regex, variable.value);
    });

  return result;
}

export function applyEnvironment(request: HttpRequest, environment: Environment | null): HttpRequest {
  if (!environment) return request;

  return {
    ...request,
    url: replaceVariables(request.url, environment),
    queryParams: request.queryParams.map(qp => ({
      ...qp,
      key: replaceVariables(qp.key, environment),
      value: replaceVariables(qp.value, environment),
    })),
    headers: request.headers.map(h => ({
      ...h,
      key: replaceVariables(h.key, environment),
      value: replaceVariables(h.value, environment),
    })),
    body: {
      ...request.body,
      content: replaceVariables(request.body.content, environment),
    },
    auth: {
      ...request.auth,
      token: request.auth.token ? replaceVariables(request.auth.token, environment) : undefined,
      username: request.auth.username ? replaceVariables(request.auth.username, environment) : undefined,
      password: request.auth.password ? replaceVariables(request.auth.password, environment) : undefined,
    },
  };
}

export async function executeRequest(
  request: HttpRequest,
  environment: Environment | null,
  timeoutMs?: number
): Promise<HttpResponse> {
  environmentCache.clear();

  const setEnv = (key: string, value: string) => {
    environmentCache.set(key, value);
  };

  const getEnv = (key: string): string | undefined => {
    if (environmentCache.has(key)) {
      return environmentCache.get(key);
    }
    return environment?.variables.find(v => v.key === key && v.enabled)?.value;
  };

  if (request.preRequestScript) {
    executeScript(request.preRequestScript, {
      request,
      environment,
      setEnv,
      getEnv,
      console: {
        log: (...args) => console.log('[Pre-Request]', ...args),
        error: (...args) => console.error('[Pre-Request]', ...args),
        warn: (...args) => console.warn('[Pre-Request]', ...args),
        info: (...args) => console.info('[Pre-Request]', ...args),
      },
    });
  }

  const processedRequest = applyEnvironment(request, environment);
  const response = await httpClient.execute(processedRequest, { timeoutMs });

  if (request.postRequestScript) {
    executeScript(request.postRequestScript, {
      request,
      environment,
      response,
      setEnv,
      getEnv,
      console: {
        log: (...args) => console.log('[Post-Request]', ...args),
        error: (...args) => console.error('[Post-Request]', ...args),
        warn: (...args) => console.warn('[Post-Request]', ...args),
        info: (...args) => console.info('[Post-Request]', ...args),
      },
    });
  }

  return response;
}

export function cancelRequest(): void {
  httpClient.abort();
}
