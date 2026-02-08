import { useRequestStore } from '../store/useRequestStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Trash2, Plus } from 'lucide-react';

export function HeadersEditor() {
  const { currentRequest, addHeader, updateHeader, removeHeader } = useRequestStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Headers</h3>
        <Button onClick={addHeader} variant="ghost" size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {currentRequest.headers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No headers</p>
      ) : (
        <div className="space-y-3">
          {currentRequest.headers.map((header) => (
            <div key={header.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => updateHeader(header.id, { enabled: e.target.checked })}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded mt-3 sm:mt-0 flex-shrink-0"
              />
              <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
                <Input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, { key: e.target.value })}
                  placeholder="Key"
                  className="w-full sm:flex-1"
                />
                <Input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, { value: e.target.value })}
                  placeholder="Value"
                  className="w-full sm:flex-1"
                />
              </div>
              <button
                onClick={() => removeHeader(header.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 self-end sm:self-center"
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
