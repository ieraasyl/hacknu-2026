import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';

const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const session = await getSession(request);
  if (!session) {
    throw redirect({ to: '/login', search: { redirect: undefined } });
  }
  const profile = await getParticipant(session.user.id);
  if (!profile) {
    throw redirect({ to: '/onboarding', search: { redirect: undefined } });
  }
  return { user: session.user };
});

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    await checkAuth();
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
