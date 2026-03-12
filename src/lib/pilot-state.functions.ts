import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { getSession } from '@/lib/auth.server';
import { getParticipant } from '@/lib/onboarding.server';

export type PilotState = 'unknown' | 'unregistered' | 'noteam' | 'ready';

export const getPilotState = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PilotState> => {
    const request = getRequest();
    const session = await getSession(request);
    if (!session) return 'unknown';

    const participant = await getParticipant(session.user.id);
    if (!participant) return 'unregistered';
    if (!participant.teamId) return 'noteam';
    return 'ready';
  },
);
