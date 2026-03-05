import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '@/lib/auth.server';

/**
 * Catch-all route for all auth endpoints.
 * Routes to auth.handler() for processing.
 * File path: src/routes/api/auth/$.ts
 * Serves: /api/auth/*
 */

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = getAuth();
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        const auth = getAuth();
        return auth.handler(request);
      },
    },
  },
});
