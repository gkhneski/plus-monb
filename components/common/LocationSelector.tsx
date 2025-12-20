'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Location {
  id: string;
  name: string;
  city: string;
}

interface LocationSelectorProps {
  selectedLocations?: string[];
  onLocationChange?: (locationIds: string[]) => void;
  multiSelect?: boolean;
}

const LocationSelector = ({ 
  selectedLocations = [], 
  onLocationChange,
  multiSelect = true 
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedLocations);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locations: Location[] = [
    { id: '1', name: 'Hauptfiliale Wien', city: 'Wien' },
    { id: '2', name: 'Filiale Graz', city: 'Graz' },
    { id: '3', name: 'Filiale Salzburg', city: 'Salzburg' },
    { id: '4', name: 'Filiale Innsbruck', city: 'Innsbruck' },
    { id: '5', name: 'Filiale Linz', city: 'Linz' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationToggle = (locationId: string) => {
    let newSelected: string[];
    
    if (multiSelect) {
      if (selected.includes(locationId)) {
        newSelected = selected.filter(id => id !== locationId);
      } else {
        newSelected = [...selected, locationId];
      }
    } else {
      newSelected = [locationId];
      setIsOpen(false);
    }
    
    setSelected(newSelected);
    onLocationChange?.(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = locations.map(loc => loc.id);
    setSelected(allIds);
    onLocationChange?.(allIds);
  };

  const handleClearAll = () => {
    setSelected([]);
    onLocationChange?.([]);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return 'Alle Standorte';
    if (selected.length === locations.length) return 'Alle Standorte';
    if (selected.length === 1) {
      const location = locations.find(loc => loc.id === selected[0]);
      return location?.name || 'Standort auswählen';
    }
    return `${selected.length} Standorte`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg
                   hover:bg-muted transition-smooth text-sm font-medium text-foreground
                   min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon name="MapPinIcon" size={18} className="text-secondary" />
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
          {multiSelect && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
              >
                Alle auswählen
              </button>
              <button
                onClick={handleClearAll}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                Auswahl löschen
              </button>
            </div>
          )}
          
          <div className="overflow-y-auto max-h-80">
            {locations.map((location) => {
              const isSelected = selected.includes(location.id);
              
              return (
                <button
                  key={location.id}
                  onClick={() => handleLocationToggle(location.id)}
                  className="w-full flex items-center justify-between px-4 py-3 
                           hover:bg-muted transition-smooth text-left"
                >
                  <div className="flex items-center gap-3">
                    {multiSelect && (
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        transition-smooth
                        ${isSelected 
                          ? 'bg-primary border-primary' :'border-border bg-card'
                        }
                      `}>
                        {isSelected && (
                          <Icon name="CheckIcon" size={14} className="text-primary-foreground" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {location.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {location.city}
                      </div>
                    </div>
                  </div>
                  
                  {!multiSelect && isSelected && (
                    <Icon name="CheckIcon" size={18} className="text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
