import type { Collection, HttpRequest } from '../../../shared/models';
import { generateId } from '../../../shared/utils/id';

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header?: Array<{ key: string; value: string; disabled?: boolean }>;
    url: string | PostmanUrl;
    body?: {
      mode: string;
      raw?: string;
      urlencoded?: Array<{ key: string; value: string }>;
    };
    auth?: {
      type: string;
      bearer?: Array<{ key: string; value: string }>;
      basic?: Array<{ key: string; value: string }>;
    };
  };
}

interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: Array<{ key: string; value: string; disabled?: boolean }>;
}

export function convertPostmanToCollection(postmanData: any): Collection {
  const postman = postmanData as PostmanCollection;

  if (!postman.info || !postman.item) {
    throw new Error('Invalid Postman collection format');
  }

  const requests: HttpRequest[] = postman.item.map((item) => convertPostmanItem(item));

  return {
    id: generateId(),
    name: postman.info.name || 'Imported Collection',
    description: postman.info.description || '',
    requests,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function convertPostmanItem(item: PostmanItem): HttpRequest {
  const request = item.request;

  const url = typeof request.url === 'string' ? request.url : request.url.raw;

  const headers = (request.header || []).map((h) => ({
    id: generateId(),
    key: h.key,
    value: h.value,
    enabled: !h.disabled,
  }));

  let queryParams: any[] = [];
  if (typeof request.url !== 'string' && request.url.query) {
    queryParams = request.url.query.map((q) => ({
      id: generateId(),
      key: q.key,
      value: q.value,
      enabled: !q.disabled,
    }));
  }

  let bodyType: 'json' | 'text' | 'none' = 'none';
  let bodyContent = '';

  if (request.body) {
    if (request.body.mode === 'raw') {
      bodyContent = request.body.raw || '';
      try {
        JSON.parse(bodyContent);
        bodyType = 'json';
      } catch {
        bodyType = 'text';
      }
    } else if (request.body.mode === 'urlencoded') {
      bodyType = 'text';
      bodyContent = request.body.urlencoded
        ?.map((param) => `${param.key}=${param.value}`)
        .join('&') || '';
    }
  }

  let auth: any = { type: 'none' };
  if (request.auth) {
    if (request.auth.type === 'bearer') {
      const tokenObj = request.auth.bearer?.find((b) => b.key === 'token');
      auth = {
        type: 'bearer',
        token: tokenObj?.value || '',
      };
    } else if (request.auth.type === 'basic') {
      const username = request.auth.basic?.find((b) => b.key === 'username')?.value || '';
      const password = request.auth.basic?.find((b) => b.key === 'password')?.value || '';
      auth = {
        type: 'basic',
        username,
        password,
      };
    }
  }

  return {
    id: generateId(),
    name: item.name,
    method: request.method as any,
    url,
    queryParams,
    headers,
    auth,
    body: {
      type: bodyType,
      content: bodyContent,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
