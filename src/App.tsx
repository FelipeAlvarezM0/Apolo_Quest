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
      <div className="flex h-screen bg-bg-app text-text-primary">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 sm:w-64 border-r border-border-subtle flex flex-col
        bg-bg-sidebar
        transform transition-transform duration-normal ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-md py-lg border-b border-border-subtle">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-accent truncate">ApoloQuest</h1>
              <p className="text-xs mt-1 text-text-muted">Professional HTTP Client</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-bg-hover transition-all duration-fast flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-md py-md border-b border-border-subtle">
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
            Environment
          </label>
          <Select
            value={activeEnvironmentId || ''}
            onChange={(e) => setActiveEnvironment(e.target.value || null)}
            className="text-sm w-full"
          >
            <option value="">None</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </Select>
        </div>

        <nav className="flex-1 overflow-y-auto py-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-md py-2.5 text-left
                  transition-all duration-fast relative
                  ${isActive
                    ? 'text-text-primary bg-bg-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-md py-md border-t border-border-subtle">
          <div className="text-xs font-medium text-text-muted">Version 2.0.0</div>
          <div className="text-xs text-text-muted mt-1">UI Overhaul</div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-md py-md border-b border-border-subtle bg-bg-panel">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-bg-hover transition-all duration-fast"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-base font-semibold truncate px-2">
            {navItems.find(item => item.id === activeRoute)?.label}
          </h2>
          <div className="w-10" />
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
