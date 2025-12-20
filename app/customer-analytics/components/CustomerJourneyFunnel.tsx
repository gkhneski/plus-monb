'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface CustomerJourneyFunnelProps {
  stages: FunnelStage[];
  onStageClick?: (stageId: string) => void;
}

const CustomerJourneyFunnel = ({ stages, onStageClick }: CustomerJourneyFunnelProps) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const handleStageClick = (stageId: string) => {
    setSelectedStage(stageId);
    onStageClick?.(stageId);
  };

  const maxCount = stages[0]?.count || 1;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Customer Journey Funnel</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vom Erstkontakt zur Stammkundin
          </p>
        </div>
        <Icon name="FunnelIcon" size={24} className="text-secondary" />
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;
          const isSelected = selectedStage === stage.id;
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.id}>
              <button
                onClick={() => handleStageClick(stage.id)}
                className={`
                  w-full text-left transition-smooth
                  ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{stage.name}</span>
                    {stage.dropoff > 0 && (
                      <span className="text-xs text-error font-medium">
                        -{stage.dropoff}% Abbruch
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {stage.count.toLocaleString('de-DE')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`
                      absolute left-0 top-0 h-full rounded-lg transition-all duration-500
                      ${isSelected ? 'bg-primary' : 'bg-primary/80 hover:bg-primary'}
                    `}
                    style={{ width: `${width}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">
                        {stage.count.toLocaleString('de-DE')} Kunden
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {!isLast && (
                <div className="flex items-center justify-center my-2">
                  <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {((stages[stages.length - 1]?.count / stages[0]?.count) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Conversion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {stages.reduce((sum, stage) => sum + stage.dropoff, 0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Gesamt-Abbruch</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {stages[stages.length - 1]?.count.toLocaleString('de-DE')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Stammkunden</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyFunnel;
