'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StaffSelectorProps {
  selectedView: 'team' | 'individual';
  onViewChange?: (view: 'team' | 'individual') => void;
  selectedStaff?: string;
  onStaffChange?: (staffId: string) => void;
}

const StaffSelector = ({ 
  selectedView, 
  onViewChange,
  selectedStaff,
  onStaffChange 
}: StaffSelectorProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const staffMembers = [
    { id: '1', name: 'Anna Schmidt', role: 'Senior Kosmetikerin' },
    { id: '2', name: 'Maria Weber', role: 'Kosmetikerin' },
    { id: '3', name: 'Julia Müller', role: 'Kosmetikerin' },
    { id: '4', name: 'Sophie Fischer', role: 'Junior Kosmetikerin' },
    { id: '5', name: 'Laura Bauer', role: 'Empfang' },
  ];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-48 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const handleViewToggle = (view: 'team' | 'individual') => {
    onViewChange?.(view);
    if (view === 'team') {
      setIsOpen(false);
    }
  };

  const handleStaffSelect = (staffId: string) => {
    onStaffChange?.(staffId);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedView === 'team') return 'Gesamtes Team';
    const staff = staffMembers.find(s => s.id === selectedStaff);
    return staff?.name || 'Mitarbeiter wählen';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => handleViewToggle('team')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
            selectedView === 'team' ?'bg-card text-foreground shadow-subtle' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="UserGroupIcon" size={18} />
            <span>Team</span>
          </div>
        </button>
        <button
          onClick={() => handleViewToggle('individual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
            selectedView === 'individual' ?'bg-card text-foreground shadow-subtle' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name="UserIcon" size={18} />
            <span>Einzeln</span>
          </div>
        </button>
      </div>

      {selectedView === 'individual' && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg
                     hover:bg-muted transition-smooth text-sm font-medium text-foreground
                     min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon name="UserCircleIcon" size={18} className="text-secondary" />
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <Icon 
              name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
              size={18} 
              className="text-secondary flex-shrink-0"
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border 
                         rounded-lg shadow-floating z-50 max-h-96 overflow-hidden">
              <div className="overflow-y-auto max-h-80">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 
                             hover:bg-muted transition-smooth text-left ${
                               selectedStaff === staff.id ? 'bg-muted' : ''
                             }`}
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {staff.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {staff.role}
                      </div>
                    </div>
                    {selectedStaff === staff.id && (
                      <Icon name="CheckIcon" size={18} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffSelector;
