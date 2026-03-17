import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
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
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-1">
          <span className="text-lg font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-lg font-bold tracking-tighter text-hacknu-purple">/26</span>
        </a>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="rounded px-2 py-1 text-xs tracking-wider text-hacknu-text-muted uppercase transition-colors hover:bg-hacknu-dark-card hover:text-hacknu-text"
          >
            {t('navbar.dashboard')}
          </Link>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing || (refreshCooldownSeconds ?? 0) > 0}
              className="rounded px-2 py-1 text-xs text-hacknu-text-muted transition-colors hover:bg-hacknu-dark-card hover:text-hacknu-text disabled:opacity-50"
            >
              {isRefreshing
                ? 'Refreshing…'
                : (refreshCooldownSeconds ?? 0) > 0
                  ? `↻ ${refreshCooldownSeconds}s`
                  : '↻ Refresh'}
            </button>
          )}
          <ConfirmButton
            label={t('dashboard.signOut')}
            confirmLabel={t('dashboard.confirmAction')}
            onConfirm={onSignOut}
            variant="outline"
            size="sm"
            className="border-hacknu-border text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
          />
        </div>
      </div>
    </header>
  );
}
