import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

type CheckinStatCardProps = {
  label: string;
  total: number;
  breakdown: string;
  variant: 'green' | 'purple';
};

export function CheckinStatCard({ label, total, breakdown, variant }: CheckinStatCardProps) {
  const colorClass = variant === 'purple' ? 'text-hacknu-purple' : 'text-hacknu-green';

  return (
    <Card className="border-hacknu-border bg-hacknu-dark-card">
      <CardContent className="flex items-end justify-between pt-4">
        <div>
          <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
            {label}
          </CardDescription>
          <CardTitle className={`text-2xl ${colorClass}`}>{total}</CardTitle>
        </div>
        <div className="text-right text-sm font-medium text-hacknu-text-muted tabular-nums">
          {breakdown}
        </div>
      </CardContent>
    </Card>
  );
}
