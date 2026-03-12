import { useTranslation } from 'react-i18next';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
          <LanguageSwitcher />
          <span className="hidden text-xs text-hacknu-text-muted sm:inline">
            {session.user.email}
          </span>
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
