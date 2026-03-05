import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';
import { joinTeamBySlug } from '@/lib/team.server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundGrid } from '@/components/ui/background';

/* ─── Server Functions ─── */

/**
 * Loader — run on the server to validate auth & onboarding before anything renders.
 * Does NOT perform the join (that's a mutation; the component handles it via POST).
 */
const validateInviteFn = createServerFn({ method: 'GET' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: `/invite/${data.slug}` } });
    }
    const profile = await getParticipant(session.user.id);
    if (!profile) {
      throw redirect({ to: '/onboarding', search: { redirect: `/invite/${data.slug}` } });
    }
    // Already in a team — just go to dashboard
    if (profile.teamId) {
      throw redirect({ to: '/dashboard' });
    }
    return { slug: data.slug };
  });

/**
 * Mutation — join the team. Called from the component on mount.
 */
const joinByInviteFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    await joinTeamBySlug(session.user.id, data.slug);
  });

/* ─── Route ─── */

export const Route = createFileRoute('/invite/$slug')({
  loader: ({ params }) => validateInviteFn({ data: { slug: params.slug } }),
  component: InviteResult,
});

/* ─── Component ─── */

function InviteResult() {
  const { t } = useTranslation();
  const { slug } = Route.useLoaderData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'joining' | 'error'>('joining');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    joinByInviteFn({ data: { slug } })
      .then(() => navigate({ to: '/dashboard' }))
      .catch((e: Error) => {
        setErrorMsg(e.message);
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'joining') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark">
        <BackgroundGrid />
        <div className="relative z-10 text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-hacknu-green/30 border-t-hacknu-green" />
          <p className="font-mono text-sm tracking-wider text-hacknu-text-muted">
            {t('invite.joining')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
      <BackgroundGrid />
      <Card className="relative z-10 w-full max-w-sm border-hacknu-border bg-hacknu-dark-card">
        <CardHeader className="border-b border-hacknu-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-red-500/30" />
            <div className="h-3 w-3 rounded-full bg-red-500/10" />
            <span className="ml-2 text-xs text-red-400">invite_error</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <CardTitle className="mb-1 font-mono text-red-400">{t('invite.couldNotJoin')}</CardTitle>
          <CardDescription className="mb-6 text-hacknu-text-muted">
            {errorMsg ?? t('invite.unexpectedError')}
          </CardDescription>
          <Button
            className="h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
            render={<a href="/dashboard" />}
          >
            {t('invite.goToDashboard')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
