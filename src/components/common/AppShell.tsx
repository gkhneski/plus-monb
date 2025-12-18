'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Scroll lock + ESC close
  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-slate-950 text-white overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64">
        <Sidebar variant="desktop" />
      </div>

      {/* Main */}
      <div className="lg:pl-64 min-w-0">
        {/* Mobile Topbar */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 active:scale-[0.99]"
              aria-label="Menü öffnen"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="text-white font-semibold leading-tight">Booking Pro</div>
              <div className="text-white/60 text-sm truncate">Management System</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-50',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <button
          type="button"
          className={[
            'absolute inset-0 bg-black/55 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-label="Overlay schließen"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          className={[
            'absolute inset-y-0 left-0 w-[86vw] max-w-[340px]',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="sr-only">
            <button ref={closeBtnRef} onClick={() => setMobileOpen(false)}>
              close
            </button>
          </div>

          <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </div>
  );
}
