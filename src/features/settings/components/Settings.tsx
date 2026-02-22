import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { SettingsIcon } from 'lucide-react';

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
    { action: 'Send Request', keys: ['Ctrl', 'Enter'] },
    { action: 'Save to Collection', keys: ['Ctrl', 'S'] },
    { action: 'Focus Search', keys: ['Ctrl', 'F'] },
    { action: 'Request Builder', keys: ['Ctrl', 'Shift', 'B'] },
    { action: 'Collections', keys: ['Ctrl', 'Shift', 'C'] },
    { action: 'History', keys: ['Ctrl', 'Shift', 'H'] },
    { action: 'Environments', keys: ['Ctrl', 'Shift', 'E'] },
    { action: 'Runner', keys: ['Ctrl', 'Shift', 'R'] },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon size={28} className="text-gray-100" strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold text-gray-100 tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">Configure preferences and behavior</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">Appearance</h2>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-200 mb-1">Color Theme</label>
                    <p className="text-xs text-gray-500 mb-3">Select your preferred interface color scheme</p>
                  </div>
                  <div className="w-48">
                    <select
                      value={settings.theme}
                      onChange={(e) => handleUpdateSettings({ theme: e.target.value as 'dark' | 'light' })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">HTTP Requests</h2>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden divide-y divide-gray-800/50">
              <div className="p-5">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-200 mb-1">Request Timeout</label>
                    <p className="text-xs text-gray-500">Time limit before canceling requests (milliseconds)</p>
                  </div>
                  <div className="w-48">
                    <input
                      type="number"
                      value={settings.timeoutMs}
                      onChange={(e) => handleUpdateSettings({ timeoutMs: parseInt(e.target.value) || 30000 })}
                      min="1000"
                      step="1000"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200 mb-1">Pretty Print JSON</div>
                    <p className="text-xs text-gray-500">Auto-format JSON responses with indentation</p>
                  </div>
                  <div className="relative inline-block w-11 h-6 mt-0.5">
                    <input
                      type="checkbox"
                      checked={settings.prettyJson}
                      onChange={(e) => handleUpdateSettings({ prettyJson: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors peer-focus:ring-2 peer-focus:ring-blue-500/50"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-1">Keyboard Shortcuts</h2>
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
              <div className="divide-y divide-gray-800/30">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{shortcut.action}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                          <span key={`${shortcut.action}-${key}-${keyIdx}`} className="contents">
                            <kbd
                              className="min-w-[2rem] px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded border border-gray-700 shadow-sm text-center"
                            >
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-gray-600 text-xs mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-gray-800/20 border-t border-gray-800/50">
                <p className="text-xs text-gray-500">
                  macOS users: Replace <span className="text-gray-400 font-medium">Ctrl</span> with <span className="text-gray-400 font-medium">Cmd</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
