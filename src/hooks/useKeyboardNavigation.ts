import { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export type MainMobileTab = 'home' | 'search' | 'applications' | 'messages' | 'profile';

/**
 * Pure helper to verify if the event target is an editable input/textarea/select
 */
export function isTargetInputOrEditable(target: EventTarget | null): boolean {
  if (!target) return false;
  if (typeof HTMLElement !== 'undefined' && !(target instanceof HTMLElement)) {
    return false;
  }
  const el = target as { tagName?: string; isContentEditable?: boolean };
  if (!el.tagName) return false;
  const tagName = el.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    Boolean(el.isContentEditable)
  );
}

/**
 * Pure helper to map numeric keys 1-5 to main mobile tabs
 */
export function getTabForNumericKey(key: string): MainMobileTab | null {
  switch (key) {
    case '1':
      return 'home';
    case '2':
      return 'search';
    case '3':
      return 'applications';
    case '4':
      return 'messages';
    case '5':
      return 'profile';
    default:
      return null;
  }
}

export interface UseKeyboardNavigationOptions {
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for mobile tab navigation (1-5 keys)
 * and 'Space' to toggle the JobSearch filter slide-over panel.
 */
export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const { enabled = true } = options;
  const {
    activeTab,
    setActiveTab,
    currentRole,
    isJobSearchFilterOpen,
    setIsJobSearchFilterOpen,
    toggleJobSearchFilter,
  } = useApp();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Do not trigger shortcuts if user is typing in any form input
      if (isTargetInputOrEditable(e.target)) {
        return;
      }

      // Ignore if modifier keys are active to avoid intercepting browser shortcuts (e.g. Cmd+1)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Tab navigation via 1-5 numeric keys (Seeker mode)
      if (currentRole === 'seeker') {
        const targetTab = getTabForNumericKey(e.key);
        if (targetTab) {
          e.preventDefault();
          setActiveTab(targetTab);
          return;
        }
      }

      // 'Space' key: Toggle JobSearch filter panel
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (activeTab !== 'search') {
          setActiveTab('search');
          setIsJobSearchFilterOpen(true);
        } else {
          toggleJobSearchFilter();
        }
        return;
      }

      // 'Escape' key: Close filter panel if open
      if (e.key === 'Escape' && isJobSearchFilterOpen) {
        e.preventDefault();
        setIsJobSearchFilterOpen(false);
        return;
      }
    },
    [
      enabled,
      currentRole,
      activeTab,
      setActiveTab,
      isJobSearchFilterOpen,
      setIsJobSearchFilterOpen,
      toggleJobSearchFilter,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    activeTab,
    isJobSearchFilterOpen,
    toggleJobSearchFilter,
  };
};
