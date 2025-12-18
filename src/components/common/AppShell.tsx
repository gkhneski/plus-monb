'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Body scroll lock wenn Drawer offen
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64">
        <Sidebar variant="desktop" onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Mobile Drawer + Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px]">
            <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Mobile Topbar */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 active:scale-[0.99]"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className="min-w-0">
              <div className="text-white font-semibold leading-tight">Booking Pro</div>
              <div className="text-white/60 text-sm truncate">Management System</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
