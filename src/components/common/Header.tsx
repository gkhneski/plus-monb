'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const Header = ({ onMenuToggle, showMenuButton = true }: HeaderProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/main-dashboard-overview',
      icon: 'ChartBarIcon',
      tooltip: 'Haupt-KPI-Übersicht und operative Einblicke'
    },
    { 
      label: 'Kunden', 
      path: '/customer-analytics',
      icon: 'UsersIcon',
      tooltip: 'Kundenanalyse und Segmentierung'
    },
    { 
      label: 'Filialen', 
      path: '/location-performance',
      icon: 'BuildingStorefrontIcon',
      tooltip: 'Standortleistung und Vergleich'
    },
    { 
      label: 'Mitarbeiter', 
      path: '/staff-performance',
      icon: 'UserGroupIcon',
      tooltip: 'Mitarbeiterproduktivität und Planung'
    },
  ];

  const isActive = (path: string) => pathname === path;

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-subtle">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
              aria-label="Toggle menu"
            >
              <Icon name="Bars3Icon" size={24} className="text-foreground" />
            </button>
          )}
          
          <Link href="/main-dashboard-overview" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Icon name="SparklesIcon" size={24} className="text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Cosmetics Studio
              </h1>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              title={item.tooltip}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-smooth
                ${isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon 
                name={item.icon as any} 
                size={18} 
                className={isActive(item.path) ? 'text-primary-foreground' : 'text-secondary'}
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMobileMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Toggle mobile menu"
          >
            <Icon 
              name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} 
              size={24} 
              className="text-foreground" 
            />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="flex flex-col p-4 gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                  transition-smooth
                  ${isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon 
                  name={item.icon as any} 
                  size={20} 
                  className={isActive(item.path) ? 'text-primary-foreground' : 'text-secondary'}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;