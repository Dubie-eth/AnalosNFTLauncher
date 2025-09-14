'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppStoreProvider } from '@/store/AppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <WalletProvider>
          <AppStoreProvider>
            {children}
          </AppStoreProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
