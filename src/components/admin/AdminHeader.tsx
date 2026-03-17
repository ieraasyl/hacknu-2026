import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';

export default function AdminHeader({
  onSignOut,
  onRefresh,
  isRefreshing,
  refreshCooldownSeconds,
}: {
  onSignOut: () => void | Promise<void>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  refreshCooldownSeconds?: number;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-2xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </a>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={<Link to="/dashboard" />}
          >
            {t('navbar.dashboard')}
          </Button>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || (refreshCooldownSeconds ?? 0) > 0}
              className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            >
              {isRefreshing
                ? 'Refreshing…'
                : (refreshCooldownSeconds ?? 0) > 0
                  ? `↻ ${refreshCooldownSeconds}s`
                  : '↻ Refresh'}
            </Button>
          )}
          <ConfirmButton
            label={t('dashboard.signOut')}
            confirmLabel={t('dashboard.confirmAction')}
            onConfirm={onSignOut}
            variant="outline"
            size="sm"
            className="border-hacknu-border tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
          />
        </div>
      </div>
    </header>
  );
}
