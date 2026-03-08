import { env } from 'cloudflare:workers';
import { getDb } from '@/db';

interface AppEnv {
  DB: D1Database;
  GAS_SECRET: string;
}

function getAppDb() {
  const appEnv = env as unknown as AppEnv;
  return getDb(appEnv.DB);
}

export type ReportParticipant = {
  fullName: string;
  email: string;
  iin: string;
  phone: string;
  city: string;
  placeOfStudy: string;
  parentPhone: string | null;
  educationLevel: string;
  teamName: string | null;
  cvUrl: string | null;
  createdAt: string;
};

export type ReportTeam = {
  name: string;
  inviteSlug: string;
  captainName: string;
  memberCount: number;
  createdAt: string;
  member1: string;
  member2: string;
  member3: string;
  member4: string;
};

export async function getReportData(): Promise<{
  participants: ReportParticipant[];
  teams: ReportTeam[];
}> {
  const db = getAppDb();

  const participantsRows = await db.query.participant.findMany({
    with: {
      user: { columns: { email: true } },
      team: { columns: { name: true } },
    },
  });

  const participants: ReportParticipant[] = participantsRows.map((p) => ({
    fullName: p.fullName,
    email: p.user?.email ?? '',
    iin: p.iin,
    phone: p.phone,
    city: p.city,
    placeOfStudy: p.placeOfStudy,
    parentPhone: p.parentPhone,
    educationLevel: p.educationLevel,
    teamName: p.team?.name ?? null,
    cvUrl: p.cvUrl,
    createdAt:
      p.createdAt instanceof Date
        ? p.createdAt.toISOString()
        : new Date(p.createdAt).toISOString(),
  }));

  const teamsRows = await db.query.team.findMany({
    with: {
      captain: { columns: { name: true } },
      members: { columns: { id: true, fullName: true } },
    },
  });

  const teams: ReportTeam[] = teamsRows.map((t) => {
    const captainFirst = [
      ...t.members.filter((m) => m.id === t.captainId),
      ...t.members.filter((m) => m.id !== t.captainId),
    ];
    const [member1 = '', member2 = '', member3 = '', member4 = ''] = captainFirst.map(
      (m) => m.fullName,
    );
    return {
      name: t.name,
      inviteSlug: t.inviteSlug,
      captainName: t.captain?.name ?? '',
      memberCount: t.members.length,
      createdAt:
        t.createdAt instanceof Date
          ? t.createdAt.toISOString()
          : new Date(t.createdAt).toISOString(),
      member1,
      member2,
      member3,
      member4,
    };
  });

  return { participants, teams };
}
