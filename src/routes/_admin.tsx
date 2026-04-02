import { useMemo, useState } from 'react';
import { createFileRoute, notFound, Outlet, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { signOut } from '@/lib/auth-client';
import { getSession } from '@/lib/auth.server';
import { sessionIsAdmin } from '@/lib/admin.server';
import {
  AdminHeaderContext,
  type AdminHeaderControls,
  type AdminHeaderContextValue,
} from '@/lib/admin-header-context';
import AdminHeader from '@/components/admin/AdminHeader';

const checkAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!sessionIsAdmin(session)) {
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
  const [headerControls, setHeaderControlsState] = useState<AdminHeaderControls>({});

  const headerContextValue = useMemo<AdminHeaderContextValue>(
    () => ({
      setHeaderControls: (controls) => setHeaderControlsState(controls),
      resetHeaderControls: () => setHeaderControlsState({}),
    }),
    [],
  );

  async function handleSignOut() {
    await signOut();
    void navigate({ to: '/' });
  }

  return (
    <AdminHeaderContext.Provider value={headerContextValue}>
      <AdminHeader
        onSignOut={handleSignOut}
        onRefresh={headerControls.onRefresh}
        isRefreshing={headerControls.isRefreshing}
        refreshCooldownSeconds={headerControls.refreshCooldownSeconds}
      />
      <Outlet />
    </AdminHeaderContext.Provider>
  );
}
