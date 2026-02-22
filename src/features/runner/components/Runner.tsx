import { useEffect, useState } from 'react';
import { useRunnerStore } from '../store/useRunnerStore';
import { useCollectionsStore } from '../../collections/store/useCollectionsStore';
import { useEnvironmentStore } from '../../environments/store/useEnvironmentStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import { StatusBadge } from '../../../shared/ui/Badge';
import { formatBytes, formatDuration } from '../../../shared/utils/format';
import { Play, Square, CheckCircle2, XCircle } from 'lucide-react';

export function Runner() {
  const { isRunning, results, currentIndex, runCollection, stopRun, clearResults } = useRunnerStore();
  const { collections, loadCollections } = useCollectionsStore();
  const { environments, loadEnvironments, activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();
  const { settings } = useSettingsStore();
  const { success, error: showError } = useToastStore();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  useEffect(() => {
    loadCollections();
    loadEnvironments();
  }, [loadCollections, loadEnvironments]);

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);
  const totalRequests = selectedCollection?.requests.length || 0;
  const progress = totalRequests > 0 ? (results.length / totalRequests) * 100 : 0;

  const handleRun = async () => {
    const collection = collections.find(c => c.id === selectedCollectionId);
    if (!collection) return;

    const activeEnv = environments.find(e => e.id === activeEnvironmentId) || null;
    success(`Running collection "${collection.name}"...`);
    await runCollection(collection, activeEnv, settings.timeoutMs);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      success(`Collection completed! ${successCount} requests successful`);
    } else {
      showError(`Collection completed with ${errorCount} errors`);
    }
  };

  const handleStop = () => {
    stopRun();
    showError('Collection execution stopped');
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">Collection Runner</h2>

      <div className="space-y-4 mb-6">
        <Select
          label="Collection"
          value={selectedCollectionId}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
          disabled={isRunning}
        >
          <option value="">Select a collection</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name} ({collection.requests.length} requests)
            </option>
          ))}
        </Select>

        <Select
          label="Environment (Optional)"
          value={activeEnvironmentId || ''}
          onChange={(e) => setActiveEnvironment(e.target.value || null)}
          disabled={isRunning}
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </Select>

        {isRunning && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300 font-mono">
                {results.length} / {totalRequests} ({Math.round(progress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out animate-pulse-slow"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentIndex >= 0 && selectedCollection && (
              <p className="text-sm text-gray-400">
                Currently running: <span className="text-gray-300">{selectedCollection.requests[currentIndex]?.name}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {isRunning ? (
            <Button onClick={handleStop} variant="danger" className="flex items-center gap-2">
              <Square size={16} />
              Stop
            </Button>
          ) : (
            <>
              <Button
                onClick={handleRun}
                disabled={!selectedCollectionId}
                className="flex items-center gap-2"
              >
                <Play size={16} />
                Run Collection
              </Button>
              {results.length > 0 && (
                <Button onClick={clearResults} variant="secondary">
                  Clear Results
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-100 mb-3">Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-2xl font-bold text-green-400">{successCount}</div>
                <div className="text-sm text-gray-400 mt-1">Success</div>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-2xl font-bold text-red-400">{errorCount}</div>
                <div className="text-sm text-gray-400 mt-1">Failed</div>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-2xl font-bold text-blue-400">{formatDuration(totalTime)}</div>
                <div className="text-sm text-gray-400 mt-1">Total Time</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-100 mb-3">Results</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded hover:bg-gray-850 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {result.status === 'success' ? (
                      <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={20} className="text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-300 font-medium">{result.requestName}</div>
                      {result.error && (
                        <div className="text-xs text-red-400 mt-1 truncate">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {result.response && (
                      <>
                        <StatusBadge status={result.response.status} />
                        <span className="text-sm text-gray-400">{formatDuration(result.response.timeMs)}</span>
                        <span className="text-xs text-gray-500">{formatBytes(result.response.sizeBytes)}</span>
                      </>
                    )}
                    {!result.response && result.error && (
                      <span className="text-sm text-red-400">Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isRunning && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Play size={48} className="mb-3 opacity-50" />
          <p>Select a collection and run it</p>
          <p className="text-sm">Execute all requests in sequence</p>
        </div>
      )}
    </div>
  );
}
