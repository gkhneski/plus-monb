"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { path: "/online-calendar", label: "Online Kalender", icon: Calendar },
    { path: "/buchungen", label: "Buchungen", icon: FileText },
    { path: "/kunden", label: "Kunden", icon: Users },
    { path: "/behandlungen", label: "Behandlungen", icon: Sparkles },
    { path: "/mitarbeiter", label: "Mitarbeiter", icon: User },
    { path: "/filialen", label: "Filialen", icon: Building2 },
    { path: "/einstellungen", label: "Einstellungen", icon: Settings },
  ];

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  // Overlay nur mobil
  const showOverlay = open;

  return (
    <>
      {showOverlay && (
        <button
          aria-label="Sidebar schließen"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 shrink-0",
          "bg-gradient-to-b from-slate-950 to-slate-900 text-white",
          "border-r border-white/10",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:z-auto",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold">Booking Pro</div>
                <div className="text-xs text-white/60">Management System</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Card */}
          <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="text-sm font-medium truncate">
              {user?.email ?? "—"}
            </div>
            <div className="text-xs text-white/60">Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => onClose()} // mobil: nach klick schließen
                    className={[
                      "group flex items-center justify-between gap-3 rounded-2xl px-3 py-3",
                      "transition-colors",
                      active
                        ? "bg-white/10 border border-white/10"
                        : "hover:bg-white/7",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={[
                          "h-9 w-9 rounded-xl flex items-center justify-center border",
                          active
                            ? "bg-white/10 border-white/15"
                            : "bg-white/5 border-white/10 group-hover:bg-white/7",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-medium truncate">{item.label}</span>
                    </span>

                    <ChevronRight className="h-4 w-4 text-white/50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 bg-red-500/10 border border-red-400/20 hover:bg-red-500/15 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Abmelden</span>
          </button>
        </div>
      </aside>
    </>
  );
}
