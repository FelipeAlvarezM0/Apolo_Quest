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
import { Button } from '../../../shared/ui/Button';
import { Play, Square, Save, Copy } from 'lucide-react';

export function RequestBuilder() {
  const { currentRequest, isLoading, sendRequest, stopRequest, duplicateRequest } = useRequestStore();
  const { collections, addRequestToCollection } = useCollectionsStore();
  const { getActiveEnvironment } = useEnvironmentStore();
  const { settings } = useSettingsStore();
  const { success, error: showError } = useToastStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

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

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="shrink-0">
                <MethodSelector />
              </div>
              <UrlInput />
            </div>
            <div className="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
              {isLoading ? (
                <Button
                  onClick={stopRequest}
                  variant="danger"
                  className="flex items-center gap-2 whitespace-nowrap px-4 sm:px-6"
                  title="Stop request"
                  aria-label="Stop current request"
                >
                  <Square size={16} />
                  <span>Stop</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSend}
                    className="flex items-center gap-2 whitespace-nowrap px-4 sm:px-6"
                    title="Send request (Ctrl+Enter)"
                    aria-label="Send HTTP request"
                  >
                    <Play size={16} />
                    <span>Send</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                    title="Save to collection (Ctrl+S)"
                    aria-label="Save request to collection"
                  >
                    <Save size={16} />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  <Button
                    onClick={handleDuplicate}
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                    title="Duplicate request"
                    aria-label="Duplicate current request"
                  >
                    <Copy size={16} />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {showSaveDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-100">Save Request to Collection</h3>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm sm:text-base text-gray-100 mb-4"
                >
                  <option value="">Select a collection...</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setShowSaveDialog(false)} variant="ghost" size="sm" className="sm:text-sm">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSave} size="sm" className="sm:text-sm">Save</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Tabs />
          </div>
        </div>

        <div className="border-t border-gray-700">
          <ResponseViewer />
        </div>
      </div>
    </div>
  );
}

function Tabs() {
  const tabs = ['Query Params', 'Headers', 'Auth', 'Body', 'Scripts'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-gray-700 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-3 sm:mt-4">
        {activeTab === 'Query Params' && <QueryParamsEditor />}
        {activeTab === 'Headers' && <HeadersEditor />}
        {activeTab === 'Auth' && <AuthEditor />}
        {activeTab === 'Body' && <BodyEditor />}
        {activeTab === 'Scripts' && <ScriptsEditor />}
      </div>
    </div>
  );
}
