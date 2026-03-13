import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { getSession } from '@/lib/auth.server';

interface AppEnv {
  ADMIN_EMAILS?: string;
}

function getAdminEmails(): string[] {
  const appEnv = env as unknown as AppEnv;
  const raw = appEnv.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const checkAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  const adminEmails = getAdminEmails();
  const email = session?.user.email?.toLowerCase();
  const isAdmin = adminEmails.length > 0 && email && adminEmails.includes(email);
  if (!isAdmin) {
    throw notFound();
  }
  return { user: session!.user };
});

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    return await checkAdmin();
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
