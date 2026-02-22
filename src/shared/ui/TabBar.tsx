import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  actions?: ReactNode;
}

export function TabBar({ tabs, activeTab, onTabChange, actions }: TabBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-bg-panel px-2 py-2">
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-normal
              hover:text-text-primary
              ${
                activeTab === tab.id
                  ? 'text-text-primary bg-bg-elevated border-border-default shadow-md shadow-black/10'
                  : 'text-text-secondary border-transparent hover:bg-bg-hover'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-bg-hover px-1.5 py-0.5 text-[11px] text-text-muted">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      {actions && <div className="px-1">{actions}</div>}
    </div>
  );
}
