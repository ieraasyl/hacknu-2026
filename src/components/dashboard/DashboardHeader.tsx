import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Session } from '@/lib/types';

export default function DashboardHeader({
  session,
  onSignOut,
}: {
  session: Session;
  onSignOut: () => void | Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-hacknu-text-muted sm:inline">
            {session.user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-hacknu-border tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
            onClick={onSignOut}
          >
            {t('dashboard.signOut')}
          </Button>
        </div>
      </div>
    </header>
  );
}
