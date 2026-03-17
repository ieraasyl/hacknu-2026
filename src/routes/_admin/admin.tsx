import { useState, useMemo, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getSession } from '@/lib/auth.server';
import { getReportData } from '@/lib/report.server';
import type { ReportParticipant, ReportTeam } from '@/lib/report.server';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackgroundGrid } from '@/components/ui/background';
import { ListChecksIcon } from '@phosphor-icons/react';

/* ─── Server Function ─── */

const getAdminReportFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) throw new Error('Unauthorized');
  // Admin check is done in _admin layout; we're only called when admin
  return getReportData();
});

const reportQueryOptions = queryOptions({
  queryKey: ['admin-report'],
  queryFn: () => getAdminReportFn(),
  staleTime: 5 * 60 * 1000,
});

export const REFRESH_COOLDOWN_MS = 30 * 1000; // 30 seconds on success
export const REFRESH_COOLDOWN_ON_FAIL_MS = 10 * 1000; // 10 seconds on error
export { reportQueryOptions };

/* ─── Route ─── */

export const Route = createFileRoute('/_admin/admin')({
  loader: ({ context }) => context.queryClient.ensureQueryData(reportQueryOptions),
  component: AdminPage,
});

/* ─── Component ─── */

function SortableTh<K extends string>({
  label,
  sortKey,
  current,
  onSort,
  variant = 'green',
}: {
  label: string;
  sortKey: K;
  current: { key: K; dir: 'asc' | 'desc' };
  onSort: (key: K) => void;
  variant?: 'green' | 'purple';
}) {
  const isActive = current.key === sortKey;
  const colorClass =
    variant === 'purple'
      ? 'text-hacknu-purple hover:text-hacknu-purple/80'
      : 'text-hacknu-green hover:text-hacknu-green/80';
  return (
    <th
      className={`cursor-pointer px-4 py-3 font-medium select-none ${colorClass}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-hacknu-text-muted">{current.dir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

type ParticipantSortKey = keyof Pick<
  ReportParticipant,
  | 'fullName'
  | 'email'
  | 'iin'
  | 'phone'
  | 'city'
  | 'placeOfStudy'
  | 'educationLevel'
  | 'teamName'
  | 'parentPhone'
  | 'createdAt'
>;
type TeamSortKey = keyof Pick<
  ReportTeam,
  'name' | 'captainName' | 'memberCount' | 'inviteSlug' | 'createdAt'
>;

type TabId = 'participants' | 'teams';

const PARTICIPANT_COLUMNS: { key: ParticipantSortKey | 'cvUrl'; label: string }[] = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'iin', label: 'IIN' },
  { key: 'phone', label: 'Phone' },
  { key: 'parentPhone', label: 'Parent phone' },
  { key: 'city', label: 'City' },
  { key: 'placeOfStudy', label: 'Place of study' },
  { key: 'educationLevel', label: 'Education' },
  { key: 'teamName', label: 'Team' },
  { key: 'cvUrl', label: 'CV' },
  { key: 'createdAt', label: 'Created' },
];

const TEAM_COLUMNS: { key: TeamSortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'captainName', label: 'Captain' },
  { key: 'memberCount', label: 'Members' },
  { key: 'inviteSlug', label: 'Invite slug' },
  { key: 'createdAt', label: 'Created' },
];

const displayDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeZone: 'Asia/Almaty',
});

function formatDateForDisplay(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return displayDateFormatter.format(date);
}

function AdminPage() {
  const { data } = useSuspenseQuery(reportQueryOptions);
  const [activeTab, setActiveTab] = useState<TabId>('participants');
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [participantSort, setParticipantSort] = useState<{
    key: ParticipantSortKey;
    dir: 'asc' | 'desc';
  }>({ key: 'fullName', dir: 'asc' });
  const [teamSort, setTeamSort] = useState<{
    key: TeamSortKey;
    dir: 'asc' | 'desc';
  }>({ key: 'name', dir: 'asc' });

  const [visibleParticipantCols, setVisibleParticipantCols] = useState<Record<string, boolean>>(
    () => Object.fromEntries(PARTICIPANT_COLUMNS.map((c) => [c.key, true])),
  );
  const [visibleTeamCols, setVisibleTeamCols] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TEAM_COLUMNS.map((c) => [c.key, true])),
  );

  const { participants, teams } = data;

  const teamByName = useMemo(() => new Map(teams.map((t) => [t.name, t])), [teams]);
  const participantByName = useMemo(
    () => new Map(participants.map((p) => [p.fullName, p])),
    [participants],
  );

  const filteredParticipants = useMemo(() => {
    const q = participantSearch.toLowerCase().trim();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.teamName?.toLowerCase().includes(q) ?? false) ||
        p.city.toLowerCase().includes(q) ||
        p.placeOfStudy.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.iin.includes(q) ||
        (p.parentPhone?.includes(q) ?? false) ||
        p.educationLevel.toLowerCase().includes(q),
    );
  }, [participants, participantSearch]);

  const filteredTeams = useMemo(() => {
    const q = teamSearch.toLowerCase().trim();
    if (!q) return teams;
    const members = (t: ReportTeam) =>
      [t.member1, t.member2, t.member3, t.member4].filter(Boolean).join(' ').toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.captainName.toLowerCase().includes(q) ||
        members(t).includes(q) ||
        t.inviteSlug.toLowerCase().includes(q),
    );
  }, [teams, teamSearch]);

  const sortedParticipants = useMemo(() => {
    const { key, dir } = participantSort;
    return [...filteredParticipants].sort((a, b) => {
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      const cmp =
        key === 'createdAt'
          ? new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
          : String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredParticipants, participantSort]);

  const sortedTeams = useMemo(() => {
    const { key, dir } = teamSort;
    return [...filteredTeams].sort((a, b) => {
      let cmp: number;
      if (key === 'memberCount') cmp = a.memberCount - b.memberCount;
      else if (key === 'createdAt')
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else
        cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, {
          sensitivity: 'base',
        });
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredTeams, teamSort]);

  function toggleParticipantSort(key: ParticipantSortKey) {
    setParticipantSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  function toggleTeamSort(key: TeamSortKey) {
    setTeamSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  // Cross-tab navigation: scroll to element after switching tab.
  useEffect(() => {
    if (!scrollToId) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let innerRafId: number | null = null;
    const rafId = requestAnimationFrame(() => {
      innerRafId = requestAnimationFrame(() => {
        const el = document.getElementById(scrollToId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const cls = scrollToId.startsWith('participant-')
            ? 'admin-highlight-green'
            : 'admin-highlight-purple';
          el.classList.add(cls);
          timeoutId = setTimeout(() => el.classList.remove(cls), 2000);
          setScrollToId(null);
        } else {
          setScrollToId(null);
        }
      });
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (innerRafId !== null) cancelAnimationFrame(innerRafId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [activeTab, scrollToId]);

  function goToTeam(slug: string) {
    setActiveTab('teams');
    setScrollToId(`team-${slug}`);
  }

  function goToParticipant(email: string) {
    setActiveTab('participants');
    setScrollToId(`participant-${email}`);
  }

  return (
    <div className="min-h-screen bg-hacknu-dark">
      <BackgroundGrid />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm tracking-wider text-hacknu-text-muted">$ admin --report</p>
          <h1 className="text-3xl font-bold text-hacknu-text md:text-5xl">
            Report <span className="text-hacknu-green">participants & teams</span>
          </h1>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <Card className="border-hacknu-border bg-hacknu-dark-card">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                Participants
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-green">{participants.length}</CardTitle>
            </CardContent>
          </Card>
          <Card className="border-hacknu-border bg-hacknu-dark-card">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                Teams
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-purple">{teams.length}</CardTitle>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabId)}
          className="mb-8 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList className="h-auto w-fit gap-1 rounded-lg border border-hacknu-border bg-hacknu-dark-card p-1">
              <TabsTrigger
                value="participants"
                className="rounded-md px-5 py-2.5 text-sm font-medium text-hacknu-text-muted transition-colors hover:text-hacknu-text data-active:bg-hacknu-green/20 data-active:text-hacknu-green"
              >
                Participants ({participants.length})
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="rounded-md px-5 py-2.5 text-sm font-medium text-hacknu-text-muted transition-colors hover:text-hacknu-text data-active:bg-hacknu-purple/20 data-active:text-hacknu-purple"
              >
                Teams ({teams.length})
              </TabsTrigger>
            </TabsList>
            <Input
              placeholder={
                activeTab === 'participants'
                  ? 'Search by name, email, IIN, team, city...'
                  : 'Search by name, captain, members...'
              }
              value={activeTab === 'participants' ? participantSearch : teamSearch}
              onChange={(e) =>
                activeTab === 'participants'
                  ? setParticipantSearch(e.target.value)
                  : setTeamSearch(e.target.value)
              }
              className="max-w-xs border-hacknu-border bg-hacknu-dark-card text-hacknu-text placeholder:text-hacknu-text-muted/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'participants') {
                  const allVisible = PARTICIPANT_COLUMNS.every(
                    (c) => visibleParticipantCols[c.key],
                  );
                  setVisibleParticipantCols(
                    Object.fromEntries(PARTICIPANT_COLUMNS.map((c) => [c.key, !allVisible])),
                  );
                } else {
                  const allVisible = TEAM_COLUMNS.every((c) => visibleTeamCols[c.key]);
                  setVisibleTeamCols(
                    Object.fromEntries(TEAM_COLUMNS.map((c) => [c.key, !allVisible])),
                  );
                }
              }}
              title={
                activeTab === 'participants'
                  ? PARTICIPANT_COLUMNS.every((c) => visibleParticipantCols[c.key])
                    ? 'Hide all columns'
                    : 'Show all columns'
                  : TEAM_COLUMNS.every((c) => visibleTeamCols[c.key])
                    ? 'Hide all columns'
                    : 'Show all columns'
              }
              className="shrink-0 rounded p-0.5 text-hacknu-text-muted transition-colors hover:bg-hacknu-dark-card hover:text-hacknu-text"
              aria-label="Toggle all columns"
            >
              <ListChecksIcon className="size-4" />
            </button>
            {activeTab === 'participants'
              ? PARTICIPANT_COLUMNS.map((col) => {
                  const visible = visibleParticipantCols[col.key] ?? true;
                  return (
                    <Badge
                      key={col.key}
                      variant={visible ? 'secondary' : 'outline'}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer transition-colors select-none ${
                        visible
                          ? 'border-hacknu-green/40 bg-hacknu-green/20 text-hacknu-green hover:bg-hacknu-green/30'
                          : 'border-hacknu-border bg-transparent text-hacknu-text-muted/70 hover:border-hacknu-border hover:text-hacknu-text-muted'
                      }`}
                      onClick={() =>
                        setVisibleParticipantCols((prev) => ({ ...prev, [col.key]: !visible }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setVisibleParticipantCols((prev) => ({ ...prev, [col.key]: !visible }));
                        }
                      }}
                    >
                      {col.label}
                    </Badge>
                  );
                })
              : TEAM_COLUMNS.map((col) => {
                  const visible = visibleTeamCols[col.key] ?? true;
                  return (
                    <Badge
                      key={col.key}
                      variant={visible ? 'secondary' : 'outline'}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer transition-colors select-none ${
                        visible
                          ? 'border-hacknu-purple/40 bg-hacknu-purple/20 text-hacknu-purple hover:bg-hacknu-purple/30'
                          : 'border-hacknu-border bg-transparent text-hacknu-text-muted/70 hover:border-hacknu-border hover:text-hacknu-text-muted'
                      }`}
                      onClick={() =>
                        setVisibleTeamCols((prev) => ({ ...prev, [col.key]: !visible }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setVisibleTeamCols((prev) => ({ ...prev, [col.key]: !visible }));
                        }
                      }}
                    >
                      {col.label}
                    </Badge>
                  );
                })}
          </div>

          <TabsContent value="participants" className="mt-0">
            <section>
              <p className="mb-2 text-xs text-hacknu-text-muted">
                {filteredParticipants.length} of {participants.length}
                {participantSearch && ' (filtered)'}
              </p>
              <div className="overflow-x-auto rounded border border-hacknu-border">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hacknu-border bg-hacknu-dark-card">
                      {visibleParticipantCols.fullName && (
                        <SortableTh
                          label="Name"
                          sortKey="fullName"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.email && (
                        <SortableTh
                          label="Email"
                          sortKey="email"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.iin && (
                        <SortableTh
                          label="IIN"
                          sortKey="iin"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.phone && (
                        <SortableTh
                          label="Phone"
                          sortKey="phone"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.parentPhone && (
                        <SortableTh
                          label="Parent phone"
                          sortKey="parentPhone"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.city && (
                        <SortableTh
                          label="City"
                          sortKey="city"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.placeOfStudy && (
                        <SortableTh
                          label="Place of study"
                          sortKey="placeOfStudy"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.educationLevel && (
                        <SortableTh
                          label="Education"
                          sortKey="educationLevel"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.teamName && (
                        <SortableTh
                          label="Team"
                          sortKey="teamName"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                      {visibleParticipantCols.cvUrl && (
                        <th className="px-4 py-3 font-medium text-hacknu-green">CV</th>
                      )}
                      {visibleParticipantCols.createdAt && (
                        <SortableTh
                          label="Created"
                          sortKey="createdAt"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((p) => (
                      <tr
                        key={p.email}
                        id={`participant-${p.email}`}
                        className="scroll-mt-24 border-b border-hacknu-border/50 last:border-0 hover:bg-hacknu-dark-card/50"
                      >
                        {visibleParticipantCols.fullName && (
                          <td className="px-4 py-3 text-hacknu-text">{p.fullName}</td>
                        )}
                        {visibleParticipantCols.email && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.email}</td>
                        )}
                        {visibleParticipantCols.iin && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.iin}</td>
                        )}
                        {visibleParticipantCols.phone && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.phone}</td>
                        )}
                        {visibleParticipantCols.parentPhone && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {p.parentPhone ?? '—'}
                          </td>
                        )}
                        {visibleParticipantCols.city && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.city}</td>
                        )}
                        {visibleParticipantCols.placeOfStudy && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.placeOfStudy}</td>
                        )}
                        {visibleParticipantCols.educationLevel && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{p.educationLevel}</td>
                        )}
                        {visibleParticipantCols.teamName && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {p.teamName
                              ? (() => {
                                  const team = teamByName.get(p.teamName);
                                  return team ? (
                                    <button
                                      type="button"
                                      onClick={() => goToTeam(team.inviteSlug)}
                                      aria-label={`Go to team ${p.teamName}`}
                                      className="text-left text-hacknu-purple hover:text-hacknu-purple/80 hover:underline"
                                    >
                                      {p.teamName}
                                    </button>
                                  ) : (
                                    p.teamName
                                  );
                                })()
                              : '—'}
                          </td>
                        )}
                        {visibleParticipantCols.cvUrl && (
                          <td className="px-4 py-3">
                            {p.cvUrl ? (
                              <a
                                href={p.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-hacknu-green hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-hacknu-text-muted/50">—</span>
                            )}
                          </td>
                        )}
                        {visibleParticipantCols.createdAt && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {formatDateForDisplay(p.createdAt)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <section>
              <p className="mb-2 text-xs text-hacknu-text-muted">
                {filteredTeams.length} of {teams.length}
                {teamSearch && ' (filtered)'}
              </p>
              <div className="overflow-x-auto rounded border border-hacknu-border">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hacknu-border bg-hacknu-dark-card">
                      {visibleTeamCols.name && (
                        <SortableTh
                          label="Name"
                          sortKey="name"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                      {visibleTeamCols.captainName && (
                        <SortableTh
                          label="Captain"
                          sortKey="captainName"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                      {visibleTeamCols.memberCount && (
                        <SortableTh
                          label="Members"
                          sortKey="memberCount"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                      {visibleTeamCols.inviteSlug && (
                        <SortableTh
                          label="Invite slug"
                          sortKey="inviteSlug"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                      {visibleTeamCols.createdAt && (
                        <SortableTh
                          label="Created"
                          sortKey="createdAt"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((t) => (
                      <tr
                        key={t.inviteSlug}
                        id={`team-${t.inviteSlug}`}
                        className="scroll-mt-24 border-b border-hacknu-border/50 last:border-0 hover:bg-hacknu-dark-card/50"
                      >
                        {visibleTeamCols.name && (
                          <td className="px-4 py-3 text-hacknu-text">{t.name}</td>
                        )}
                        {visibleTeamCols.captainName && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{t.captainName}</td>
                        )}
                        {visibleTeamCols.memberCount && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {[t.member1, t.member2, t.member3, t.member4]
                              .filter(Boolean)
                              .map((name, i, arr) => {
                                const participant = participantByName.get(name);
                                return (
                                  <span key={name}>
                                    {participant ? (
                                      <button
                                        type="button"
                                        onClick={() => goToParticipant(participant.email)}
                                        aria-label={`Go to participant ${name}`}
                                        className="text-left text-hacknu-green hover:text-hacknu-green/80 hover:underline"
                                      >
                                        {name}
                                      </button>
                                    ) : (
                                      name
                                    )}
                                    {i < arr.length - 1 ? ', ' : ''}
                                  </span>
                                );
                              })}
                          </td>
                        )}
                        {visibleTeamCols.inviteSlug && (
                          <td className="px-4 py-3 font-mono text-xs text-hacknu-text-muted">
                            {t.inviteSlug}
                          </td>
                        )}
                        {visibleTeamCols.createdAt && (
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-hacknu-text-muted">
                            {formatDateForDisplay(t.createdAt)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
