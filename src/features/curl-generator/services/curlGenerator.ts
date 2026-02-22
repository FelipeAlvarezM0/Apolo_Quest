import type { HttpRequest, Environment } from '../../../shared/models';
import { applyEnvironment } from '../../../shared/http/requestExecutor';

interface CurlOptions {
  includeHeaders?: boolean;
  includeBody?: boolean;
  multiline?: boolean;
}

export function generateCurl(
  request: HttpRequest,
  environment: Environment | null,
  options: CurlOptions = {}
): string {
  const { includeHeaders = true, includeBody = true, multiline = true } = options;
  const processedRequest = applyEnvironment(request, environment);

  const separator = multiline ? ' \\\n  ' : ' ';
  let curl = `curl -X ${processedRequest.method}`;

  const enabledQueryParams = processedRequest.queryParams.filter(qp => qp.enabled && qp.key);
  let url = processedRequest.url;

  if (enabledQueryParams.length > 0) {
    const queryString = enabledQueryParams
      .map(qp => `${encodeURIComponent(qp.key)}=${encodeURIComponent(qp.value)}`)
      .join('&');
    url = `${url}?${queryString}`;
  }

  curl += ` "${url}"`;

  if (includeHeaders) {
    const enabledHeaders = processedRequest.headers.filter(h => h.enabled && h.key);
    enabledHeaders.forEach(header => {
      curl += `${separator}-H "${header.key}: ${header.value}"`;
    });

    if (processedRequest.auth.type === 'bearer' && processedRequest.auth.token) {
      curl += `${separator}-H "Authorization: Bearer ${processedRequest.auth.token}"`;
    } else if (processedRequest.auth.type === 'basic' && processedRequest.auth.username && processedRequest.auth.password) {
      const encoded = btoa(`${processedRequest.auth.username}:${processedRequest.auth.password}`);
      curl += `${separator}-H "Authorization: Basic ${encoded}"`;
    }
  }

  if (includeBody) {
    if (processedRequest.body.type === 'raw' && processedRequest.body.content) {
      const contentTypeByRawType: Record<string, string> = {
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        text: 'text/plain',
        javascript: 'application/javascript',
        graphql: 'application/graphql',
        yaml: 'application/x-yaml',
      };
      const rawType = processedRequest.body.rawType || 'json';
      const contentType = contentTypeByRawType[rawType] || 'text/plain';
      curl += `${separator}-H "Content-Type: ${contentType}"`;
      const escapedBody = processedRequest.body.content.replace(/"/g, '\\"');
      curl += `${separator}-d "${escapedBody}"`;
    } else if (processedRequest.body.type === 'x-www-form-urlencoded') {
      const encodedBody = (processedRequest.body.formData || [])
        .filter(item => item.enabled && item.key)
        .map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
        .join('&');

      if (encodedBody) {
        curl += `${separator}-H "Content-Type: application/x-www-form-urlencoded"`;
        curl += `${separator}-d "${encodedBody}"`;
      }
    }
  }

  return curl;
}
