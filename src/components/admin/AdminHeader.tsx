import { useTranslation } from 'react-i18next';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const navButtonClass = 'tracking-wider uppercase hover:bg-transparent hover:text-hacknu-text';

  return (
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="flex cursor-pointer items-center gap-2"
        >
          <span className="text-2xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-2xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(navButtonClass, 'text-hacknu-text-muted hover:text-hacknu-green')}
            onClick={() => navigate({ to: '/dashboard' })}
          >
            {t('navbar.dashboard')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              navButtonClass,
              pathname === '/admin'
                ? 'text-hacknu-green'
                : 'text-hacknu-text-muted hover:text-hacknu-green',
            )}
            onClick={() => navigate({ to: '/admin' })}
          >
            Report
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              navButtonClass,
              pathname === '/checkin'
                ? 'text-hacknu-purple'
                : 'text-hacknu-text-muted hover:text-hacknu-purple',
            )}
            onClick={() => navigate({ to: '/checkin' })}
          >
            Check-in
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
