import Icon from '@/components/ui/AppIcon';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  sparklineData?: number[];
}

const MetricCard = ({ title, value, change, trend, icon, sparklineData = [] }: MetricCardProps) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-lg
          ${isPositive ? 'bg-success/10' : 'bg-error/10'}
        `}>
          <Icon 
            name={icon as any} 
            size={24} 
            className={isPositive ? 'text-success' : 'text-error'}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`
          flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold
          ${isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}
        `}>
          <Icon 
            name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
            size={14}
          />
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-xs text-muted-foreground">vs. Vormonat</span>
      </div>
      
      {sparklineData.length > 0 && (
        <div className="mt-4 h-12 flex items-end gap-1">
          {sparklineData.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-primary/20 rounded-t"
              style={{ height: `${(value / Math.max(...sparklineData)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricCard;