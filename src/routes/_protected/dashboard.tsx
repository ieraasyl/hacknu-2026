import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { useQueryClient, useMutation, useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { useSession, signOut } from '@/lib/auth-client';
import { getSession } from '@/lib/auth.server';
import { webHapticsOptions } from '@/lib/web-haptics';
import { createTeamSchema, inviteSlugSchema } from '@/lib/validation';
import {
  getTeamByParticipant,
  createTeam,
  joinTeamBySlug,
  kickMember,
  leaveTeam,
  dissolveTeam,
} from '@/lib/team.server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundGrid } from '@/components/ui/background';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProfileCard from '@/components/dashboard/ProfileCard';
import TeamCard from '@/components/dashboard/TeamCard';

/* ─── Server Functions ─── */

const getMyTeamFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) return null;
  return getTeamByParticipant(session.user.id);
});

const createTeamFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    const parsed = createTeamSchema.safeParse(data);
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);
    return createTeam(session.user.id, parsed.data.name);
  });

const joinTeamFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    const parsed = inviteSlugSchema.safeParse(data);
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);
    return joinTeamBySlug(session.user.id, parsed.data.slug);
  });

const kickMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { targetUserId: string }) => input)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) throw new Error('Unauthorized');
    await kickMember(session.user.id, data.targetUserId);
  });

const leaveTeamFn = createServerFn({ method: 'POST' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) throw new Error('Unauthorized');
  await leaveTeam(session.user.id);
});

const dissolveTeamFn = createServerFn({ method: 'POST' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) throw new Error('Unauthorized');
  await dissolveTeam(session.user.id);
});

const teamQueryOptions = queryOptions({
  queryKey: ['team'],
  queryFn: () => getMyTeamFn(),
});

/* ─── Route ─── */

export const Route = createFileRoute('/_protected/dashboard')({
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions),
  component: Dashboard,
});

/* ─── Component ─── */

function Dashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: session, isPending, error } = useSession();
  const navigate = useNavigate();
  const { participant } = useRouteContext({ from: '/_protected' });
  const { trigger } = useWebHaptics(webHapticsOptions);

  const { data: teamData } = useSuspenseQuery(teamQueryOptions);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useMutation({
    mutationFn: (name: string) => createTeamFn({ data: { name } }),
    onSuccess: () => {
      trigger?.('success');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setCreateName('');
      setCreateError(null);
    },
    onError: (err) => {
      trigger?.('error');
      setCreateError(t((err as Error).message));
    },
  });

  const joinMutation = useMutation({
    mutationFn: (slug: string) => joinTeamFn({ data: { slug } }),
    onSuccess: () => {
      trigger?.('success');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setJoinInput('');
      setJoinError(null);
    },
    onError: (err) => {
      trigger?.('error');
      setJoinError(t((err as Error).message));
    },
  });

  const kickMutation = useMutation({
    mutationFn: (targetUserId: string) => kickMemberFn({ data: { targetUserId } }),
    onSuccess: () => {
      trigger?.('success');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setActionError(null);
    },
    onError: (err) => {
      trigger?.('error');
      setActionError((err as Error).message);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveTeamFn(),
    onSuccess: () => {
      trigger?.('success');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setActionError(null);
    },
    onError: (err) => {
      trigger?.('error');
      setActionError((err as Error).message);
    },
  });

  const dissolveMutation = useMutation({
    mutationFn: () => dissolveTeamFn(),
    onSuccess: () => {
      trigger?.('success');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setActionError(null);
    },
    onError: (err) => {
      trigger?.('error');
      setActionError((err as Error).message);
    },
  });

  function extractSlug(input: string): string {
    const trimmed = input.trim();
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      const inviteIdx = parts.indexOf('invite');
      if (inviteIdx !== -1 && parts[inviteIdx + 1]) return parts[inviteIdx + 1];
    } catch {
      // not a URL — treat as bare slug
    }
    return trimmed.replace(/.*\/invite\//, '');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    createMutation.mutate(createName);
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(null);
    const slug = extractSlug(joinInput);
    if (!slug) {
      trigger?.('error');
      setJoinError(t('dashboard.invalidInviteInput'));
      return;
    }
    joinMutation.mutate(slug);
  }

  function handleKick(targetUserId: string) {
    setActionError(null);
    kickMutation.mutate(targetUserId);
  }

  function handleLeave() {
    setActionError(null);
    leaveMutation.mutate();
  }

  function handleDissolve() {
    setActionError(null);
    dissolveMutation.mutate();
  }

  async function handleCopyLink() {
    if (!teamData) return;
    const url = `${window.location.origin}/invite/${teamData.inviteSlug}`;
    await navigator.clipboard.writeText(url);
    trigger?.('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    void navigate({ to: '/' });
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-hacknu-green/30 border-t-hacknu-green" />
          <p className="text-sm tracking-wider text-hacknu-text-muted">
            {t('dashboard.hackingInto')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
        <Card className="w-full max-w-sm border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-red-500/30" />
              <div className="h-3 w-3 rounded-full bg-red-500/10" />
              <span className="ml-2 text-xs text-red-400">access_denied</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <CardTitle className="mb-1 font-mono text-red-400">
              {t('dashboard.unauthorized')}
            </CardTitle>
            <CardDescription className="mb-6 text-hacknu-text-muted">
              {t('dashboard.pleaseLogin')}
            </CardDescription>
            <Button
              className="h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
              render={<a href="/login" />}
            >
              {t('dashboard.goToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCaptain = teamData ? teamData.captainId === session.user.id : false;
  const inviteUrl = teamData
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/invite/${teamData.inviteSlug}`
      : `/invite/${teamData.inviteSlug}`
    : '';

  const actionLoading =
    kickMutation.isPending && kickMutation.variables
      ? kickMutation.variables
      : leaveMutation.isPending
        ? 'leave'
        : dissolveMutation.isPending
          ? 'dissolve'
          : null;

  return (
    <div className="min-h-screen bg-hacknu-dark">
      <BackgroundGrid />
      <DashboardHeader session={session} onSignOut={handleSignOut} />
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm tracking-wider text-hacknu-text-muted">
            $ dashboard --participant="{participant.fullName}"
          </p>
          <h1 className="text-3xl font-bold text-hacknu-text md:text-5xl">
            {t('dashboard.welcomeBack')}{' '}
            <span className="text-hacknu-green">{participant.fullName}</span>
          </h1>
        </div>
        <DashboardStats teamData={teamData} teamLoading={false} />
        <ProfileCard session={session} participant={participant} />
        <TeamCard
          team={{
            data: teamData,
            loading: false,
            isCaptain,
            inviteUrl,
          }}
          createForm={{
            name: createName,
            setName: setCreateName,
            loading: createMutation.isPending,
            error: createError,
            onSubmit: handleCreate,
          }}
          joinForm={{
            input: joinInput,
            setInput: setJoinInput,
            loading: joinMutation.isPending,
            error: joinError,
            onSubmit: handleJoin,
          }}
          actions={{
            copied,
            onCopyLink: handleCopyLink,
            loading: actionLoading,
            error: actionError,
            onKick: handleKick,
            onLeave: handleLeave,
            onDissolve: handleDissolve,
          }}
        />
      </main>
    </div>
  );
}
