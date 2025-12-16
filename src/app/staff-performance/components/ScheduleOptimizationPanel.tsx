import Icon from '@/components/ui/AppIcon';

interface ScheduleRecommendation {
  id: string;
  type: 'understaffed' | 'overstaffed' | 'skill_gap' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeSlot: string;
  suggestedAction: string;
}

interface ScheduleOptimizationPanelProps {
  recommendations: ScheduleRecommendation[];
}

const ScheduleOptimizationPanel = ({ recommendations }: ScheduleOptimizationPanelProps) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-error bg-error/10 border-error/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'understaffed': return 'ExclamationTriangleIcon';
      case 'overstaffed': return 'UserMinusIcon';
      case 'skill_gap': return 'AcademicCapIcon';
      case 'optimization': return 'SparklesIcon';
      default: return 'InformationCircleIcon';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Planungsoptimierung</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Empfehlungen basierend auf historischen Daten
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
          <Icon name="LightBulbIcon" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {recommendations.length} Empfehlungen
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div 
            key={rec.id}
            className="border border-border rounded-lg p-4 hover:shadow-card transition-smooth"
          >
            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                rec.impact === 'high' ? 'bg-error/10' :
                rec.impact === 'medium' ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Icon 
                  name={getTypeIcon(rec.type) as any} 
                  size={20} 
                  className={
                    rec.impact === 'high' ? 'text-error' :
                    rec.impact === 'medium' ? 'text-warning' : 'text-success'
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getImpactColor(rec.impact)}`}>
                    {rec.impact === 'high' ? 'Hohe Priorität' :
                     rec.impact === 'medium' ? 'Mittlere Priorität' : 'Niedrige Priorität'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Icon name="ClockIcon" size={14} className="text-secondary" />
                    <span>{rec.timeSlot}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-foreground mb-1">Empfohlene Maßnahme:</p>
                  <p className="text-sm text-foreground">{rec.suggestedAction}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-smooth">
          <Icon name="CalendarIcon" size={18} className="text-primary-foreground" />
          <span>Optimierten Zeitplan anzeigen</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleOptimizationPanel;