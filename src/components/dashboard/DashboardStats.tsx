import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import type { TeamData } from '@/lib/team.server';

export default function DashboardStats({
  teamData,
  teamLoading,
}: {
  teamData: TeamData | null;
  teamLoading: boolean;
}) {
  const { t } = useTranslation();

  const health =
    !teamData || teamLoading
      ? {
          title: t('dashboard.healthWarning'),
          subtitle: t('dashboard.healthNoTeam'),
          color: 'text-yellow-400',
          border: 'hover:border-yellow-500/30',
        }
      : teamData.members.length < 2
        ? {
            title: t('dashboard.healthWarning'),
            subtitle: t('dashboard.healthTeamSmall'),
            color: 'text-yellow-400',
            border: 'hover:border-yellow-500/30',
          }
        : {
            title: t('dashboard.healthReady'),
            subtitle: t('dashboard.healthRegistered'),
            color: 'text-hacknu-green',
            border: 'hover:border-hacknu-green/30',
          };

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        className={`border-hacknu-border bg-hacknu-dark-card transition-all ${health.border}`}
      >
        <CardContent className="pt-4">
          <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
            {t('dashboard.healthCheck')}
          </CardDescription>
          <CardTitle className={`text-2xl ${health.color}`}>{health.title}</CardTitle>
          <p className="mt-1 font-mono text-xs tracking-wider text-hacknu-text-muted">
            {health.subtitle}
          </p>
        </CardContent>
      </Card>
      <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-purple/30">
        <CardContent className="pt-4">
          <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
            {t('dashboard.team')}
          </CardDescription>
          {teamLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-hacknu-border" />
          ) : teamData ? (
            <CardTitle className="truncate text-2xl text-hacknu-purple">{teamData.name}</CardTitle>
          ) : (
            <CardTitle className="text-2xl text-hacknu-purple">—</CardTitle>
          )}
          <p className="mt-1 text-xs text-hacknu-text-muted">
            {teamLoading
              ? ''
              : teamData
                ? t('dashboard.members', { count: teamData.members.length })
                : t('dashboard.noTeam')}
          </p>
        </CardContent>
      </Card>
      <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-green/30 sm:col-span-2 lg:col-span-1">
        <CardContent className="pt-4">
          <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
            {t('dashboard.event')}
          </CardDescription>
          <CardTitle className="text-2xl text-hacknu-text">{t('dashboard.eventDate')}</CardTitle>
          <p className="mt-1 text-xs text-hacknu-text-muted">{t('dashboard.eventVenue')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
