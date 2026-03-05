import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession, signOut } from '../../lib/auth-client';
import { getSession } from '../../lib/auth.server';
import { createTeamSchema, inviteSlugSchema } from '../../lib/validation';
import {
  getTeamByParticipant,
  createTeam,
  joinTeamBySlug,
  kickMember,
  leaveTeam,
  dissolveTeam,
  type TeamData,
} from '../../lib/team.server';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { BackgroundGrid } from '../../components/ui/background';

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

/* ─── Route ─── */

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
});

/* ─── Component ─── */

function Dashboard() {
  const { t } = useTranslation();
  const { data: session, isPending, error } = useSession();
  const navigate = useNavigate();

  // Team state
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamData | null>(null);

  // Create team form
  const [createName, setCreateName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join team form (accepts full URL or bare slug)
  const [joinInput, setJoinInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Per-action loading: 'leave' | 'dissolve' | '<userId>' (kick)
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const refreshTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const data = await getMyTeamFn();
      setTeamData(data);
    } catch {
      setTeamData(null);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam]);

  // Extract slug from a full invite URL or bare slug
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      const result = await createTeamFn({ data: { name: createName } });
      setTeamData(result);
      setCreateName('');
    } catch (err) {
      setCreateError(t((err as Error).message));
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(null);
    const slug = extractSlug(joinInput);
    if (!slug) {
      setJoinError(t('dashboard.invalidInviteInput'));
      return;
    }
    setJoinLoading(true);
    try {
      const result = await joinTeamFn({ data: { slug } });
      setTeamData(result);
      setJoinInput('');
    } catch (err) {
      setJoinError(t((err as Error).message));
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleKick(targetUserId: string) {
    setActionError(null);
    setActionLoading(targetUserId);
    try {
      await kickMemberFn({ data: { targetUserId } });
      await refreshTeam();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave() {
    setActionError(null);
    setActionLoading('leave');
    try {
      await leaveTeamFn();
      setTeamData(null);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDissolve() {
    setActionError(null);
    setActionLoading('dissolve');
    try {
      await dissolveTeamFn();
      setTeamData(null);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCopyLink() {
    if (!teamData) return;
    const url = `${window.location.origin}/invite/${teamData.inviteSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="min-h-screen bg-hacknu-dark">
      {/* Background grid */}
      <BackgroundGrid />

      {/* Top navbar */}
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
              onClick={async () => {
                await signOut();
                void navigate({ to: '/' });
              }}
            >
              {t('dashboard.signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="mb-2 text-sm tracking-wider text-hacknu-text-muted">
            $ dashboard --user="{session.user.name}"
          </p>
          <h1 className="text-3xl font-bold text-hacknu-text md:text-5xl">
            {t('dashboard.welcomeBack')}{' '}
            <span className="text-hacknu-green">{session.user.name}</span>
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-green/30">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                {t('dashboard.status')}
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-green">
                {t('dashboard.registered')}
              </CardTitle>
              <p className="mt-1 text-xs text-hacknu-text-muted">
                {t('dashboard.participant')}
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
                <CardTitle className="truncate text-2xl text-hacknu-purple">
                  {teamData.name}
                </CardTitle>
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
              <CardTitle className="text-2xl text-hacknu-text">
                {t('dashboard.eventDate')}
              </CardTitle>
              <p className="mt-1 text-xs text-hacknu-text-muted">
                {t('dashboard.eventVenue')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-hacknu-green/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="ml-2 text-xs text-hacknu-text-muted">profile.json</span>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto text-sm leading-relaxed text-hacknu-text-muted">
              <code>
                {`{
  "name": "${session.user.name}",
  "email": "${session.user.email}",
  "role": "participant",
  "event": "HackNU/26",
  "registered": true
}`}
              </code>
            </pre>
          </CardContent>
        </Card>

        {/* Team Management Card */}
        <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-hacknu-purple/60" />
              <div className="h-3 w-3 rounded-full bg-hacknu-purple/30" />
              <div className="h-3 w-3 rounded-full bg-hacknu-purple/10" />
              <span className="ml-2 text-xs text-hacknu-text-muted">team.sh</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {teamLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 w-48 animate-pulse rounded bg-hacknu-border" />
                <div className="h-4 w-64 animate-pulse rounded bg-hacknu-border" />
              </div>
            ) : teamData ? (
              /* ── In a team ── */
              <div className="space-y-4">
                {/* Team name + invite link */}
                <div>
                  <p className="mb-1 text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('dashboard.team')}
                  </p>
                  <p className="font-mono text-lg font-bold text-hacknu-green">{teamData.name}</p>
                </div>

                <div>
                  <p className="mb-1 text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('dashboard.inviteLink')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded border border-hacknu-border bg-hacknu-dark px-2 py-1 text-xs text-hacknu-text-muted">
                      {inviteUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-hacknu-border text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-hacknu-green/50 hover:text-hacknu-green"
                      onClick={handleCopyLink}
                    >
                      {copied ? t('dashboard.copied') : t('dashboard.copy')}
                    </Button>
                  </div>
                </div>

                <Separator className="border-hacknu-border" />

                {/* Members list */}
                <div>
                  <p className="mb-2 text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('dashboard.members', { count: teamData.members.length })}
                  </p>
                  <ul className="space-y-2">
                    {teamData.members.map((member) => (
                      <li
                        key={member.id}
                        className="flex items-center justify-between gap-2 font-mono text-sm"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-hacknu-green">{'>'}</span>
                          <span className="truncate text-hacknu-text">{member.fullName}</span>
                          {member.isCaptain && (
                            <span className="rounded border border-hacknu-purple/40 px-1 py-0.5 text-xs text-hacknu-purple">
                              {t('dashboard.captain')}
                            </span>
                          )}
                        </span>
                        {isCaptain && !member.isCaptain && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 border-hacknu-border px-2 text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
                            disabled={actionLoading === member.id}
                            onClick={() => handleKick(member.id)}
                          >
                            {actionLoading === member.id ? '...' : t('dashboard.kick')}
                          </Button>
                        )}
                      </li>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: 4 - teamData.members.length }).map((_, i) => (
                      <li
                        key={`empty-${i}`}
                        className="font-mono text-sm text-hacknu-text-muted/40"
                      >
                        <span className="mr-2 text-hacknu-text-muted/40">{'>'}</span>
                        {t('dashboard.emptySlot')}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action error */}
                {actionError && <p className="text-xs text-red-400">[error] {actionError}</p>}

                {/* Captain / member actions */}
                <div className="flex justify-end pt-2">
                  {isCaptain ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-xs tracking-wider text-red-400/70 uppercase hover:border-red-500 hover:text-red-400"
                      disabled={actionLoading === 'dissolve'}
                      onClick={handleDissolve}
                    >
                      {actionLoading === 'dissolve'
                        ? t('dashboard.dissolving')
                        : t('dashboard.dissolveTeam')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-hacknu-border text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
                      disabled={actionLoading === 'leave'}
                      onClick={handleLeave}
                    >
                      {actionLoading === 'leave'
                        ? t('dashboard.leaving')
                        : t('dashboard.leaveTeam')}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* ── No team ── */
              <div className="space-y-6 py-2">
                {/* Create team */}
                <div>
                  <p className="mb-3 text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('dashboard.createTeam')}
                  </p>
                  <form onSubmit={handleCreate} className="flex gap-2">
                    <Input
                      placeholder={t('dashboard.teamNamePlaceholder')}
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      disabled={createLoading}
                      className="flex-1 border-hacknu-border bg-hacknu-dark font-mono text-xs text-hacknu-text placeholder:text-hacknu-text-muted/50"
                    />
                    <Button
                      type="submit"
                      disabled={createLoading || !createName.trim()}
                      className="shrink-0 bg-hacknu-green text-xs font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
                    >
                      {createLoading ? '...' : t('dashboard.create')}
                    </Button>
                  </form>
                  {createError && (
                    <p className="mt-1 text-xs text-red-400">[error] {createError}</p>
                  )}
                </div>

                <Separator className="border-hacknu-border" />

                {/* Join team */}
                <div>
                  <p className="mb-3 text-xs tracking-wider text-hacknu-text-muted uppercase">
                    {t('dashboard.joinTeam')}
                  </p>
                  <form onSubmit={handleJoin} className="flex gap-2">
                    <Input
                      placeholder={t('dashboard.joinPlaceholder')}
                      value={joinInput}
                      onChange={(e) => setJoinInput(e.target.value)}
                      disabled={joinLoading}
                      className="flex-1 border-hacknu-border bg-hacknu-dark font-mono text-xs text-hacknu-text placeholder:text-hacknu-text-muted/50"
                    />
                    <Button
                      type="submit"
                      disabled={joinLoading || !joinInput.trim()}
                      className="shrink-0 border border-hacknu-border bg-transparent text-xs tracking-wider text-hacknu-purple uppercase hover:border-hacknu-purple/50 hover:bg-hacknu-purple/10"
                    >
                      {joinLoading ? '...' : t('dashboard.join')}
                    </Button>
                  </form>
                  {joinError && <p className="mt-1 text-xs text-red-400">[error] {joinError}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
