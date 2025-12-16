'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  bookings: number;
}

interface BookingBehaviorHeatmapProps {
  data: HeatmapCell[];
  onCellClick?: (cell: HeatmapCell) => void;
}

const BookingBehaviorHeatmap = ({ data, onCellClick }: BookingBehaviorHeatmapProps) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

  const maxValue = Math.max(...data.map(cell => cell.value));

  const getIntensityColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return 'bg-primary';
    if (intensity > 0.6) return 'bg-primary/80';
    if (intensity > 0.4) return 'bg-primary/60';
    if (intensity > 0.2) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  const handleCellClick = (cell: HeatmapCell) => {
    setSelectedCell(cell);
    onCellClick?.(cell);
  };

  const displayCell = hoveredCell || selectedCell;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Buchungsverhalten Heatmap</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Buchungsmuster nach Wochentag und Uhrzeit
          </p>
        </div>
        <Icon name="CalendarDaysIcon" size={24} className="text-secondary" />
      </div>

      {displayCell && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {displayCell.day}, {displayCell.hour}:00 - {displayCell.hour + 1}:00
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {displayCell.bookings} Buchungen
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{displayCell.value}%</p>
              <p className="text-xs text-muted-foreground">Auslastung</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-2 mb-2">
            <div className="w-12" />
            {hours.map(hour => (
              <div key={hour} className="w-12 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {days.map(day => (
            <div key={day} className="flex gap-2 mb-2">
              <div className="w-12 flex items-center">
                <span className="text-xs font-medium text-foreground">{day}</span>
              </div>
              {hours.map(hour => {
                const cell = data.find(c => c.day === day && c.hour === hour);
                if (!cell) return <div key={hour} className="w-12 h-12" />;

                const isSelected = selectedCell?.day === day && selectedCell?.hour === hour;
                const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;

                return (
                  <button
                    key={hour}
                    onClick={() => handleCellClick(cell)}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      w-12 h-12 rounded transition-smooth
                      ${getIntensityColor(cell.value)}
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${isHovered ? 'scale-110' : ''}
                      hover:scale-110
                    `}
                    title={`${day} ${hour}:00 - ${cell.bookings} Buchungen (${cell.value}%)`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Niedrig</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div
                key={index}
                className={`w-8 h-4 rounded ${getIntensityColor(intensity * maxValue)}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Hoch</span>
        </div>
      </div>
    </div>
  );
};

export default BookingBehaviorHeatmap;