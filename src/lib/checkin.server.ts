import { env } from 'cloudflare:workers';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { getDb, participant, team } from '@/db';

interface AppEnv {
  DB: D1Database;
}

export type CheckinParticipant = {
  id: string;
  fullName: string;
  teamId: string;
  teamName: string;
  placeOfStudy: string;
  educationLevel: string;
  attended: boolean;
};

export type CheckinTeamMember = {
  id: string;
  fullName: string;
  attended: boolean;
};

export type CheckinTeam = {
  id: string;
  name: string;
  captainName: string;
  members: CheckinTeamMember[];
};

export type CheckinData = {
  participants: CheckinParticipant[];
  teams: CheckinTeam[];
  eligibleTeamIds: string[];
};

export type AttendanceStatus = {
  id: string;
  attended: boolean;
};

function getAppEnv() {
  return env as unknown as AppEnv;
}

function getAppDb() {
  return getDb(getAppEnv().DB);
}

function compareByName(a: { fullName: string }, b: { fullName: string }) {
  return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' });
}

export async function getCheckinData(): Promise<CheckinData> {
  const db = getAppDb();

  const eligible = db.$with('eligible').as(
    db
      .select({ teamId: participant.teamId })
      .from(participant)
      .where(isNotNull(participant.teamId))
      .groupBy(participant.teamId)
      .having(sql`count(*) >= 2`),
  );

  const teamsQuery = db
    .with(eligible)
    .select({
      id: team.id,
      name: team.name,
      captainId: team.captainId,
    })
    .from(team)
    .innerJoin(eligible, eq(team.id, eligible.teamId))
    .orderBy(sql`${team.name} collate nocase`);

  const membersQuery = db
    .with(eligible)
    .select({
      id: participant.id,
      fullName: participant.fullName,
      teamId: participant.teamId,
      attended: participant.attended,
      placeOfStudy: participant.placeOfStudy,
      educationLevel: participant.educationLevel,
    })
    .from(participant)
    .innerJoin(eligible, eq(participant.teamId, eligible.teamId));

  const [teamRows, memberRows] = await db.batch([teamsQuery, membersQuery]);

  if (teamRows.length === 0) {
    return { participants: [], teams: [], eligibleTeamIds: [] };
  }

  type MemberRow = (typeof memberRows)[number];
  const membersByTeamId = new Map<string, MemberRow[]>();
  for (const row of memberRows) {
    const tid = row.teamId;
    if (!tid) continue;
    const list = membersByTeamId.get(tid) ?? [];
    list.push(row);
    membersByTeamId.set(tid, list);
  }

  const eligibleTeams = teamRows;

  const eligibleTeamIds = eligibleTeams.map((t) => t.id);

  const participants: CheckinParticipant[] = eligibleTeams
    .flatMap((t) => {
      const raw = membersByTeamId.get(t.id) ?? [];
      return raw.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        teamId: t.id,
        teamName: t.name,
        placeOfStudy: member.placeOfStudy,
        educationLevel: member.educationLevel,
        attended: member.attended,
      }));
    })
    .sort(compareByName);

  const teams: CheckinTeam[] = eligibleTeams.map((t) => {
    const raw = membersByTeamId.get(t.id) ?? [];
    const members = raw
      .map((member) => ({
        id: member.id,
        fullName: member.fullName,
        attended: member.attended,
      }))
      .sort((a, b) => {
        if (a.id === t.captainId) return -1;
        if (b.id === t.captainId) return 1;
        return compareByName(a, b);
      });

    const captainName =
      members.find((m) => m.id === t.captainId)?.fullName ??
      raw.find((m) => m.id === t.captainId)?.fullName ??
      '';

    return {
      id: t.id,
      name: t.name,
      captainName,
      members,
    };
  });

  return { participants, teams, eligibleTeamIds };
}

export async function setAttendance(
  participantId: string,
  attended: boolean,
): Promise<AttendanceStatus> {
  const db = getAppDb();
  const [row] = await db
    .update(participant)
    .set({ attended, updatedAt: new Date() })
    .where(eq(participant.id, participantId))
    .returning({ id: participant.id, attended: participant.attended });

  if (!row) {
    throw new Error('Participant not found');
  }

  return { id: row.id, attended: row.attended };
}
