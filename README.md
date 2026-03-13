# hacknu-2026

HackNU/26 — 9th Annual Student Hackathon site and registration app

## Features

- **Registration**: Sign in via email OTP or Google OAuth → complete onboarding → access dashboard.
- **Teams**: Create a team (2–4 members) or join via invite link. Captain can kick members or dissolve the team.
- **Admin**: Participants and teams report at `/admin`.

## Tech Stack

TanStack Start (React) on Cloudflare Workers. D1 + Drizzle for storage. better-auth (email OTP, Google OAuth). Tailwind CSS, shadcn/ui (baseui), i18next (en/kk/ru).

## Setup

1. Install Bun.
2. Clone the repo and `cd` into it.
3. Create `.env` and `.dev.vars` in the project root:

   ```bash
   cp .env.example .env
   cp .dev.vars.example .dev.vars
   ```

   Fill in the values in both files.

   _Note: `.dev.vars` is used only for local development. For production, set secrets via `wrangler secret put <NAME>`. No need to put `.env` variable for production, these are only used from your PC._

4. Install dependencies:
   ```bash
   bun install
   ```
5. Generate Cloudflare Worker types:
   ```bash
   bun run types
   ```
6. Apply migrations locally:
   ```bash
   bun run db:migrate:local
   ```

## GAS

Email OTP delivery and CV upload use a Google Apps Script. See [HackNU26 GAS](https://gist.github.com/ieraasyl/583877ca6c55a99a11f6bace0d7bedf6) for the script and setup instructions.

The GAS handles: `send-otp`, `upload-cv` / `delete-cv`, and `sync-report`. Deploy as Web App → Execute as: Me → Who has access: Anyone. Set Script Properties: `GAS_SECRET`, `CV_FOLDER_ID`, `WORKER_URL`, `SHEET_ID`.

_Note: This setup is feasible because we use the ACM@NU Google Workspace account (Gmail, Drive, Sheets)._

_Without GAS:_ If you don't want to spam your mail during testing, you can view the OTP in the `verification` table (e.g. `bun run db:studio:local`).

## Google OAuth

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google` (e.g. `https://hacknu.nuacm.kz/api/auth/callback/google` for production) and `http://localhost:3000/api/auth/callback/google` for local.
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.dev.vars` (local) or via `wrangler secret put` (production).

## Development

```bash
bun run dev
```

Starts the Vite dev server on port 3000 with Cloudflare Workers bindings via the `@cloudflare/vite-plugin`.

When you change auth config, run `bun run auth:generate && bun run db:generate`.

When you change db schema, run `bun run db:generate`.

## Before Commit

Run formatting and lint checks:

```bash
bun run format
bun run lint
```

## Database

- Inspect local DB: `bun run db:studio:local`
- Inspect remote DB: `bun run db:studio:remote`

_Note: You can also inspect local DB by viewing `.wrangler/state/v3/d1` with a SQLite viewer extension in VS Code._

## Deploy

```bash
bun run deploy
```

This installs dependencies, builds the app, and deploys to Cloudflare Workers. Wrangler will prompt you to log in if needed.

**First-time deploy:** Run `bun run db:migrate:remote` before deploying so the remote D1 database has the schema.

If you do not have Cloudflare access yet, ask for access and provide your email address.

By default, the Worker is available at `https://<name>.<subdomain>.workers.dev`. For production, use a custom domain:

- Register a domain at Dashboard → Domains → Onboard a domain
- Dashboard → Workers & Pages → your Worker → **Triggers** → **Add Custom Domain**

## Useful Scripts

- `bun run dev` — start dev server on port 3000
- `bun run build` — build for production
- `bun run deploy` — build and deploy to Cloudflare Workers
- `bun run types` — regenerate Cloudflare Worker types
- `bun run db:generate` — generate migrations from schema
- `bun run db:migrate:local` — apply migrations to local D1
- `bun run db:migrate:remote` — apply migrations to remote D1
- `bun run db:studio:local` — open Drizzle Studio for local DB
- `bun run db:studio:remote` — open Drizzle Studio for remote DB
- `bun run auth:generate` — regenerate auth schema from better-auth config
- `bun run lint` / `bun run lint:fix` — ESLint
- `bun run format` / `bun run format:check` — Prettier
