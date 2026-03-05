import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { user, session, account, verification } from '@/db/auth-schema';

// Type assertion for environment variables from .dev.vars or secrets
interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GAS_URL: string;
  GAS_SECRET: string;
}

/**
 * Runtime auth instance for server-side use.
 * Uses cloudflare:workers env to access D1 binding and secrets.
 * This file should ONLY be imported in server-side code (routes, server functions).
 * Never import this in createMiddleware or client components.
 */

export function getAuth() {
  const authEnv = env as unknown as AuthEnv;
  const d1Binding = authEnv.DB;
  const secret = authEnv.BETTER_AUTH_SECRET;
  const url = authEnv.BETTER_AUTH_URL;

  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not set');
  }

  if (!url) {
    throw new Error('BETTER_AUTH_URL is not set');
  }

  if (!d1Binding) {
    throw new Error('D1 binding (DB) is not configured');
  }

  const db = getDb(d1Binding);

  const gasUrl = authEnv.GAS_URL;
  const gasSecret = authEnv.GAS_SECRET;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    secret,
    appName: 'HackNU 2026',
    baseURL: url,
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        async sendVerificationOTP({ email, otp, type }) {
          if (!gasUrl || !gasSecret) {
            console.log(`[OTP] GAS not configured — type=${type} email=${email} otp=${otp}`);
            return;
          }
          try {
            const res = await fetch(gasUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                secret: gasSecret,
                action: 'send-otp',
                email,
                otp,
                type,
              }),
            });
            if (!res.ok) {
              console.error(`[OTP] GAS returned HTTP ${res.status}`);
            }
          } catch (err) {
            console.error('[OTP] Failed to call GAS:', err);
          }
        },
      }),
    ],
  });
}

/**
 * Get the current session from the request headers.
 * Call this in server functions or API routes.
 */
export async function getSession(request: Request) {
  const auth = getAuth();
  try {
    return await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Ensure a user is logged in, throw if not.
 * Use in protected server functions/routes.
 */
export async function ensureSession(request: Request) {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
