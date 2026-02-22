import { useEffect, useState } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Globe, Plus, Trash2, Edit2, Copy, Check, X, Search, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

export function Environments() {
  const {
    environments,
    loadEnvironments,
    createEnvironment,
    deleteEnvironment,
    renameEnvironment,
    duplicateEnvironment,
    reorderEnvironments,
    addVariable,
    duplicateVariable,
    updateVariable,
    removeVariable,
    reorderVariables,
  } = useEnvironmentStore();
  const { success } = useToastStore();

  const [showNewEnvironment, setShowNewEnvironment] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [expandedEnvId, setExpandedEnvId] = useState<string | null>(null);
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editingEnvName, setEditingEnvName] = useState('');
  const [variableSearchTerm, setVariableSearchTerm] = useState('');

  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  const handleCreateEnvironment = async () => {
    if (!newEnvironmentName.trim()) return;
    await createEnvironment(newEnvironmentName);
    setNewEnvironmentName('');
    setShowNewEnvironment(false);
    success('Environment created');
  };

  const handleDeleteEnvironment = async (id: string, name: string) => {
    await deleteEnvironment(id);
    success(`Environment "${name}" deleted`);
  };

  const handleAddVariable = async (envId: string) => {
    await addVariable(envId);
    success('Variable added');
  };

  const handleRemoveVariable = async (envId: string, varId: string) => {
    await removeVariable(envId, varId);
    success('Variable removed');
  };

  const handleDuplicateVariable = async (envId: string, varId: string) => {
    await duplicateVariable(envId, varId);
    success('Variable duplicated');
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingEnvId(id);
    setEditingEnvName(currentName);
  };

  const handleCancelRename = () => {
    setEditingEnvId(null);
    setEditingEnvName('');
  };

  const handleSaveRename = async (id: string) => {
    if (!editingEnvName.trim()) return;
    await renameEnvironment(id, editingEnvName);
    setEditingEnvId(null);
    setEditingEnvName('');
    success('Environment renamed');
  };

  const handleDuplicateEnvironment = async (id: string, name: string) => {
    await duplicateEnvironment(id);
    success(`Environment "${name}" duplicated`);
  };

  const handleMoveEnvironment = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    await reorderEnvironments(index, newIndex);
  };

  const handleMoveVariable = async (envId: string, index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    await reorderVariables(envId, index, newIndex);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">Environments</h2>
        <Button
          onClick={() => setShowNewEnvironment(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Environment
        </Button>
      </div>

      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded text-blue-300 text-sm">
        <p className="font-medium mb-1">Use variables in your requests:</p>
        <p className="text-blue-400">Example: {"{{baseUrl}}"}/users or Bearer {"{{token}}"}</p>
      </div>

      {showNewEnvironment && (
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded">
          <Input
            value={newEnvironmentName}
            onChange={(e) => setNewEnvironmentName(e.target.value)}
            placeholder="Environment name (e.g., Production)"
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateEnvironment} size="sm">Create</Button>
            <Button onClick={() => setShowNewEnvironment(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {environments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Globe size={48} className="mb-3 opacity-50" />
          <p>No environments yet</p>
          <p className="text-sm">Create one to manage variables</p>
        </div>
      ) : (
        <div className="space-y-4">
          {environments.map((env, envIndex) => (
            <div key={env.id} className="bg-gray-800 border border-gray-700 rounded">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750"
                onClick={() => setExpandedEnvId(expandedEnvId === env.id ? null : env.id)}
              >
                {editingEnvId === env.id ? (
                  <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingEnvName}
                      onChange={(e) => setEditingEnvName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(env.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(env.id)}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors rounded hover:bg-gray-700"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-100">{env.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{env.variables.length} variables</span>
                      {envIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEnvironment(envIndex, 'up');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-300 transition-colors rounded hover:bg-gray-700"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                      )}
                      {envIndex < environments.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEnvironment(envIndex, 'down');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-300 transition-colors rounded hover:bg-gray-700"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(env.id, env.name);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded hover:bg-gray-700"
                        title="Rename environment"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateEnvironment(env.id, env.name);
                        }}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors rounded hover:bg-gray-700"
                        title="Duplicate environment"
                      >
                        <Copy size={14} />
                      </button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEnvironment(env.id, env.name);
                        }}
                        variant="danger"
                        size="sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {expandedEnvId === env.id && (
                <div className="p-4 border-t border-gray-700 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-300">Variables</h4>
                    <Button
                      onClick={() => handleAddVariable(env.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Variable
                    </Button>
                  </div>

                  {env.variables.length > 0 && (
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        type="text"
                        value={variableSearchTerm}
                        onChange={(e) => setVariableSearchTerm(e.target.value)}
                        placeholder="Search variables..."
                        className="pl-10"
                      />
                    </div>
                  )}

                  {env.variables.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No variables</p>
                  ) : (
                    <div className="space-y-2">
                      {env.variables
                        .filter((v) =>
                          variableSearchTerm === '' ||
                          v.key.toLowerCase().includes(variableSearchTerm.toLowerCase()) ||
                          v.value.toLowerCase().includes(variableSearchTerm.toLowerCase())
                        )
                        .map((variable) => {
                          const actualIndex = env.variables.findIndex(v => v.id === variable.id);
                          return (
                        <div key={variable.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variable.enabled}
                            onChange={(e) =>
                              updateVariable(env.id, variable.id, { enabled: e.target.checked })
                            }
                            className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
                          />
                          <Input
                            type="text"
                            value={variable.key}
                            onChange={(e) =>
                              updateVariable(env.id, variable.id, { key: e.target.value })
                            }
                            placeholder="Key (e.g., baseUrl)"
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            value={variable.value}
                            onChange={(e) =>
                              updateVariable(env.id, variable.id, { value: e.target.value })
                            }
                            placeholder="Value"
                            className="flex-1"
                          />
                          {actualIndex > 0 && (
                            <button
                              onClick={() => handleMoveVariable(env.id, actualIndex, 'up')}
                              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                              title="Move up"
                              aria-label="Move variable up"
                            >
                              <ChevronUp size={16} />
                            </button>
                          )}
                          {actualIndex < env.variables.length - 1 && (
                            <button
                              onClick={() => handleMoveVariable(env.id, actualIndex, 'down')}
                              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                              title="Move down"
                              aria-label="Move variable down"
                            >
                              <ChevronDown size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicateVariable(env.id, variable.id)}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                            title="Duplicate variable"
                            aria-label="Duplicate variable"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveVariable(env.id, variable.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Remove variable"
                            aria-label="Remove variable"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
