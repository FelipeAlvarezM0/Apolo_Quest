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
    if (processedRequest.body.type === 'json' && processedRequest.body.content) {
      curl += `${separator}-H "Content-Type: application/json"`;
      const escapedBody = processedRequest.body.content.replace(/"/g, '\\"').replace(/\n/g, '');
      curl += `${separator}-d "${escapedBody}"`;
    } else if (processedRequest.body.type === 'text' && processedRequest.body.content) {
      const escapedBody = processedRequest.body.content.replace(/"/g, '\\"');
      curl += `${separator}-d "${escapedBody}"`;
    }
  }

  return curl;
}
