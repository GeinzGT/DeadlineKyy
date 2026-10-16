'use client';

import type { ReactNode } from 'react';
import { DataProvider } from '@/hooks/use-data';
import { AppShell } from '@/components/layout/app-shell';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <AppShell>{children}</AppShell>
    </DataProvider>
  );
}
