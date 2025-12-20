import Icon from '@/components/ui/AppIcon';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  subtitle?: string;
}

const KPICard = ({ title, value, change, trend, icon, subtitle }: KPICardProps) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Icon name={icon as any} size={24} className="text-primary" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
          isPositive ? 'bg-success/10' : 'bg-error/10'
        }`}>
          <Icon 
            name={isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} 
            size={14} 
            className={isPositive ? 'text-success' : 'text-error'}
          />
          <span className={`text-xs font-semibold ${
            isPositive ? 'text-success' : 'text-error'
          }`}>
            {Math.abs(change)}%
          </span>
        </div>
        <span className="text-xs text-muted-foreground">vs. vorheriger Zeitraum</span>
      </div>
    </div>
  );
};

export default KPICard;
