import { useEffect, useState } from 'react';
import { useFlowsStore } from '../store/useFlowsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Plus, Trash2, Copy, Download, Upload, Play } from 'lucide-react';
import { formatTimestamp } from '../../../shared/utils/format';

interface FlowListPageProps {
  onNavigateToEditor: (flowId: string) => void;
}

export function FlowListPage({ onNavigateToEditor }: FlowListPageProps) {
  const { flows, loadFlows, createFlow, deleteFlow, duplicateFlow, importFlow, exportFlow } = useFlowsStore();
  const { addToast } = useToastStore();
  const [newFlowName, setNewFlowName] = useState('');
  const [showNewFlowInput, setShowNewFlowInput] = useState(false);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      addToast('error', 'Flow name is required');
      return;
    }

    const flow = await createFlow(newFlowName.trim());
    if (flow) {
      addToast('success', `Flow "${flow.name}" created`);
      setNewFlowName('');
      setShowNewFlowInput(false);
      onNavigateToEditor(flow.id);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete flow "${name}"?`)) return;

    await deleteFlow(id);
    addToast('success', `Flow "${name}" deleted`);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateFlow(id);
    addToast('success', 'Flow duplicated');
  };

  const handleExport = async (id: string, name: string) => {
    const result = await exportFlow(id);
    if (result.success && result.json) {
      const blob = new Blob([result.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.flow.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Flow exported');
    } else {
      addToast('error', result.error || 'Export failed');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const result = await importFlow(text);
      if (result.success) {
        addToast('success', 'Flow imported');
      } else {
        addToast('error', result.error || 'Import failed');
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col bg-bg-panel">
      <div className="p-md border-b border-border-subtle">
        <div className="flex items-center justify-between gap-md">
          <div>
            <h2 className="text-lg font-semibold">Flows</h2>
            <p className="text-sm text-text-muted mt-0.5">
              Visual automation workflows
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImport}
              className="flex items-center gap-1.5"
            >
              <Upload size={16} />
              Import
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewFlowInput(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={16} />
              New Flow
            </Button>
          </div>
        </div>

        {showNewFlowInput && (
          <div className="mt-md flex items-center gap-sm">
            <Input
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Flow name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFlow();
                if (e.key === 'Escape') {
                  setShowNewFlowInput(false);
                  setNewFlowName('');
                }
              }}
              className="flex-1"
            />
            <Button variant="primary" size="sm" onClick={handleCreateFlow}>
              Create
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowNewFlowInput(false);
                setNewFlowName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-md">
        {flows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <p className="text-text-muted mb-md">No flows yet</p>
              <p className="text-sm text-text-muted mb-lg">
                Create your first flow to automate API workflows
              </p>
              <Button
                variant="primary"
                onClick={() => setShowNewFlowInput(true)}
                className="flex items-center gap-1.5 mx-auto"
              >
                <Plus size={16} />
                Create First Flow
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-md grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-bg-elevated border border-border-subtle rounded-lg p-md hover-lift card-shadow"
              >
                <div className="flex items-start justify-between gap-sm mb-sm">
                  <h3 className="font-semibold text-text-primary truncate flex-1">
                    {flow.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onNavigateToEditor(flow.id)}
                      className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
                      title="Open flow"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(flow.id)}
                      className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleExport(flow.id, flow.name)}
                      className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
                      title="Export"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(flow.id, flow.name)}
                      className="p-1.5 text-text-secondary hover:text-status-error hover:bg-bg-hover rounded transition-all duration-fast"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {flow.description && (
                  <p className="text-sm text-text-muted mb-sm line-clamp-2">
                    {flow.description}
                  </p>
                )}

                <div className="flex items-center gap-md text-xs text-text-muted">
                  <span>{flow.nodes.length} nodes</span>
                  <span>•</span>
                  <span>{flow.edges.length} edges</span>
                  <span>•</span>
                  <span>{formatTimestamp(flow.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
