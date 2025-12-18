'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  FileText,
  Users,
  Sparkles,
  User,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router?.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/online-calendar', label: 'Online Kalender', icon: Calendar },
    { path: '/buchungen', label: 'Buchungen', icon: FileText },
    { path: '/kunden', label: 'Kunden', icon: Users },
    { path: '/behandlungen', label: 'Behandlungen', icon: Sparkles },
    { path: '/mitarbeiter', label: 'Mitarbeiter', icon: User },
    { path: '/filialen', label: 'Filialen', icon: Building2 },
    { path: '/einstellungen', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 text-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-slate-200" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold leading-tight text-slate-100">Booking Pro</div>
            <div className="text-xs text-slate-400">Management System</div>
          </div>
        </div>

        {user?.email && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-100 truncate">{user.email}</div>
                <div className="text-xs text-slate-400">Administrator</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav (scrollt nur hier) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'group flex items-center justify-between rounded-xl px-3 py-2.5',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={[
                      'h-9 w-9 rounded-lg flex items-center justify-center border',
                      isActive
                        ? 'bg-white/10 border-white/10'
                        : 'bg-slate-900/60 border-slate-800 group-hover:bg-slate-900',
                    ].join(' ')}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <span className="text-[13px] font-medium truncate">{item.label}</span>
                </div>

                <ChevronRight
                  className={[
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-slate-200' : 'text-slate-600 group-hover:text-slate-300',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-[13px] font-semibold text-red-100
                     hover:bg-red-500/15 hover:border-red-500/35 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" />
            Abmelden
          </span>
        </button>
      </div>
    </aside>
  );
}
