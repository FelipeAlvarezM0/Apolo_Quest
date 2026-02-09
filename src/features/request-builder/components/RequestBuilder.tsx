import { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { useCollectionsStore } from '../../collections/store/useCollectionsStore';
import { useEnvironmentStore } from '../../environments/store/useEnvironmentStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { MethodSelector } from './MethodSelector';
import { UrlInput } from './UrlInput';
import { QueryParamsEditor } from './QueryParamsEditor';
import { HeadersEditor } from './HeadersEditor';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { ScriptsEditor } from './ScriptsEditor';
import { ResponseViewer } from './ResponseViewer';
import { ResizablePanels } from '../../../shared/ui/ResizablePanels';
import { TabBar } from '../../../shared/ui/TabBar';
import { Play, Square, Save, Copy } from 'lucide-react';

export function RequestBuilder() {
  const { currentRequest, isLoading, sendRequest, stopRequest, duplicateRequest } = useRequestStore();
  const { collections, addRequestToCollection } = useCollectionsStore();
  const { getActiveEnvironment } = useEnvironmentStore();
  const { settings } = useSettingsStore();
  const { success, error: showError } = useToastStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [activeTab, setActiveTab] = useState('params');

  const handleSend = () => {
    const activeEnv = getActiveEnvironment();
    sendRequest(activeEnv, settings.timeoutMs);
  };

  const handleSave = () => {
    if (collections.length === 0) {
      showError('Create a collection first');
      return;
    }
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedCollectionId) {
      showError('Select a collection');
      return;
    }
    await addRequestToCollection(selectedCollectionId, currentRequest);
    setShowSaveDialog(false);
    setSelectedCollectionId('');
    success('Request saved to collection');
  };

  const handleDuplicate = () => {
    duplicateRequest();
    success('Request duplicated');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        handleSend();
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const editorPanel = (
    <div className="flex flex-col h-full bg-bg-panel">
      <div className="flex items-center gap-2 px-md py-sm border-b border-border-subtle bg-bg-elevated">
        <MethodSelector />
        <UrlInput />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={isLoading ? stopRequest : handleSend}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold
              transition-all duration-fast relative
              ${isLoading
                ? 'bg-status-error hover:bg-status-error/90 text-white'
                : 'bg-accent hover:bg-accent-hover text-white'
              }
            `}
            title={isLoading ? 'Stop request' : 'Send request (Ctrl+Enter)'}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Sending...</span>
                <div className="absolute inset-0 rounded-md bg-white/10 animate-pulse-slow pointer-events-none" />
              </>
            ) : (
              <>
                <Play size={14} />
                Send
              </>
            )}
          </button>
          {!isLoading && (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
                title="Save to collection (Ctrl+S)"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleDuplicate}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-all duration-fast"
                title="Duplicate request"
              >
                <Copy size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <TabBar
        tabs={[
          { id: 'params', label: 'Query', count: currentRequest.queryParams.length },
          { id: 'headers', label: 'Headers', count: currentRequest.headers.length },
          { id: 'auth', label: 'Auth' },
          { id: 'body', label: 'Body' },
          { id: 'scripts', label: 'Scripts' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 overflow-auto p-md flex flex-col">
        {activeTab === 'params' && <QueryParamsEditor />}
        {activeTab === 'headers' && <HeadersEditor />}
        {activeTab === 'auth' && <AuthEditor />}
        {activeTab === 'body' && <BodyEditor />}
        {activeTab === 'scripts' && <ScriptsEditor />}
      </div>
    </div>
  );

  return (
    <div className="h-full" onKeyDown={handleKeyDown}>
      <ResizablePanels
        topPanel={editorPanel}
        bottomPanel={<ResponseViewer />}
        defaultHeight={45}
        minHeight={25}
      />

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-elevated border border-border-default p-6 rounded-lg shadow-2xl max-w-md w-full">
            <h3 className="text-base font-semibold mb-4 text-text-primary">Save Request to Collection</h3>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full px-3 py-2 bg-bg-input border border-border-subtle rounded-md text-sm text-text-primary mb-4 focus:outline-none focus:border-border-focus"
            >
              <option value="">Select a collection...</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-all duration-fast"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-md font-medium transition-all duration-fast"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
