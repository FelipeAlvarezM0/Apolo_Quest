import { z } from 'zod';
import { HttpRequestSchema } from '../../../shared/validation/schemas';

const xySchema = z.object({
  x: z.number(),
  y: z.number(),
});

const flowVariableSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
    description: z.string().optional(),
  }),
]);

const startNodeSchema = z.object({
  id: z.string(),
  type: z.literal('start'),
  position: xySchema,
  label: z.string().optional(),
});

const endNodeSchema = z.object({
  id: z.string(),
  type: z.literal('end'),
  position: xySchema,
  label: z.string().optional(),
});

const requestNodeSchema = z.object({
  id: z.string(),
  type: z.literal('request'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    requestRef: z.union([
      z.object({
        kind: z.literal('collectionRequest'),
        collectionId: z.string(),
        requestId: z.string(),
      }),
      z.object({
        kind: z.literal('adhoc'),
        request: HttpRequestSchema,
      }),
    ]),
    name: z.string().optional(),
    overrideEnvId: z.string().optional(),
    saveResponseAs: z.string().optional(),
    preRequestScript: z.string().optional(),
    postRequestScript: z.string().optional(),
  }),
});

const extractNodeSchema = z.object({
  id: z.string(),
  type: z.literal('extract'),
  position: xySchema,
  label: z.string().optional(),
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
  label: z.string().optional(),
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
  label: z.string().optional(),
  data: z.object({
    key: z.string(),
    valueTemplate: z.string(),
  }),
});

const delayNodeSchema = z.object({
  id: z.string(),
  type: z.literal('delay'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    ms: z.number(),
  }),
});

const logNodeSchema = z.object({
  id: z.string(),
  type: z.literal('log'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    messageTemplate: z.string(),
  }),
});

const loopNodeSchema = z.object({
  id: z.string(),
  type: z.literal('loop'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    arrayVar: z.string(),
    itemVar: z.string(),
    indexVar: z.string().optional(),
  }),
});

const parallelNodeSchema = z.object({
  id: z.string(),
  type: z.literal('parallel'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    branches: z.number(),
  }),
});

const mapNodeSchema = z.object({
  id: z.string(),
  type: z.literal('map'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    inputVar: z.string(),
    outputVar: z.string(),
    transformScript: z.string(),
  }),
});

const scriptNodeSchema = z.object({
  id: z.string(),
  type: z.literal('script'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    script: z.string(),
  }),
});

const errorHandlerNodeSchema = z.object({
  id: z.string(),
  type: z.literal('errorHandler'),
  position: xySchema,
  label: z.string().optional(),
  data: z.object({
    errorVar: z.string().optional(),
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
  loopNodeSchema,
  parallelNodeSchema,
  mapNodeSchema,
  scriptNodeSchema,
  errorHandlerNodeSchema,
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
  variables: z.record(z.string(), flowVariableSchema),
  environmentId: z.string().optional(),
  version: z.number(),
  tags: z.array(z.string()).optional(),
});

export const validateFlow = (data: unknown) => {
  try {
    return { success: true, data: flowSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};
