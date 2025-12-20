import Icon from '@/components/ui/AppIcon';

interface StaffMetricCardProps {
  title: string;
  value: string;
  change: number;
  target: number;
  icon: string;
  unit?: string;
}

const StaffMetricCard = ({ title, value, change, target, icon, unit = '' }: StaffMetricCardProps) => {
  const isPositive = change >= 0;
  const targetAchievement = ((parseFloat(value.replace(/[^0-9.]/g, '')) / target) * 100).toFixed(0);
  const isTargetMet = parseFloat(targetAchievement) >= 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Icon name={icon as any} size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {value}{unit}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            isPositive ? 'bg-success/10' : 'bg-error/10'
          }`}>
            <Icon 
              name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
              size={14} 
              className={isPositive ? 'text-success' : 'text-error'}
            />
            <span className={`text-xs font-medium ${
              isPositive ? 'text-success' : 'text-error'
            }`}>
              {Math.abs(change)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">vs. Vormonat</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isTargetMet ? 'bg-success' : 'bg-warning'
          }`} />
          <span className="text-xs text-muted-foreground">
            {targetAchievement}% Ziel
          </span>
        </div>
      </div>
    </div>
  );
};

export default StaffMetricCard;
