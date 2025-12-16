'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Segment {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface SegmentSelectorProps {
  segments: Segment[];
  selectedSegment: string;
  onSegmentChange: (segmentId: string) => void;
}

const SegmentSelector = ({ segments, selectedSegment, onSegmentChange }: SegmentSelectorProps) => {
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

  const currentSegment = segments.find(s => s.id === selectedSegment);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-lg
                   hover:bg-muted transition-smooth text-sm font-medium text-foreground
                   min-w-[240px] justify-between"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentSegment?.color }}
          />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold">{currentSegment?.name}</span>
            <span className="text-xs text-muted-foreground">{currentSegment?.count} Kunden</span>
          </div>
        </div>
        <Icon 
          name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
          size={18} 
          className="text-secondary"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border 
                       rounded-lg shadow-floating z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Kundensegmente</h3>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => {
                  onSegmentChange(segment.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 
                  hover:bg-muted transition-smooth
                  ${selectedSegment === segment.id ? 'bg-muted' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{segment.name}</span>
                    <span className="text-xs text-muted-foreground">{segment.count} Kunden</span>
                  </div>
                </div>
                {selectedSegment === segment.id && (
                  <Icon name="CheckIcon" size={18} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentSelector;