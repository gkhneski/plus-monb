import Icon from '@/components/ui/AppIcon';

interface LocationKPICardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const LocationKPICard = ({ title, value, change, icon, status }: LocationKPICardProps) => {
  const statusColors = {
    excellent: 'bg-success/10 text-success border-success/20',
    good: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    critical: 'bg-error/10 text-error border-error/20',
  };

  const statusBgColors = {
    excellent: 'bg-success',
    good: 'bg-primary',
    warning: 'bg-warning',
    critical: 'bg-error',
  };

  return (
    <div className={`bg-card border-2 rounded-lg p-4 transition-smooth hover:shadow-card ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${statusBgColors[status]}`}>
          <Icon name={icon as any} size={20} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${change >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
          <Icon name={change >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={12} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default LocationKPICard;