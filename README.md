# hacknu-2026

HackNU/26 — 9th Annual Student Hackathon site and registration app

## Tech Stack

Built with React 19 + TanStack Start (SSR) and deployed on Cloudflare Workers. It uses D1 + Drizzle for storage and better-auth (email OTP) for authentication.

## Setup

1. Install Bun.
2. Clone the repo and `cd` into it.
3. Create `.env` and `.dev.vars` in the project root:
   ```bash
   cp .env.example .env
   cp .dev.vars.example .dev.vars
   ```
   Fill in the values in both files.
4. Install dependencies:
   ```bash
   bun install
   ```
5. Generate Cloudflare Worker types:
   ```bash
   bun run types
   ```
6. Generate and apply migrations locally:
   ```bash
   bun run db:generate
   bun run db:migrate:local
   ```

## Development

```bash
bun run dev
```

Starts the Vite dev server on port 3000 with Cloudflare Workers bindings via the `@cloudflare/vite-plugin`.

## Database

- View local D1 data: open `.wrangler/state/v3/d1` with a SQLite viewer extension in VS Code.
- Inspect local DB with Drizzle Studio:
  ```bash
  bun run db:studio:local
  ```
- Inspect remote (production) DB with Drizzle Studio:
  ```bash
  bun run db:studio:remote
  ```

## Deploy

```bash
bun run deploy
```

It will prompt you to log in to your Cloudflare account if you haven't already.

If you do not have Cloudflare access yet, ask for access and provide your email address.

## Before Commit

Run formatting and lint checks:

```bash
bun run format
bun run lint
```

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
- `bun run lint` — run ESLint
- `bun run format` — run Prettier
