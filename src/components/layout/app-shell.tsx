'use client';

import type { ReactNode } from 'react';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/70 antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm shadow-sm">
              D
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
              Deadline
            </h1>
          </div>
        </header>
        <main className="px-4 py-5 pb-28 lg:pb-10 lg:px-10 lg:py-8 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
