import { env } from 'cloudflare:workers';
import { getDb } from '@/db';

interface AppEnv {
  DB: D1Database;
}

export type CheckinParticipant = {
  id: string;
  fullName: string;
  email: string;
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
  const teamRows = await db.query.team.findMany({
    with: {
      captain: { columns: { fullName: true } },
      members: {
        columns: {
          id: true,
          fullName: true,
          placeOfStudy: true,
          educationLevel: true,
          attended: true,
        },
        with: {
          user: { columns: { email: true } },
        },
      },
    },
  });

  const eligibleTeams = [...teamRows]
    .filter((team) => team.members.length >= 2)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const eligibleTeamIds = eligibleTeams.map((team) => team.id);

  const participants = eligibleTeams
    .flatMap((team) =>
      team.members.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        email: member.user?.email ?? '',
        teamId: team.id,
        teamName: team.name,
        placeOfStudy: member.placeOfStudy,
        educationLevel: member.educationLevel,
        attended: member.attended,
      })),
    )
    .sort(compareByName);

  const teams = eligibleTeams.map((team) => {
    const members = [...team.members].sort((a, b) => {
      if (a.id === team.captainId) return -1;
      if (b.id === team.captainId) return 1;
      return compareByName(a, b);
    });

    return {
      id: team.id,
      name: team.name,
      captainName: team.captain?.fullName ?? '',
      members: members.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        attended: member.attended,
      })),
    };
  });

  return { participants, teams, eligibleTeamIds };
}

export async function getAttendanceStatuses(): Promise<AttendanceStatus[]> {
  const result = await getAppEnv()
    .DB.prepare(
      `SELECT p.id, p.attended
     FROM participant p
     WHERE p.team_id IN (
       SELECT t.id
       FROM team t
       INNER JOIN participant p2 ON p2.team_id = t.id
       GROUP BY t.id
       HAVING COUNT(p2.id) >= 2
     )`,
    )
    .all<{ id: string; attended: number | boolean }>();

  if (import.meta.env.DEV) {
    console.info('[checkin] attendance rows_read', result.meta.rows_read ?? null);
  }

  return result.results.map((row) => ({
    id: row.id,
    attended: Boolean(row.attended),
  }));
}

export async function setAttendance(
  participantId: string,
  attended: boolean,
): Promise<AttendanceStatus> {
  const result = await getAppEnv()
    .DB.prepare(
      `UPDATE participant
       SET attended = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(attended ? 1 : 0, Date.now(), participantId)
    .run();

  if ((result.meta.changes ?? 0) === 0) {
    throw new Error('Participant not found');
  }

  return { id: participantId, attended };
}
