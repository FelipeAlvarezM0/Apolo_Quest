import type { ExecutionContext } from '../models/flow';

export function resolveTemplate(
  template: string,
  context: ExecutionContext,
  envVars: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, varName) => {
    const key = varName.trim();

    if (context.flowVars.hasOwnProperty(key)) {
      return String(context.flowVars[key]);
    }

    if (envVars.hasOwnProperty(key)) {
      return envVars[key];
    }

    return `{{${key}}}`;
  });
}

export function extractJsonPath(obj: any, path: string): any {
  if (!path) return obj;

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }

  return result;
}

export function evaluateCondition(
  left: any,
  op: 'equals' | 'notEquals' | 'contains' | 'gt' | 'lt',
  right: any
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
