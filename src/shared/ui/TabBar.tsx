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
    <div className="flex items-center justify-between border-b border-border-subtle bg-bg-panel">
      <div className="flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-md py-sm text-sm font-medium transition-all duration-normal
              hover:text-text-primary hover:bg-bg-hover
              ${
                activeTab === tab.id
                  ? 'text-text-primary bg-bg-elevated'
                  : 'text-text-secondary'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs text-text-muted">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>
      {actions && <div className="px-md py-sm">{actions}</div>}
    </div>
  );
}
