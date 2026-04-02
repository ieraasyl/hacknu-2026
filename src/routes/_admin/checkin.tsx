import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getSession } from '@/lib/auth.server';
import { sessionIsAdmin } from '@/lib/admin.server';
import {
  getAttendanceStatuses,
  getCheckinData,
  setAttendance,
  type AttendanceStatus,
  type CheckinData,
  type CheckinParticipant,
  type CheckinTeam,
} from '@/lib/checkin.server';
import { AttendanceToggle, type AttendanceFilter } from '@/components/admin/AttendanceToggle';
import { CheckinStatCard } from '@/components/admin/CheckinStatCard';
import { ColumnToggleBar } from '@/components/admin/ColumnToggleBar';
import { TeamStatusToggle, type TeamStatusFilter } from '@/components/admin/TeamStatusToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BackgroundGrid } from '@/components/ui/background';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function requireAdminSession() {
  const request = getRequest();
  const session = await getSession(request);
  if (!session || !sessionIsAdmin(session)) {
    throw new Error('Unauthorized');
  }
}

const getCheckinDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  return getCheckinData();
});

const getAttendanceStatusesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession();
  return getAttendanceStatuses();
});

const setAttendanceFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { participantId: string; attended: boolean }) => input)
  .handler(async ({ data }) => {
    await requireAdminSession();
    return setAttendance(data.participantId, data.attended);
  });

const checkinDataQueryKey = ['checkin-data'] as const;
const attendanceQueryKey = ['checkin-attendance'] as const;

const checkinDataQueryOptions = queryOptions({
  queryKey: checkinDataQueryKey,
  queryFn: () => getCheckinDataFn(),
  staleTime: Infinity,
  refetchOnWindowFocus: false,
});

const attendanceQueryOptions = queryOptions({
  queryKey: attendanceQueryKey,
  queryFn: () => getAttendanceStatusesFn(),
  refetchInterval: 30_000,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
});

export const Route = createFileRoute('/_admin/checkin')({
  loader: ({ context }) => context.queryClient.ensureQueryData(checkinDataQueryOptions),
  component: CheckinPage,
});

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
  CheckinParticipant,
  'fullName' | 'email' | 'teamName' | 'placeOfStudy' | 'educationLevel'
>;

type TeamSortKey = 'name' | 'captainName' | 'attended';
type TeamColumnKey = TeamSortKey | 'members';
type TabId = 'participants' | 'teams';
type TeamAttendanceStatus = Exclude<TeamStatusFilter, 'all'>;

const PARTICIPANT_COLUMNS: { key: ParticipantSortKey; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'email', label: 'Email' },
  { key: 'teamName', label: 'Team name' },
  { key: 'placeOfStudy', label: 'Place of study' },
  { key: 'educationLevel', label: 'Education level' },
];

const TEAM_COLUMNS: { key: TeamColumnKey; label: string }[] = [
  { key: 'name', label: 'Team name' },
  { key: 'captainName', label: 'Captain' },
  { key: 'members', label: 'Members' },
  { key: 'attended', label: 'Attended' },
];

function getAttendedMemberCount(team: CheckinTeam) {
  return team.members.filter((member) => member.attended).length;
}

function getTeamAttendanceStatus(team: CheckinTeam): TeamAttendanceStatus {
  const attendedCount = getAttendedMemberCount(team);
  if (attendedCount >= 2) return 'full';
  if (attendedCount === 1) return 'incomplete';
  return 'no-show';
}

function mergeCheckinData(
  checkinData: CheckinData,
  attendanceMap: Map<string, boolean>,
): CheckinData {
  if (attendanceMap.size === 0) return checkinData;

  return {
    ...checkinData,
    participants: checkinData.participants.map((participant) => ({
      ...participant,
      attended: attendanceMap.get(participant.id) ?? participant.attended,
    })),
    teams: checkinData.teams.map((team) => ({
      ...team,
      members: team.members.map((member) => ({
        ...member,
        attended: attendanceMap.get(member.id) ?? member.attended,
      })),
    })),
  };
}

