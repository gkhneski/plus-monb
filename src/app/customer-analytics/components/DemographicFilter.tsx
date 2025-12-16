'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface DemographicFilterProps {
  title: string;
  icon: string;
  options: FilterOption[];
  selectedOptions: string[];
  onFilterChange: (optionIds: string[]) => void;
}

const DemographicFilter = ({ 
  title, 
  icon, 
  options, 
  selectedOptions, 
  onFilterChange 
}: DemographicFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionId: string) => {
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    onFilterChange(newSelected);
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return `Alle ${title}`;
    if (selectedOptions.length === options.length) return `Alle ${title}`;
    return `${selectedOptions.length} ausgewählt`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg
                   hover:bg-muted transition-smooth text-sm font-medium text-foreground
                   min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon name={icon as any} size={18} className="text-secondary" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <Icon 
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
          size={18} 
          className="text-secondary flex-shrink-0"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-popover border border-border 
                       rounded-lg shadow-floating z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggle(option.id)}
                  className="w-full flex items-center justify-between px-4 py-3 
                           hover:bg-muted transition-smooth"
                >
                  <div className="flex items-center gap-3">
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
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.count} Kunden</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicFilter;