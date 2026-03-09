import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';

/**
 * CLI-only auth configuration (Node.js safe)
 * This is used by @better-auth/cli to generate the schema.
 * It will NOT be used at runtime - see auth.server.ts for server-side usage.
 *
 * No cloudflare:workers imports allowed here.
 */

export const auth = betterAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: drizzleAdapter(null as any, {
    provider: 'sqlite',
    schema: {},
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  appName: 'HackNU 2026',
  ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET && {
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      },
    }),
  plugins: [
    emailOTP({
      async sendVerificationOTP() {
        // no-op: CLI-only config for schema generation
      },
    }),
  ],
});