function updateCheckinDataAttendance(
  checkinData: CheckinData | undefined,
  participantId: string,
  attended: boolean,
) {
  if (!checkinData) return checkinData;

  return {
    ...checkinData,
    participants: checkinData.participants.map((participant) =>
      participant.id === participantId ? { ...participant, attended } : participant,
    ),
    teams: checkinData.teams.map((team) => ({
      ...team,
      members: team.members.map((member) =>
        member.id === participantId ? { ...member, attended } : member,
      ),
    })),
  };
}

function upsertAttendanceStatus(
  statuses: AttendanceStatus[] | undefined,
  nextStatus: AttendanceStatus,
): AttendanceStatus[] {
  let found = false;
  const updatedStatuses = (statuses ?? []).map((status) => {
    if (status.id !== nextStatus.id) return status;
    found = true;
    return nextStatus;
  });

  return found ? updatedStatuses : [...updatedStatuses, nextStatus];
}

function AttendanceCheckbox({
  checked,
  disabled,
  participantName,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  participantName: string;
  onChange: (nextValue: boolean) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.checked) {
            onChange(true);
            return;
          }
          setConfirmOpen(true);
        }}
        aria-label={
          checked
            ? `Mark ${participantName} as not attended`
            : `Mark ${participantName} as attended`
        }
        className="h-4 w-4 cursor-pointer accent-hacknu-green disabled:cursor-not-allowed disabled:opacity-50"
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-hacknu-border bg-hacknu-dark-card text-hacknu-text">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark attendee as absent?</AlertDialogTitle>
            <AlertDialogDescription className="text-hacknu-text-muted">
              {participantName} will move back into the not attended queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-hacknu-border text-hacknu-text-muted hover:bg-hacknu-dark-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onChange(false);
                setConfirmOpen(false);
              }}
            >
              Mark absent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CheckinPage() {
  const queryClient = useQueryClient();
  const { data: staticCheckinData } = useSuspenseQuery(checkinDataQueryOptions);
  const attendanceQuery = useQuery(attendanceQueryOptions);
  const [activeTab, setActiveTab] = useState<TabId>('participants');
  const [participantSearch, setParticipantSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState<AttendanceFilter>('all');
  const [teamFilter, setTeamFilter] = useState<TeamStatusFilter>('all');
  const [participantSort, setParticipantSort] = useState<{
    key: ParticipantSortKey;
    dir: 'asc' | 'desc';
  }>({ key: 'fullName', dir: 'asc' });
  const [teamSort, setTeamSort] = useState<{
    key: TeamSortKey;
    dir: 'asc' | 'desc';
  }>({ key: 'name', dir: 'asc' });
  const [visibleParticipantCols, setVisibleParticipantCols] = useState<Record<string, boolean>>(
    () => Object.fromEntries(PARTICIPANT_COLUMNS.map((column) => [column.key, true])),
  );
  const [visibleTeamCols, setVisibleTeamCols] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TEAM_COLUMNS.map((column) => [column.key, true])),
  );
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const attendanceById = useMemo(
    () => new Map((attendanceQuery.data ?? []).map((status) => [status.id, status.attended])),
    [attendanceQuery.data],
  );

  const checkinData = useMemo(
    () => mergeCheckinData(staticCheckinData, attendanceById),
    [attendanceById, staticCheckinData],
  );

  const participants = checkinData.participants;
  const teams = checkinData.teams;

  const participantStats = useMemo(() => {
    const attendedCount = participants.filter((participant) => participant.attended).length;
    return {
      attendedCount,
      notAttendedCount: participants.length - attendedCount,
    };
  }, [participants]);

  const teamStats = useMemo(() => {
    return teams.reduce(
      (counts, team) => {
        counts[getTeamAttendanceStatus(team)] += 1;
        return counts;
      },
      { full: 0, incomplete: 0, 'no-show': 0 } as Record<TeamAttendanceStatus, number>,
    );
  }, [teams]);

  const participantsByFilter = useMemo(() => {
    if (participantFilter === 'attended') {
      return participants.filter((participant) => participant.attended);
    }
    if (participantFilter === 'not-attended') {
      return participants.filter((participant) => !participant.attended);
    }
    return participants;
  }, [participantFilter, participants]);

  const filteredParticipants = useMemo(() => {
    const query = participantSearch.toLowerCase().trim();
    if (!query) return participantsByFilter;

    return participantsByFilter.filter(
      (participant) =>
        participant.fullName.toLowerCase().includes(query) ||
        participant.email.toLowerCase().includes(query) ||
        participant.teamName.toLowerCase().includes(query) ||
        participant.placeOfStudy.toLowerCase().includes(query) ||
        participant.educationLevel.toLowerCase().includes(query),
    );
  }, [participantSearch, participantsByFilter]);

  const sortedParticipants = useMemo(() => {
    const { key, dir } = participantSort;
    return [...filteredParticipants].sort((a, b) => {
      const comparison = String(a[key]).localeCompare(String(b[key]), undefined, {
        sensitivity: 'base',
      });
      return dir === 'asc' ? comparison : -comparison;
    });
  }, [filteredParticipants, participantSort]);

  const teamsByFilter = useMemo(() => {
    if (teamFilter === 'all') return teams;
    return teams.filter((team) => getTeamAttendanceStatus(team) === teamFilter);
  }, [teamFilter, teams]);

  const filteredTeams = useMemo(() => {
    const query = teamSearch.toLowerCase().trim();
    if (!query) return teamsByFilter;

    return teamsByFilter.filter((team) => {
      const memberNames = team.members
        .map((member) => member.fullName)
        .join(' ')
        .toLowerCase();
      return (
        team.name.toLowerCase().includes(query) ||
        team.captainName.toLowerCase().includes(query) ||
        memberNames.includes(query)
      );
    });
  }, [teamSearch, teamsByFilter]);

  const sortedTeams = useMemo(() => {
    const { key, dir } = teamSort;
    return [...filteredTeams].sort((a, b) => {
      const comparison =
        key === 'attended'
          ? getAttendedMemberCount(a) - getAttendedMemberCount(b) ||
            a.members.length - b.members.length
          : String(a[key]).localeCompare(String(b[key]), undefined, {
              sensitivity: 'base',
            });

      return dir === 'asc' ? comparison : -comparison;
    });
  }, [filteredTeams, teamSort]);

  const attendanceMutation = useMutation({
    mutationFn: (variables: { participantId: string; attended: boolean }) =>
      setAttendanceFn({ data: variables }),
    onMutate: async ({ participantId, attended }) => {
      setPendingIds((current) => {
        const next = new Set(current);
        next.add(participantId);
        return next;
      });
      setActionError(null);

      await queryClient.cancelQueries({ queryKey: attendanceQueryKey });

      const previousCheckinData = queryClient.getQueryData<CheckinData>(checkinDataQueryKey);
      const previousAttendance = queryClient.getQueryData<AttendanceStatus[]>(attendanceQueryKey);

      queryClient.setQueryData<CheckinData>(checkinDataQueryKey, (current) =>
        updateCheckinDataAttendance(current, participantId, attended),
      );
      queryClient.setQueryData<AttendanceStatus[]>(attendanceQueryKey, (current) => {
        const fallbackStatuses =
          current ??
          previousCheckinData?.participants.map((participant) => ({
            id: participant.id,
            attended: participant.attended,
          })) ??
          [];

        return upsertAttendanceStatus(fallbackStatuses, {
          id: participantId,
          attended,
        });
      });

      return { previousCheckinData, previousAttendance };
    },
    onError: (error, _variables, context) => {
      if (context?.previousCheckinData) {
        queryClient.setQueryData(checkinDataQueryKey, context.previousCheckinData);
      }
      if (context?.previousAttendance) {
        queryClient.setQueryData(attendanceQueryKey, context.previousAttendance);
      }
      setActionError(error instanceof Error ? error.message : 'Failed to update attendance');
    },
    onSuccess: (result) => {
      queryClient.setQueryData<CheckinData>(checkinDataQueryKey, (current) =>
        updateCheckinDataAttendance(current, result.id, result.attended),
      );
      queryClient.setQueryData<AttendanceStatus[]>(attendanceQueryKey, (current) =>
        upsertAttendanceStatus(current, result),
      );
    },
    onSettled: (_result, _error, variables) => {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(variables.participantId);
        return next;
      });
    },
  });

  const errorMessage =
    actionError ?? (attendanceQuery.error instanceof Error ? attendanceQuery.error.message : null);

  function toggleParticipantSort(key: ParticipantSortKey) {
    setParticipantSort((current) => ({
      key,
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  function toggleTeamSort(key: TeamSortKey) {
    setTeamSort((current) => ({
      key,
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }));
  }

  function handleAttendanceChange(participantId: string, attended: boolean) {
    attendanceMutation.mutate({ participantId, attended });
  }

  return (
    <div className="min-h-screen bg-hacknu-dark">
      <BackgroundGrid />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm tracking-wider text-hacknu-text-muted">$ admin --checkin</p>
          <h1 className="text-3xl font-bold text-hacknu-text md:text-5xl">
            Check-in <span className="text-hacknu-green">eligible teams</span>
          </h1>
          <p className="mt-3 text-sm text-hacknu-text-muted">
            Attendance syncs every 30 seconds while this tab is visible.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          <CheckinStatCard
            label="Eligible Participants"
            total={participants.length}
            breakdown={`${participantStats.attendedCount} attended / ${participantStats.notAttendedCount} not attended`}
            variant="green"
          />
          <CheckinStatCard
            label="Eligible Teams"
            total={teams.length}
            breakdown={`${teamStats.full} full / ${teamStats.incomplete} incomplete / ${teamStats['no-show']} no-show`}
            variant="purple"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabId)}
          className="mb-8 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList className="h-auto w-fit gap-1 rounded-lg border border-hacknu-border bg-hacknu-dark-card p-1">
              <TabsTrigger
                value="participants"
                className="rounded-md px-5 py-2.5 text-sm font-medium text-hacknu-text-muted transition-colors hover:text-hacknu-text data-active:bg-hacknu-green/20 data-active:text-hacknu-green"
              >
                Participants
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="rounded-md px-5 py-2.5 text-sm font-medium text-hacknu-text-muted transition-colors hover:text-hacknu-text data-active:bg-hacknu-purple/20 data-active:text-hacknu-purple"
              >
                Teams
              </TabsTrigger>
            </TabsList>

            <Input
              placeholder={
                activeTab === 'participants'
                  ? 'Search by name, email, team, place of study...'
                  : 'Search by team, captain, member...'
              }
              value={activeTab === 'participants' ? participantSearch : teamSearch}
              onChange={(event) =>
                activeTab === 'participants'
                  ? setParticipantSearch(event.target.value)
                  : setTeamSearch(event.target.value)
              }
              className="max-w-xs border-hacknu-border bg-hacknu-dark-card text-hacknu-text placeholder:text-hacknu-text-muted/60"
            />
          </div>

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'participants' ? (
              <>
                <ColumnToggleBar
                  columns={PARTICIPANT_COLUMNS}
                  visible={visibleParticipantCols}
                  variant="green"
                  onToggleColumn={(key) =>
                    setVisibleParticipantCols((current) => ({
                      ...current,
                      [key]: !(current[key] ?? true),
                    }))
                  }
                  onToggleAll={() => {
                    const allVisible = PARTICIPANT_COLUMNS.every(
                      (column) => visibleParticipantCols[column.key],
                    );
                    setVisibleParticipantCols(
                      Object.fromEntries(
                        PARTICIPANT_COLUMNS.map((column) => [column.key, !allVisible]),
                      ),
                    );
                  }}
                />
                <AttendanceToggle value={participantFilter} onChange={setParticipantFilter} />
              </>
            ) : (
              <>
                <ColumnToggleBar
                  columns={TEAM_COLUMNS}
                  visible={visibleTeamCols}
                  variant="purple"
                  onToggleColumn={(key) =>
                    setVisibleTeamCols((current) => ({
                      ...current,
                      [key]: !(current[key] ?? true),
                    }))
                  }
                  onToggleAll={() => {
                    const allVisible = TEAM_COLUMNS.every((column) => visibleTeamCols[column.key]);
                    setVisibleTeamCols(
                      Object.fromEntries(TEAM_COLUMNS.map((column) => [column.key, !allVisible])),
                    );
                  }}
                />
                <TeamStatusToggle value={teamFilter} onChange={setTeamFilter} />
              </>
            )}
          </div>

          <TabsContent value="participants" className="mt-0">
            <section>
              <p className="mb-2 text-xs text-hacknu-text-muted">
                {filteredParticipants.length} of {participantsByFilter.length}
                {participantSearch && ' (filtered)'}
              </p>
              <div className="overflow-x-auto rounded border border-hacknu-border">
                <table className="w-full min-w-[840px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hacknu-border bg-hacknu-dark-card">
                      <th className="px-4 py-3 font-medium text-hacknu-green">Attended</th>
                      {visibleParticipantCols.fullName && (
                        <SortableTh
                          label="Full name"
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
                      {visibleParticipantCols.teamName && (
                        <SortableTh
                          label="Team name"
                          sortKey="teamName"
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
                          label="Education level"
                          sortKey="educationLevel"
                          current={participantSort}
                          onSort={toggleParticipantSort}
                        />
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-hacknu-border/50 last:border-0 hover:bg-hacknu-dark-card/50"
                      >
                        <td className="px-4 py-3">
                          <AttendanceCheckbox
                            checked={participant.attended}
                            disabled={pendingIds.has(participant.id)}
                            participantName={participant.fullName}
                            onChange={(attended) =>
                              handleAttendanceChange(participant.id, attended)
                            }
                          />
                        </td>
                        {visibleParticipantCols.fullName && (
                          <td className="px-4 py-3 text-hacknu-text">{participant.fullName}</td>
                        )}
                        {visibleParticipantCols.email && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{participant.email}</td>
                        )}
                        {visibleParticipantCols.teamName && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {participant.teamName}
                          </td>
                        )}
                        {visibleParticipantCols.placeOfStudy && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {participant.placeOfStudy}
                          </td>
                        )}
                        {visibleParticipantCols.educationLevel && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {participant.educationLevel}
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
                {filteredTeams.length} of {teamsByFilter.length}
                {teamSearch && ' (filtered)'}
              </p>
              <div className="overflow-x-auto rounded border border-hacknu-border">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hacknu-border bg-hacknu-dark-card">
                      {visibleTeamCols.name && (
                        <SortableTh
                          label="Team name"
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
                      {visibleTeamCols.members && (
                        <th className="px-4 py-3 font-medium text-hacknu-purple">Members</th>
                      )}
                      {visibleTeamCols.attended && (
                        <SortableTh
                          label="Attended"
                          sortKey="attended"
                          current={teamSort}
                          onSort={toggleTeamSort}
                          variant="purple"
                        />
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team) => (
                      <tr
                        key={team.id}
                        className="border-b border-hacknu-border/50 last:border-0 hover:bg-hacknu-dark-card/50"
                      >
                        {visibleTeamCols.name && (
                          <td className="px-4 py-3 text-hacknu-text">{team.name}</td>
                        )}
                        {visibleTeamCols.captainName && (
                          <td className="px-4 py-3 text-hacknu-text-muted">{team.captainName}</td>
                        )}
                        {visibleTeamCols.members && (
                          <td className="px-4 py-3 text-hacknu-text-muted">
                            {team.members.map((member, index) => (
                              <span
                                key={member.id}
                                className={member.attended ? 'text-hacknu-green' : 'text-red-400'}
                              >
                                {member.fullName}
                                {index < team.members.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </td>
                        )}
                        {visibleTeamCols.attended && (
                          <td className="px-4 py-3 font-medium text-hacknu-text-muted">
                            {getAttendedMemberCount(team)}/{team.members.length}
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
