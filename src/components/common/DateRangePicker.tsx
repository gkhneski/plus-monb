'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
}

type PresetPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const DateRangePicker = ({ selectedRange, onRangeChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<PresetPeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presets = [
    { id: 'today' as PresetPeriod, label: 'Heute', icon: 'CalendarIcon' },
    { id: 'week' as PresetPeriod, label: 'Diese Woche', icon: 'CalendarIcon' },
    { id: 'month' as PresetPeriod, label: 'Dieser Monat', icon: 'CalendarIcon' },
    { id: 'quarter' as PresetPeriod, label: 'Dieses Quartal', icon: 'CalendarIcon' },
    { id: 'year' as PresetPeriod, label: 'Dieses Jahr', icon: 'CalendarIcon' },
    { id: 'custom' as PresetPeriod, label: 'Benutzerdefiniert', icon: 'AdjustmentsHorizontalIcon' },
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

  const getDateRange = (period: PresetPeriod): DateRange => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (period) {
      case 'today':
        return { startDate: startOfDay, endDate: today };
      
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        return { startDate: startOfWeek, endDate: today };
      
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: startOfMonth, endDate: today };
      
      case 'quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
        return { startDate: startOfQuarter, endDate: today };
      
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return { startDate: startOfYear, endDate: today };
      
      default:
        return { startDate: startOfDay, endDate: today };
    }
  };

  const handlePresetClick = (period: PresetPeriod) => {
    setActivePeriod(period);
    
    if (period !== 'custom') {
      const range = getDateRange(period);
      onRangeChange?.(range);
      setIsOpen(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      const range: DateRange = {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate),
      };
      onRangeChange?.(range);
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (activePeriod === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    
    const preset = presets.find(p => p.id === activePeriod);
    return preset?.label || 'Zeitraum wählen';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg
                   hover:bg-muted transition-smooth text-sm font-medium text-foreground
                   min-w-[220px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon name="CalendarIcon" size={18} className="text-secondary" />
          <span className="truncate">{formatDateRange()}</span>
        </div>
        <Icon 
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
          size={18} 
          className="text-secondary flex-shrink-0"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border 
                       rounded-lg shadow-floating z-50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Zeitraum auswählen</h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-smooth
                    ${activePeriod === preset.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  <Icon 
                    name={preset.icon as any} 
                    size={16} 
                    className={activePeriod === preset.id ? 'text-primary-foreground' : 'text-secondary'}
                  />
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activePeriod === 'custom' && (
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg
                             text-sm text-foreground focus:outline-none focus:ring-2 
                             focus:ring-ring transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg
                             text-sm text-foreground focus:outline-none focus:ring-2 
                             focus:ring-ring transition-smooth"
                  />
                </div>
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!customStartDate || !customEndDate}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg
                           font-medium text-sm hover:bg-primary/90 transition-smooth
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anwenden
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;