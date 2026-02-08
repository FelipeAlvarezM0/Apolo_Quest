import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import { SettingsIcon, Keyboard } from 'lucide-react';

export function Settings() {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { success } = useToastStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSettings = (updates: Partial<typeof settings>) => {
    updateSettings(updates);
    success('Settings updated');
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
        <SettingsIcon size={24} />
        Settings
      </h2>

      <div className="space-y-6 max-w-2xl">
        <div>
          <Select
            label="Theme"
            value={settings.theme}
            onChange={(e) => handleUpdateSettings({ theme: e.target.value as 'dark' | 'light' })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Choose your preferred color scheme</p>
        </div>

        <div>
          <Input
            type="number"
            label="Request Timeout (ms)"
            value={settings.timeoutMs}
            onChange={(e) => handleUpdateSettings({ timeoutMs: parseInt(e.target.value) || 30000 })}
            min="1000"
            step="1000"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum time to wait for a response</p>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.prettyJson}
              onChange={(e) => handleUpdateSettings({ prettyJson: e.target.checked })}
              className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
            />
            <span className="text-sm font-medium text-gray-300">Pretty Print JSON</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">Automatically format JSON responses</p>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-8">
          <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Send Request</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Enter</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Save Request to Collection</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Focus Search</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+F</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Go to Request Builder</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Shift+B</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Go to Collections</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Shift+C</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Go to History</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Shift+H</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Go to Environments</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Shift+E</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="text-sm text-gray-300">Go to Runner</span>
              <kbd className="px-2 py-1 bg-gray-900 rounded text-xs font-mono text-gray-400 border border-gray-700">Ctrl+Shift+R</kbd>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Note: Use Cmd instead of Ctrl on macOS</p>
        </div>
      </div>
    </div>
  );
}
