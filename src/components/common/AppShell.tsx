"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  headerRightSlot?: React.ReactNode;
};

export default function AppShell({ children, title, headerRightSlot }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll lock wenn Sidebar offen (mobil)
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="lg:flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main */}
        <div className="flex-1 min-w-0">
          <Header
            title={title}
            onOpenSidebar={() => setSidebarOpen(true)}
            rightSlot={headerRightSlot}
          />

          {/* WICHTIG: min-w-0 verhindert, dass Kalender/Grid die Seite sprengt */}
          <main className="min-w-0 p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
