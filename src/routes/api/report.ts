import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { getReportData } from '@/lib/report.server';

interface AppEnv {
  GAS_SECRET: string;
}

/**
 * Report API — returns participants and teams for GAS sync.
 * POST only, requires secret in JSON body matching GAS_SECRET.
 * Serves: /api/report
 */
export const Route = createFileRoute('/api/report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const appEnv = env as unknown as AppEnv;
        const secret = appEnv.GAS_SECRET;

        if (!secret) {
          return new Response(JSON.stringify({ error: 'Report API not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        let body: { secret?: string };
        try {
          body = (await request.json()) as { secret?: string };
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (body.secret !== secret) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        try {
          const data = await getReportData();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('[Report API]', err);
          return new Response(JSON.stringify({ error: 'Failed to fetch report data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
