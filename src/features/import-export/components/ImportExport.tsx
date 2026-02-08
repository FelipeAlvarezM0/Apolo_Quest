import { useRef } from 'react';
import { useCollectionsStore } from '../../collections/store/useCollectionsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { CollectionSchema } from '../../../shared/validation/schemas';
import { collectionsRepository } from '../../../shared/storage/repositories/collections.repository';
import { convertPostmanToCollection } from '../services/postmanConverter';
import { Button } from '../../../shared/ui/Button';
import { Download, Upload, FileJson } from 'lucide-react';
import type { Collection } from '../../../shared/models';

export function ImportExport() {
  const { collections, loadCollections } = useCollectionsStore();
  const { success, error: showError } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postmanInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (collection: Collection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${collection.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    success(`Exported: ${collection.name}`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const collection = CollectionSchema.parse(json);

      await collectionsRepository.create(collection);
      await loadCollections();

      success(`Imported: ${collection.name}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Invalid collection file format');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePostmanImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const collection = convertPostmanToCollection(json);

      await collectionsRepository.create(collection);
      await loadCollections();

      success(`Imported Postman collection: ${collection.name}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Invalid Postman collection format');
    }

    if (postmanInputRef.current) {
      postmanInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">Import / Export</h2>

      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="flex items-center gap-2"
            title="Import native collection"
          >
            <Upload size={16} />
            Import Collection
          </Button>
          <Button
            onClick={() => postmanInputRef.current?.click()}
            variant="secondary"
            className="flex items-center gap-2"
            title="Import Postman collection (v2.x)"
          >
            <Upload size={16} />
            Import from Postman
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <input
          ref={postmanInputRef}
          type="file"
          accept=".json"
          onChange={handlePostmanImport}
          className="hidden"
        />
        <div className="text-sm text-gray-400 p-3 bg-gray-800 border border-gray-700 rounded">
          <p className="font-medium mb-1">Import formats supported:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Native API Client Pro collections (.json)</li>
            <li>Postman Collection v2.x (.json)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-100">Export Collections</h3>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileJson size={48} className="mb-3 opacity-50" />
            <p>No collections to export</p>
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded hover:border-gray-600 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-gray-100">{collection.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {collection.requests.length} requests
                  </div>
                </div>
                <Button
                  onClick={() => handleExport(collection)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download size={14} />
                  Export
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
