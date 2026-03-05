import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { team, participant } from '@/db/schema';

interface AppEnv {
  DB: D1Database;
}

function getAppDb() {
  const appEnv = env as unknown as AppEnv;
  return getDb(appEnv.DB);
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

/**
 * Convert a team name to a URL-safe slug.
 * "Cool Hackers!!" → "cool-hackers"
 */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug for the given team name.
 * Appends -2, -3, … on collision (up to 10 attempts).
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const db = getAppDb();
  const base = slugify(name);

  const existing = await db.query.team.findFirst({
    where: eq(team.inviteSlug, base),
    columns: { id: true },
  });

  if (!existing) return base;

  for (let i = 2; i <= 11; i++) {
    const candidate = `${base}-${i}`;
    const collision = await db.query.team.findFirst({
      where: eq(team.inviteSlug, candidate),
      columns: { id: true },
    });
    if (!collision) return candidate;
  }

  throw new Error('Could not generate a unique invite slug — try a different team name');
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type TeamMember = {
  id: string;
  fullName: string;
  isCaptain: boolean;
};

export type TeamData = {
  id: string;
  name: string;
  inviteSlug: string;
  captainId: string;
  members: TeamMember[];
};

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Return the team (with all members) for a participant, or null if not in a team.
 */
export async function getTeamByParticipant(userId: string): Promise<TeamData | null> {
  const db = getAppDb();

  const p = await db.query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { teamId: true },
  });

  if (!p?.teamId) return null;

  const t = await db.query.team.findFirst({
    where: eq(team.id, p.teamId),
    with: {
      members: {
        columns: { id: true, fullName: true },
      },
    },
  });

  if (!t) return null;

  return {
    id: t.id,
    name: t.name,
    inviteSlug: t.inviteSlug,
    captainId: t.captainId,
    members: t.members.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      isCaptain: m.id === t.captainId,
    })),
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a new team. The creator becomes captain.
 */
export async function createTeam(userId: string, name: string): Promise<TeamData> {
  const db = getAppDb();

  const p = await db.query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { id: true, teamId: true },
  });
  if (!p) throw new Error('Participant profile not found');
  if (p.teamId) throw new Error('You are already in a team');

  const existing = await db.query.team.findFirst({
    where: eq(team.name, name),
    columns: { id: true },
  });
  if (existing) throw new Error('Team name is already taken');

  const inviteSlug = await generateUniqueSlug(name);
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(team).values({
    id,
    name,
    inviteSlug,
    captainId: userId,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(participant)
    .set({ teamId: id, updatedAt: now })
    .where(eq(participant.id, userId));

  const result = await getTeamByParticipant(userId);
  if (!result) throw new Error('Failed to create team');
  return result;
}

/**
 * Join a team by its invite slug. Enforces max 4 members.
 */
export async function joinTeamBySlug(userId: string, slug: string): Promise<TeamData> {
  const db = getAppDb();

  const p = await db.query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { id: true, teamId: true },
  });
  if (!p) throw new Error('Participant profile not found');
  if (p.teamId) throw new Error('You are already in a team');

  const t = await db.query.team.findFirst({
    where: eq(team.inviteSlug, slug),
    with: {
      members: { columns: { id: true } },
    },
  });
  if (!t) throw new Error('Invite link is invalid or the team no longer exists');
  if (t.members.length >= 4) throw new Error('This team is full (max 4 members)');

  await db
    .update(participant)
    .set({ teamId: t.id, updatedAt: new Date() })
    .where(eq(participant.id, userId));

  const result = await getTeamByParticipant(userId);
  if (!result) throw new Error('Failed to join team');
  return result;
}

/**
 * Kick a member from the team. Captain only.
 */
export async function kickMember(captainId: string, targetUserId: string): Promise<void> {
  const db = getAppDb();

  if (targetUserId === captainId) throw new Error('You cannot kick yourself');

  const captainParticipant = await db.query.participant.findFirst({
    where: eq(participant.id, captainId),
    columns: { teamId: true },
  });
  if (!captainParticipant?.teamId) throw new Error('You are not in a team');

  const t = await db.query.team.findFirst({
    where: eq(team.id, captainParticipant.teamId),
    columns: { id: true, captainId: true },
  });
  if (!t) throw new Error('Team not found');
  if (t.captainId !== captainId) throw new Error('Only the captain can kick members');

  const target = await db.query.participant.findFirst({
    where: eq(participant.id, targetUserId),
    columns: { teamId: true },
  });
  if (!target || target.teamId !== t.id) throw new Error('This person is not in your team');

  await db
    .update(participant)
    .set({ teamId: null, updatedAt: new Date() })
    .where(eq(participant.id, targetUserId));
}

/**
 * Leave the team. Non-captains only — captains must dissolve.
 */
export async function leaveTeam(userId: string): Promise<void> {
  const db = getAppDb();

  const p = await db.query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { teamId: true },
  });
  if (!p?.teamId) throw new Error('You are not in a team');

  const t = await db.query.team.findFirst({
    where: eq(team.id, p.teamId),
    columns: { captainId: true },
  });
  if (!t) throw new Error('Team not found');
  if (t.captainId === userId)
    throw new Error('The captain cannot leave — dissolve the team instead');

  await db
    .update(participant)
    .set({ teamId: null, updatedAt: new Date() })
    .where(eq(participant.id, userId));
}

/**
 * Dissolve the team. Captain only.
 * Clears all members' teamId then deletes the team row.
 */
export async function dissolveTeam(userId: string): Promise<void> {
  const db = getAppDb();

  const p = await db.query.participant.findFirst({
    where: eq(participant.id, userId),
    columns: { teamId: true },
  });
  if (!p?.teamId) throw new Error('You are not in a team');

  const t = await db.query.team.findFirst({
    where: eq(team.id, p.teamId),
    columns: { id: true, captainId: true },
  });
  if (!t) throw new Error('Team not found');
  if (t.captainId !== userId) throw new Error('Only the captain can dissolve the team');

  // Clear all members' teamId first
  await db
    .update(participant)
    .set({ teamId: null, updatedAt: new Date() })
    .where(eq(participant.teamId, t.id));

  // Then delete the team
  await db.delete(team).where(eq(team.id, t.id));
}
