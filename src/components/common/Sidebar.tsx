'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

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
    { path: '/online-calendar', label: 'Online Kalender', icon: '📅' },
    { path: '/buchungen', label: 'Buchungen', icon: '📝' },
    { path: '/kunden', label: 'Kunden', icon: '👥' },
    { path: '/behandlungen', label: 'Behandlungen', icon: '💆' },
    { path: '/mitarbeiter', label: 'Mitarbeitern', icon: '👤' },
    { path: '/filialen', label: 'Filialen', icon: '🏢' },
    { path: '/einstellungen', label: 'Einstellungen', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-2xl font-bold">Booking System</h1>
        {user?.email && (
          <p className="text-indigo-300 text-sm mt-2 truncate">{user?.email}</p>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems?.map((item) => (
            <li key={item?.path}>
              <Link
                href={item?.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item?.path
                    ? 'bg-indigo-800 text-white' :'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item?.icon}</span>
                <span className="font-medium">{item?.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Logout Button */}
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </div>
  );
}