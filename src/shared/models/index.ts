export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey' | 'oauth2' | 'digest';

export type BodyType = 'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded' | 'binary';

export type RawBodyType = 'json' | 'xml' | 'html' | 'text' | 'javascript' | 'graphql' | 'yaml';

export type ApiKeyLocation = 'header' | 'query' | 'cookie';

export interface HeaderKV {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParamKV {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiKeyItem {
  id: string;
  key: string;
  value: string;
  location: ApiKeyLocation;
  enabled: boolean;
}

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKeys?: ApiKeyItem[];
  oauth2AccessToken?: string;
  oauth2RefreshToken?: string;
  oauth2Scope?: string;
}

export interface FormDataItem {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  fileName?: string;
  fileContent?: string;
  fileMimeType?: string;
  enabled: boolean;
}

export interface RequestBody {
  type: BodyType;
  content: string;
  rawType?: RawBodyType;
  formData?: FormDataItem[];
  binaryFileName?: string;
  binaryContent?: string;
  binaryMimeType?: string;
}

export interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: QueryParamKV[];
  headers: HeaderKV[];
  auth: AuthConfig;
  body: RequestBody;
  preRequestScript?: string;
  postRequestScript?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyType: 'json' | 'text';
  timeMs: number;
  sizeBytes: number;
  error?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: HttpRequest[];
  environmentId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  id: string;
  request: HttpRequest;
  response: HttpResponse;
  timestamp: number;
  environmentId?: string | null;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  createdAt: number;
  updatedAt: number;
}

export interface RunnerResult {
  requestId: string;
  requestName: string;
  status: 'success' | 'error';
  response?: HttpResponse;
  error?: string;
  timeMs: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  timeoutMs: number;
  prettyJson: boolean;
}
