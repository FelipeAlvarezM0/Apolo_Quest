import { Play, Square, SendHorizontal, Filter, Split, Edit, Clock, FileText } from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: any;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'request',
    label: 'Request',
    icon: SendHorizontal,
    description: 'Execute HTTP request',
  },
  {
    type: 'extract',
    label: 'Extract',
    icon: Filter,
    description: 'Extract data from response',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: Split,
    description: 'Conditional branching',
  },
  {
    type: 'setVar',
    label: 'Set Variable',
    icon: Edit,
    description: 'Set flow variable',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait for specified time',
  },
  {
    type: 'log',
    label: 'Log',
    icon: FileText,
    description: 'Log message',
  },
];

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-48 border-r border-border-subtle bg-bg-sidebar p-sm flex flex-col">
      <div className="mb-md">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-sm py-1">
          Nodes
        </h3>
      </div>

      <div className="flex flex-col gap-1">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <button
              key={nodeType.type}
              onClick={() => onAddNode(nodeType.type)}
              className="flex items-start gap-2 px-sm py-2 rounded text-left hover:bg-bg-hover transition-all duration-fast group"
              title={nodeType.description}
            >
              <Icon size={18} className="flex-shrink-0 mt-0.5 text-text-secondary group-hover:text-text-primary transition-colors" />
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

      <div className="mt-auto pt-md border-t border-border-subtle">
        <div className="text-xs text-text-muted px-sm">
          <p className="mb-1">Drag nodes to canvas</p>
          <p>Connect to build flow</p>
        </div>
      </div>
    </div>
  );
}
