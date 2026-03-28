import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  total: number;
  eligibleCount: number;
  variant: 'green' | 'purple';
};

export function StatCard({ label, total, eligibleCount, variant }: StatCardProps) {
  const colorClass = variant === 'purple' ? 'text-hacknu-purple' : 'text-hacknu-green';
  const notEligible = total - eligibleCount;

  return (
    <Card className="border-hacknu-border bg-hacknu-dark-card">
      <CardContent className="flex items-end justify-between pt-4">
        <div>
          <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
            {label}
          </CardDescription>
          <CardTitle className={`text-2xl ${colorClass}`}>{total}</CardTitle>
        </div>
        <div className="text-sm font-medium tabular-nums text-hacknu-text-muted">
          {eligibleCount} / {notEligible}
        </div>
      </CardContent>
    </Card>
  );
}
