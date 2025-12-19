"use client";

import React from "react";
import { Menu } from "lucide-react";

type HeaderProps = {
  title?: string;
  onOpenSidebar: () => void;
  rightSlot?: React.ReactNode; // optional: DateRangePicker / LocationSelector etc.
};

export default function Header({ title, onOpenSidebar, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-14 px-3 sm:px-4 lg:px-6 flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 truncate">
            {title ?? "Dashboard"}
          </div>
        </div>

        {/* optional right area */}
        {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
