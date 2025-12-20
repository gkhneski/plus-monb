import Icon from '@/components/ui/AppIcon';

interface LocationMapMarkerProps {
  location: {
    id: string;
    name: string;
    city: string;
    revenue: number;
    performance: 'excellent' | 'good' | 'warning' | 'critical';
    lat: number;
    lng: number;
  };
  onClick: () => void;
}

const LocationMapMarker = ({ location, onClick }: LocationMapMarkerProps) => {
  const performanceColors = {
    excellent: 'bg-success border-success',
    good: 'bg-primary border-primary',
    warning: 'bg-warning border-warning',
    critical: 'bg-error border-error',
  };

  const markerSize = Math.min(60, Math.max(40, location.revenue / 1000));

  return (
    <button
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${performanceColors[location.performance]} text-white font-bold shadow-elevated hover:scale-110 transition-smooth flex items-center justify-center`}
      style={{
        width: `${markerSize}px`,
        height: `${markerSize}px`,
        left: `${location.lng}%`,
        top: `${location.lat}%`,
      }}
      title={location.name}
    >
      <Icon name="BuildingStorefrontIcon" size={markerSize / 2} className="text-white" />
    </button>
  );
};

export default LocationMapMarker;
