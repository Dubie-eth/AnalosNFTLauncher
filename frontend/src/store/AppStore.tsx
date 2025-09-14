'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAppStore } from './useAppStore';

interface AppStoreProviderProps {
  children: ReactNode;
}

const AppStoreContext = createContext<ReturnType<typeof useAppStore> | null>(null);

export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const store = useAppStore();
  
  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStoreContext() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStoreContext must be used within AppStoreProvider');
  }
  return context;
}
