import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Search, Layers, MessageSquare, User } from 'lucide-react';

interface TabItem {
  id: 'home' | 'search' | 'applications' | 'messages' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
  shortcut: string;
}

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, applications } = useApp();

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home, shortcut: '1' },
    { id: 'search', label: 'Search', icon: Search, shortcut: '2' },
    {
      id: 'applications',
      label: 'Applied',
      icon: Layers,
      badge: applications.length,
      shortcut: '3',
    },
    { id: 'messages', label: 'Chat', icon: MessageSquare, badge: 1, shortcut: '4' },
    { id: 'profile', label: 'Profile', icon: User, shortcut: '5' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800/80 px-3 flex items-center justify-around z-40 select-none transition-colors"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            title={`${tab.label} (Press ${tab.shortcut})`}
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] relative transition-colors cursor-pointer group ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 transition-transform group-active:scale-95" strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center px-0.5">
                  {tab.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              <kbd className="hidden sm:inline-block px-1 py-0 rounded text-[8px] font-mono bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                {tab.shortcut}
              </kbd>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
