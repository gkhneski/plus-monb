'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

type UserRole = 'super_admin' | 'studio_manager' | 'reception_staff' | 'business_owner';

interface UserRoleIndicatorProps {
  userName?: string;
  userRole?: UserRole;
  userEmail?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const UserRoleIndicator = ({ 
  userName = 'Max Mustermann',
  userRole = 'studio_manager',
  userEmail = 'max.mustermann@cosmetics-studio.at',
  onLogout,
  onProfileClick,
  onSettingsClick
}: UserRoleIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    studio_manager: 'Studio Manager',
    reception_staff: 'Empfang',
    business_owner: 'Geschäftsführer',
  };

  const roleIcons: Record<UserRole, string> = {
    super_admin: 'ShieldCheckIcon',
    studio_manager: 'UserCircleIcon',
    reception_staff: 'UserIcon',
    business_owner: 'BriefcaseIcon',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick?.();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    onSettingsClick?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-smooth group"
      >
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-foreground">{userName}</span>
          <span className="text-xs text-muted-foreground">{roleLabels[userRole]}</span>
        </div>
        
        <div className="flex items-center justify-center w-10 h-10 rounded-full 
                       bg-primary text-primary-foreground font-semibold text-sm">
          {getInitials(userName)}
        </div>
        
        <Icon 
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
          size={18} 
          className="text-secondary hidden sm:block"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-popover border border-border 
                       rounded-lg shadow-floating z-50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full 
                           bg-primary text-primary-foreground font-semibold">
                {getInitials(userName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Icon 
                    name={roleIcons[userRole] as any} 
                    size={14} 
                    className="text-secondary"
                  />
                  <span className="text-xs font-medium text-secondary">
                    {roleLabels[userRole]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium
                       text-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="UserCircleIcon" size={18} className="text-secondary" />
              <span>Mein Profil</span>
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium
                       text-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="Cog6ToothIcon" size={18} className="text-secondary" />
              <span>Einstellungen</span>
            </button>
          </div>

          <div className="border-t border-border p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-smooth"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={18} className="text-error" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleIndicator;