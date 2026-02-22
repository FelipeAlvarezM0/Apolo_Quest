import type { HttpRequest, HttpResponse, AuthConfig, HeaderKV, QueryParamKV } from '../models';

export interface ExecuteOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class HttpClient {
  private abortController: AbortController | null = null;

  async execute(request: HttpRequest, options: ExecuteOptions = {}): Promise<HttpResponse> {
    const startTime = performance.now();

    this.abortController = new AbortController();
    const { timeoutMs = 30000 } = options;

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeoutMs);

    try {
      const url = this.buildUrl(request.url, request.queryParams, request.auth);
      const { body, headers: bodyHeaders } = this.buildBody(request);
      const headers = {
        ...this.buildHeaders(request.headers, request.auth, request.body.type),
        ...bodyHeaders,
      };

      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
        signal: this.abortController.signal,
      };

      if (body !== null && request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = body;
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      const responseHeaders = this.extractHeaders(response.headers);
      const responseText = await response.text();
      const sizeBytes = new Blob([responseText]).size;

      let bodyType: 'json' | 'text' = 'text';
      const parsedBody = responseText;

      try {
        JSON.parse(responseText);
        bodyType = 'json';
      } catch {
        bodyType = 'text';
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: parsedBody,
        bodyType,
        timeMs,
        sizeBytes,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      let errorMessage = 'Network error';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request cancelled';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: '',
        bodyType: 'text',
        timeMs,
        sizeBytes: 0,
        error: errorMessage,
      };
    } finally {
      this.abortController = null;
    }
  }

  abort(): void {
    this.abortController?.abort();
  }

  private buildUrl(baseUrl: string, queryParams: QueryParamKV[], auth?: AuthConfig): string {
    const url = new URL(baseUrl);

    queryParams
      .filter(p => p.enabled && p.key)
      .forEach(param => {
        url.searchParams.append(param.key, param.value);
      });

    if (auth?.type === 'apiKey' && auth.apiKeys) {
      auth.apiKeys
        .filter(k => k.enabled && k.location === 'query')
        .forEach(k => {
          url.searchParams.append(k.key, k.value);
        });
    }

    return url.toString();
  }

  private buildHeaders(
    headers: HeaderKV[],
    auth: AuthConfig,
    bodyType: string
  ): Record<string, string> {
    const result: Record<string, string> = {};

    headers
      .filter(h => h.enabled && h.key)
      .forEach(h => {
        result[h.key] = h.value;
      });

    if (auth.type === 'bearer' && auth.token) {
      result['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth.type === 'basic' && auth.username && auth.password) {
      const encoded = btoa(`${auth.username}:${auth.password}`);
      result['Authorization'] = `Basic ${encoded}`;
    } else if (auth.type === 'digest' && auth.username && auth.password) {
      const encoded = btoa(`${auth.username}:${auth.password}`);
      result['Authorization'] = `Basic ${encoded}`;
    } else if (auth.type === 'oauth2' && auth.oauth2AccessToken) {
      result['Authorization'] = `Bearer ${auth.oauth2AccessToken}`;
    } else if (auth.type === 'apiKey' && auth.apiKeys) {
      auth.apiKeys
        .filter(k => k.enabled && k.location === 'header')
        .forEach(k => {
          result[k.key] = k.value;
        });
    }

    if (bodyType === 'raw' && !result['Content-Type']) {
      result['Content-Type'] = 'application/json';
    } else if (bodyType === 'x-www-form-urlencoded' && !result['Content-Type']) {
      result['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return result;
  }

  private buildBody(request: HttpRequest): { body: string | FormData | null; headers: Record<string, string> } {
    const headers: Record<string, string> = {};

    if (request.body.type === 'none') {
      return { body: null, headers };
    }

    if (request.body.type === 'raw') {
      const contentTypes: Record<string, string> = {
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        text: 'text/plain',
        javascript: 'application/javascript',
        graphql: 'application/graphql',
        yaml: 'application/x-yaml',
      };
      const rawType = request.body.rawType || 'json';
      headers['Content-Type'] = contentTypes[rawType];
      return { body: request.body.content, headers };
    }

    if (request.body.type === 'x-www-form-urlencoded') {
      const formData = request.body.formData || [];
      const params = new URLSearchParams();
      formData
        .filter(item => item.enabled && item.key)
        .forEach(item => {
          params.append(item.key, item.value);
        });
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return { body: params.toString(), headers };
    }

    if (request.body.type === 'form-data') {
      const formData = new FormData();
      (request.body.formData || [])
        .filter(item => item.enabled && item.key)
        .forEach(item => {
          if (item.type === 'file' && item.fileContent && item.fileName) {
            const base64 = item.fileContent.split(',')[1];
            const bytes = atob(base64);
            const arrayBuffer = new ArrayBuffer(bytes.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < bytes.length; i++) {
              uint8Array[i] = bytes.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: item.fileMimeType || 'application/octet-stream' });
            formData.append(item.key, blob, item.fileName);
          } else {
            formData.append(item.key, item.value);
          }
        });
      return { body: formData, headers };
    }

    if (request.body.type === 'binary' && request.body.binaryContent) {
      const base64 = request.body.binaryContent.split(',')[1];
      const bytes = atob(base64);
      headers['Content-Type'] = request.body.binaryMimeType || 'application/octet-stream';
      return { body: bytes, headers };
    }

    return { body: null, headers };
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

export const httpClient = new HttpClient();
