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
  ChevronRight
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
    { path: '/mitarbeiter', label: 'Mitarbeitern', icon: User },
    { path: '/filialen', label: 'Filialen', icon: Building2 },
    { path: '/einstellungen', label: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl border-r border-slate-700/50">
      {/* Logo/Header */}
      <div className="p-8 border-b border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Booking Pro
            </h1>
            <p className="text-xs text-slate-400 font-medium">Management System</p>
          </div>
        </div>
        {user?.email && (
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-6 space-y-2">
        {menuItems?.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item?.path;
          
          return (
            <Link
              key={item?.path}
              href={item?.path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white hover:translate-x-1'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/60'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{item?.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                isActive ? 'text-white/80' : 'text-slate-500 group-hover:text-slate-300'
              } ${isActive ? 'rotate-0' : 'group-hover:translate-x-1'}`} />
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-slate-700/50">
        <button
          onClick={handleSignOut}
          className="w-full group flex items-center justify-center space-x-3 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold text-sm">Abmelden</span>
        </button>
      </div>
    </div>
  );
}