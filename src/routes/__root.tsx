import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import appCss from '../styles.css?url';

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(88,225,145,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(88,225,145,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10 max-w-lg text-center">
        <p className="mb-6 text-xs tracking-[0.3em] text-hacknu-green/50 uppercase">
          [ERR_NOT_FOUND]
        </p>
        <h1 className="gradient-text mb-4 text-8xl leading-none font-black text-hacknu-green md:text-[10rem]">
          404
        </h1>
        <div className="mb-6 text-xs tracking-[0.5em] text-hacknu-text-muted/30">
          ════════════════════════════════
        </div>
        <p className="mb-8 text-sm text-hacknu-text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-hacknu-green px-8 py-3 text-sm font-bold tracking-wider text-hacknu-dark uppercase transition-all hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
        >
          ← Go Home
        </a>
      </div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'HackNU/26 — 9th Annual Student Hackathon',
      },
      {
        name: 'description',
        content:
          'HackNU/26 — the 9th Annual 24-hour student hackathon organized by NU ACM Student Chapter at Nazarbayev University.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
