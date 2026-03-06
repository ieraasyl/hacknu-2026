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
  const participant = await getParticipant(session.user.id);
  if (!participant) {
    throw redirect({ to: '/onboarding', search: { redirect: undefined } });
  }
  return { user: session.user, participant };
});

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    return await checkAuth();
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
