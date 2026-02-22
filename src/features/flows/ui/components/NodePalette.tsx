import { SendHorizontal, Filter, Split, Edit, Clock, FileText, Repeat, Layers, MapPin, Code, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  category: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'request',
    label: 'Request',
    icon: SendHorizontal,
    description: 'Execute HTTP request',
    category: 'Basic',
  },
  {
    type: 'extract',
    label: 'Extract',
    icon: Filter,
    description: 'Extract data from response',
    category: 'Basic',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: Split,
    description: 'Conditional branching',
    category: 'Basic',
  },
  {
    type: 'setVar',
    label: 'Set Variable',
    icon: Edit,
    description: 'Set flow variable',
    category: 'Basic',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait for specified time',
    category: 'Basic',
  },
  {
    type: 'log',
    label: 'Log',
    icon: FileText,
    description: 'Log message',
    category: 'Basic',
  },
  {
    type: 'loop',
    label: 'Loop',
    icon: Repeat,
    description: 'Iterate over array',
    category: 'Advanced',
  },
  {
    type: 'parallel',
    label: 'Parallel',
    icon: Layers,
    description: 'Execute branches in parallel',
    category: 'Advanced',
  },
  {
    type: 'map',
    label: 'Map',
    icon: MapPin,
    description: 'Transform data',
    category: 'Advanced',
  },
  {
    type: 'script',
    label: 'Script',
    icon: Code,
    description: 'Execute JavaScript',
    category: 'Advanced',
  },
  {
    type: 'errorHandler',
    label: 'Error Handler',
    icon: AlertTriangle,
    description: 'Handle errors',
    category: 'Advanced',
  },
];

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const categories = Array.from(new Set(nodeTypes.map((n) => n.category)));

  return (
    <div className="w-52 border-r border-border-subtle bg-bg-sidebar p-sm flex flex-col overflow-y-auto">
      <div className="mb-md">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-sm py-1">
          Nodes
        </h3>
      </div>

      {categories.map((category, idx) => (
        <div key={category} className="mb-md">
          {idx > 0 && <div className="h-px bg-border-subtle mb-md" />}
          <div className="text-xs font-medium text-text-secondary px-sm mb-1">
            {category}
          </div>
          <div className="flex flex-col gap-1">
            {nodeTypes
              .filter((n) => n.category === category)
              .map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => onAddNode(nodeType.type)}
                    className="flex items-start gap-2 px-sm py-2 rounded text-left hover:bg-bg-hover transition-all duration-fast group"
                    title={nodeType.description}
                  >
                    <Icon size={16} className="flex-shrink-0 mt-0.5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {nodeType.label}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {nodeType.description}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <div className="mt-auto pt-md border-t border-border-subtle">
        <div className="text-xs text-text-muted px-sm">
          <p className="mb-1">Click to add node</p>
          <p>Connect to build flow</p>
        </div>
      </div>
    </div>
  );
}
