import { env } from 'cloudflare:workers';

interface AppEnv {
  ADMIN_EMAILS?: string;
}

export function getAdminEmails(): string[] {
  const appEnv = env as unknown as AppEnv;
  const raw = appEnv.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True only when ADMIN_EMAILS is non-empty and the session user's email is listed. */
export function sessionIsAdmin(session: { user: { email?: string | null } } | null): boolean {
  if (!session?.user?.email) return false;
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(session.user.email.toLowerCase());
}
