import type { ExecutionContext } from '../models/flow';

export function resolveTemplate(
  template: string,
  context: ExecutionContext,
  envVars: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, varName) => {
    const key = varName.trim();

    if (Object.prototype.hasOwnProperty.call(context.flowVars, key)) {
      return String(context.flowVars[key]);
    }

    if (Object.prototype.hasOwnProperty.call(envVars, key)) {
      return envVars[key];
    }

    return `{{${key}}}`;
  });
}

export function extractJsonPath(obj: unknown, path: string): unknown {
  if (!path) return obj;

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    if (Array.isArray(result)) {
      const index = Number(key);
      if (Number.isNaN(index)) {
        return undefined;
      }
      result = result[index];
      continue;
    }

    if (typeof result !== 'object') {
      return undefined;
    }

    result = (result as Record<string, unknown>)[key];
  }

  return result;
}

export function evaluateCondition(
  left: unknown,
  op: 'equals' | 'notEquals' | 'contains' | 'gt' | 'lt',
  right: unknown
): boolean {
  switch (op) {
    case 'equals':
      return left == right;
    case 'notEquals':
      return left != right;
    case 'contains':
      return String(left).includes(String(right));
    case 'gt':
      return Number(left) > Number(right);
    case 'lt':
      return Number(left) < Number(right);
    default:
      return false;
  }
}
