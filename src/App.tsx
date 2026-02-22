import { useState, useEffect } from 'react';
import { RequestBuilder } from './features/request-builder/components/RequestBuilder';
import { Collections } from './features/collections/components/Collections';
import { History } from './features/history/components/History';
import { Environments } from './features/environments/components/Environments';
import { Runner } from './features/runner/components/Runner';
import { ImportExport } from './features/import-export/components/ImportExport';
import { CurlGenerator } from './features/curl-generator/components/CurlGenerator';
import { Settings } from './features/settings/components/Settings';
import { FlowListPage } from './features/flows/ui/FlowListPage';
import { FlowEditorPage } from './features/flows/ui/FlowEditorPage';
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
  Workflow,
} from 'lucide-react';

type Route = 'builder' | 'collections' | 'history' | 'environments' | 'runner' | 'import-export' | 'curl' | 'settings' | 'flows' | 'flow-editor';

function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('builder');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const { environments, loadEnvironments, activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();
  const { loadSettings } = useSettingsStore();
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

  const navSections = [
    {
      title: 'Core',
      items: [
        { id: 'builder' as Route, label: 'Request Builder', icon: Send },
      ],
    },
    {
      title: 'Organization',
      items: [
        { id: 'collections' as Route, label: 'Collections', icon: FolderOpen },
        { id: 'history' as Route, label: 'History', icon: Clock },
        { id: 'environments' as Route, label: 'Environments', icon: Globe },
      ],
    },
    {
      title: 'Automation',
      items: [
        { id: 'runner' as Route, label: 'Runner', icon: Play },
        { id: 'flows' as Route, label: 'Flows', icon: Workflow },
      ],
    },
    {
      title: 'Utilities',
      items: [
        { id: 'import-export' as Route, label: 'Import/Export', icon: Download },
        { id: 'curl' as Route, label: 'cURL', icon: Terminal },
        { id: 'settings' as Route, label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((section) => section.items);
  const activeNavItem = allNavItems.find((item) => item.id === activeRoute);

  const handleNavClick = (route: Route) => {
    setActiveRoute(route);
    setSidebarOpen(false);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="relative flex h-screen overflow-hidden bg-bg-app text-text-primary">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-status-info/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 border-r border-border-subtle flex flex-col
        bg-bg-sidebar/95 backdrop-blur-lg
        transform transition-transform duration-normal ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-md py-lg border-b border-border-subtle bg-gradient-to-br from-status-info/10 via-transparent to-accent/10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight text-text-primary truncate">ApoloQuest</h1>
              <p className="text-xs mt-1 text-text-muted">Build, test and orchestrate APIs visually</p>
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
          {navSections.map((section, sectionIdx) => (
            <div key={section.title}>
              {sectionIdx > 0 && (
                <div className="my-2 mx-md h-px bg-border-subtle" />
              )}
              <div className="px-md py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </span>
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      mx-sm w-[calc(100%-16px)] rounded-lg border border-transparent
                      flex items-center gap-3 px-3 py-2.5 text-left
                      transition-all duration-fast relative
                      ${isActive
                        ? 'text-text-primary bg-bg-hover border-border-default panel-shadow'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/80'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent" />
                    )}
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-md py-md border-t border-border-subtle bg-bg-panel/70">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-text-primary">ApoloQuest</div>
              <div className="text-text-muted mt-0.5">Version 2.3.0</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
        <div className="hidden lg:flex items-center justify-between px-lg py-md border-b border-border-subtle bg-bg-panel/85 backdrop-blur-md">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {activeRoute === 'flow-editor' ? 'Flow Editor' : activeNavItem?.label}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Professional API workspace with visual automation
            </p>
          </div>
        </div>

        <div className="lg:hidden flex items-center justify-between px-md py-md border-b border-border-subtle bg-bg-panel/95 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-bg-hover transition-all duration-fast"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-base font-semibold truncate px-2">
            {activeRoute === 'flow-editor'
              ? 'Flow Editor'
              : allNavItems.find(item => item.id === activeRoute)?.label}
          </h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-hidden animate-rise-in">
          {activeRoute === 'builder' && <RequestBuilder />}
          {activeRoute === 'collections' && <Collections />}
          {activeRoute === 'history' && <History />}
          {activeRoute === 'environments' && <Environments />}
          {activeRoute === 'runner' && <Runner />}
          {activeRoute === 'import-export' && <ImportExport />}
          {activeRoute === 'curl' && <CurlGenerator />}
          {activeRoute === 'settings' && <Settings />}
          {activeRoute === 'flows' && (
            <FlowListPage
              onNavigateToEditor={(flowId) => {
                setActiveFlowId(flowId);
                setActiveRoute('flow-editor');
              }}
            />
          )}
          {activeRoute === 'flow-editor' && activeFlowId && (
            <FlowEditorPage
              flowId={activeFlowId}
              onNavigateToList={() => {
                setActiveRoute('flows');
                setActiveFlowId(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
    </>
  );
}

export default App;
