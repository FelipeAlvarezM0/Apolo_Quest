import { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { StatusBadge, Badge } from '../../../shared/ui/Badge';
import { TabBar } from '../../../shared/ui/TabBar';
import { CodeEditor } from '../../../shared/ui/CodeEditor';
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
      <div className="flex items-center justify-center h-full bg-bg-panel">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent"></div>
          <span className="text-sm text-text-secondary">Sending request...</span>
        </div>
      </div>
    );
  }

  if (!currentResponse) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-panel">
        <div className="text-center">
          <p className="text-sm text-text-muted">Send a request to see the response</p>
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

  const contentType = Object.entries(currentResponse.headers).find(
    ([key]) => key.toLowerCase() === 'content-type'
  )?.[1] || 'text/plain';

  return (
    <div className="flex flex-col h-full bg-bg-panel">
      <div className="flex items-center justify-between px-md py-sm bg-bg-elevated">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={currentResponse.status} />
          <span className="text-xs text-text-secondary">{currentResponse.statusText}</span>
          <div className="h-3 w-px bg-border-subtle" />
          <span className="text-xs text-text-muted">{formatDuration(currentResponse.timeMs)}</span>
          <span className="text-xs text-text-muted">{formatBytes(currentResponse.sizeBytes)}</span>
          <Badge variant="neutral" className="text-xs">{contentType.split(';')[0]}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            title="Copy response"
          >
            {copied ? <Check size={16} className="text-status-success" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            title="Download response"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {currentResponse.error && (
        <div className="mx-md mt-md p-3 bg-status-error/10 text-status-error text-xs">
          {currentResponse.error}
        </div>
      )}

      <TabBar
        tabs={[
          { id: 'body', label: 'Body' },
          { id: 'headers', label: 'Headers', count: Object.keys(currentResponse.headers).length },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'body' | 'headers')}
      />

      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <div className="h-full p-md bg-bg-panel">
            {displayBody ? (
              <CodeEditor
                value={displayBody}
                language={currentResponse.bodyType === 'json' ? 'json' : 'text'}
                readOnly={true}
                minHeight="100%"
                className="bg-gray-900"
              />
            ) : (
              <p className="text-xs text-text-muted">(empty)</p>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-md">
            {Object.entries(currentResponse.headers).length === 0 ? (
              <p className="text-xs text-text-muted">No headers</p>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-bg-elevated">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wide">Key</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wide">Value</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {Object.entries(currentResponse.headers).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-bg-panel' : 'bg-bg-elevated'}>
                        <td className="px-3 py-2 text-accent">{key}</td>
                        <td className="px-3 py-2 text-text-primary break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
