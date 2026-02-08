import { z } from 'zod';

const xySchema = z.object({
  x: z.number(),
  y: z.number(),
});

const startNodeSchema = z.object({
  id: z.string(),
  type: z.literal('start'),
  position: xySchema,
});

const endNodeSchema = z.object({
  id: z.string(),
  type: z.literal('end'),
  position: xySchema,
});

const requestNodeSchema = z.object({
  id: z.string(),
  type: z.literal('request'),
  position: xySchema,
  data: z.object({
    requestRef: z.union([
      z.object({
        kind: z.literal('collectionRequest'),
        collectionId: z.string(),
        requestId: z.string(),
      }),
      z.object({
        kind: z.literal('adhoc'),
        request: z.any(),
      }),
    ]),
    name: z.string().optional(),
    overrideEnvId: z.string().optional(),
    saveResponseAs: z.string().optional(),
  }),
});

const extractNodeSchema = z.object({
  id: z.string(),
  type: z.literal('extract'),
  position: xySchema,
  data: z.object({
    from: z.enum(['lastResponseBody', 'flowVar']),
    flowVarName: z.string().optional(),
    jsonPath: z.string(),
    toFlowVar: z.string(),
  }),
});

const conditionNodeSchema = z.object({
  id: z.string(),
  type: z.literal('condition'),
  position: xySchema,
  data: z.object({
    left: z.object({
      kind: z.enum(['flowVar', 'lastStatus', 'lastResponseBodyPath']),
      value: z.string(),
    }),
    op: z.enum(['equals', 'notEquals', 'contains', 'gt', 'lt']),
    right: z.object({
      kind: z.enum(['literal', 'flowVar']),
      value: z.string(),
    }),
  }),
});

const setVarNodeSchema = z.object({
  id: z.string(),
  type: z.literal('setVar'),
  position: xySchema,
  data: z.object({
    key: z.string(),
    valueTemplate: z.string(),
  }),
});

const delayNodeSchema = z.object({
  id: z.string(),
  type: z.literal('delay'),
  position: xySchema,
  data: z.object({
    ms: z.number(),
  }),
});

const logNodeSchema = z.object({
  id: z.string(),
  type: z.literal('log'),
  position: xySchema,
  data: z.object({
    messageTemplate: z.string(),
  }),
});

const flowNodeSchema = z.union([
  startNodeSchema,
  endNodeSchema,
  requestNodeSchema,
  extractNodeSchema,
  conditionNodeSchema,
  setVarNodeSchema,
  delayNodeSchema,
  logNodeSchema,
]);

const flowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

export const flowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  variables: z.record(z.string()),
  environmentId: z.string().optional(),
  version: z.number(),
});

export const validateFlow = (data: unknown) => {
  try {
    return { success: true, data: flowSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};
