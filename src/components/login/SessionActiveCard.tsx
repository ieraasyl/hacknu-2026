import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TerminalDots } from '@/components/ui/terminal-dots';
import type { Session } from '@/lib/types';

export default function SessionActiveCard({ session }: { session: Session }) {
  const { t } = useTranslation();

  return (
    <Card className="border-hacknu-border bg-hacknu-dark-card">
      <CardHeader className="border-b border-hacknu-border">
        <TerminalDots label="session_active" />
      </CardHeader>
      <CardContent className="pt-4">
        <p className="mb-2 text-sm text-hacknu-green">$ whoami</p>
        <CardTitle className="mb-1 text-xl text-hacknu-text">{session.user.name}</CardTitle>
        <CardDescription className="mb-6 text-hacknu-text-muted">
          {session.user.email}
        </CardDescription>
        <Button
          className="h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
          render={<a href="/dashboard" />}
        >
          {t('login.goToDashboard')}
        </Button>
        <div className="mt-3 text-center">
          <Button
            variant="link"
            size="xs"
            className="text-hacknu-text-muted hover:text-hacknu-green"
            render={<a href="/" />}
          >
            {t('login.backToHome')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
