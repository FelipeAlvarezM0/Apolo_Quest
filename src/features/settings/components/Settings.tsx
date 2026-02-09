import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import { SettingsIcon, Palette, Timer, Code2, Keyboard, Zap } from 'lucide-react';

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

  const shortcuts = [
    { action: 'Send Request', keys: 'Ctrl+Enter', category: 'Actions' },
    { action: 'Save to Collection', keys: 'Ctrl+S', category: 'Actions' },
    { action: 'Focus Search', keys: 'Ctrl+F', category: 'General' },
    { action: 'Request Builder', keys: 'Ctrl+Shift+B', category: 'Navigation' },
    { action: 'Collections', keys: 'Ctrl+Shift+C', category: 'Navigation' },
    { action: 'History', keys: 'Ctrl+Shift+H', category: 'Navigation' },
    { action: 'Environments', keys: 'Ctrl+Shift+E', category: 'Navigation' },
    { action: 'Runner', keys: 'Ctrl+Shift+R', category: 'Navigation' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-950">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
            <SettingsIcon size={32} className="text-blue-500" />
            Settings
          </h1>
          <p className="text-gray-400">Configure your ApoloQuest preferences and settings</p>
        </div>

        <div className="space-y-6">
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Palette size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Appearance</h2>
                <p className="text-sm text-gray-400">Customize the look and feel</p>
              </div>
            </div>
            <div className="max-w-md">
              <Select
                label="Theme"
                value={settings.theme}
                onChange={(e) => handleUpdateSettings({ theme: e.target.value as 'dark' | 'light' })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
              <p className="text-xs text-gray-500 mt-2">Choose your preferred color scheme</p>
            </div>
          </section>

          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Timer size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Request Settings</h2>
                <p className="text-sm text-gray-400">Configure request behavior</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="max-w-md">
                <Input
                  type="number"
                  label="Request Timeout"
                  value={settings.timeoutMs}
                  onChange={(e) => handleUpdateSettings({ timeoutMs: parseInt(e.target.value) || 30000 })}
                  min="1000"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-2">Maximum time to wait for a response (in milliseconds)</p>
              </div>
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={settings.prettyJson}
                    onChange={(e) => handleUpdateSettings({ prettyJson: e.target.checked })}
                    className="mt-1 w-4 h-4 bg-gray-800 border-gray-700 rounded"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">Pretty Print JSON</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Automatically format JSON responses for better readability</p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Keyboard size={20} className="text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Keyboard Shortcuts</h2>
                <p className="text-sm text-gray-400">Speed up your workflow with hotkeys</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Actions</h3>
                </div>
                <div className="space-y-2">
                  {shortcuts.filter(s => s.category === 'Actions').map((shortcut) => (
                    <div key={shortcut.keys} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-sm text-gray-300">{shortcut.action}</span>
                      <kbd className="px-3 py-1.5 bg-gray-900 rounded-md text-xs font-mono text-gray-300 border border-gray-700 shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Navigation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shortcuts.filter(s => s.category === 'Navigation').map((shortcut) => (
                    <div key={shortcut.keys} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-sm text-gray-300">{shortcut.action}</span>
                      <kbd className="px-3 py-1.5 bg-gray-900 rounded-md text-xs font-mono text-gray-300 border border-gray-700 shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-yellow-500" />
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">General</h3>
                </div>
                <div className="space-y-2">
                  {shortcuts.filter(s => s.category === 'General').map((shortcut) => (
                    <div key={shortcut.keys} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <span className="text-sm text-gray-300">{shortcut.action}</span>
                      <kbd className="px-3 py-1.5 bg-gray-900 rounded-md text-xs font-mono text-gray-300 border border-gray-700 shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span className="text-blue-500">ℹ️</span>
                <span>Note: Use <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs font-mono border border-gray-700">Cmd</kbd> instead of <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs font-mono border border-gray-700">Ctrl</kbd> on macOS</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
