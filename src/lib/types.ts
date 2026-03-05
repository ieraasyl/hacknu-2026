import type { authClient } from '@/lib/auth-client';

type InferredSession = typeof authClient.$Infer.Session;

export type Session = InferredSession;
export type SessionUser = InferredSession['user'];
