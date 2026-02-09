import { useRequestStore } from '../store/useRequestStore';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { generateId } from '../../../shared/utils/id';
import type { AuthType, ApiKeyLocation, ApiKeyItem } from '../../../shared/models';

export function AuthEditor() {
  const { currentRequest, setAuth } = useRequestStore();
  const { auth } = currentRequest;

  const handleAddApiKey = () => {
    const newApiKey: ApiKeyItem = {
      id: generateId(),
      key: '',
      value: '',
      location: 'header',
      enabled: true,
    };
    setAuth({ ...auth, apiKeys: [...(auth.apiKeys || []), newApiKey] });
  };

  const handleUpdateApiKey = (id: string, updates: Partial<ApiKeyItem>) => {
    const updatedKeys = (auth.apiKeys || []).map(k => k.id === id ? { ...k, ...updates } : k);
    setAuth({ ...auth, apiKeys: updatedKeys });
  };

  const handleRemoveApiKey = (id: string) => {
    setAuth({ ...auth, apiKeys: (auth.apiKeys || []).filter(k => k.id !== id) });
  };

  return (
    <div className="space-y-4">
      <Select
        label="Type"
        value={auth.type}
        onChange={(e) => setAuth({ ...auth, type: e.target.value as AuthType })}
        className="w-full sm:w-48"
      >
        <option value="none">None</option>
        <option value="bearer">Bearer Token</option>
        <option value="basic">Basic Auth</option>
        <option value="apiKey">API Key</option>
        <option value="oauth2">OAuth 2.0</option>
        <option value="digest">Digest Auth</option>
      </Select>

      {auth.type === 'bearer' && (
        <div className="space-y-2">
          <Input
            type="text"
            label="Token"
            value={auth.token || ''}
            onChange={(e) => setAuth({ ...auth, token: e.target.value })}
            placeholder="your-bearer-token"
          />
          <p className="text-xs text-gray-400">The token will be sent in the Authorization header as "Bearer {'{token}'}"</p>
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="space-y-3">
          <Input
            type="text"
            label="Username"
            value={auth.username || ''}
            onChange={(e) => setAuth({ ...auth, username: e.target.value })}
            placeholder="username"
          />
          <Input
            type="password"
            label="Password"
            value={auth.password || ''}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
            placeholder="password"
          />
          <p className="text-xs text-gray-400">Credentials will be base64 encoded and sent in the Authorization header</p>
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">API Keys</label>
            <Button onClick={handleAddApiKey} size="sm" variant="ghost" className="flex items-center gap-1">
              <Plus size={14} />
              Add Key
            </Button>
          </div>
          <p className="text-xs text-gray-400">API keys can be sent in headers, query parameters, or cookies</p>

          {(auth.apiKeys || []).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No API keys added</p>
          )}

          {(auth.apiKeys || []).map((apiKey) => (
            <div key={apiKey.id} className="flex items-start gap-2 p-3 bg-gray-900">
              <input
                type="checkbox"
                checked={apiKey.enabled}
                onChange={(e) => handleUpdateApiKey(apiKey.id, { enabled: e.target.checked })}
                className="mt-2 w-4 h-4 bg-gray-800 rounded"
              />
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  value={apiKey.key}
                  onChange={(e) => handleUpdateApiKey(apiKey.id, { key: e.target.value })}
                  placeholder="Key (e.g., X-API-Key)"
                  className="text-sm"
                />
                <Input
                  type="text"
                  value={apiKey.value}
                  onChange={(e) => handleUpdateApiKey(apiKey.id, { value: e.target.value })}
                  placeholder="Value"
                  className="text-sm"
                />
                <Select
                  value={apiKey.location}
                  onChange={(e) => handleUpdateApiKey(apiKey.id, { location: e.target.value as ApiKeyLocation })}
                  className="text-sm"
                >
                  <option value="header">Header</option>
                  <option value="query">Query Parameter</option>
                  <option value="cookie">Cookie</option>
                </Select>
              </div>
              <button
                onClick={() => handleRemoveApiKey(apiKey.id)}
                className="p-2 text-red-400 hover:text-red-300"
                title="Remove key"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {auth.type === 'oauth2' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">OAuth 2.0 Bearer Token authentication. Obtain tokens from your OAuth provider.</p>
          <Input
            type="text"
            label="Access Token"
            value={auth.oauth2AccessToken || ''}
            onChange={(e) => setAuth({ ...auth, oauth2AccessToken: e.target.value })}
            placeholder="your-access-token"
          />
          <Input
            type="text"
            label="Refresh Token (Optional)"
            value={auth.oauth2RefreshToken || ''}
            onChange={(e) => setAuth({ ...auth, oauth2RefreshToken: e.target.value })}
            placeholder="your-refresh-token"
          />
          <Input
            type="text"
            label="Scope (Optional)"
            value={auth.oauth2Scope || ''}
            onChange={(e) => setAuth({ ...auth, oauth2Scope: e.target.value })}
            placeholder="read write"
          />
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {}}
          >
            <RefreshCw size={14} />
            Refresh Token
          </Button>
          <p className="text-xs text-gray-500">Note: Token refresh must be implemented manually using your OAuth provider's API</p>
        </div>
      )}

      {auth.type === 'digest' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Digest authentication provides better security than Basic Auth by hashing credentials</p>
          <Input
            type="text"
            label="Username"
            value={auth.username || ''}
            onChange={(e) => setAuth({ ...auth, username: e.target.value })}
            placeholder="username"
          />
          <Input
            type="password"
            label="Password"
            value={auth.password || ''}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
            placeholder="password"
          />
          <p className="text-xs text-yellow-400">Note: Digest Auth requires server challenge. Implementation may vary by server.</p>
        </div>
      )}
    </div>
  );
}
