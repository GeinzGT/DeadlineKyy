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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:border-slate-200 lg:bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight">
          Deadline
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menu utama">
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
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
                isActive
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-400">Mode demo lokal</p>
      </div>
    </aside>
  );
}
