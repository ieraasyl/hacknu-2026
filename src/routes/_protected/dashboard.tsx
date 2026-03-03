import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession, signOut } from '../../lib/auth-client';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { BackgroundGrid } from '../../components/ui/background';

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { data: session, isPending, error } = useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-hacknu-green/30 border-t-hacknu-green" />
          <p className="text-sm tracking-wider text-hacknu-text-muted">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hacknu-dark p-6">
        <Card className="w-full max-w-sm border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-red-500/30" />
              <div className="h-3 w-3 rounded-full bg-red-500/10" />
              <span className="ml-2 text-xs text-red-400">access_denied</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <CardTitle className="mb-1 font-mono text-red-400">[403] Unauthorized</CardTitle>
            <CardDescription className="mb-6 text-hacknu-text-muted">
              Please log in to access this page.
            </CardDescription>
            <Button
              className="h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
              render={<a href="/login" />}
            >
              → Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hacknu-dark">
      {/* Background grid */}
      <BackgroundGrid />

      {/* Top navbar */}
      <header className="sticky top-0 z-50 border-b border-hacknu-border bg-hacknu-dark/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
            <span className="text-xl font-bold tracking-tighter text-hacknu-purple">/26</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-hacknu-text-muted sm:inline">
              {session.user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-hacknu-border tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
              onClick={async () => {
                await signOut();
                void navigate({ to: '/' });
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="mb-2 text-sm tracking-wider text-hacknu-text-muted">
            $ dashboard --user="{session.user.name}"
          </p>
          <h1 className="text-3xl font-bold text-hacknu-text md:text-5xl">
            Welcome back, <span className="text-hacknu-green">{session.user.name}</span>
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-green/30">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                Status
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-green">Registered</CardTitle>
              <p className="mt-1 text-xs text-hacknu-text-muted">HackNU/26 participant</p>
            </CardContent>
          </Card>
          <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-purple/30">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                Team
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-purple">—</CardTitle>
              <p className="mt-1 text-xs text-hacknu-text-muted">No team yet</p>
            </CardContent>
          </Card>
          <Card className="border-hacknu-border bg-hacknu-dark-card transition-all hover:border-hacknu-green/30 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4">
              <CardDescription className="mb-2 tracking-wider text-hacknu-text-muted uppercase">
                Event
              </CardDescription>
              <CardTitle className="text-2xl text-hacknu-text">Oct 18-19</CardTitle>
              <p className="mt-1 text-xs text-hacknu-text-muted">Nazarbayev University</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <Card className="border-hacknu-border bg-hacknu-dark-card">
          <CardHeader className="border-b border-hacknu-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-hacknu-green/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="ml-2 text-xs text-hacknu-text-muted">profile.json</span>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto text-sm leading-relaxed text-hacknu-text-muted">
              <code>
                {`{
  "name": "${session.user.name}",
  "email": "${session.user.email}",
  "role": "participant",
  "event": "HackNU/26",
  "registered": true
}`}
              </code>
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
