import { useState, useEffect } from 'react';
import { createFileRoute, notFound, Outlet, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useQuery } from '@tanstack/react-query';
import { env } from 'cloudflare:workers';
import { signOut } from '@/lib/auth-client';
import { getSession } from '@/lib/auth.server';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  reportQueryOptions,
  REFRESH_COOLDOWN_MS,
  REFRESH_COOLDOWN_ON_FAIL_MS,
} from './_admin/admin';

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
  const navigate = useNavigate();
  const { refetch, isFetching } = useQuery(reportQueryOptions);
  const [refreshCooldownUntil, setRefreshCooldownUntil] = useState(0);
  const [refreshCooldownSeconds, setRefreshCooldownSeconds] = useState(0);

  useEffect(() => {
    if (refreshCooldownUntil <= 0) {
      queueMicrotask(() => setRefreshCooldownSeconds(0));
      return;
    }
    const update = () => {
      const remaining = Math.ceil((refreshCooldownUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setRefreshCooldownUntil(0);
        setRefreshCooldownSeconds(0);
        return;
      }
      setRefreshCooldownSeconds(remaining);
    };
    update();
    const t = setTimeout(
      () => setRefreshCooldownUntil(0),
      Math.max(0, refreshCooldownUntil - Date.now()),
    );
    const i = setInterval(update, 1000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [refreshCooldownUntil]);

  async function handleSignOut() {
    await signOut();
    void navigate({ to: '/' });
  }

  async function handleRefresh() {
    if (refreshCooldownSeconds > 0 || isFetching) return;
    try {
      await refetch();
      setRefreshCooldownUntil(Date.now() + REFRESH_COOLDOWN_MS);
    } catch {
      setRefreshCooldownUntil(Date.now() + REFRESH_COOLDOWN_ON_FAIL_MS);
    }
  }

  return (
    <>
      <AdminHeader
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
        refreshCooldownSeconds={refreshCooldownSeconds}
      />
      <Outlet />
    </>
  );
}
