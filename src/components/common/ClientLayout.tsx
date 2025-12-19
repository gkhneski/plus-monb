"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideShell = useMemo(() => {
    if (!pathname) return false;
    return pathname === "/login" || pathname.startsWith("/signup");
  }, [pathname]);

  if (hideShell) return <>{children}</>;

  return <AppShell>{children}</AppShell>;
}
