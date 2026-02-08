import { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { StatusBadge } from '../../../shared/ui/Badge';
import { formatBytes, formatDuration } from '../../../shared/utils/format';
import { Copy, Check, Download } from 'lucide-react';

export function ResponseViewer() {
  const { currentResponse, isLoading } = useRequestStore();
  const { settings } = useSettingsStore();
  const { success } = useToastStore();
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm sm:text-base text-gray-400">Sending request...</span>
        </div>
      </div>
    );
  }

  if (!currentResponse) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
          Send a request to see the response
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentResponse.body);
    setCopied(true);
    success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentResponse.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    success('Response downloaded');
  };

  const formatJson = (text: string): string => {
    if (!settings.prettyJson) return text;
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  const displayBody = currentResponse.bodyType === 'json'
    ? formatJson(currentResponse.body)
    : currentResponse.body;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">Status:</span>
          <StatusBadge status={currentResponse.status} />
          <span className="text-sm text-gray-600">{currentResponse.statusText}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-gray-400">
            Time: <span className="text-gray-300">{formatDuration(currentResponse.timeMs)}</span>
          </span>
          <span className="text-gray-400">
            Size: <span className="text-gray-300">{formatBytes(currentResponse.sizeBytes)}</span>
          </span>
        </div>
      </div>

      {currentResponse.error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
          {currentResponse.error}
        </div>
      )}

      <div className="flex border-b border-gray-700 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'body'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'headers'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Headers
        </button>
      </div>

      {activeTab === 'body' && (
        <div className="relative">
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
          <pre className="bg-gray-900 border border-gray-700 rounded p-4 pr-20 overflow-x-auto text-xs sm:text-sm text-gray-300 font-mono max-h-96 overflow-y-auto">
            {displayBody || '(empty)'}
          </pre>
        </div>
      )}

      {activeTab === 'headers' && (
        <div className="space-y-2">
          {Object.entries(currentResponse.headers).length === 0 ? (
            <p className="text-gray-500 text-sm">No headers</p>
          ) : (
            Object.entries(currentResponse.headers).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm break-words">
                <span className="text-blue-400 font-medium">{key}:</span>
                <span className="text-gray-300 break-all">{value}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
