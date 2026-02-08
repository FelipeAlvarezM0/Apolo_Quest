import { useEffect, useState, useMemo, useRef } from 'react';
import { useCollectionsStore } from '../store/useCollectionsStore';
import { useRequestStore } from '../../request-builder/store/useRequestStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Badge } from '../../../shared/ui/Badge';
import { FolderPlus, Play, Trash2, Plus, Search, Edit2, Check, X, Copy, ChevronUp, ChevronDown, ArrowRightLeft, ArrowUp, ArrowDown } from 'lucide-react';

export function Collections() {
  const { collections, loadCollections, createCollection, deleteCollection, addRequestToCollection, removeRequestFromCollection, updateCollection, moveRequestInCollection, moveRequestBetweenCollections, reorderCollections, duplicateRequest } = useCollectionsStore();
  const { currentRequest, loadRequest } = useRequestStore();
  const { success } = useToastStore();

  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');

  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editingRequestName, setEditingRequestName] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCollections = useMemo(() => {
    return collections.map(collection => {
      const filteredRequests = collection.requests.filter(request => {
        const matchesSearch = searchTerm === '' ||
          request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMethod = methodFilter === 'all' || request.method === methodFilter;

        return matchesSearch && matchesMethod;
      });

      return {
        ...collection,
        requests: filteredRequests,
        originalRequestCount: collection.requests.length,
      };
    }).filter(c => c.requests.length > 0 || (searchTerm === '' && methodFilter === 'all'));
  }, [collections, searchTerm, methodFilter]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName);
    setNewCollectionName('');
    setShowNewCollection(false);
    success('Collection created');
  };

  const handleSaveRequest = async () => {
    if (!selectedCollectionId) return;
    await addRequestToCollection(selectedCollectionId, currentRequest);
    setShowSaveDialog(false);
    setSelectedCollectionId(null);
    success('Request saved to collection');
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    await deleteCollection(id);
    success(`Collection "${name}" deleted`);
  };

  const handleRenameCollection = async (id: string) => {
    if (!editingCollectionName.trim()) return;
    await updateCollection(id, { name: editingCollectionName });
    setEditingCollectionId(null);
    success('Collection renamed');
  };

  const handleRenameRequest = async (collectionId: string, requestId: string) => {
    if (!editingRequestName.trim()) return;
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const updatedRequests = collection.requests.map(r =>
      r.id === requestId ? { ...r, name: editingRequestName } : r
    );

    await updateCollection(collectionId, { requests: updatedRequests });
    setEditingRequestId(null);
    success('Request renamed');
  };

  const handleLoadRequest = (request: any) => {
    loadRequest(request);
    success('Request loaded in builder');
  };

  const handleDeleteRequest = async (collectionId: string, requestId: string, requestName: string) => {
    await removeRequestFromCollection(collectionId, requestId);
    success(`Request "${requestName}" removed`);
  };

  const handleDuplicateRequest = async (collectionId: string, request: any) => {
    await duplicateRequest(collectionId, request);
    success('Request duplicated');
  };

  const handleMoveRequest = async (collectionId: string, requestId: string, direction: 'up' | 'down') => {
    await moveRequestInCollection(collectionId, requestId, direction);
  };

  const handleMoveCollection = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    await reorderCollections(index, newIndex);
  };

  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveRequestData, setMoveRequestData] = useState<{ collectionId: string; requestId: string; requestName: string } | null>(null);

  const handleMoveRequestBetweenCollections = async (toCollectionId: string) => {
    if (!moveRequestData) return;
    await moveRequestBetweenCollections(moveRequestData.collectionId, toCollectionId, moveRequestData.requestId);
    setShowMoveDialog(false);
    setMoveRequestData(null);
    success('Request moved to collection');
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">Collections</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowSaveDialog(true)}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Save Current Request
          </Button>
          <Button
            onClick={() => setShowNewCollection(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <FolderPlus size={16} />
            New Collection
          </Button>
        </div>
      </div>

      {collections.length > 0 && (
        <div className="mb-4 sm:mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by URL or name... (Ctrl+F)"
                className="pl-10"
              />
            </div>
            <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-full sm:w-32">
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </Select>
          </div>
        </div>
      )}

      {showNewCollection && (
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg animate-fade-in">
          <Input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Collection name"
            className="mb-3"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateCollection} size="sm">Create</Button>
            <Button onClick={() => setShowNewCollection(false)} variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg animate-fade-in">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Select Collection</h3>
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {collections.map((collection) => (
              <label key={collection.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="collection"
                  value={collection.id}
                  checked={selectedCollectionId === collection.id}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">{collection.name}</span>
                <Badge variant="default" className="ml-auto">{collection.requests.length}</Badge>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveRequest} size="sm" disabled={!selectedCollectionId}>Save</Button>
            <Button onClick={() => { setShowSaveDialog(false); setSelectedCollectionId(null); }} variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FolderPlus size={48} className="mb-3 opacity-50" />
          <p>No collections yet</p>
          <p className="text-sm">Create one to organize your requests</p>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Search size={48} className="mb-3 opacity-50" />
          <p>No results found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCollections.map((collection, collectionIndex) => {
            const actualIndex = collections.findIndex(c => c.id === collection.id);
            return (
            <div key={collection.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 animate-fade-in hover:border-gray-600 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                {editingCollectionId === collection.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingCollectionName}
                      onChange={(e) => setEditingCollectionName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameCollection(collection.id);
                        if (e.key === 'Escape') setEditingCollectionId(null);
                      }}
                    />
                    <button
                      onClick={() => handleRenameCollection(collection.id)}
                      className="p-2 text-green-400 hover:text-green-300 rounded hover:bg-gray-700"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCollectionId(null)}
                      className="p-2 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium text-gray-100">{collection.name}</h3>
                      <Badge variant="info">{collection.originalRequestCount} requests</Badge>
                      {actualIndex > 0 && (
                        <button
                          onClick={() => handleMoveCollection(actualIndex, 'up')}
                          className="p-1 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-700"
                          title="Move collection up"
                        >
                          <ArrowUp size={14} />
                        </button>
                      )}
                      {actualIndex < collections.length - 1 && (
                        <button
                          onClick={() => handleMoveCollection(actualIndex, 'down')}
                          className="p-1 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-700"
                          title="Move collection down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingCollectionId(collection.id);
                          setEditingCollectionName(collection.name);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 rounded hover:bg-gray-700"
                        title="Rename collection"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                    <Button
                      onClick={() => handleDeleteCollection(collection.id, collection.name)}
                      variant="danger"
                      size="sm"
                      className="flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Trash2 size={14} />
                      <span className="hidden xs:inline">Delete</span>
                    </Button>
                  </>
                )}
              </div>

              {collection.requests.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">No requests match your filters</p>
              ) : (
                <div className="space-y-2">
                  {collection.requests.map((request, index) => (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-900 rounded hover:bg-gray-850 transition-colors group gap-2 sm:gap-0"
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Badge variant="info" className="font-mono text-[10px] sm:text-xs flex-shrink-0">{request.method}</Badge>
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                          {editingRequestId === request.id ? (
                            <Input
                              value={editingRequestName}
                              onChange={(e) => setEditingRequestName(e.target.value)}
                              className="w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameRequest(collection.id, request.id);
                                if (e.key === 'Escape') setEditingRequestId(null);
                              }}
                            />
                          ) : (
                            <>
                              <span className="text-xs sm:text-sm text-gray-300 font-medium truncate">{request.name}</span>
                              <span className="text-[10px] sm:text-xs text-gray-500 truncate">{request.url}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 sm:ml-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end">
                        {editingRequestId === request.id ? (
                          <>
                            <button
                              onClick={() => handleRenameRequest(collection.id, request.id)}
                              className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 rounded hover:bg-gray-800"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingRequestId(null)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-800"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleLoadRequest(request)}
                              className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 rounded hover:bg-gray-800"
                              title="Load in builder"
                            >
                              <Play size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRequestId(request.id);
                                setEditingRequestName(request.name);
                              }}
                              className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 rounded hover:bg-gray-800 hidden sm:block"
                              title="Rename"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDuplicateRequest(collection.id, request)}
                              className="p-1.5 sm:p-2 text-yellow-400 hover:text-yellow-300 rounded hover:bg-gray-800 hidden sm:block"
                              title="Duplicate"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setMoveRequestData({ collectionId: collection.id, requestId: request.id, requestName: request.name });
                                setShowMoveDialog(true);
                              }}
                              className="p-1.5 sm:p-2 text-purple-400 hover:text-purple-300 rounded hover:bg-gray-800 hidden sm:block"
                              title="Move to another collection"
                            >
                              <ArrowRightLeft size={14} />
                            </button>
                            {index > 0 && (
                              <button
                                onClick={() => handleMoveRequest(collection.id, request.id, 'up')}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-800 hidden sm:block"
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                            )}
                            {index < collection.requests.length - 1 && (
                              <button
                                onClick={() => handleMoveRequest(collection.id, request.id, 'down')}
                                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-300 rounded hover:bg-gray-800 hidden sm:block"
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(collection.id, request.id, request.name)}
                              className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 rounded hover:bg-gray-800"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}

      {showMoveDialog && moveRequestData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Move "{moveRequestData.requestName}" to collection</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {collections
                .filter(c => c.id !== moveRequestData.collectionId)
                .map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => handleMoveRequestBetweenCollections(collection.id)}
                    className="w-full text-left p-3 bg-gray-900 hover:bg-gray-750 rounded transition-colors"
                  >
                    <div className="font-medium text-gray-100">{collection.name}</div>
                    <div className="text-sm text-gray-400">{collection.requests.length} requests</div>
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowMoveDialog(false);
                  setMoveRequestData(null);
                }}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
