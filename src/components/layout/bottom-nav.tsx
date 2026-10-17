'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  CheckSquare,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/jadwal', label: 'Jadwal', icon: Calendar },
  { href: '/tugas', label: 'Tugas', icon: CheckSquare },
  { href: '/catatan', label: 'Catatan', icon: StickyNote },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-md lg:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
      role="navigation"
      aria-label="Menu utama"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-xs transition-all focus-visible:outline-none',
                isActive
                  ? 'text-indigo-600 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn('p-1 rounded-full transition-colors', isActive && 'bg-indigo-50')}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
