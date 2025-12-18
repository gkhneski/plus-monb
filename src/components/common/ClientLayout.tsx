'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

const PUBLIC_ROUTES = ['/login', '/signup'];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  // Public pages: kein AppShell/keine Sidebar
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // Protected pages: AppShell regelt responsive Sidebar (Desktop + Mobile Drawer)
  return <AppShell>{children}</AppShell>;
}
