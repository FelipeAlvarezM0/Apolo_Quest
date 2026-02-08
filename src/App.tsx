import { useState, useEffect } from 'react';
import { RequestBuilder } from './features/request-builder/components/RequestBuilder';
import { Collections } from './features/collections/components/Collections';
import { History } from './features/history/components/History';
import { Environments } from './features/environments/components/Environments';
import { Runner } from './features/runner/components/Runner';
import { ImportExport } from './features/import-export/components/ImportExport';
import { CurlGenerator } from './features/curl-generator/components/CurlGenerator';
import { Settings } from './features/settings/components/Settings';
import { Select } from './shared/ui/Select';
import { ToastContainer } from './shared/ui/Toast';
import { useEnvironmentStore } from './features/environments/store/useEnvironmentStore';
import { useSettingsStore } from './features/settings/store/useSettingsStore';
import { useToastStore } from './shared/ui/useToastStore';
import {
  Send,
  FolderOpen,
  Clock,
  Globe,
  Play,
  Download,
  Terminal,
  Settings as SettingsIcon,
  Menu,
  X,
} from 'lucide-react';

type Route = 'builder' | 'collections' | 'history' | 'environments' | 'runner' | 'import-export' | 'curl' | 'settings';

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('builder');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { environments, loadEnvironments, activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();
  const { settings, loadSettings } = useSettingsStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    loadEnvironments();
    loadSettings();
  }, [loadEnvironments, loadSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            setActiveRoute('builder');
            break;
          case 'c':
            e.preventDefault();
            setActiveRoute('collections');
            break;
          case 'h':
            e.preventDefault();
            setActiveRoute('history');
            break;
          case 'e':
            e.preventDefault();
            setActiveRoute('environments');
            break;
          case 'r':
            e.preventDefault();
            setActiveRoute('runner');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'builder' as Route, label: 'Request Builder', icon: Send },
    { id: 'collections' as Route, label: 'Collections', icon: FolderOpen },
    { id: 'history' as Route, label: 'History', icon: Clock },
    { id: 'environments' as Route, label: 'Environments', icon: Globe },
    { id: 'runner' as Route, label: 'Runner', icon: Play },
    { id: 'import-export' as Route, label: 'Import/Export', icon: Download },
    { id: 'curl' as Route, label: 'cURL', icon: Terminal },
    { id: 'settings' as Route, label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (route: Route) => {
    setActiveRoute(route);
    setSidebarOpen(false);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className={`flex h-screen ${settings.theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-gray-950 text-gray-100'}`}>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 sm:w-64 border-r flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${settings.theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}
      `}>
        <div className={`p-3 sm:p-4 border-b ${settings.theme === 'light' ? 'border-gray-200' : 'border-gray-800'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-blue-500 truncate">ApoloQuest</h1>
              <p className={`text-xs mt-0.5 sm:mt-1 ${settings.theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>Professional HTTP Client</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-1 rounded flex-shrink-0 ${
                settings.theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
              }`}
            >
              <X size={18} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>

        <div className={`p-3 sm:p-4 border-b ${settings.theme === 'light' ? 'border-gray-200' : 'border-gray-800'}`}>
          <Select
            value={activeEnvironmentId || ''}
            onChange={(e) => setActiveEnvironment(e.target.value || null)}
            className="text-xs sm:text-sm w-full"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </Select>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors ${
                  activeRoute === item.id
                    ? 'bg-blue-600 text-white'
                    : settings.theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon size={16} className="sm:hidden flex-shrink-0" />
                <Icon size={18} className="hidden sm:block flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-3 sm:p-4 border-t text-xs ${settings.theme === 'light' ? 'border-gray-200 text-gray-500' : 'border-gray-800 text-gray-500'}`}>
          <div className="font-medium">v1.3.5</div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs">Built</div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className={`lg:hidden flex items-center justify-between p-3 sm:p-4 border-b ${
          settings.theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'
        }`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              settings.theme === 'light'
                ? 'hover:bg-gray-100 text-gray-700'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <Menu size={20} className="sm:hidden" />
            <Menu size={24} className="hidden sm:block" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold truncate px-2">
            {navItems.find(item => item.id === activeRoute)?.label}
          </h2>
          <div className="w-8 sm:w-10" />
        </div>

        <div className="flex-1 overflow-hidden">
          {activeRoute === 'builder' && <RequestBuilder />}
          {activeRoute === 'collections' && <Collections />}
          {activeRoute === 'history' && <History />}
          {activeRoute === 'environments' && <Environments />}
          {activeRoute === 'runner' && <Runner />}
          {activeRoute === 'import-export' && <ImportExport />}
          {activeRoute === 'curl' && <CurlGenerator />}
          {activeRoute === 'settings' && <Settings />}
        </div>
      </main>
    </div>
    </>
  );
}

export default App;
