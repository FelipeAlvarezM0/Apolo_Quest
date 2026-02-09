import { useRequestStore } from '../store/useRequestStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Trash2, Plus } from 'lucide-react';

export function QueryParamsEditor() {
  const { currentRequest, addQueryParam, updateQueryParam, removeQueryParam } = useRequestStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Query Parameters</h3>
        <Button onClick={addQueryParam} variant="ghost" size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {currentRequest.queryParams.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No query parameters</p>
      ) : (
        <div className="space-y-3">
          {currentRequest.queryParams.map((param) => (
            <div key={param.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={(e) => updateQueryParam(param.id, { enabled: e.target.checked })}
                className="w-4 h-4 bg-gray-800 rounded mt-3 sm:mt-0 flex-shrink-0"
              />
              <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
                <Input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateQueryParam(param.id, { key: e.target.value })}
                  placeholder="Key"
                  className="w-full sm:flex-1"
                />
                <Input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateQueryParam(param.id, { value: e.target.value })}
                  placeholder="Value"
                  className="w-full sm:flex-1"
                />
              </div>
              <button
                onClick={() => removeQueryParam(param.id)}
                className="p-2 text-gray-400 hover:text-red-400 flex-shrink-0 self-end sm:self-center"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
