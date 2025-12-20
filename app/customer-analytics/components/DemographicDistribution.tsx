'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DemographicData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DemographicDistributionProps {
  title: string;
  icon: string;
  data: DemographicData[];
  totalLabel: string;
}

const DemographicDistribution = ({ 
  title, 
  icon, 
  data, 
  totalLabel 
}: DemographicDistributionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString('de-DE')} {totalLabel}
          </p>
        </div>
        <Icon name={icon as any} size={24} className="text-secondary" />
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="transition-smooth"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {item.value.toLocaleString('de-DE')}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    opacity: isHovered ? 1 : 0.8
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.map((item, index) => {
                const previousPercentage = data
                  .slice(0, index)
                  .reduce((sum, d) => sum + d.percentage, 0);
                const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                const strokeDashoffset = -previousPercentage;

                return (
                  <circle
                    key={item.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                    style={{ 
                      opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.3 
                    }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {total.toLocaleString('de-DE')}
                </p>
                <p className="text-xs text-muted-foreground">{totalLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicDistribution;
