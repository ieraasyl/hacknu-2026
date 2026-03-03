import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

/**
 * Client-side auth client for React components
 * Used for sign in/up/out and accessing session data
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [emailOTPClient()],
});

// Export commonly used functions
export const { signIn, signOut, useSession } = authClient;
