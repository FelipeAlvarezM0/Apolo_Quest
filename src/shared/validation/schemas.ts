import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

export const AuthTypeSchema = z.enum(['none', 'bearer', 'basic', 'apiKey', 'oauth2', 'digest']);

export const BodyTypeSchema = z.enum(['none', 'raw', 'form-data', 'x-www-form-urlencoded', 'binary']);

export const RawBodyTypeSchema = z.enum(['json', 'xml', 'html', 'text', 'javascript', 'graphql', 'yaml']);

export const ApiKeyLocationSchema = z.enum(['header', 'query', 'cookie']);

export const HeaderKVSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

export const QueryParamKVSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

export const ApiKeyItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  location: ApiKeyLocationSchema,
  enabled: z.boolean(),
});

export const AuthConfigSchema = z.object({
  type: AuthTypeSchema,
  token: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKeys: z.array(ApiKeyItemSchema).optional(),
  oauth2AccessToken: z.string().optional(),
  oauth2RefreshToken: z.string().optional(),
  oauth2Scope: z.string().optional(),
});

export const FormDataItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  type: z.enum(['text', 'file']),
  fileName: z.string().optional(),
  fileContent: z.string().optional(),
  fileMimeType: z.string().optional(),
  enabled: z.boolean(),
});

export const RequestBodySchema = z.object({
  type: BodyTypeSchema,
  content: z.string(),
  rawType: RawBodyTypeSchema.optional(),
  formData: z.array(FormDataItemSchema).optional(),
  binaryFileName: z.string().optional(),
  binaryContent: z.string().optional(),
  binaryMimeType: z.string().optional(),
});

export const HttpRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  method: HttpMethodSchema,
  url: z.string(),
  queryParams: z.array(QueryParamKVSchema),
  headers: z.array(HeaderKVSchema),
  auth: AuthConfigSchema,
  body: RequestBodySchema,
  preRequestScript: z.string().optional(),
  postRequestScript: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const HttpResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string(),
  bodyType: z.enum(['json', 'text']),
  timeMs: z.number(),
  sizeBytes: z.number(),
  error: z.string().optional(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  requests: z.array(HttpRequestSchema),
  environmentId: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const HistoryEntrySchema = z.object({
  id: z.string(),
  request: HttpRequestSchema,
  response: HttpResponseSchema,
  timestamp: z.number(),
  environmentId: z.string().nullable().optional(),
});

export const EnvironmentVariableSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

export const EnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  variables: z.array(EnvironmentVariableSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const RunnerResultSchema = z.object({
  requestId: z.string(),
  requestName: z.string(),
  status: z.enum(['success', 'error']),
  response: HttpResponseSchema.optional(),
  error: z.string().optional(),
  timeMs: z.number(),
});

export const SettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  timeoutMs: z.number(),
  prettyJson: z.boolean(),
});
