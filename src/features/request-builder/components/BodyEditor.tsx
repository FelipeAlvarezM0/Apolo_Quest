import { useRequestStore } from '../store/useRequestStore';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CodeEditor } from '../../../shared/ui/CodeEditor';
import { Plus, Trash2, Upload } from 'lucide-react';
import { generateId } from '../../../shared/utils/id';
import type { BodyType, RawBodyType, FormDataItem } from '../../../shared/models';

export function BodyEditor() {
  const { currentRequest, setBody } = useRequestStore();
  const { body } = currentRequest;

  const handleAddFormDataItem = () => {
    const newItem: FormDataItem = {
      id: generateId(),
      key: '',
      value: '',
      type: 'text',
      enabled: true,
    };
    setBody({ ...body, formData: [...(body.formData || []), newItem] });
  };

  const handleUpdateFormDataItem = (id: string, updates: Partial<FormDataItem>) => {
    const updatedFormData = (body.formData || []).map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setBody({ ...body, formData: updatedFormData });
  };

  const handleRemoveFormDataItem = (id: string) => {
    setBody({ ...body, formData: (body.formData || []).filter(item => item.id !== id) });
  };

  const handleFileSelect = async (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleUpdateFormDataItem(id, {
        fileName: file.name,
        fileContent: result,
        fileMimeType: file.type,
        value: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBinaryFileSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBody({
        ...body,
        binaryFileName: file.name,
        binaryContent: result,
        binaryMimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <Select
          label="Type"
          value={body.type}
          onChange={(e) => setBody({ ...body, type: e.target.value as BodyType, content: body.type !== e.target.value ? '' : body.content })}
          className="w-48"
        >
          <option value="none">None</option>
          <option value="raw">Raw</option>
          <option value="form-data">Form Data</option>
          <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
          <option value="binary">Binary</option>
        </Select>

        {body.type === 'raw' && (
          <Select
            label="Format"
            value={body.rawType || 'json'}
            onChange={(e) => setBody({ ...body, rawType: e.target.value as RawBodyType })}
            className="w-48"
          >
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="html">HTML</option>
            <option value="text">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="graphql">GraphQL</option>
            <option value="yaml">YAML</option>
          </Select>
        )}
      </div>

      {body.type === 'raw' && (
        <div className="flex flex-col flex-1 min-h-0">
          <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={body.content}
              onChange={(value) => setBody({ ...body, content: value })}
              language={getLanguageForRawType(body.rawType || 'json')}
              placeholder={getPlaceholderForRawType(body.rawType || 'json')}
              minHeight="100%"
              className="bg-gray-800 h-full"
            />
          </div>
        </div>
      )}

      {body.type === 'form-data' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Form Data</label>
            <Button onClick={handleAddFormDataItem} size="sm" variant="ghost" className="flex items-center gap-1">
              <Plus size={14} />
              Add Field
            </Button>
          </div>
          <p className="text-xs text-gray-400">Add text fields or file uploads. Content-Type will be set to multipart/form-data</p>

          {(body.formData || []).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No form fields added</p>
          )}

          {(body.formData || []).map((item) => (
            <div key={item.id} className="flex items-start gap-2 p-3 bg-gray-900 rounded border border-gray-700">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => handleUpdateFormDataItem(item.id, { enabled: e.target.checked })}
                className="mt-2 w-4 h-4 bg-gray-800 border-gray-700 rounded"
              />
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  value={item.key}
                  onChange={(e) => handleUpdateFormDataItem(item.id, { key: e.target.value })}
                  placeholder="Key"
                  className="text-sm"
                />
                <Select
                  value={item.type}
                  onChange={(e) => handleUpdateFormDataItem(item.id, { type: e.target.value as 'text' | 'file' })}
                  className="text-sm"
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </Select>
                {item.type === 'text' ? (
                  <Input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleUpdateFormDataItem(item.id, { value: e.target.value })}
                    placeholder="Value"
                    className="text-sm"
                  />
                ) : (
                  <div className="space-y-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(item.id, file);
                      }}
                      className="w-full text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                    />
                    {item.fileName && (
                      <p className="text-xs text-gray-400">Selected: {item.fileName}</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveFormDataItem(item.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Remove field"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {body.type === 'x-www-form-urlencoded' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Form URL Encoded</label>
            <Button onClick={handleAddFormDataItem} size="sm" variant="ghost" className="flex items-center gap-1">
              <Plus size={14} />
              Add Field
            </Button>
          </div>
          <p className="text-xs text-gray-400">Content-Type will be set to application/x-www-form-urlencoded</p>

          {(body.formData || []).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No form fields added</p>
          )}

          {(body.formData || []).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => handleUpdateFormDataItem(item.id, { enabled: e.target.checked })}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
              />
              <Input
                type="text"
                value={item.key}
                onChange={(e) => handleUpdateFormDataItem(item.id, { key: e.target.value })}
                placeholder="Key"
                className="flex-1 text-sm"
              />
              <Input
                type="text"
                value={item.value}
                onChange={(e) => handleUpdateFormDataItem(item.id, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 text-sm"
              />
              <button
                onClick={() => handleRemoveFormDataItem(item.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Remove field"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {body.type === 'binary' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Upload a file to send as binary data. Content-Type will be set based on the file type.</p>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-600 rounded hover:border-blue-500 transition-colors">
                <Upload size={24} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-300">Click to select a file</p>
                  {body.binaryFileName && (
                    <p className="text-xs text-gray-400 mt-1">Selected: {body.binaryFileName}</p>
                  )}
                </div>
              </div>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBinaryFileSelect(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          {body.binaryFileName && (
            <div className="p-3 bg-gray-900 rounded border border-gray-700">
              <p className="text-sm text-gray-300"><span className="text-gray-400">File:</span> {body.binaryFileName}</p>
              <p className="text-sm text-gray-300"><span className="text-gray-400">Type:</span> {body.binaryMimeType || 'unknown'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPlaceholderForRawType(rawType: RawBodyType): string {
  switch (rawType) {
    case 'json':
      return '{\n  "key": "value"\n}';
    case 'xml':
      return '<?xml version="1.0"?>\n<root>\n  <element>value</element>\n</root>';
    case 'html':
      return '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>';
    case 'graphql':
      return 'query {\n  users {\n    id\n    name\n  }\n}';
    case 'yaml':
      return 'key: value\nlist:\n  - item1\n  - item2';
    case 'javascript':
      return 'console.log("Hello World");';
    default:
      return 'Enter text content';
  }
}

function getLanguageForRawType(rawType: RawBodyType): 'json' | 'javascript' | 'xml' | 'html' | 'text' | 'yaml' | 'graphql' {
  switch (rawType) {
    case 'json':
      return 'json';
    case 'javascript':
      return 'javascript';
    case 'xml':
      return 'xml';
    case 'html':
      return 'html';
    case 'yaml':
      return 'yaml';
    case 'graphql':
      return 'graphql';
    default:
      return 'text';
  }
}
