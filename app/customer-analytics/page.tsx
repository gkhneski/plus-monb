import type { Metadata } from 'next';
import CustomerAnalyticsInteractive from './components/CustomerAnalyticsInteractive';

export const metadata: Metadata = {
  title: 'Kundenanalyse - Cosmetics Studio Analytics',
  description: 'Verstehen Sie Ihre Kunden durch umfassende Verhaltensanalysen, Segmentierung und Lifetime-Value-Optimierung für datengetriebene Geschäftsentscheidungen.',
};

export default function CustomerAnalyticsPage() {
  return <CustomerAnalyticsInteractive />;
}
